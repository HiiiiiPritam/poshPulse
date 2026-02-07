import { NextApiRequest, NextApiResponse } from 'next';
import { makeShiprocketRequest } from '@/libs/(shiprocket)/shiprocketClient';
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Fetch all orders using the Shiprocket API endpoint
    const response = await makeShiprocketRequest('/v1/external/orders', 'GET');

    // console.log(response);
    // Respond with the retrieved orders
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
