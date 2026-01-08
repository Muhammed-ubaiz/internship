import Student from "../Model/Studentsmodel.js";
import Attendance from "../Model/Attendancemodel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";
import ForgetModel from "../Model/ForgetModel.js";
import nodemailer from "nodemailer"

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
    const isPasswordValid = bcrypt.compare(password, student.password);
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
;

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Generate OTP or token (for simplicity using OTP)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove old OTP
    await ForgetModel.deleteMany({ email: student.email });

    const otpStore = new ForgetModel({
      email: student.email,
      otp: otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
    });

    await otpStore.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: process.env.APP_EMAIL,
      to: email,
      subject: "Student Password Reset OTP",
      html: `<p>Your OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`,
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("ForgotPassword Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: "Email, OTP and new password required" });

    const otpRecord = await ForgetModel.findOne({ email: email.toLowerCase() });
    if (!otpRecord) return res.status(400).json({ message: "No OTP request found" });

    if (otpRecord.otpExpiry < Date.now()) {
      await ForgetModel.deleteOne({ email });
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    if (otpRecord.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Student.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword }
    );

    await ForgetModel.deleteOne({ email });

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("ResetPassword Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

