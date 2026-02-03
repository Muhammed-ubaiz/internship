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
  verifyOtp,
  getMentorNotifications,
  getTodayAttendance,
  deleteMentorNotification,
  getMentorProfile
} from "../Controller/MentorContriller.js";

const mentorroutes = express.Router();

// Auth routes
mentorroutes.post("/mentorlogin", mentorlogin);
mentorroutes.post("/forgot-password", sendOtp);
mentorroutes.post("/verify-otp", verifyOtp);
mentorroutes.post("/reset-password", resetPassword);

// Student routes
mentorroutes.get("/getStudents", verifyToken, getstudent);

// Leave request routes
mentorroutes.get("/leave-requests", verifyToken, getStudentLeavesForMentor);
mentorroutes.post("/leave-requests/:id/:action", verifyToken, updateStudentLeaveStatus);

// ✅ FIXED: Punch request routes - removed duplicates and fixed parameter names
mentorroutes.get("/punch-requests", verifyToken, getPunchRequests);
mentorroutes.post("/punch-requests/:requestId/accept", verifyToken, acceptPunchRequest);
mentorroutes.post("/punch-requests/:requestId/reject", verifyToken, rejectPunchRequest);

// Attendance routes
mentorroutes.get("/today-attendance", getTodayAttendance);

// Notification routes
mentorroutes.get("/notifications", getMentorNotifications);
mentorroutes.delete("/notifications/:id", deleteMentorNotification);

// Profile routes
mentorroutes.get("/profile", verifyToken, getMentorProfile);

export default mentorroutes;