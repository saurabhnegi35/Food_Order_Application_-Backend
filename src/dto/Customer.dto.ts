import { IsEmail, IsNotEmpty, Length, Matches } from "class-validator";

export class CreateCustomerInputs {
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @IsNotEmpty({ message: "Phone number is required" })
  @Length(7, 12, { message: "Phone number must be between 7 to 12 digits" })
  @Matches(/^\d+$/, { message: "Phone number must contain only digits" })
  phone: string;

  @IsNotEmpty({ message: "Password is required" })
  @Length(6, 12, { message: "Password must be between 6 to 12 characters" })
  password: string;
}

export class UserLoginInputs {
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @IsNotEmpty({ message: "Password is required" })
  @Length(6, 12, { message: "Password must be between 6 to 12 characters" })
  password: string;
}

export class EditCustomerProfileInputs {
  @Length(3, 16, { message: "Firstname must be between 3 to 16 characters" })
  firstName: string;

  @Length(3, 16, { message: "Lastname must be between 3 to 16 characters" })
  lastName: string;

  @Length(6, 16, { message: "Address must be between 6 to 16 characters" })
  address: string;
}

export interface CustomerPayload {
  _id: string;
  email: string;
  verified: boolean;
}
