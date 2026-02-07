import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/dbConnect";
import Order from "@/models/Orders";
import Cart from "@/models/Cart";
import Products from "@/models/Products";
import User from "@/models/User";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { userId, shippingAddress } = body;

    if (!userId || !shippingAddress) {
      return NextResponse.json(
        { error: "UserId and Shipping Address are required" },
        { status: 400 }
      );
    }

    // 1. Fetch Cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 2. Validate Prices & Calculate Total
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of cart.items) {
      const product = await Products.findById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.name}`);
      }
      
      // Use the database price, ignoring what's in the cart/frontend
      const price = product.discountedPrice || product.price;

      // Check Stock
      const sizeData = product.sizes.find((s: any) => s.size === item.size);
      if (!sizeData) {
        throw new Error(`Size ${item.size} not found for product: ${item.name}`);
      }
      if (sizeData.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name} (Size: ${item.size})`);
      }

      calculatedTotal += price * item.quantity;

      validatedItems.push({
        productId: product._id,
        name: product.title,
        price: price,
        quantity: item.quantity,
        size: item.size,
        images: product.images
      });
    }

    // Add shipping charges if applicable (hardcoded 0 for prepaid for now, logic can expand)
    // if (paymentMethod === 'COD') calculatedTotal += 150; 
    
    // 3. Create Pending Order in DB
    const newOrder = new Order({
      userId,
      items: validatedItems,
      totalAmount: calculatedTotal,
      shippingAddress,
      status: "PENDING",
      paymentMethod: "Prepaid",
      // shiprocketOrderId will be added in finalize step
    });

    await newOrder.save();

    // 4. Create Razorpay Order
    const razorpayOptions = {
      amount: calculatedTotal * 100, // paise
      currency: "INR",
      receipt: `receipt_${newOrder._id}`,
      notes: { dbOrderId: newOrder._id.toString() }
    };

    const razorpayOrder = await razorpay.orders.create(razorpayOptions);

    // 5. Update DB Order with Razorpay ID
    newOrder.razorpayOrderId = razorpayOrder.id;
    await newOrder.save();

    return NextResponse.json({
      success: true,
      dbOrderId: newOrder._id,
      razorpayOrder
    });

  } catch (error: any) {
    console.error("Error initiating order:", error);
    return NextResponse.json(
      { error: "Failed to initiate order", details: error.message },
      { status: 500 }
    );
  }
}
