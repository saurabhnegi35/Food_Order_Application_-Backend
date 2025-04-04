import mongoose from "mongoose";
import { MONGO_URI } from "../config";

export default async () => {
  try {
    mongoose
      .connect(MONGO_URI)
      .then(() => {
        console.log("Connected to MongoDB successfully!");
      })
      .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
      });
  } catch (error) {
    console.log(error);
  }
};
