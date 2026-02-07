import dbConnect from "@/libs/dbConnect";
import Cart from "@/models/Cart";
import Products from "@/models/Products";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch cart items for a user
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    // Fetch the cart for the user
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return NextResponse.json(
        { userId, items: [], totalAmount: 0 },
        { status: 200 }
      );
    }

    // Fetch all product IDs in the cart
    const productIdsInCart = cart.items.map((item : any) => item.productId);

    // Validate if products exist in the database
    const validProducts = await Products.find({ _id: { $in: productIdsInCart } });
    const validProductIds = validProducts.map((product) => product._id.toString());

    // Filter out invalid items
    const validItems = cart.items.filter((item: any) =>
      validProductIds.includes(item.productId.toString())
    );

    // Check if any items were removed
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;

      // Save the updated cart
      await cart.save();
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}


// PUT: Update quantity of a cart item
// export async function PUT(req: NextRequest) {
//   const body = await req.json();
//   const { userId, productId, quantity } = body;

//   if (!userId || !productId || quantity === undefined) {
//     return NextResponse.json(
//       { error: "User ID, Product ID, and Quantity are required" },
//       { status: 400 }
//     );
//   }

//   try {
//     await dbConnect();
//     const cart = await Cart.findOne({ userId });
//     if (!cart) {
//       return NextResponse.json(
//         { message: "Cart not found for the user" },
//         { status: 404 }
//       );
//     }

//     // Find and update the specific product in the cart
//     const item = cart.items.find((item: any) => item.productId.toString() === productId);
//     if (item) {
//       item.quantity = quantity;
//       await cart.save();
//       return NextResponse.json(cart);
//     } else {
//       return NextResponse.json(
//         { message: "Product not found in the cart" },
//         { status: 404 }
//       );
//     }
//   } catch (error) {
//     console.error("Error updating cart item:", error);
//     return NextResponse.json(
//       { error: "Failed to update cart item" },
//       { status: 500 }
//     );
//   }
// }

// PUT: Update quantity of a cart item
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { userId, productId, quantity, size } = body;

  if (!userId || !productId || quantity === undefined || size === undefined) {
    console.log(userId, productId, quantity);
    return NextResponse.json(
      { error: "User ID, Product ID, and Quantity are required, and size is required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    console.log("Received userId:", userId);
    console.log("Looking for cart...");

    // Convert userId to ObjectId if necessary
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return NextResponse.json(
        { message: "Cart not found for the user" },
        { status: 404 }
      );
    }


    // console.log("Cart found:", cart);
    // Find and update the specific product in the cart
    // console.log(size,"hoiiiii")
    const item = cart.items.find((item: any) => (item.productId.toString() === productId && item.size === size));
    // console .log("Found item:", item, size);
    if (item) {
      item.quantity = quantity;
      cart.totalAmount = cart.items.reduce((total: number, item: any) => total + item.price * item.quantity, 0);
      await cart.save();
      return NextResponse.json(cart);
    } else {
      return NextResponse.json(
        { message: "Product not found in the cart" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}


// DELETE: Remove a cart item
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { userId, productId, quantity, size } = body;

  if (!userId || !productId) {
    return NextResponse.json(
      { error: "User ID and Product ID are required" },
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

    // Filter out the product to delete
    cart.items = cart.items.filter((item: any) => item.productId.toString() !== productId || item.quantity !== quantity || item.size !== size);

    cart.totalAmount = cart.items.reduce((total: number, item: any) => {
      return total + item.price * item.quantity;
    }, 0);

    await cart.save();
    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return NextResponse.json(
      { error: "Failed to delete cart item" },
      { status: 500 }
    );
  }
}
