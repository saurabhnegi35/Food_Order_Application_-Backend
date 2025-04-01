import express, { Request, Response, NextFunction } from "express";
import { VendorLogin } from "../controllers";
const router = express.Router();

router.post('/login', VendorLogin)

export { router as VendorRoutes };
