import express from "express";
import { Login,addCourse,getCourse,deleteCourse, getBatches, addBatch, updateCourse, deleteBatch,addStudent,getStudents,toggleStudentStatus, updateStudent, toggleCourseStatus, sendOtp, verifyOtp, saveLocation, addMentor, getMentors, toggleMentorStatus, updateMentor,  getAllPendingLeaves, updateLeaveStatusAdmin, sendInformation, getDailyAttendance } from "../Controller/AdminController.js";

import { verifyToken } from "../AuthMiddleware.js";

const adminRoutes = express.Router();


adminRoutes.post("/login", Login);


adminRoutes.post("/addCourse",verifyToken, addCourse);
adminRoutes.get("/getCourse",verifyToken, getCourse);
adminRoutes.delete("/deleteCourse/:id",verifyToken, deleteCourse);
adminRoutes.post("/updateCourse/:_id",verifyToken, updateCourse);



adminRoutes.get("/getBatches/:courseName",verifyToken ,getBatches);
adminRoutes.post("/addBatch/:courseName",verifyToken, addBatch);
adminRoutes.delete("/deleteBatch/:batchId",verifyToken, deleteBatch);

adminRoutes.post("/addStudent",verifyToken, addStudent);
adminRoutes.get("/getStudents",verifyToken, getStudents);

adminRoutes.put("/student/status/:id",verifyToken ,toggleStudentStatus);
adminRoutes.put("/course/status/:id", toggleCourseStatus);

adminRoutes.put("/updateStudent/:id",verifyToken, updateStudent);

adminRoutes.post("/send-otp",verifyToken,sendOtp);
adminRoutes.post("/verify-otp",verifyToken, verifyOtp);

adminRoutes.post("/location", saveLocation);;

adminRoutes.post("/addMentor",verifyToken, addMentor);
adminRoutes.get("/getMentors",verifyToken, getMentors);
adminRoutes.put("/updateMentor/:id", verifyToken, updateMentor);

adminRoutes.put("/mentor/status/:id",verifyToken, toggleMentorStatus);

adminRoutes.get('/daily-attendance', getDailyAttendance);

adminRoutes.get("/leave-requests", verifyToken, getAllPendingLeaves);
adminRoutes.put("/leave-status/:id", verifyToken, updateLeaveStatusAdmin);

adminRoutes.post("/send-information", sendInformation);



export default adminRoutes;
