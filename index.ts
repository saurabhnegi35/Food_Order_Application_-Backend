import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import path from "path";

import { AdminRoutes, VendorRoutes } from "./routes/index";
import { MONGO_URI } from "./config";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const imagePath = path.join(__dirname, "../images");

app.use("/images", express.static(imagePath));

app.use("/admin", AdminRoutes);
app.use("/vendor", VendorRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.listen(8000, () => {
  console.log("App is Listening to Port 8000");
});
