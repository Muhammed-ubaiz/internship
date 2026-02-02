import express from "express";
import { verifyToken } from "../AuthMiddleware.js";
import { 
  acceptPunchRequest,  
  getPunchRequests, 
  getstudent, 
  getStudentLeavesForMentor, 
  mentorlogin, 
  rejectPunchRequest,
  resetPassword, 
  sendOtp,  
  updateStudentLeaveStatus, 
  verifyOtp 
} from "../Controller/MentorContriller.js";

const mentorroutes = express.Router();

mentorroutes.post("/mentorlogin", mentorlogin);

mentorroutes.post("/forgot-password", sendOtp);
mentorroutes.post("/verify-otp", verifyOtp);
mentorroutes.post("/reset-password", resetPassword);

mentorroutes.get("/getStudents", verifyToken, getstudent);


mentorroutes.get("/leave-requests", verifyToken, getStudentLeavesForMentor);
mentorroutes.post("/leave-requests/:id/:action", verifyToken, updateStudentLeaveStatus);

mentorroutes.get("/punch-requests", verifyToken, getPunchRequests);
mentorroutes.post("/punch-requests/:id/accept", verifyToken, acceptPunchRequest);
mentorroutes.post("/punch-requests/:id/reject", verifyToken, rejectPunchRequest);

export default mentorroutes;