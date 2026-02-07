import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";


export async function PATCH(req: NextRequest){

  const body = await req.json();
  const { userId, name, email } = body;

  if (!userId || !name || !email) {
    return NextResponse.json(
      { error: "User ID, Name, and Email are required" },
      { status: 400 }
    );
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    user.name = name;
    user.email = email;
    await user.save();

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user details" },
      { status: 500 }
    )
  }

}