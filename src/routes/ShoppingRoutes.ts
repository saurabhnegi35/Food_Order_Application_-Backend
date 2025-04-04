import express from "express";
import {
  GetFoodAvailability,
  GetFoodsIn30Min,
  GetTopRestaurants,
  RestaurantById,
  SearchFoods,
} from "../controllers";

const router = express.Router();

router.get("/:pincode", GetFoodAvailability);
router.get("/top-restaurants/:pincode", GetTopRestaurants);
router.get("/foods-in-30-min/:pincode", GetFoodsIn30Min);
router.get("/search/:pincode", SearchFoods);
router.get("/restaurant/:id", RestaurantById);

export { router as ShoppingRoutes };
