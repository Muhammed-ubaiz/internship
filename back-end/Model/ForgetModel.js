import mongoose from "mongoose";

const forgetSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  otpExpiry: { type: Date, required: true },
});

const ForgetModel = mongoose.model("Forget", forgetSchema);
export default ForgetModel;
