import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/dbConnect";
import Order from "@/models/Orders";
import Cart from "@/models/Cart";
import Products from "@/models/Products";
import crypto from "crypto";
import { makeShiprocketRequest } from "@/libs/(shiprocket)/shiprocketClient";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { dbOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!dbOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Missing verification details" },
        { status: 400 }
      );
    }

    // 1. Fetch the Order
    const order = await Order.findById(dbOrderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "PAID") {
      return NextResponse.json({ message: "Order already paid" }, { status: 200 });
    }

    // 2. Verify Razorpay Signature
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(order.razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (generated_signature !== razorpaySignature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 3. Mark as Paid
    order.status = "PAID";
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save(); // Save intermediate state

    // 3.5 Update Stock
    for (const item of order.items) {
      await Products.updateOne(
        { _id: item.productId, "sizes.size": item.size },
        { $inc: { "sizes.$.stock": -item.quantity } }
      );
    }

    // 4. Create Shiprocket Order
    // Map DB Order to Shiprocket Payload
    const shiprocketPayload = {
      order_id: order._id.toString(),
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: "Primary", // Ensure this exists in Shiprocket Console
      billing_customer_name: order.shippingAddress.customer_name,
      billing_last_name: order.shippingAddress.last_name || "",
      billing_address: order.shippingAddress.address,
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.pincode,
      billing_state: order.shippingAddress.state,
      billing_country: order.shippingAddress.country,
      billing_email: order.shippingAddress.email,
      billing_phone: order.shippingAddress.phone,
      shipping_is_billing: true,
      order_items: order.items.map((item: any) => ({
        name: item.name,
        sku: item.productId.toString(), // Using ProductID as SKU
        units: item.quantity,
        selling_price: item.price,
        discount: "",
        tax: "",
        hsn: ""
      })),
      payment_method: "Prepaid",
      sub_total: order.totalAmount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5 // Default weight as it's not in Product model
    };

    try {
      const shipRes = await makeShiprocketRequest('/v1/external/orders/create/adhoc', 'POST', shiprocketPayload);
      
      order.shiprocketOrderId = shipRes.order_id;
      order.status = "ORDER_PLACED"; // Or keep as PAXID/Processing
      await order.save();

      // 5. Clear Cart
      await Cart.findOneAndDelete({ userId: order.userId });

      return NextResponse.json({ 
        success: true, 
        orderId: order._id, 
        shiprocketId: shipRes.order_id 
      });

    } catch (shipError: any) {
      console.error("Shiprocket creation failed:", shipError);
      // Order is paid but shipping failed. Mark status accordingly.
      order.status = "PAID_SHIPPING_FAILED";
      await order.save();
      
      return NextResponse.json({ 
        success: true, 
        warning: "Payment received but shipping creation failed. Support will contact you.",
        orderId: order._id 
      });
    }

  } catch (error: any) {
    console.error("Error finalizing order:", error);
    return NextResponse.json(
      { error: "Failed to finalize order", details: error.message },
      { status: 500 }
    );
  }
}
