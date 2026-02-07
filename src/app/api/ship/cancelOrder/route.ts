import { makeShiprocketRequest } from '@/libs/(shiprocket)/shiprocketClient';

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const ids = await request.json();

    console.log(ids);
    
    const response = await makeShiprocketRequest('/v1/external/orders/cancel', 'POST', ids);
    console.log("shipRocketOrder cancelled",response);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json({ error: 'Failed to cancle order' }, { status: 500 });
  }
}

