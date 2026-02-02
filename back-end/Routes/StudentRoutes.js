import express from "express";
import {
  checkstudent,
  getLocationHistory,
  getTodayAttendance,
  punchIn,
  punchOut,
  resetStudentPassword,
  requestPunchIn,
  requestPunchOut,
  saveLocation,
  sendStudentOtp,
  verifyStudentOtp,
  // ─── NEW ───
  firstPunchInWithLocation,
  getMyLeaves,

  applyLeave,
  getLeaveCount,
} from "../Controller/StudentController.js";
import { verifyToken } from "../AuthMiddleware.js";

const studentroutes = express.Router();


studentroutes.post("/checkstudent", checkstudent);
studentroutes.post("/punch-in", verifyToken, punchIn);
studentroutes.post("/request-punch-in", verifyToken, requestPunchIn);
studentroutes.post("/request-punch-out", verifyToken, requestPunchOut);
studentroutes.post("/punch-out", verifyToken, punchOut);
studentroutes.get("/today-attendance", verifyToken, getTodayAttendance);

studentroutes.post("/location", verifyToken, saveLocation);
studentroutes.get("/location/history", verifyToken, getLocationHistory);

studentroutes.post("/send-otp", sendStudentOtp);
studentroutes.post("/verify-otp", verifyStudentOtp);
studentroutes.post("/reset-password", resetStudentPassword);

studentroutes.post(
  "/first-punch-in-with-location",
  verifyToken,
  firstPunchInWithLocation,
);

studentroutes.post("/apply-leave", verifyToken, applyLeave);
studentroutes.get("/my-leaves", verifyToken, getMyLeaves);
studentroutes.get("/leave-count", verifyToken, getLeaveCount); 

export default studentroutes;
