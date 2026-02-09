import { makeShiprocketRequest } from '@/libs/(shiprocket)/shiprocketClient';
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import Order from "@/models/Orders";
import dbConnect from "@/libs/dbConnect";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ids = await request.json(); // Array of Shiprocket Order IDs
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    await dbConnect();

    // Security Check: Ensure User owns these orders (or is Admin)
    if (session.user.role !== 'admin') {
        const count = await Order.countDocuments({
            shiprocketOrderId: { $in: ids },
            userId: session.user.id
        });

        if (count !== ids.length) {
             return NextResponse.json({ error: "Forbidden: You do not own these orders" }, { status: 403 });
        }
    }
    
    // Proceed if authorized
    console.log("Cancelling Shiprocket Orders:", ids);
    const response = await makeShiprocketRequest('/v1/external/orders/cancel', 'POST', ids);
    console.log("Shiprocket Response:", response);
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
  }
}

