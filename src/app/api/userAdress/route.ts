import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/libs/dbConnect';
import { ShippingAddress } from '@/models/User';

export async function POST(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId');
  await dbConnect();

  try {
    const body = await req.json();
    const address: ShippingAddress = body;

    // Add order reference to the user
    const response = await User.findByIdAndUpdate(userId, { $push: { address: address } });

    return NextResponse.json({ "message": "Address added successfully" }, { status: 201 });
  } catch (error) {
    console.error('Error adding address:', error);
    return NextResponse.json({ error: 'Failed to add address' }, { status: 500 });
  }
}