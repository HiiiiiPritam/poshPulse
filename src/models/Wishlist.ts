// models/Wishlist.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlist extends Document {
  userId: string;
  productIds: string[];
  createdAt: Date;
}

const WishlistSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

export default mongoose.models?.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);
