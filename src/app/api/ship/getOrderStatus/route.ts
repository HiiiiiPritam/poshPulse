import { makeShiprocketRequest } from '@/libs/(shiprocket)/shiprocketClient';

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
  try {
    
    console.log("shiprocket id from getorder status",orderId);
    const response = await makeShiprocketRequest(`/v1/external/orders/show/${orderId}`, 'GET');
    console.log("Order Details:",response.data.status);
    return NextResponse.json(response.data.status, { status: 200 });
  } catch (error) {
    console.error('Error fetching the order details:', error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}

