import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenuItem extends Document {
  code: number; // numeric selection code
  name: string;
  price: number;
  description?: string;
}

const MenuItemSchema = new Schema<IMenuItem>({
  code: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
});

const MenuItem: Model<IMenuItem> =
  mongoose.models.MenuItem ||
  mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
export default MenuItem;
