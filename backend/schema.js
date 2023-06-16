import mongoose from "mongoose";

const Employee = new mongoose.Schema({
  fullName: { type: String, unique: true, required: true },
  walletAddress: { type: String, unique: true, required: true },
  salary: { type: Number, required: true },
  bonus: { type: Number },
  penalty: { type: Number },
});

export default mongoose.model("Employee", Employee);
