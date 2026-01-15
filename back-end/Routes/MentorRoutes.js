import express from "express";
import {
  mentorlogin,
  sendOtp,
  verifyOtp,
  resetPassword,
} from "../Controller/MentorContriller.js";

const mentorroutes = express.Router();

mentorroutes.post("/mentorlogin", mentorlogin);
mentorroutes.post("/forgot-password", sendOtp);
mentorroutes.post("/verify-otp", verifyOtp);
mentorroutes.post("/reset-password", resetPassword);

export default mentorroutes;
