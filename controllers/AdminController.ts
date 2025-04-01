import { Request, Response, NextFunction } from "express";

import { CreateVendorInput } from "../dto";
import { Vendor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

export const CreateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    address,
    email,
    foodType,
    name,
    ownerName,
    password,
    phone,
    pincode,
  } = <CreateVendorInput>req.body;

  const existingVendor = await Vendor.findOne({ email });

  if (existingVendor) {
    res.status(409).json({ message: "A Vendor exists with this emailId" });
    return;
  }

  //Generate Salt
  const salt = await GenerateSalt();

  //Encrypt the Password using the Salt
  const HashedPassword = await GeneratePassword(password, salt);

  const CreateVendor = await Vendor.create({
    name,
    address,
    email,
    foodType,
    ownerName,
    password: HashedPassword,
    phone,
    pincode,
    salt,
    serviceAvailability: false,
    coverImages: [],
    rating: 0,
  });

  res.status(200).json(CreateVendor);
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
