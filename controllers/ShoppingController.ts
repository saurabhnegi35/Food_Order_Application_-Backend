import express, { Request, Response, NextFunction } from "express";
import { FoodDoc, Vendor } from "../models";

export const GetFoodAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract pincode from request parameters
    const pincode = req.params?.pincode;

    // Validate if pincode is provided
    if (!pincode) {
      res.status(400).json({ message: "Pincode is required" });
      return;
    }

    // Find vendors that are available for service in the given pincode
    const vendors = await Vendor.find({ pincode, serviceAvailability: true })
      .sort([["rating", "descending"]]) // Sort vendors by highest rating first
      .populate("foods"); // Populate the "foods" field with relevant food items

    // If vendors are found, return them with status 200
    if (vendors.length > 0) {
      res.status(200).json({
        message: "Available food in your area",
        data: vendors,
      });
      return;
    }

    // If no vendors are found, return 404 (Not Found)
    res.status(404).json({ message: "No vendors found for the given pincode" });
  } catch (error) {
    // Handle internal server errors properly
    res.status(500).json({
      message: "An error occurred while fetching available food",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const GetTopRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract pincode from request parameters
    const pincode = req.params?.pincode;

    // Validate if pincode is provided
    if (!pincode) {
      res.status(400).json({ message: "Pincode is required" });
      return;
    }

    // Find vendors that are available for service in the given pincode
    const vendors = await Vendor.find({ pincode, serviceAvailability: true })
      .sort([["rating", "descending"]]) // Sort vendors by highest rating first
      .limit(10);

    // If vendors are found, return them with status 200
    if (vendors.length > 0) {
      res.status(200).json({
        message: "Available vendors in your area",
        data: vendors,
      });
      return;
    }

    // If no vendors are found, return 404 (Not Found)
    res.status(404).json({ message: "No vendors found for the given pincode" });
  } catch (error) {
    // Handle internal server errors properly
    res.status(500).json({
      message: "An error occurred while fetching vendors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const GetFoodsIn30Min = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract pincode from request parameters
    const pincode = req.params?.pincode;

    // Validate if pincode is provided, otherwise return a 400 (Bad Request) status
    if (!pincode) {
      res.status(400).json({ message: "Pincode is required" });
      return;
    }

    // Find vendors that are available for service in the given pincode
    const vendors = await Vendor.find({
      pincode,
      serviceAvailability: true,
    }).populate("foods");

    // If vendors are found, filter food items with a ready time of 30 minutes or less
    if (vendors.length > 0) {
      let foodResult: any = [];

      vendors.forEach((vendor) => {
        const foods = vendor.foods as FoodDoc[];

        const quickFoods = foods.filter(
          (food) => food.readyTime <= 30 // Otherwise, compare directly
        );

        foodResult.push(...quickFoods);
      });

      // Return available food items with a 200 (OK) status
      res.status(200).json({
        message: "Foods available in 30 minutes",
        data: foodResult,
      });
      return;
    }

    // If no vendors are found, return a 404 (Not Found) status
    res.status(404).json({ message: "No vendors found for the given pincode" });
  } catch (error) {
    // Handle internal server errors properly
    res.status(500).json({
      message: "An error occurred while fetching vendors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const SearchFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const RestaurantById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
