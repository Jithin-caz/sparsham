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

  // Only approved requests can be returned
  if (request.status !== "approved") {
    return NextResponse.json(
      { error: "Request must be approved to be returned" },
      { status: 400 }
    );
  }

  const item = await Item.findById(request.item).exec();
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  // Increment item quantity
  item.quantity += 1;
  await item.save();

  // Update request status
  request.status = "returned";
  // We can track who marked it as returned in a new field if we updated the schema,
  // but for now, the transaction log is the source of truth for "who did it".
  // Optionally, we could update handledBy/handledAt, but those usually track the approval.
  // Let's rely on the transaction log for the "returner" info as per requirements.
  await request.save();

  await logTransaction({
    type: "request_returned",
    itemId: item._id.toString(),
    requestId: request._id.toString(),
    userId: user._id.toString(), // The user who marks it as returned
  });

  return NextResponse.json({ message: "Item marked as returned" });
}
