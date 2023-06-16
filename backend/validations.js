import { body } from "express-validator";
import Employee from "./schema.js";

export const employeeValidation = [
  body("fullName").custom(async (fullName) => {
    const employee = await Employee.findOne({ fullName });
    if (employee) {
      return Promise.reject("Full name already exists");
    }
  }),
  body("walletAddress").custom(async (walletAddress) => {
    const employee = await Employee.findOne({ walletAddress });
    if (employee) {
      return Promise.reject("Wallet address already exists");
    }
  }),
];
