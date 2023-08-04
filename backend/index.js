import express from "express";
import mongoose from "mongoose";
import Employee from "./schema.js";
import Transaction from "./transactionSchema.js";
import { validationResult } from "express-validator";
import { employeeValidation } from "./validations.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const PORT = 3500;
const DB_URL = `mongodb+srv://admin:${process.env.DB_PASSWORD}@salarycluster.mtp2sic.mongodb.net/?retryWrites=true&w=majority`;

const app = express();

app.use(cors());
app.use(express.json());

// Transactions
app.get("/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find({});
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error to get list of transactions",
    });
  }
});

app.post("/transactions", async (req, res) => {
  try {
    const { date, amount, hash } = req.body;
    const newTransaction = new Transaction({ date, amount, hash });
    const transaction = await newTransaction.save();
    res.json({ ...transaction._doc });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating transaction",
    });
  }
});

// Employees
app.get("/all", async (req, res) => {
  try {
    const employees = await Employee.find({});
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error to get list of employees",
    });
  }
});

app.post("/employees", employeeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    const { fullName, walletAddress, salary } = req.body;
    const bonus = 0;
    const penalty = 0;
    const newEmployee = new Employee({
      fullName,
      walletAddress,
      salary,
      bonus,
      penalty,
    });
    const user = await newEmployee.save();
    res.json({ ...user._doc });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating employee",
    });
  }
});

app.put("/employees/patch", async (req, res) => {
  try {
    const { walletAddress, salary, bonus, penalty } = req.body;
    const updatedEmployee = await Employee.findOneAndUpdate(
      { walletAddress },
      { $set: { salary, bonus, penalty } }
    );

    if (!updatedEmployee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.json(updatedEmployee);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating employee data",
    });
  }
});

app.delete("/employees/delete", async (req, res) => {
  try {
    const { walletAddress } = req.query;
    const deletedEmployee = await Employee.findOneAndDelete({ walletAddress });

    if (!deletedEmployee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.json({
      message: "Employee successfully deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error when deleting an employee",
    });
  }
});

async function startApp() {
  try {
    await mongoose.connect(DB_URL);
    app.listen(PORT, () =>
      console.log("The server is running on a port " + PORT)
    );
  } catch (error) {
    console.log(error);
  }
}

startApp();
