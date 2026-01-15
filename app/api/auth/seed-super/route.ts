import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { User } from "../../../../models/User";
import { hashPassword } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  await connectDB();
  const { name, email, password } = await req.json();

  const existing = await User.findOne({ email }).exec();
  if (existing) {
    return NextResponse.json({ error: "Already exists" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "super",
    approved: true,
  });

  return NextResponse.json({ id: user._id, email: user.email });
}
