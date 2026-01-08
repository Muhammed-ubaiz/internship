import express from "express";
import { checkstudent, forgotPassword, punchIn, resetPassword } from "../Controller/StudentController.js";

const studentroutes = express.Router();

studentroutes.post("/checkstudent", checkstudent);
studentroutes.post("/punch-in", punchIn)
studentroutes.post("/forgot-password",forgotPassword)
studentroutes.post("/reset-password",resetPassword)

export default studentroutes;
