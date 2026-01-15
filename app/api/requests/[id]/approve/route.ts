import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import { Request } from "../../../../../models/Request";
import { Item } from "../../../../../models/Item";
import { requireRole, logTransaction } from "../../../../../lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(["member", "super"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const request = await Request.findById(id).exec();
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (request.status !== "pending") {
    return NextResponse.json({ error: "Already processed" }, { status: 400 });
  }

  const item = await Item.findById(request.item).exec();
  if (!item || item.quantity <= 0) {
    return NextResponse.json(
      { error: "Item not available" },
      { status: 400 }
    );
  }

  item.quantity -= 1;
  await item.save();

  request.status = "approved";
  request.handledBy = user._id;
  request.handledAt = new Date();
  await request.save();

  await logTransaction({
    type: "request_approved",
    itemId: item._id.toString(),
    requestId: request._id.toString(),
    userId: user._id.toString(),
  });

  return NextResponse.json({ message: "Approved" });
}
