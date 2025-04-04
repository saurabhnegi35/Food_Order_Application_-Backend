import { Request, NextFunction, Response } from "express";
import { AuthPayload } from "../dto/index";
import { ValidateToken } from "../utility";

// Extending Express's Request object to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload; // Defines an optional user property in the Request object
    }
  }
}

/**
 * Middleware to authenticate users using JWT tokens.
 *
 * This function validates the request's Authorization token and, if valid,
 * allows the request to proceed. Otherwise, it returns an appropriate error response.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function to pass control to the next middleware
 */

export const Authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the JWT token from the Authorization header
    const token = await ValidateToken(req);

    if (token) {
      // If the token is valid, proceed to the next middleware or route handler
      next();
    } else {
      // If the token is invalid or missing, return an unauthorized response
      res.status(401).json({ message: "User not Authorized" });
    }
  } catch (error) {
    // Handle unexpected errors during authentication
    res.status(500).json({
      message: "An error occurred during authentication",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
