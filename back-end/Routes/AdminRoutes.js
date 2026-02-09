import express from "express";
import {
  Login,
  addCourse,
  getCourse,
  deleteCourse,
  getBatches,
  addBatch,
  updateCourse,
  deleteBatch,
  addStudent,
  getStudents,
  toggleStudentStatus,
  updateStudent,
  toggleCourseStatus,
  saveLocation,
  addMentor,
  getMentors,
  toggleMentorStatus,
  updateMentor,
  getAllPendingLeaves,
  updateLeaveStatusAdmin,
  sendInformation,
  getDailyAttendance,
  getAllLeaves,
  getMonthlySummaryForAdmin,
  sendPasswordResetLink,
} from "../Controller/AdminController.js";

import { verifyToken } from "../AuthMiddleware.js";

const adminRoutes = express.Router();

// Auth routes (NO verifyToken)
adminRoutes.post("/login", Login);

// All routes below require verifyToken

// Course routes
adminRoutes.post("/addCourse", verifyToken, addCourse);
adminRoutes.get("/getCourse", verifyToken, getCourse);
adminRoutes.delete("/deleteCourse/:id", verifyToken, deleteCourse);
adminRoutes.post("/updateCourse/:_id", verifyToken, updateCourse);
adminRoutes.put("/course/status/:id", verifyToken, toggleCourseStatus);

// Batch routes
adminRoutes.get("/getBatches/:courseName", verifyToken, getBatches);
adminRoutes.post("/addBatch/:courseName", verifyToken, addBatch);
adminRoutes.delete("/deleteBatch/:batchId", verifyToken, deleteBatch);

// Student routes
adminRoutes.post("/addStudent", verifyToken, addStudent);
adminRoutes.get("/getStudents", verifyToken, getStudents);
adminRoutes.put("/student/status/:id", verifyToken, toggleStudentStatus);
adminRoutes.put("/updateStudent/:id", verifyToken, updateStudent);

// adminRoutes.js
adminRoutes.post("/send-password-link", verifyToken, sendPasswordResetLink);

// Location routes
adminRoutes.post("/location", verifyToken, saveLocation);

// Mentor routes
adminRoutes.post("/addMentor", verifyToken, addMentor);
adminRoutes.get("/getMentors", verifyToken, getMentors);
adminRoutes.put("/updateMentor/:id", verifyToken, updateMentor);
adminRoutes.put("/mentor/status/:id", verifyToken, toggleMentorStatus);

// Attendance routes
adminRoutes.get("/daily-attendance", verifyToken, getDailyAttendance);
adminRoutes.get("/monthly-summary", verifyToken, getMonthlySummaryForAdmin);

// Leave routes
adminRoutes.get("/leave-requests", verifyToken, getAllPendingLeaves);
adminRoutes.get("/leave-history", verifyToken, getAllLeaves);
adminRoutes.put("/leave-status/:id", verifyToken, updateLeaveStatusAdmin);

// Notification routes
adminRoutes.post("/send-information", verifyToken, sendInformation);

export default adminRoutes;
