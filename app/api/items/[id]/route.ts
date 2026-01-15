import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import { Item } from "../../../../../models/Item";
import { requireRole, logTransaction } from "../../../../../lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(["super"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const { name, description, quantity, imageUrl } = await req.json();

  const item = await Item.findByIdAndUpdate(
    id,
    { name, description, quantity, imageUrl },
    { new: true, runValidators: true }
  ).exec();

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await logTransaction({
    type: "item_updated",
    itemId: item._id.toString(),
    userId: user._id.toString(),
    meta: {
      name, quantity, description // Log changed values for reference
    }
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
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await logTransaction({
    type: "item_deleted",
    itemId: id,
    userId: user._id.toString(),
    meta: { name: item.name }
  });

  return NextResponse.json({ message: "Item deleted" });
}
