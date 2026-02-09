import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import Order from "@/models/Orders";
import Products from "@/models/Products";
import dbConnect from "@/libs/dbConnect";
import { makeShiprocketRequest } from "@/libs/(shiprocket)/shiprocketClient";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, reason } = await req.json();

    if (!orderId || !reason) {
      return NextResponse.json({ error: "Order ID and reason are required" }, { status: 400 });
    }

    await dbConnect();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Security Check: Owner or Admin
    if (order.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // State Validation
    const allowedStates = ['PENDING', 'ORDER_PLACED', 'PROCESSING', 'NEW'];
    if (!allowedStates.includes(order.status) && session.user.role !== 'admin') {
      // Admins can force cancel, but users can't cancel if shipped
      return NextResponse.json({ 
        error: `Cannot cancel order in '${order.status}' state. Please contact support.` 
      }, { status: 400 });
    }
    
    // Idempotency check
    if (order.status === 'CANCELLED') {
        return NextResponse.json({ message: "Order is already cancelled" }, { status: 200 });
    }

    let isHandled = false;

    // 1. Shiprocket Cancellation
    if (order.shiprocketOrderId) {
      try {
        await makeShiprocketRequest('/v1/external/orders/cancel', 'POST', [order.shiprocketOrderId]);
        console.log(`Shiprocket order ${order.shiprocketOrderId} cancelled.`);
        isHandled = true; // Auto-handled by system
      } catch (srError) {
        console.error("Shiprocket cancellation failed:", srError);
        // Note: We continues to cancel local order, but mark as NOT handled so Admin checks it.
        isHandled = false; 
      }
    } else {
        // No shiprocket ID, so it's handled locally (or needs admin attention if it was supposed to have one)
        // If status was PENDING (not placed yet), it's handled.
        if (order.status === 'PENDING') isHandled = true;
    }

    // 2. Inventory Restock
    for (const item of order.items) {
      await Products.updateOne(
        { _id: item.productId, "sizes.size": item.size },
        { $inc: { "sizes.$.stock": item.quantity } }
      );
    }

    // 3. Update Order Status
    order.status = 'CANCELLED';
    order.cancellationReason = reason;
    order.cancelledAt = new Date();
    order.cancelledBy = session.user.id;
    order.isCancellationHandled = isHandled;
    
    await order.save();

    return NextResponse.json({ 
      success: true, 
      message: "Order cancelled successfully", 
      isHandled 
    });

  } catch (error) {
    console.error("Cancellation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
