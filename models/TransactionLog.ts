import { Schema, model, models, Types } from "mongoose";

export type TransactionType =
  | "request_created"
  | "request_approved"
  | "request_rejected"
  | "request_returned"
  | "item_added"
  | "item_updated"
  | "item_deleted"
  | "member_approved";

export interface ITransactionLog {
  _id: string;
  type: TransactionType;
  item?: Types.ObjectId;
  request?: Types.ObjectId;
  user?: Types.ObjectId;
  timestamp: Date;
  meta?: Record<string, unknown>;
}

const transactionLogSchema = new Schema<ITransactionLog>({
  type: {
    type: String,
    enum: [
      "request_created",
      "request_approved",
      "request_rejected",
      "request_returned",
      "item_added",
      "item_updated",
      "item_deleted",
      "member_approved",
    ],
    required: true,
  },
  item: { type: Schema.Types.ObjectId, ref: "Item" },
  request: { type: Schema.Types.ObjectId, ref: "Request" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
  meta: { type: Schema.Types.Mixed },
});

// Prevent model overwrite warning in development
if (process.env.NODE_ENV !== "production") {
  delete models.TransactionLog;
}

export const TransactionLog =
  models.TransactionLog || model<ITransactionLog>("TransactionLog", transactionLogSchema);
