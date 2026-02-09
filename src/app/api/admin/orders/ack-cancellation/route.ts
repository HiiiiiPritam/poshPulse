import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import Order from "@/models/Orders";
import dbConnect from "@/libs/dbConnect";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    await dbConnect();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.isCancellationHandled = true;
    await order.save();

    return NextResponse.json({ 
      success: true, 
      message: "Order marked as handled" 
    });

  } catch (error) {
    console.error("Ack Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
