import express from "express";
import { AdminRoutes, VendorRoutes } from "./routes/index";

const app = express();

app.use("/admin", AdminRoutes);
app.use("/vendor", VendorRoutes);

app.listen(8000, () => {
  console.log("App is Listening to Port 8000");
});
