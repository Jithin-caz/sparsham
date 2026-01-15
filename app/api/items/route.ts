import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { Item } from "../../../models/Item";
import { requireRole, logTransaction } from "../../../lib/auth";

const defaultImage = process.env.DEFAULT_ITEM_IMAGE ||
  "https://via.placeholder.com/300x200?text=Item";

export async function GET() {
  await connectDB();
  const items = await Item.find({ active: true }).lean().exec();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["super"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { name, description, quantity, imageUrl } = await req.json();

  const item = await Item.create({
    name,
    description,
    quantity,
    imageUrl: imageUrl || defaultImage,
  });

  await logTransaction({
    type: "item_added",
    itemId: item._id.toString(),
    userId: user._id.toString(),
  });

  return NextResponse.json(item, { status: 201 });
}
