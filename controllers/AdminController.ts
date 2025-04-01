import { Request, Response, NextFunction } from "express";

import { CreateVendorInput } from "../dto";
import { Vendor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

export const CreateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract vendor details from request body
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

    // Check if a vendor already exists with the given email
    const existingVendor = await Vendor.findOne({ email });

    if (existingVendor) {
      res.status(409).json({ message: "A Vendor exists with this emailId" });
      return;
    }

    //Generate Salt
    const salt = await GenerateSalt();

    //Encrypt the Password using the Salt
    const hashedPassword = await GeneratePassword(password, salt);

    // Create a new vendor in the database
    const newVendor = await Vendor.create({
      name,
      address,
      email,
      foodType,
      ownerName,
      password: hashedPassword,
      phone,
      pincode,
      salt,
      serviceAvailability: false, // Default service availability set to false
      coverImages: [], // Initialize with an empty array for images
      rating: 0, // Default rating
    });

    // Send success response with newly created vendor details
    res
      .status(201)
      .json({ message: "Vendor created successfully", vendor: newVendor });
  } catch (error) {
    // Handle internal server errors
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
};

export const GetVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Fetch all vendors from the database
    const vendors = await Vendor.find();

    // Check if no vendors exist
    if (!vendors) {
      res.status(404).json({ message: "No Vendors found" });
      return;
    }

    // Return successful response with vendors list
    res
      .status(200)
      .json({ message: "Vendors retrieved successfully", vendors });
  } catch (error) {
    // Handle internal server errors
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
};

export const GetVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.json({ message: "Vendor Sent Successfully" });
};
