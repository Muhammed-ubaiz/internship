import express from "express";

import { Login,addCourse,getCourse,deleteCourse, } from "../Controller/AdminController.js";
import { verifyToken } from "../AuthMiddleware.js";

const adminRoutes = express.Router();


adminRoutes.post("/login", Login);

/* COURSES */
adminRoutes.post("/addCourse",verifyToken, addCourse);
adminRoutes.get("/getCourse",verifyToken, getCourse);
adminRoutes.delete("/deleteCourse/:id", deleteCourse);


export default adminRoutes;
