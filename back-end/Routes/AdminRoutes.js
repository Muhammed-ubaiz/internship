import express from "express";




import { Login,addCourse,getCourse,deleteCourse, getBatches, addBatch, updateCourse, deleteBatch,addStudent,getStudents,toggleStudentStatus, updateStudent, toggleCourseStatus } from "../Controller/AdminController.js";

 





import { verifyToken } from "../AuthMiddleware.js";

const adminRoutes = express.Router();


adminRoutes.post("/login", Login);


adminRoutes.post("/addCourse",verifyToken, addCourse);
adminRoutes.get("/getCourse",verifyToken, getCourse);
adminRoutes.delete("/deleteCourse/:id", deleteCourse);
adminRoutes.post("/updateCourse/:_id", updateCourse);



adminRoutes.get("/getBatches/:courseName", getBatches);
adminRoutes.post("/addBatch/:courseName", addBatch);
adminRoutes.delete("/deleteBatch/:batchId", deleteBatch);


adminRoutes.post("/addStudent", addStudent);
adminRoutes.get("/getStudents", getStudents);

adminRoutes.put("/student/status/:id", toggleStudentStatus);
adminRoutes.put("/course/status/:id", toggleCourseStatus);

adminRoutes.put("/updateStudent/:id", updateStudent);




export default adminRoutes;
