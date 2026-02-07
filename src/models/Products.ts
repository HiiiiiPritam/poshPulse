import mongoose, { Schema, Document } from 'mongoose';

export interface ISizeStock {
  size: string;
  stock: number;
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  tags: string[];
  sizes: ISizeStock[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SizeStockSchema: Schema = new Schema({
  size: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
});

const ProductSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountedPrice: { type: Number, default: null },
    category: { type: String, required: true },
    tags: [{ type: String }],
    sizes: [SizeStockSchema], // Array of size-stock pairs
    images: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models?.Product || mongoose.model<IProduct>('Product', ProductSchema);
