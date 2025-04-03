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
  const customerInputs = plainToClass(CreateCustomerInputs, req.body);
  const inputErrors = await validate(customerInputs, {
    validationError: { target: true },
  });

  if (inputErrors.length > 0) {
    res.status(400).json({ message: "Error", error: inputErrors });
    return;
  }
  const { email, phone, password } = customerInputs;

  const existCustomer = await Customer.findOne({ email });
  if (existCustomer) {
    res.status(200).json({ message: "Account already Exists with email id" });
    return;
  }
  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const { otp, expiry } = generateOTP();

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
    // Send the OTP to Customer
    await onRequestOTP(otp, phone);
    // Generate the Token
    const token = await GenerateToken({
      _id: result.id,
      email: result.email,
      verified: result.verified,
    });
    // Send the result to User
    res.status(201).json({
      token,
      verify: result.verified,
      email: result.email,
      message: "",
    });
  } else {
    res.status(400).json({ message: "Error Signing Up" });
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
) => {};

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
