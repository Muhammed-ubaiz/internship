import Student from "../Model/Studentsmodel.js";
import Attendance from "../Model/Attendancemodel.js";
import Location from "../Model/Locationmodel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";
import ForgetModel from "../Model/ForgetModel.js";
import nodemailer from "nodemailer"
import PunchingRequest from "../Model/PunchingRequestmodel.js";
import Leave from "../Model/LeaveModel.js";
import Mentor from "../Model/Mentormodel.js";

import Notification from "../Model/NotificationModel.js";


export const getStudentNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      audience: { $in: ["students", "all"] },
      deletedBy: { $ne: "student" }, // ⭐ student deleted ones hidden
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ✅ DELETE only for student (soft delete)
export const deleteStudentNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findByIdAndUpdate(id, {
      $addToSet: { deletedBy: "student" }, // ⭐ student only
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};











// config/jwt.js
 const JWT_SECRET = process.env.JWT_SECRET || "key321";


export const checkstudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    
    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: student._id, email: student.email, role: "student" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: "student",
      },
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



const getTodayRange = () => {
  const now = new Date();
  
  // Start of today (00:00:00) in local time (IST)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  
  // Start of tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return { today, tomorrow };
};

export const requestPunchIn = async (req, res) => {
  try {
    const { latitude, longitude, distance } = req.body;
    const studentId = req.user.id;

    // ✅ Use utility function
    const { today, tomorrow } = getTodayRange();

    // Check if location was already checked today
    const existingAttendance = await Attendance.findOne({
      studentId,
      date: { $gte: today, $lt: tomorrow },
    });

    if (existingAttendance && existingAttendance.initialLocationChecked) {
      return res.status(400).json({ 
        success: false, 
        message: "Location already verified today. Use direct punch-in." 
      });
    }

    // Validate distance (50 meters)
    if (distance > 50) {
      return res.status(400).json({
        success: false,
        message: `You are ${Math.round(distance)}m away. Please move within 50m of the institution.`,
      });
    }

    // Create punch request
    const punchRequest = new PunchingRequest({
      studentId,
      type: "PUNCH_IN",
      latitude,
      longitude,
      distance,
      status: "PENDING",
      requestTime: new Date(),
    });

    await punchRequest.save();

    // Emit to admin via socket
    const io = req.app.get("io");
    if (io) {
      io.emit("newPunchRequest", {
        requestId: punchRequest._id,
        studentId,
        type: "PUNCH_IN",
        latitude,
        longitude,
        distance,
        requestTime: punchRequest.requestTime,
      });
    }

    res.status(200).json({
      success: true,
      message: "Punch-in request submitted successfully",
      requestId: punchRequest._id,
    });

  } catch (error) {
    console.error("Error in requestPunchIn:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Direct punch-in (SUBSEQUENT PUNCHES - NO APPROVAL NEEDED)
export const punchIn = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find or create today's attendance
    let attendance = await Attendance.findOne({
      studentId,
      date: { $gte: today, $lt: tomorrow },
    });

    // Check if location was checked today
    if (!attendance || !attendance.initialLocationChecked) {
      return res.status(400).json({
        success: false,
        message: 'First punch-in requires location verification. Please use request-punch-in.',
      });
    }

    // Check if already punched in
    const lastRecord = attendance.punchRecords[attendance.punchRecords.length - 1];
    if (lastRecord && !lastRecord.punchOut) {
      return res.status(400).json({
        success: false,
        message: 'Already punched in',
      });
    }

    // If there was a previous punch-out, calculate break time
    if (lastRecord && lastRecord.punchOut) {
      const breakDuration = Math.floor((Date.now() - lastRecord.punchOut.getTime()) / 1000);
      attendance.totalBreakSeconds += breakDuration;
      attendance.currentBreakStart = null;
    }

    // Add new punch-in record
    attendance.punchRecords.push({
      punchIn: new Date(),
      punchOut: null,
    });

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Punched in successfully',
      attendance: {
        totalWorkingSeconds: attendance.totalWorkingSeconds,
        totalBreakSeconds: attendance.totalBreakSeconds,
      },
    });
  } catch (error) {
    console.error('Error in punchIn:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Punch out
export const punchOut = async (req, res) => {
  try {
    const studentId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      studentId,
      date: { $gte: today, $lt: tomorrow },
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No attendance record found for today',
      });
    }

    const lastRecord = attendance.punchRecords[attendance.punchRecords.length - 1];

    if (!lastRecord || lastRecord.punchOut) {
      return res.status(400).json({
        success: false,
        message: 'Not currently punched in',
      });
    }

    // Calculate working time for this session
    const workDuration = Math.floor((Date.now() - lastRecord.punchIn.getTime()) / 1000);
    attendance.totalWorkingSeconds += workDuration;

    // Update punch-out time
    lastRecord.punchOut = new Date();
    attendance.currentBreakStart = new Date();

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Punched out successfully',
      attendance: {
        totalWorkingSeconds: attendance.totalWorkingSeconds,
        totalBreakSeconds: attendance.totalBreakSeconds,
      },
    });
  } catch (error) {
    console.error('Error in punchOut:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// NEW: Auto punch-out when distance exceeded
export const autoPunchOut = async (req, res) => {
  try {
    const { latitude, longitude, distance } = req.body;
    const studentId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      studentId,
      date: { $gte: today, $lt: tomorrow },
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No attendance record found for today',
      });
    }

    const lastRecord = attendance.punchRecords[attendance.punchRecords.length - 1];

    if (!lastRecord || lastRecord.punchOut) {
      return res.status(400).json({
        success: false,
        message: 'Not currently punched in',
      });
    }

    // Calculate working time for this session
    const workDuration = Math.floor((Date.now() - lastRecord.punchIn.getTime()) / 1000);
    attendance.totalWorkingSeconds += workDuration;

    // Update punch-out time (auto punch-out)
    lastRecord.punchOut = new Date();
    lastRecord.autoPunchOut = true; // Mark as auto punch-out
    lastRecord.autoPunchOutReason = `Distance exceeded: ${Math.round(distance)}m`;
    attendance.currentBreakStart = new Date();

    await attendance.save();

    // Emit socket event to notify student
    const io = req.app.get('io');
    if (io) {
      io.emit('autoPunchOut', {
        studentId,
        distance: Math.round(distance),
        punchOutTime: lastRecord.punchOut,
        reason: lastRecord.autoPunchOutReason,
      });
    }

    console.log(`⚠️ Auto punch-out for student ${studentId} - Distance: ${Math.round(distance)}m`);

    res.status(200).json({
      success: true,
      message: 'Auto punch-out successful - distance exceeded',
      attendance: {
        totalWorkingSeconds: attendance.totalWorkingSeconds,
        totalBreakSeconds: attendance.totalBreakSeconds,
      },
      distance: Math.round(distance),
    });
  } catch (error) {
    console.error('Error in autoPunchOut:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get today's attendance
export const getTodayAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      studentId,
      date: { $gte: today, $lt: tomorrow },
    });

    res.status(200).json({
      success: true,
      attendance: attendance || null,
    });
  } catch (error) {
    console.error('Error in getTodayAttendance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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



export const sendStudentOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await ForgetModel.findOneAndUpdate(
      { email },
      { otp, otpExpiry },
      { upsert: true, new: true }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.APP_EMAIL,
      to: email,
      subject: "Student Password Reset OTP",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("SEND STUDENT OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const verifyStudentOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await ForgetModel.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (record.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    return res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("VERIFY STUDENT OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const resetStudentPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Student.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

    await ForgetModel.deleteOne({ email });

    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("RESET STUDENT PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};







export const applyLeave = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { leaveType, fromDate, toDate, reason } = req.body;

    if (!leaveType || !fromDate || !toDate || !reason) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    // Monthly limit check (only APPROVED leaves count)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const approvedLeavesThisMonth = await Leave.countDocuments({
      studentId,
      status: "Approved",
      createdAt: { $gte: startOfMonth, $lt: endOfMonth },
    });

    if (approvedLeavesThisMonth >= 2) {
      return res.status(400).json({ success: false, message: "Monthly leave limit reached" });
    }

    const newLeave = await Leave.create({
      studentId,
      type: leaveType,
      from: new Date(fromDate),
      to: new Date(toDate),
      reason,
      status: "Pending", // new leave starts as Pending
    });

    res.status(201).json({ success: true, leave: newLeave });
  } catch (error) {
    console.error("Apply leave error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};




// Get student leave history
export const getMyLeaves = async (req, res) => {
  try {
    const studentId = req.user.id;
    const leaves = await Leave.find({ studentId }).sort({ createdAt: -1 });
    res.json({ success: true, leaves });
  } catch (error) {
    console.error("Get leaves error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get student leave count
export const getLeaveCount = async (req, res) => {
  try {
    const studentId = req.user.id;

    const totalLeaves = 2; // total allowed per month
    const usedLeaves = await Leave.countDocuments({ studentId, status: "Approved" }); // only approved
    const remaining = totalLeaves - usedLeaves;

    res.status(200).json({ total: totalLeaves, used: usedLeaves, remaining });
  } catch (error) {
    console.error("Error getting leave count:", error);
    res.status(500).json({ success: false, message: "Server error" })
  }}
  
export const getStudentDailyAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;

    const records = await Attendance.find({ studentId })
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch attendance" });

  }

};
  