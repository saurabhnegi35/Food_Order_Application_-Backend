import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import {
  CreateCustomerInputs,
  EditCustomerProfileInputs,
  OrderInputs,
  UserLoginInputs,
} from "../dto/Customer.dto";
import { validate } from "class-validator";
import {
  generateOTP,
  GeneratePassword,
  GenerateSalt,
  GenerateToken,
  onRequestOTP,
  ValidatePassword,
} from "../utility";
import { Customer } from "../models/Customer";
import { verify } from "jsonwebtoken";
import { Food } from "../models";
import { Order } from "../models/Order";

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
      orders: [],
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
) => {
  try {
    // Validate request body against UserLoginInputs schema
    const loginInputs = plainToClass(UserLoginInputs, req.body);
    const loginErrors = await validate(loginInputs, {
      validationError: { target: true },
    });

    // If validation errors exist, return 400 Bad Request
    if (loginErrors.length > 0) {
      res.status(400).json({
        message: "Invalid input data",
        error: loginErrors,
      });
      return;
    }

    const { email, password } = loginInputs;

    // Check if customer exists in the database
    const customer = await Customer.findOne({ email });

    if (!customer) {
      res.status(404).json({
        message: "Invalid credentials. Please check your email or password.",
      });
      return;
    }

    // Validate password with stored hash & salt
    const isPasswordValid = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );

    if (!isPasswordValid) {
      res.status(401).json({
        message: "Invalid credentials. Please check your email or password.",
      });
      return;
    }

    // Check if the customer has verified their account
    if (!customer.verified) {
      res.status(403).json({
        message:
          "Account not verified. Please verify your OTP before logging in.",
      });
      return;
    }

    // Generate a new authentication token
    const token = await GenerateToken({
      _id: customer.id,
      email: customer.email,
      verified: customer.verified,
    });

    // Send success response with token
    res.status(200).json({
      message: "Login successful",
      token,
      verified: customer.verified,
      email: customer.email,
    });
  } catch (error) {
    // Handle internal server errors properly
    res.status(500).json({
      message: "An error occurred while logging in",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

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
    if (profile.otp_expiry < new Date()) {
      res.status(400).json({ message: "OTP has expired" });
      return;
    }
    if (profile.otp !== parseInt(otp)) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    // Mark customer as verified
    profile.verified = true;
    const updatedCustomerResponse = await profile.save();

    // Generate a new token for the verified customer
    const token = await GenerateToken({
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
) => {
  try {
    // Ensure user is authenticated
    const customer = req.user;
    if (!customer) {
      res.status(401).json({ message: "Unauthorized. Please log in." });
      return;
    }

    // Find customer profile in the database
    const profile = await Customer.findById(customer._id);
    if (!profile) {
      res.status(404).json({ message: "Customer profile not found." });
      return;
    }

    // Generate new OTP and expiry
    const { otp, expiry } = generateOTP(); // Ensure generateOTP() returns expiry

    // Update profile with new OTP
    profile.otp = otp;
    profile.otp_expiry = expiry;

    await profile.save();

    // Send OTP via SMS (handle errors in sending OTP)
    try {
      await onRequestOTP(otp, profile.phone);
    } catch (smsError) {
      res.status(500).json({
        message: "Failed to send OTP. Please try again later.",
        error:
          smsError instanceof Error ? smsError.message : "Unknown SMS error",
      });
    }

    res
      .status(200)
      .json({ message: "OTP sent to your registered phone number." });
  } catch (error) {
    // Handle internal server errors properly
    res.status(500).json({
      message: "An error occurred while generating OTP.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Ensure user is authenticated
    const customer = req.user;
    if (!customer) {
      res.status(401).json({ message: "Unauthorized. Please log in." });
      return;
    }

    // Find customer profile
    const profile = await Customer.findById(customer._id);
    if (!profile) {
      res.status(404).json({ message: "Customer profile not found." });
      return;
    }

    res.status(200).json({
      message: "Profile retrieved successfully",
      data: profile,
    });
  } catch (error) {
    // Handle internal server errors properly
    res.status(500).json({
      message: "An error occurred while retrieving the profile.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const EditCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Ensure user is authenticated
    const customer = req.user;
    if (!customer) {
      res.status(401).json({ message: "Unauthorized. Please log in." });
      return;
    }

    // Validate input data
    const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);
    const profileErrors = await validate(profileInputs, {
      validationError: { target: true },
    });

    if (profileErrors.length > 0) {
      res.status(400).json({
        message: "Invalid input data",
        error: profileErrors,
      });
      return;
    }

    const { firstName, lastName, address } = profileInputs;

    // Find customer profile
    const profile = await Customer.findById(customer._id);
    if (!profile) {
      res.status(404).json({ message: "Customer profile not found." });
      return;
    }

    // Update profile details
    profile.firstName = firstName;
    profile.lastName = lastName;
    profile.address = address;

    // Save the updated profile
    const result = await profile.save();

    res.status(200).json({
      message: "Profile updated successfully",
      data: result,
    });
  } catch (error) {
    // Handle internal server errors properly
    res.status(500).json({
      message: "An error occurred while editing the profile.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const CreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //Grab the currently logged-in customer
    const customer = req.user;

    if (!customer) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Fetch customer profile from DB
    const profile = await Customer.findById(customer._id);
    if (!profile) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    // Grab order items from request body
    const cart = req.body as OrderInputs[];
    if (!cart || cart.length === 0) {
      res.status(400).json({ message: "Cart is empty" });
      return;
    }

    // Generate a random order ID
    const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

    let cartItems = Array();
    let netAmount = 0.0;

    // 🍽 Fetch food items by IDs present in cart
    const foods = await Food.find()
      .where("_id")
      .in(cart.map((item) => item._id))
      .exec();

    // Match cart items with food and calculate total
    foods.forEach((food) => {
      cart.forEach(({ _id, unit }) => {
        if (food._id == _id) {
          netAmount += food.price * unit;
          cartItems.push({ food, unit });
        }
      });
    });

    if (cartItems.length == 0) {
      res.status(400).json({ message: "No matching food items found" });
      return;
    }

    // Create the order
    const currentOrder = await Order.create({
      orderID: orderId,
      items: cartItems,
      totalAmount: netAmount,
      orderDate: new Date(),
      paidThrough: "COD", // You can later add online methods
      paymentResponse: "",
      orderStatus: "waiting",
    });

    if (!currentOrder) {
      res.status(500).json({ message: "Failed to create order" });
      return;
    }

    // Push order into customer profile and save
    profile.orders.push(currentOrder);
    const profileResponse = await profile.save();

    // Send success response
    res.status(200).json({
      message: "Order placed successfully",
      data: currentOrder,
    });
  } catch (error) {
    // Handle internal server errors properly
    res.status(500).json({
      message: "An error occurred while placing the order.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const GetOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //Grab the currently logged-in customer
    const customer = req.user;

    if (!customer) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Fetch customer profile and populate orders
    const profile = await Customer.findById(customer._id).populate("orders");
    if (!profile) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    res.status(200).json({
      message: "Customer Orders fetched successfully",
      data: profile.orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching orders.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const GetOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      res.status(400).json({ message: "Order ID is required" });
      return;
    }

    const order = await Order.findById(orderId).populate("items.food");

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.status(200).json({
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching orders.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
