import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { TransactionLog } from "../../../models/TransactionLog";
import { requireRole } from "../../../lib/auth";

export async function GET(req: NextRequest) {
  const user = await requireRole(["super"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "weekly";

  const now = new Date();
  let from: Date;

  if (period === "yearly") {
    from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  } else if (period === "monthly") {
    from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  } else {
    from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const logs = await TransactionLog.find({
    timestamp: { $gte: from },
    type: {
      $in: [
        "request_created",
        "request_approved",
        "request_rejected",
        "request_returned",
      ],
    },
  })
    .sort({ timestamp: -1 })
    .populate("user", "name")
    .populate("item", "name")
    .populate({
      path: "request",
      populate: { path: "handledBy", select: "name" },
    })
    .lean()
    .exec();

  return NextResponse.json(logs);
}
