import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IOrderItem {
  item: Types.ObjectId; // ref MenuItem
  qty: number;
}
export interface IOrder extends Document {
  sid: string;
  items: IOrderItem[];
  total: number;
  status: "pending" | "placed" | "paid" | "cancelled";
  reference?: string;
  paidAt?: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    sid: { type: String, required: true, index: true },
    items: [
      {
        item: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
        qty: { type: Number, required: true, min: 1 },
      },
    ],
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "placed", "paid", "cancelled"],
      default: "pending",
    },
    reference: { type: String, index: true },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
