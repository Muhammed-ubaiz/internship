import express from "express";
import { checkstudent } from "../Controller/StudentController.js";

const studentroutes = express.Router();

studentroutes.post("/checkstudent", checkstudent);

export default studentroutes;
