import mongoose from 'mongoose';
import User from '../src/models/User';
import Cart from '../src/models/Cart';
import Products from '../src/models/Products';
import Order from '../src/models/Orders';
import dbConnect from '../src/libs/dbConnect';

// Use global fetch
// const fetch = require('node-fetch');

async function run() {
  await dbConnect();
  console.log("Connected to DB");

  // 1. Get User
  let user = await User.findOne({});
  if (!user) {
    console.log("No user found. Creating one.");
    user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "password"
    });
  }
  console.log(`Using User: ${user._id}`);

  // 2. Get Product
  const product = await Products.findOne({});
  if (!product) {
    console.error("No products found! Cannot test.");
    process.exit(1);
  }
  console.log(`Using Product: ${product.title} (${product._id}) Price: ${product.price}`);

  // 3. Add to Cart
  let cart = await Cart.findOne({ userId: user._id });
  if (!cart) {
    cart = new Cart({ userId: user._id, items: [] });
  }
  cart.items = [{
    productId: product._id,
    name: product.title,
    price: product.price,
    quantity: 1,
    size: "M",
    images: product.images
  }];
  await cart.save();
  console.log("Cart populated.");

  // 4. Call Initiate API
  console.log("Calling API...");
  const payload = {
    userId: user._id,
    shippingAddress: {
      customer_name: "Test",
      address: "123 St",
      city: "City",
      pincode: "123456",
      phone: "9999999999"
    }
  };

  try {
    const res = await fetch('http://localhost:3000/api/orders/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("API Response:", res.status, data);
  } catch (e) {
      console.log("API Call failed (expected due to Razorpay):", (e as any).message);
  }

  // 5. Verify Order Creation
  const order = await Order.findOne({ userId: user._id }).sort({ createdAt: -1 });
  if (order) {
    console.log("SUCCESS: Order created in DB!");
    console.log(`Order ID: ${order._id}, Status: ${order.status}, Amount: ${order.totalAmount}`);
    // Check if it matches product price
    if (order.totalAmount === product.price) {
        console.log("Price Verification: PASSED");
    } else {
        console.log("Price Verification: FAILED");
    }
  } else {
    console.log("FAILURE: No order found in DB.");
  }

  process.exit(0);
}

run().catch(console.error);
