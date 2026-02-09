import Orders from '@/models/Orders';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, newStatus } = await req.json();

    // Find the order by ID
    const order = await Orders.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Security Check: Only allow if User is Owner OR User is Admin
    if (order.userId.toString() !== session.user.id && session.user.role !== 'admin') {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
