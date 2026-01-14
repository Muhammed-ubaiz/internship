import express from "express"
import { mentorlogin } from "../Controller/MentorContriller.js";

const mentorroutes = express.Router();

mentorroutes.post("/mentorlogin",mentorlogin)



export default mentorroutes


