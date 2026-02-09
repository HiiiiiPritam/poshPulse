import { NextRequest, NextResponse } from 'next/server';
import Cart, { CartItem } from '@/models/Cart';
import User from '@/models/User';
import Order, { OrderItem } from '@/models/Orders';
import Products from '@/models/Products';
import dbConnect from '@/libs/dbConnect';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { userId, shippingAddress, paymentMethod, shiprocketOrderId, status, items, totalAmount } = body;

    if(!userId || !shippingAddress || !paymentMethod || !items || !totalAmount || !shiprocketOrderId || !status) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    
    if(!paymentMethod) {
      return NextResponse.json({ error: ' payment method are required' }, { status: 400 });
    }

    // Find the user's cart
    // const userCart = await Cart.findOne({ userId });
    // Generate Readable Order ID (e.g., ORD-192837)
    const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
    const readableOrderId = `ORD-${randomSuffix}`;

    // Create the order
    const order = await Order.create({
      userId,
      items: items,
      totalAmount,
      shippingAddress,
      shiprocketOrderId,
      paymentMethod,
      status: status,
      readableOrderId, // Add to DB
    });

    // Deduct stock for each product
      for (const item of items) {
        await Products.updateOne(
          { _id: item.productId, "sizes.size": item.size }, // Match the product and size
          { $inc: { "sizes.$.stock": -item.quantity } } // Decrement the stock for the matched size
        );
      }

    // // Clear the cart
    // if(userCart){
    //   userCart.items = [];
    //   userCart.totalAmount = 0;
    //   await userCart.save();
    // }
    // Add order reference to the user
    await User.findByIdAndUpdate(userId, { $push: { yourOrders: order._id } });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Error creating dborder:', error);
    return NextResponse.json({ error: 'Failed to create dbOrder' }, { status: 500 });
  }
}
