
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/dbConnect";
import Order from "@/models/Orders";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { orderId, status } = await req.json();

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
