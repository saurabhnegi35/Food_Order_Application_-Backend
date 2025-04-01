import { Request, Response, NextFunction } from "express";
import { VendorLoginInput } from "../dto";
import { FindVendor } from "./AdminController";
import { ValidatePassword } from "../utility";

export const VendorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract email and password from the request body
    const { email, password } = <VendorLoginInput>req.body;

    // Attempt to find the vendor by email using the FindVendor function
    const existingUser = await FindVendor("", email);

    // Check if the vendor exists
    if (existingUser) {
      // Validate the password using the ValidatePassword function
      const valideUser = await ValidatePassword(
        password,
        existingUser.password,
        existingUser.salt
      );
      if (valideUser) {
        // If the password is valid, send a success response with the vendor data
        res
          .status(200)
          .json({ message: "User logged in successfully", data: existingUser });
      } else {
        // If the password is invalid, send a bad request response with an appropriate message
        res.status(400).json({ message: "Invalid Credentials..." });
      }
    } else {
      // If no vendor exists with the given email, send a 404 response
      res
        .status(404)
        .json({ message: "Vendor not found with the given email" });
    }
  } catch (error) {
    // Handle internal server errors
    res.status(500).json({
      message: "An error occurred while retrieving the vendor",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
