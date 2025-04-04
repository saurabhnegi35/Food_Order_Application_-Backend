import express, { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { CreateCustomerInputs } from "../dto/Customer.dto";
import { validate } from "class-validator";
import {
  generateOTP,
  GeneratePassword,
  GenerateSalt,
  GenerateToken,
  onRequestOTP,
} from "../utility";
import { Customer } from "../models/Customer";
import { verify } from "jsonwebtoken";

export const CustomerSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Convert request body to class instance and validate using class-validator
    const customerInputs = plainToClass(CreateCustomerInputs, req.body);
    const inputErrors = await validate(customerInputs, {
      validationError: { target: true },
    });

    // If validation errors exist, return 400 Bad Request
    if (inputErrors.length > 0) {
      res
        .status(400)
        .json({ message: "Invalid input data", error: inputErrors });
      return;
    }

    const { email, phone, password } = customerInputs;

    // Check if a customer with the same email already exists
    const existCustomer = await Customer.findOne({ email });
    if (existCustomer) {
      // 409 Conflict for already existing account
      res
        .status(409)
        .json({ message: "Account already exists with this email ID" });
      return;
    }

    // Generate salt and hashed password
    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    // Generate OTP and its expiry
    const { otp, expiry } = generateOTP();

    // Create a new customer document in the database
    const result = await Customer.create({
      email,
      password: userPassword,
      phone,
      salt,
      otp,
      otp_expiry: expiry,
      firstName: "",
      lastName: "",
      address: "",
      verified: false,
      latitude: 0,
      longitude: 0,
    });

    if (result) {
      // Send OTP to the user's phone number via Twilio
      await onRequestOTP(otp, phone);

      // Generate JWT token
      const token = await GenerateToken({
        _id: result.id,
        email: result.email,
        verified: result.verified,
      });

      // Return success response with token and user details
      res.status(201).json({
        message: "Customer account created successfully. OTP sent.",
        token,
        verify: result.verified,
        email: result.email,
      });
    } else {
      // If customer creation fails for some reason
      res.status(500).json({ message: "Failed to create customer account" });
    }
  } catch (error) {
    // Handle unexpected internal errors
    res.status(500).json({
      message: "An error occurred while signing up the customer",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const CustomerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const CustomerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract OTP from request body
    const { otp } = req.body;

    // Extract customer information from request
    const customer = req.user;
    console.log(customer);

    // Check if customer exists in the request (authenticated)
    if (!customer) {
      res.status(401).json({ message: "Unauthorized access" });
      return;
    }
    // Fetch customer profile from database
    const profile = await Customer.findById(customer._id);

    if (!profile) {
      res.status(404).json({ message: "Customer profile not found" });
      return;
    }

    // Validate OTP and its expiry
    if (profile.otp !== parseInt(otp)) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    if (profile.otp_expiry < new Date()) {
      res.status(400).json({ message: "OTP has expired" });
      return;
    }

    // Mark customer as verified
    profile.verified = true;
    const updatedCustomerResponse = await profile.save();

    // Generate a new token for the verified customer
    const token = GenerateToken({
      _id: updatedCustomerResponse.id,
      email: updatedCustomerResponse.email,
      verified: updatedCustomerResponse.verified,
    });

    // Send verification success response
    res.status(200).json({
      message: "Customer successfully verified",
      token,
      verified: updatedCustomerResponse.verified,
      email: updatedCustomerResponse.email,
    });
  } catch (error) {
    // Handle internal server errors properly
    res.status(500).json({
      message: "An error occurred while verifying the customer",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const RequestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const EditCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
