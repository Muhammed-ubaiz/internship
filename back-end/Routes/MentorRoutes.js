import express from "express";

import { verifyToken } from "../AuthMiddleware.js";
import { addMentor, getMentor } from "../Controller/AdminController.js";

const mentorRoutes = express.Router();

mentorRoutes.post("/login", MentorLogin);
mentorRoutes.post("/addMentor", verifyToken, addMentor);
mentorRoutes.get("/getMentors", verifyToken, getMentor);
mentorRoutes.put("/updateMentor/:id", verifyToken, updateMentor);
mentorRoutes.put("/mentor/status/:id", toggleMentorStatus);

export default mentorRoutes;
