// OTP

import { ACCOUNT_SID, AUTH_TOKEN, TWILIO_PHONE } from "../config";

export const generateOTP = () => {
  //   const otp = Math.floor(1000 + Math.random() * 9000);
  //   let expiry = new Date();
  //   expiry.setTime(new Date().getTime() + 30 * 60 * 1000);
  const otp = Math.floor(1000 + Math.random() * 9000); // Ensures a 4-digit OTP
  const expiry = new Date(Date.now() + 30 * 60 * 1000); // Expires in 30 minutes

  return { otp, expiry };
};

export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {
  const accountSid = ACCOUNT_SID;
  const authToken = AUTH_TOKEN;
  const client = require("twilio")(accountSid, authToken);

  const response = await client.messages.create({
    body: `Your OTP is ${otp}`,
    from: TWILIO_PHONE,
    to: `+91${toPhoneNumber}`,
  });

  return response;
};
