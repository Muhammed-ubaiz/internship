
import express from "express";
import {
  mentorlogin,
  sendOtp,
  verifyOtp,
  resetPassword,
  getstudent,
} from "../Controller/MentorContriller.js";


import { verifyToken } from "../AuthMiddleware.js";

const mentorroutes = express.Router();

mentorroutes.post("/mentorlogin",mentorlogin);
mentorroutes.post("/forgot-password", sendOtp);
mentorroutes.post("/verify-otp", verifyOtp);
mentorroutes.post("/reset-password", resetPassword);



mentorroutes.get("/getStudents",verifyToken,getstudent)




export default mentorroutes;
