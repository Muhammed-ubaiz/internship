import express from "express";

import { Login,addCourse,getCourse,deleteCourse, } from "../Controller/AdminController.js";
import { verifyToken } from "../AuthMiddleware.js";

const adminRoutes = express.Router();











/* AUTH */
adminRoutes.post("/login", Login);

/* COURSES */
adminRoutes.post("/addCourse", addCourse);
adminRoutes.get("/getCourse", getCourse);
adminRoutes.delete("/deleteCourse/:id", deleteCourse);


export default adminRoutes;
