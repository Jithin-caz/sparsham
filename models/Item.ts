import { Schema, model, models } from "mongoose";

export interface IItem {
  _id: string;
  name: string;
  description?: string;
  quantity: number;
  imageUrl: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true },
    description: String,
    quantity: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Item = models.Item || model<IItem>("Item", itemSchema);
