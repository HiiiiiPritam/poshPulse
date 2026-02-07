import dbConnect from "@/libs/dbConnect";
import Cart, { CartItem } from "@/models/Cart";
import Products from "@/models/Products";
import { NextRequest, NextResponse } from "next/server";


// POST add an item to the cart
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, productId, name, quantity, size, image } = body; // Price removed from body

  if (!userId || !productId || !quantity || !size || !name || !image) { 
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    // Verify Product and Fetch Price
    const product = await Products.findById(productId);
    if (!product) {
       return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Validate Quantity
    if (quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be greater than 0" }, { status: 400 });
    }

    // Check Stock for Size
    const sizeData = product.sizes.find((s: any) => s.size === size);
    if (!sizeData) {
      return NextResponse.json({ error: "Size not found" }, { status: 404 });
    }
    
    if (sizeData.stock < quantity) {
      return NextResponse.json({ error: `Insufficient stock for size ${size}` }, { status: 400 });
    }

    const price = product.discountedPrice || product.price;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [], totalAmount: 0 });
    }

    // Check if the product is already in the cart with the same size
    const existingItemIndex = cart.items.findIndex(
      (item: CartItem) =>
        item.productId.toString() === productId &&
        item.size === size 
    );

    if (existingItemIndex >= 0) {
      const existingItem = cart.items[existingItemIndex];
      // Check stock with combined quantity
      if (sizeData.stock < existingItem.quantity + quantity) {
         return NextResponse.json({ error: `Insufficient stock. You already have ${existingItem.quantity} in cart.` }, { status: 400 });
      }

      // Update the quantity if the item exists
      cart.items[existingItemIndex].quantity += quantity;
      // Update price in case it changed in DB (optional but good)
      cart.items[existingItemIndex].price = price;
    } else {
      // Add a new item if it doesn't exist
      cart.items.push({ name, productId, price, quantity, size, image });
    }

    // Recalculate total amount
    cart.totalAmount = cart.items.reduce(
      (total: number, item: CartItem) => total + item.price * item.quantity,
      0
    );

    const savedCart = await cart.save();
    return NextResponse.json(savedCart, { status: 201 });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

// DELETE remove an item from the cart
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { userId, itemId } = body;

  if (!userId || !itemId) {
    return NextResponse.json(
      { error: "User ID and Item ID are required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return NextResponse.json(
        { message: "Cart not found for the user" },
        { status: 404 }
      );
    }

    // Remove the item from the cart
    cart.items = cart.items.filter((item: any) => item._id.toString() !== itemId);

    // Recalculate total amount
    cart.totalAmount = cart.items.reduce(
      (total: number, item: any) => total + item.price * item.quantity,
      0
    );

    const updatedCart = await cart.save();
    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}