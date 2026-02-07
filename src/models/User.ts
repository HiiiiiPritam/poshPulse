// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ShippingAddress {
  customer_name: string;
  last_name: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  email: string;
  phone: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  addresse: ShippingAddress;
  yourOrders: mongoose.Types.ObjectId[];
  cart: mongoose.Types.ObjectId;
  wishlist: mongoose.Types.ObjectId;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema: Schema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phoneNumber: { type: String, required: true },
});

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image : { type: String, required: false },
    address: { type: AddressSchema, required: false },
    yourOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
    wishlist: { type: mongoose.Schema.Types.ObjectId, ref: 'Wishlist' },
    role: { type: String, default: 'user', enum: ['user', 'admin'] }
  },
  { timestamps: true }
);

export default mongoose.models?.User || mongoose.model<IUser>('User', UserSchema);



