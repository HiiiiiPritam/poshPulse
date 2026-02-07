import { makeShiprocketRequest } from '@/libs/(shiprocket)/shiprocketClient';

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const shippingDetails = await request.json();

    console.log(shippingDetails);
    
    const response = await makeShiprocketRequest('/v1/external/orders/create/adhoc', 'POST', shippingDetails);
    console.log("shipRocketOrder created",response);
    
    // console.log('Order created successfully:', response);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

