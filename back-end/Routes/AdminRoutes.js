import express from "express";




import { Login,addCourse,getCourse,deleteCourse, getBatches, addBatch, updateCourse, deleteBatch,addStudent,getStudents,toggleStudentStatus, updateStudent, toggleCourseStatus, sendOtp, verifyOtp, saveLocation, addMentor } from "../Controller/AdminController.js";

 





import { verifyToken } from "../AuthMiddleware.js";

const adminRoutes = express.Router();


adminRoutes.post("/login", Login);


adminRoutes.post("/addCourse",verifyToken, addCourse);
adminRoutes.get("/getCourse",verifyToken, getCourse);
adminRoutes.delete("/deleteCourse/:id",verifyToken, deleteCourse);
adminRoutes.post("/updateCourse/:_id",verifyToken, updateCourse);



adminRoutes.get("/getBatches/:courseName",verifyToken ,getBatches);
adminRoutes.post("/addBatch/:courseName",verifyToken, addBatch);
adminRoutes.delete("/deleteBatch/:batchId", deleteBatch);

adminRoutes.post("/addStudent",verifyToken, addStudent);
adminRoutes.get("/getStudents",verifyToken, getStudents);

adminRoutes.put("/student/status/:id", toggleStudentStatus);
adminRoutes.put("/course/status/:id", toggleCourseStatus);

adminRoutes.put("/updateStudent/:id",verifyToken, updateStudent);

adminRoutes.post("/send-otp",sendOtp);
adminRoutes.post("/verify-otp", verifyOtp);

adminRoutes.post("/location", saveLocation);;

adminRoutes.post("/addMentor", addMentor);



export default adminRoutes;
