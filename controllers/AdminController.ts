import { Request, Response, NextFunction } from "express";

import { CreateVendorInput } from "../dto";
import { Vendor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

export const FindVendor = async (id: string | undefined, email?: string) => {
  try {
    // Check if the email is provided
    if (email) {
      // Search for the vendor by email
      const vendor = await Vendor.findOne({ email });

      // If no vendor is found by email
      if (!vendor) {
        throw new Error("Invalid Credentials...");
      }

      return vendor;
    } else if (id) {
      // If no email, search by vendor id
      const vendor = await Vendor.findById(id);

      // If no vendor is found by id
      if (!vendor) {
        throw new Error("Vendor with the provided id not found");
      }

      return vendor;
    } else {
      // If neither email nor id is provided, return null or throw an error
      throw new Error("Invalid Credentials...");
    }
  } catch (error) {
    // Handle the error gracefully
    console.error("Error finding vendor:", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
};

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
    const existingVendor = await FindVendor(email);

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
    res.status(500).json({
      message: "An error occurred while creating the vendor",
      error: error instanceof Error ? error.message : "Unknown error",
    });
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
    res.status(500).json({
      message: "An error occurred while retrieving vendors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const GetVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract the vendor ID from request parameters
    const vendorId = req.params?.id;

    // Validate vendorId (must be a valid MongoDB ObjectId format)
    if (!vendorId || vendorId.length !== 24) {
      res.status(400).json({ message: "Invalid vendor ID format" });
    }

    // Fetch the vendor from the database using the provided ID
    const vendor = await FindVendor(vendorId);

    // If vendor does not exist, return a 404 response
    if (!vendor) {
      res.status(404).json({ message: "Vendor not found" });
      return;
    }

    // If vendor is found, return success response with vendor details
    res.status(200).json({ message: "Vendor retrieved successfully", vendor });
  } catch (error) {
    // Handle internal server errors
    res.status(500).json({
      message: "An error occurred while retrieving the vendor",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
