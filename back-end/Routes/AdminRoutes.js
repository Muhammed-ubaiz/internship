import express from "express";



 
import { Login,addCourse,getCourse,deleteCourse, getBatches, addBatch, deleteBatch,addStudent,getStudents, updateCourse } from "../Controller/AdminController.js";




import { verifyToken } from "../AuthMiddleware.js";

const adminRoutes = express.Router();


adminRoutes.post("/login", Login);

/* COURSES */
adminRoutes.post("/addCourse",verifyToken, addCourse);
adminRoutes.get("/getCourse",verifyToken, getCourse);
adminRoutes.delete("/deleteCourse/:id", deleteCourse);
adminRoutes.post("/updateCourse/:_id", updateCourse);



adminRoutes.get("/getBatches/:courseName", getBatches);
adminRoutes.post("/addBatch/:courseName", addBatch);
adminRoutes.delete("/deleteBatch/:batchId", deleteBatch);


adminRoutes.post("/addStudent", addStudent);
adminRoutes.get("/getStudents", getStudents);


export default adminRoutes;
