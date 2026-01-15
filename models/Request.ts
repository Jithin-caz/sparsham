import { Schema, model, models, Types } from "mongoose";

export type RequestStatus = "pending" | "approved" | "rejected" | "returned";

export interface IRequest {
  _id: string;
  item: Types.ObjectId;
  collegeId: string;
  requesterName: string;
  className: string;
  phone: string;
  status: RequestStatus;
  handledBy?: Types.ObjectId;
  handledAt?: Date;
  createdAt: Date;
}

const requestSchema = new Schema<IRequest>(
  {
    item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    collegeId: { type: String, required: true },
    requesterName: { type: String, required: true },
    className: { type: String, required: true },
    phone: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "returned"],
      default: "pending",
    },
    handledBy: { type: Schema.Types.ObjectId, ref: "User" },
    handledAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Request =
  models.Request || model<IRequest>("Request", requestSchema);
