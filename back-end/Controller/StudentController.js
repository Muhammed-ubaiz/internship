import Student from "../Model/Studentsmodel.js";
import Attendance from "../Model/Attendancemodel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";
import ForgetModel from "../Model/ForgetModel.js";
import nodemailer from "nodemailer"

// config/jwt.js
 const JWT_SECRET = process.env.JWT_SECRET || "key321";


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
      { expiresIn: "15m" } 
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
    const studentemail = req.user.id;
    const { latitude, longitude, distance } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's an ACTIVE session (not punched out yet)
    const activeSession = await Attendance.findOne({
      studentemail,
      date: today,
      $or: [
        { punchOutTime: { $exists: false } },
        { punchOutTime: null }
      ]
    });

    if (activeSession) {
      return res.status(400).json({
        message: "Already punched in. Please punch out first.",
      });
    }

    // Create new attendance record
    const attendance = await Attendance.create({
      studentemail,
      punchInTime: new Date(),
      latitude,
      longitude,
      distance,
      date: today,
    });

    res.status(200).json({ attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Punch Out
// Update your punchOut function
export const punchOut = async (req, res) => {
  try {
    const studentemail = req.user.id;
    const { latitude, longitude } = req.body; // Removed workingHours

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      studentemail,
      date: today,
      $or: [{ punchOutTime: null }, { punchOutTime: { $exists: false } }],
    });

    if (!attendance) {
      return res.status(400).json({
        message: "❌ Punch in not found or already punched out",
      });
    }

    // Create punch out time on server
    const punchOutTime = new Date();
    
    // Calculate working hours in seconds
    const workingHoursInSeconds = Math.floor(
      (punchOutTime - attendance.punchInTime) / 1000
    );

    attendance.punchOutTime = punchOutTime;
    attendance.punchOutLatitude = latitude;
    attendance.punchOutLongitude = longitude;
    attendance.workingHours = workingHoursInSeconds;

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "✅ Punch out successful",
      attendance: {
        punchInTime: attendance.punchInTime,
        punchOutTime: attendance.punchOutTime,
        workingHours: attendance.workingHours,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




export const getTodayAttendance = async (req, res) => {
  try {
    const studentemail = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ CRITICAL FIX: Sort by punchInTime descending to get LATEST record
    const attendance = await Attendance.findOne({
      studentemail,
      date: today,
    }).sort({ punchInTime: -1 }); // Get the most recent punch-in

    if (!attendance) {
      return res.status(200).json({
        success: true,
        attendance: null,
      });
    }

    res.status(200).json({
      success: true,
      attendance: {
        punchInTime: attendance.punchInTime,
        punchOutTime: attendance.punchOutTime || null,
        workingHours: attendance.workingHours || 0,
        date: attendance.date,
        latitude: attendance.latitude,
        longitude: attendance.longitude,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


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

export const saveLocation = async (req, res) => {
  try {
    const { latitude, longitude, accuracy } = req.body;
    const studentId = req.user.id; // From JWT token

    // Validate coordinates
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude and longitude are required' 
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid latitude value' 
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid longitude value' 
      });
    }

    // Create location document
    const locationData = new Location({
      studentId,
      latitude,
      longitude,
      accuracy,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude] // GeoJSON format: [lng, lat]
      }
    });

    await locationData.save();

    res.status(201).json({
      success: true,
      message: 'Location saved successfully',
      data: {
        latitude,
        longitude,
        accuracy,
        timestamp: locationData.timestamp
      }
    });

  } catch (error) {
    console.error('Error saving location:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving location',
      error: error.message
    });
  }
};

// Get location history
export const getLocationHistory = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { limit = 10, startDate, endDate } = req.query;

    const query = { studentId };

    // Filter by date range if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const locations = await Location.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select('-__v');

    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });

  } catch (error) {
    console.error('Error fetching location history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching location history',
      error: error.message
    });
  }
};