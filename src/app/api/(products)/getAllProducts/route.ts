import dbConnect from "@/libs/dbConnect";
import Products from "@/models/Products";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const minPrice = parseInt(searchParams.get("minPrice") || "0");
    const maxPrice = parseInt(searchParams.get("maxPrice") || "1000000");
    const tags = searchParams.get("tags")?.split(",") || [];
    const sizes = searchParams.get("sizes")?.split(",") || [];

    const query: any = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (category && category !== "All") {
      query.category = { $regex: category, $options: "i" };
    }

    // Price Filter
    query.price = { $gte: minPrice, $lte: maxPrice };

    // Tags and Colors Filter (assuming colors are stored in tags)
    if (tags.length > 0) {
      query.tags = { $in: tags.map(t => new RegExp(t, "i")) };
    }

    // Sizes Filter
    if (sizes.length > 0) {
      // Create case-insensitive regex for each size
      const sizeRegexes = sizes.map(s => new RegExp(`^${s}$`, "i"));
      query.sizes = { $elemMatch: { size: { $in: sizeRegexes } } };
    }

    const skip = (page - 1) * limit;

    const products = await Products.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Products.countDocuments(query);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
