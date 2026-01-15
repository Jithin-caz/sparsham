import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import { Request } from "../../../../../models/Request";
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

  request.status = "rejected";
  request.handledBy = user._id;
  request.handledAt = new Date();
  await request.save();

  await logTransaction({
    type: "request_rejected",
    requestId: request._id.toString(),
    userId: user._id.toString(),
  });

  return NextResponse.json({ message: "Rejected" });
}
