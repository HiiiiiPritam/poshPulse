
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/dbConnect";
import Products from "@/models/Products";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const newProduct = new Products({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newProduct.save();

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
