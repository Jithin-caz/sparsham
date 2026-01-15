import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { Request } from "../../../models/Request";
import { Item } from "../../../models/Item";
import { requireRole, logTransaction } from "../../../lib/auth";

export async function POST(req: NextRequest) {
  await connectDB();
  const { itemId, collegeId, requesterName, className, phone } =
    await req.json();

  const item = await Item.findById(itemId).exec();
  if (!item || !item.active || item.quantity <= 0) {
    return NextResponse.json(
      { error: "Item not available" },
      { status: 400 }
    );
  }

  const r = await Request.create({
    item: item._id,
    collegeId,
    requesterName,
    className,
    phone,
  });

  await logTransaction({
    type: "request_created",
    itemId: item._id.toString(),
    requestId: r._id.toString(),
  });

  return NextResponse.json({ message: "Request submitted" }, { status: 201 });
}

export async function GET() {
  const user = await requireRole(["member", "super"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const requests = await Request.find()
    .populate("item")
    .populate("handledBy", "name")
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return NextResponse.json(requests);
}
