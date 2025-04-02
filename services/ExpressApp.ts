import express, { Application } from "express";
import bodyParser from "body-parser";
import path from "path";

import { AdminRoutes, ShoppingRoutes, VendorRoutes } from "../routes/index";

export default async (app: Application) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  const imagePath = path.join(__dirname, "../images");

  app.use("/images", express.static(imagePath));

  app.use("/admin", AdminRoutes);
  app.use("/vendor", VendorRoutes);
  app.use("/shopping", ShoppingRoutes);

  return app;
};
