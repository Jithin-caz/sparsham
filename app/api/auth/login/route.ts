import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { User } from "../../../../models/User";
import { verifyPassword, createSession } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, password } = await req.json();

  const user = await User.findOne({ email }).exec();
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (user.role === "member" && !user.approved) {
    return NextResponse.json({ error: "Member not approved yet" }, { status: 403 });
  }

  await createSession(user._id.toString());
  return NextResponse.json({
    message: "Logged in",
    user: { id: user._id, name: user.name, role: user.role },
  });
}
