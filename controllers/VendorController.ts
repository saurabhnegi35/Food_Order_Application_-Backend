import { Request, Response, NextFunction } from "express";
import { EditVendorInputs, VendorLoginInputs } from "../dto";
import { FindVendor } from "./AdminController";
import { GenerateToken, ValidatePassword } from "../utility";

/**
 * Handles vendor login authentication.
 *
 * This function verifies the vendor's email and password, generates a JWT token
 * upon successful authentication, and returns the token for future requests.
 */
export const VendorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract email and password from the request body
    const { email, password } = <VendorLoginInputs>req.body;

    // Attempt to find the vendor by email using the FindVendor function
    const existingVendor = await FindVendor("", email);

    // Check if the vendor exists
    if (existingVendor) {
      // Validate the password using the ValidatePassword function
      const valideUser = await ValidatePassword(
        password,
        existingVendor.password,
        existingVendor.salt
      );
      if (valideUser) {
        // Generate a JWT token for authentication using the vendor's details
        // This token will be used for secure access to protected routes
        const token = await GenerateToken({
          _id: existingVendor.id,
          email: existingVendor.email,
          foodType: existingVendor.foodType,
          name: existingVendor.name,
        });

        // If the password is valid, send a success response with the vendor data
        res.status(200).json({
          message: "User logged in successfully",
          token,
        });
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
      message: "An error occurred while logging in",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Retrieves the profile of the currently authenticated vendor.
 *
 * This function checks if the authenticated user exists in the request object.
 * If found, it fetches the vendor details from the database and returns them.
 * If the vendor is not found, it returns a 404 error response.
 */
export const GetVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract user data from the request (added by authentication middleware)
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized access" });
    }

    // Fetch vendor details from the database using the authenticated user's ID
    const existingVendor = await FindVendor(user?._id);

    // If no vendor is found, return a 404 response
    if (!existingVendor) {
      res.status(404).json({ message: "Vendor profile not found" });
    }

    // Return vendor profile data
    res.status(200).json({
      message: "Vendor profile retrieved successfully",
      vendor: existingVendor,
    });
  } catch (error) {
    // Handle internal server errors
    res.status(500).json({
      message: "An error occurred while retrieving the Profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Updates the profile details of an authenticated vendor.
 *
 * This function extracts user data from the request, verifies authorization,
 * and updates the vendor's profile with new details provided in the request body.
 */
export const UpdateVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract updated profile details from request body
    const { name, foodType, address, phone } = <EditVendorInputs>req.body;
    const user = req.user;

    // Check if user is authenticated
    if (!user) {
      res.status(401).json({ message: "Unauthorized access" });
    }

    // Retrieve vendor details from the database
    const existingVendor = await FindVendor(user?._id);

    // Check if the vendor exists
    if (!existingVendor) {
      res.status(404).json({ message: "Vendor profile not found" });
    }

    // Update vendor details
    existingVendor.name = name || existingVendor.name;
    existingVendor.address = address || existingVendor.address;
    existingVendor.phone = phone || existingVendor.phone;
    existingVendor.foodType = foodType || existingVendor.foodType;

    // Save the updated vendor profile
    const savedResult = await existingVendor.save();

    // Send success response
    res.status(200).json({
      message: "Vendor profile updated successfully",
      vendor: savedResult,
    });
  } catch (error) {
    // Handle internal server errors
    res.status(500).json({
      message: "An error occurred while updating the vendor profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Toggles the service availability status of an authenticated vendor.
 */
export const UpdateVendorService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract authenticated user from request
    const user = req.user;

    // Check if user is authenticated
    if (!user) {
      res.status(401).json({ message: "Unauthorized access" });
    }

    // Retrieve vendor details from the database
    const existingVendor = await FindVendor(user?._id);

    // Check if the vendor exists
    if (!existingVendor) {
      res.status(404).json({ message: "Vendor profile not found" });
    }

    // Toggle service availability status
    existingVendor.serviceAvailability = !existingVendor.serviceAvailability;

    // Save the updated vendor profile
    const savedResult = await existingVendor.save();

    // Send success response
    res.status(200).json({
      message: "Vendor availability updated successfully",
      serviceAvailability: savedResult.serviceAvailability, // Return only relevant data
    });
  } catch (error) {
    // Handle internal server errors
    res.status(500).json({
      message: "An error occurred while updating vendor availability",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
