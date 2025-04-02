import mongoose, { Schema, Document, Model } from "mongoose";

interface FoodDoc extends Document {
  vendorId: string;
  name: string;
  description: string;
  foodType: string;
  category: string;
  readyTime: [number];
  price: [number];
  rating: [number];
  images: [string];
}

const FoodSchema = new Schema(
  {
    vendorId: { type: String },
    name: { type: String, required: true },
    description: { type: String, required: true },
    categoty: { type: String },
    foodType: { type: [String], required: true },
    readyTime: { type: Number },
    price: { type: Number, required: true },
    rating: { type: Number },
    images: { type: [String] },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v, delete ret.createdAt, delete ret.updatedAt;
      },
    },

    timestamps: true,
  }
);

const Food = mongoose.model<FoodDoc>("food", FoodSchema);

export { Food };
