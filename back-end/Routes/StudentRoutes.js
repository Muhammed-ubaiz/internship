import express from "express";
import { 
  checkstudent, 
  getLocationHistory, 
  punchIn, 
  punchOut, 
  saveLocation 
} from "../Controller/StudentController.js";
import { verifyToken } from "../AuthMiddleware.js";

const studentroutes = express.Router();

studentroutes.post("/checkstudent", checkstudent);
studentroutes.post("/punch-in", verifyToken, punchIn);
studentroutes.post("/punch-out", verifyToken, punchOut);

studentroutes.post('/location', verifyToken, saveLocation);
studentroutes.get('/location/history', verifyToken, getLocationHistory);

export default studentroutes;