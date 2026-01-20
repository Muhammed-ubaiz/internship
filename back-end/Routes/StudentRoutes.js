import express from "express";
import {
  checkstudent,
  getLocationHistory,
  getTodayAttendance,
  punchIn,
  punchOut,

  

  requestPunchIn,
  resetStudentPassword,

  saveLocation,
  sendStudentOtp,
  verifyStudentOtp,
} from "../Controller/StudentController.js";
import { verifyToken } from "../AuthMiddleware.js";

const studentroutes = express.Router();

studentroutes.post("/checkstudent", checkstudent);
studentroutes.post("/punch-in", verifyToken, punchIn);
studentroutes.post("/request-punch-in", verifyToken,requestPunchIn);
studentroutes.post("/punch-out", verifyToken, punchOut);
studentroutes.get("/today-attendance", verifyToken, getTodayAttendance);


studentroutes.post("/location", verifyToken, saveLocation);
studentroutes.get("/location/history", verifyToken, getLocationHistory);

studentroutes.post("/send-otp",sendStudentOtp);
studentroutes.post("/verify-otp", verifyStudentOtp);
studentroutes.post("/reset-password", resetStudentPassword);










export default studentroutes;



