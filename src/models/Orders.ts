import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  images: string[]; // Support multiple images
}

export interface IOrder extends Document {
  userId: IUser['_id'];
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: IUser['addresse'];
  shiprocketOrderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: string;
  paymentMethod: 'COD' | 'Prepaid';
  createdAt: Date;
  updatedAt: Date;
  readableOrderId?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: string;
  isCancellationHandled?: boolean;
}

const OrderItemSchema: Schema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  size: { type: String, required: true },
  images: { type: [String], required: true }, 
});

const OrderSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: Object, required: true },
    shiprocketOrderId: { type: String }, // Made optional
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    status: {
      type: String,
      default: 'PENDING',
    },
    paymentMethod: { type: String, enum: ['COD', 'Prepaid'], required: true },
    readableOrderId: { type: String },
    cancellationReason: { type: String },
    cancelledAt: { type: Date },
    cancelledBy: { type: String },
    isCancellationHandled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models?.Order || mongoose.model<IOrder>('Order', OrderSchema);
