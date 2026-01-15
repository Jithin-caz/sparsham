import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import { User } from "../../../../../models/User";
import { requireRole, logTransaction } from "../../../../../lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(["super"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const member = await User.findById(id).exec();
  if (!member || member.role !== "member") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  member.approved = true;
  await member.save();

  await logTransaction({
    type: "member_approved",
    userId: member._id.toString(),
  });

  return NextResponse.json({ message: "Member approved" });
}
