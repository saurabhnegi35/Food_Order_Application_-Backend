import mongoose, { Schema, Document, Model } from "mongoose";
import { OrderDoc } from "./Order";

interface CustomerDoc extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  salt: string;
  address: string;
  phone: string;
  otp: number;
  verified: boolean;
  otp_expiry: Date;
  latitude: number;
  longitude: number;
  orders: [OrderDoc];
}

const CustomerSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    address: { type: String },
    phone: { type: String, required: true },
    otp: { type: Number, required: true },
    verified: { type: Boolean, required: true },
    otp_expiry: { type: Number, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "order",
      },
    ],
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password,
          delete ret.salt,
          delete ret.__v,
          delete ret.createdAt,
          delete ret.updatedAt;
      },
    },

    timestamps: true,
  }
);

const Customer = mongoose.model<CustomerDoc>("customer", CustomerSchema);

export { Customer };
