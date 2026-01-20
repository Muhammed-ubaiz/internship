
import express from "express";
import {
  mentorlogin,
  sendOtp,
  verifyOtp,
  resetPassword,
  getstudent,
  getPunchRequests,
  acceptPunchRequest,
} from "../Controller/MentorContriller.js";


import { verifyToken } from "../AuthMiddleware.js";

const mentorroutes = express.Router();

mentorroutes.post("/mentorlogin",mentorlogin);

mentorroutes.post("/forgot-password",verifyToken, sendOtp);
mentorroutes.post("/verify-otp",verifyToken, verifyOtp);
mentorroutes.post("/reset-password",verifyToken, resetPassword);

mentorroutes.get("/getStudents",verifyToken,getstudent)

mentorroutes.get("/punch-requests", getPunchRequests);
mentorroutes.post(
  "/punch-requests/:id/accept",
  verifyToken,
  acceptPunchRequest
);


export default mentorroutes;
