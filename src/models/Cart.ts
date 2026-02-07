// models/Cart.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface CartItem {
  _id?: mongoose.Types.ObjectId;
  productId: string;
  image: string[];
  name: string;
  price: number;
  quantity: number;
  size: string;
}

export interface ICart extends Document {
  userId: string;
  items: CartItem[];
  totalAmount: number;
  updatedAt: Date;
}

export const CartItemSchema: Schema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  image: [{ type: String, required: true }],
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  size: { type: String, required: true },
});

const CartSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [CartItemSchema],
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models?.Cart || mongoose.model<ICart>('Cart', CartSchema);
