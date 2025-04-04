import express from "express";
import { Authenticate } from "../middlewares";
import {
  CustomerLogin,
  CustomerSignUp,
  CustomerVerify,
  EditCustomerProfile,
  GetCustomerProfile,
  RequestOtp,
} from "../controllers";

const router = express.Router();

router.post("/signup", CustomerSignUp);
router.post("/login", CustomerLogin);

router.use(Authenticate);
router.patch("/verify", CustomerVerify);
router.get("/otp", RequestOtp);
router.get("/profile", GetCustomerProfile);
router.patch("/profile", EditCustomerProfile);

export { router as CustomerRoutes };
