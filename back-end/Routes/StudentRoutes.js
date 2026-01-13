import express from "express";

import { checkstudent, punchIn,saveLocations } from "../Controller/StudentController.js";
import { verifyToken } from "../AuthMiddleware.js";
const studentroutes = express.Router();

studentroutes.post("/checkstudent", checkstudent);
studentroutes.post("/punch-in",verifyToken, punchIn)
studentroutes.post("/location", saveLocations);;




export default studentroutes;
