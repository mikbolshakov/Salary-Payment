import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  hash: { type: String, unique: true, required: true },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
