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
  getMentorProfile,
  getbatch,
  announcementsend,
  getMyAnnouncements,
  deleteAnnouncement,
  getMonthlySummaryForMentor,
  getLeaveHistoryForMentor

} from "../Controller/MentorContriller.js";

const mentorroutes = express.Router();

// Auth routes (NO verifyToken)
mentorroutes.post("/mentorlogin", mentorlogin);
mentorroutes.post("/forgot-password", sendOtp);
mentorroutes.post("/verify-otp", verifyOtp);
mentorroutes.post("/reset-password", resetPassword);

// All routes below require verifyToken

// Profile routes
mentorroutes.get("/profile", verifyToken, getMentorProfile);

// Student routes
mentorroutes.get("/getStudents", verifyToken, getstudent);
mentorroutes.get("/getbatch", verifyToken, getbatch);

// Leave request routes
mentorroutes.get("/leave-requests", verifyToken, getStudentLeavesForMentor);
mentorroutes.get("/leave-history", verifyToken, getLeaveHistoryForMentor);
mentorroutes.post("/leave-requests/:id/:action", verifyToken, updateStudentLeaveStatus);

// Punch request routes
mentorroutes.get("/punch-requests", verifyToken, getPunchRequests);
mentorroutes.post("/punch-requests/:id/accept", verifyToken, acceptPunchRequest);
mentorroutes.post("/punch-requests/:requestId/accept", verifyToken, acceptPunchRequest);
mentorroutes.post("/punch-requests/:requestId/reject", verifyToken, rejectPunchRequest);
mentorroutes.put("/reject-punch/:id", verifyToken, rejectPunchRequest);

// Attendance routes
mentorroutes.get("/today-attendance", verifyToken, getTodayAttendance);
mentorroutes.get("/monthly-summary", verifyToken, getMonthlySummaryForMentor);

// Notification routes
mentorroutes.get("/notifications", verifyToken, getMentorNotifications);
mentorroutes.delete("/notifications/:id", verifyToken, deleteMentorNotification);

// Announcement routes
mentorroutes.post("/announcementsend", verifyToken, announcementsend);
mentorroutes.get("/my-announcements", verifyToken, getMyAnnouncements);
mentorroutes.delete("/announcements/:id", verifyToken, deleteAnnouncement);

export default mentorroutes;
