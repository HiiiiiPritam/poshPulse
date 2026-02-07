import dbConnect from "@/libs/dbConnect";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import Orders from "@/models/Orders";

// GET: Fetch cart items for a user
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const yourOrders : any = await Orders.find({ userId });
    if (!yourOrders) {
      return NextResponse.json(
        { message: "Orders not found for the user" },
        { status: 404 }
      );
    }
    // console.log(yourOrders);
    return NextResponse.json(yourOrders);
  } catch (error) {
    console.error("Error fetching your orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch your orders" },
      { status: 500 }
    );
  }
}