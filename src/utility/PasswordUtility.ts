import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request } from "express";

import { APP_SECRET } from "../config";
import { AuthPayload } from "../dto/Auth.dto";

export const GenerateSalt = async () => {
  return bcrypt.genSalt();
};

export const GeneratePassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string
) => {
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

export const GenerateToken = async (payload: AuthPayload) => {
  return jwt.sign(payload, APP_SECRET, { expiresIn: "1d" });
};

export const ValidateToken = async (req: Request) => {
  const token = req.get("Authorization");
  if (token) {
    try {
      const payload =await jwt.verify(
        token.split(" ")[1],
        APP_SECRET
      ) as AuthPayload;
      req.user = payload;
      return true;
    } catch (err) {
      return false;
    }
  }
  return false;
};
