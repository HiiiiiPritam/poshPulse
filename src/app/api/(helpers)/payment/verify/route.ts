import Razorpay from "razorpay";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    
    const body = await req.json();
    console.log("Verify 0", body);
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.log("Missing required payment details at verify");
      return NextResponse.json(
        { error: "Missing required payment details" },
        { status: 400 }
      );
    }
    console.log("verify 1");
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("verify 2", expectedSignature, razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      console.log("Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("Verified payment ID:", razorpay_payment_id);
    return NextResponse.json({ success: true, paymentId: razorpay_payment_id }, { status: 200 });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
