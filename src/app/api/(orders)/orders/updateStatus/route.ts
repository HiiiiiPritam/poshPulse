/// This route is probably for the admin dashboard


import Orders from '@/models/Orders';
import { NextRequest, NextResponse } from 'next/server';


export async function PATCH(req: NextRequest) {
  try {
    const { orderId, newStatus } = await req.json();

   
    // Find the order by ID
    const order = await Orders.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update the delivery status
    order.status = newStatus;
    await order.save();

    return NextResponse.json(
      { message: 'Order status updated successfully', order },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
