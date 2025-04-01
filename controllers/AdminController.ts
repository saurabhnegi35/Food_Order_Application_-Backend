import { Request, Response, NextFunction } from "express";

export const CreateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.json({ message: "Vendor Created Successfully" });
};

export const GetVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.json({ message: "All Vendors Sent Successfully" });
};

export const GetVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.json({ message: "Vendor Sent Successfully" });
};
