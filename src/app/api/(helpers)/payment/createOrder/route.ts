import { NextRequest, NextResponse } from "next/server";
import { log } from "node:console";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "", // Add to .env
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
//     console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);
// console.log("Razorpay Key Secret:", process.env.RAZORPAY_KEY_SECRET);

//     console.log("Razorpay:", razorpay);
    console.log("Razorpay Key Loaded:", process.env.RAZORPAY_KEY_ID?.substring(0, 10) + "...");
    const body = await req.json(); // Parse the request body
    const { amount } = body;

    console.log("Razorpay order data:", { amount});

    if (!amount ) {
      return NextResponse.json(
        { error: "Amount is require" },
        { status: 400 }
      );
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency:  "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    console.log("Razorpay order created:", order);

    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", JSON.stringify(error, null, 2));

    return NextResponse.json(
      { error: "Failed to create Razorpay order", details: error.message },
      { status: 500 }
    );
  }
}
