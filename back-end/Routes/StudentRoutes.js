import express from "express";
import {
  checkstudent,
  forgotPassword,
  getLocationHistory,
  getTodayAttendance,
  punchIn,
  punchOut,
  resetPassword,
  saveLocation,
} from "../Controller/StudentController.js";
import { verifyToken } from "../AuthMiddleware.js";

const studentroutes = express.Router();

studentroutes.post("/checkstudent", checkstudent);
studentroutes.post("/punch-in", verifyToken, punchIn);
studentroutes.post("/punch-out", verifyToken, punchOut);
studentroutes.get("/today-attendance", verifyToken, getTodayAttendance);


studentroutes.post("/location", verifyToken, saveLocation);
studentroutes.get("/location/history", verifyToken, getLocationHistory);

studentroutes.post("/forgot-password", forgotPassword);
studentroutes.post("/reset-password", resetPassword);





export default studentroutes;



