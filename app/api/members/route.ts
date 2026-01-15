import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { hashPassword, requireRole, logTransaction } from "../../../lib/auth";

export async function GET() {
  const user = await requireRole(["super"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const members = await User.find({ role: "member" })
    .select("-passwordHash")
    .lean()
    .exec();

  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["super"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { name, email, password, approved } = await req.json();

  const existing = await User.findOne({ email }).exec();
  if (existing) {
    return NextResponse.json({ error: "Email already used" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const member = await User.create({
    name,
    email,
    passwordHash,
    role: "member",
    approved: !!approved,
  });

  if (member.approved) {
    await logTransaction({
      type: "member_approved",
      userId: member._id.toString(),
    });
  }

  return NextResponse.json(
    { id: member._id, email: member.email },
    { status: 201 }
  );
}
