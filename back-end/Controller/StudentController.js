import Student from "../Model/Studentsmodel.js";
import Attendance from "../Model/Attendancemodel.js";
import jwt from "jsonwebtoken"

import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const checkstudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find student by email
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    
    const token = jwt.sign(
      { id: student._id, email: student.email, role: "student" }, // payload
      JWT_SECRET,
      { expiresIn: "10m" } 
    );

    // Send response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role:"student",
      },
      token
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const punchIn = async (req, res) => {
  try {
   
    const { studentId, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Location required" });
    }

    // Get today's date at 00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already punched in today
    const existing = await Attendance.findOne({
     
      date: today,
    });

    if (existing) {
      return res.status(400).json({ message: "Already punched in today" });
    }

    const attendance = await Attendance.create({
   
      punchInTime: new Date(),
      punchInLocation: { latitude, longitude },
      studentId,
      date: today,
    });

    res.status(201).json({
      message: "Punch in successful",
      attendance,
    });
  } catch (error) {
    console.error("Punch In Error:", error);
    res.status(500).json({ message: "Punch in failed" });
  }
};




