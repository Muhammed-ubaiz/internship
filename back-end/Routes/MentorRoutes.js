import express from "express"
import { getstudent, mentorlogin } from "../Controller/MentorContriller.js";
import { verifyToken } from "../AuthMiddleware.js";

const mentorroutes = express.Router();

mentorroutes.post("/mentorlogin",mentorlogin)

mentorroutes.get("/getStudents",verifyToken,getstudent)



export default mentorroutes


