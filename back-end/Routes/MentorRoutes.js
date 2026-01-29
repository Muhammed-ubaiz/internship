import express from "express";
import { verifyToken } from "../AuthMiddleware.js";
import { acceptPunchRequest, getMentorNotifications, getPunchRequests, getstudent, mentorlogin, rejectPunchRequest, resetPassword, sendOtp, verifyOtp } from "../Controller/MentorContriller.js";

const mentorroutes = express.Router();

mentorroutes.post("/mentorlogin", mentorlogin);

mentorroutes.post("/forgot-password", verifyToken, sendOtp);
mentorroutes.post("/verify-otp", verifyToken, verifyOtp);
mentorroutes.post("/reset-password", verifyToken, resetPassword);

mentorroutes.get("/getStudents", verifyToken, getstudent);

mentorroutes.get("/punch-requests", verifyToken, getPunchRequests);
mentorroutes.post(
  "/punch-requests/:id/accept",
  verifyToken,
  acceptPunchRequest
);
mentorroutes.put(
  "/reject-punch/:id", rejectPunchRequest
);


mentorroutes.get("/notifications", getMentorNotifications)

export default mentorroutes;