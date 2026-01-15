import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { Item } from "../../../../models/Item";
import { requireRole, logTransaction } from "../../../../lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(["super"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const item = await Item.findByIdAndUpdate(id, body, { new: true }).exec();

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logTransaction({
    type: "item_updated",
    itemId: item._id.toString(),
    userId: user._id.toString(),
  });

  return NextResponse.json(item);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(["super"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const item = await Item.findByIdAndDelete(id).exec();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logTransaction({
    type: "item_deleted",
    itemId: item._id.toString(),
    userId: user._id.toString(),
  });

  return NextResponse.json({ message: "Deleted" });
}
