import express from "express";
import {
  checkstudent,
  getLocationHistory,
  getTodayAttendance,
  punchIn,
  punchOut,
  resetStudentPassword,
  requestPunchIn,
  saveLocation,
  sendStudentOtp,
  verifyStudentOtp,

  firstPunchInWithLocation,
  getStudentsByMentor,

  getStudentNotifications,
  deleteStudentNotification,
  getMyLeaves,
  applyLeave,
  getLeaveCount,
  getStudentAnnouncements,
  getMonthlySummary,
  autoPunchOut,
  getInitialLocation,
  verifyResetToken,
  setPassword,
  deleteStudentAnnouncement,

} from "../Controller/StudentController.js";
import { verifyToken } from "../AuthMiddleware.js";

const studentroutes = express.Router();


studentroutes.post("/checkstudent", checkstudent);
studentroutes.post("/punch-in", verifyToken, punchIn);
studentroutes.post("/request-punch-in", verifyToken, requestPunchIn);
studentroutes.post("/punch-out", verifyToken, punchOut);
studentroutes.post("/auto-punch-out", verifyToken, autoPunchOut);
studentroutes.get("/today-attendance", verifyToken, getTodayAttendance);
studentroutes.get("/initial-location", verifyToken, getInitialLocation);

studentroutes.post("/location", verifyToken, saveLocation);
studentroutes.get("/location/history", verifyToken, getLocationHistory);

studentroutes.post("/send-otp", sendStudentOtp);
studentroutes.post("/verify-otp", verifyStudentOtp);
studentroutes.post("/reset-password", resetStudentPassword);


studentroutes.get("/notifications", verifyToken, getStudentNotifications);
studentroutes.delete("/notifications/:id", verifyToken, deleteStudentNotification);


studentroutes.get("/mentor/:mentorEmail", verifyToken, getStudentsByMentor)
studentroutes.post("/first-punch-in-with-location", verifyToken, firstPunchInWithLocation)


studentroutes.post("/apply-leave", verifyToken, applyLeave);
studentroutes.get("/my-leaves", verifyToken, getMyLeaves);
studentroutes.get("/leave-count", verifyToken, getLeaveCount);
studentroutes.get("/monthly-summary", verifyToken, getMonthlySummary); 


studentroutes.post("/verify-reset-token", verifyResetToken);
studentroutes.post("/set-password", setPassword); // No auth needed


// Announcement routes
studentroutes.get("/announcements", verifyToken, getStudentAnnouncements);
studentroutes.delete("/announcements/:id", verifyToken, deleteStudentAnnouncement);

export default studentroutes;
