import express from "express";

import { checkstudent, punchIn } from "../Controller/StudentController.js";
import { verifyToken } from "../AuthMiddleware.js";
const studentroutes = express.Router();

studentroutes.post("/checkstudent", checkstudent);
studentroutes.post("/punch-in",verifyToken, punchIn)

import { checkstudent, punchIn,  } from "../Controller/StudentController.js";

const studentroutes = express.Router();

studentroutes.post("/checkstudent", checkstudent);
studentroutes.post("/punch-in", punchIn)



export default studentroutes;
