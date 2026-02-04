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
import Announcement from "../Model/Announcementmodel.js"; // Added import


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

export const getStudentsByMentor = async (req, res) => {
  try {
    const { mentorEmail } = req.params;

    const students = await Student.find({ mentorEmail });

    res.json(students);

    
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



const getTodayRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { today, tomorrow };
};

// GET /student/today-attendance
export const getTodayAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { today, tomorrow } = getTodayRange();

    const attendance = await Attendance.findOne({
      studentId,
      date: { $gte: today, $lt: tomorrow }
    });

    res.status(200).json({
      success: true,
      attendance: attendance || null
    });
  } catch (error) {
    console.error('Error in getTodayAttendance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /student/first-punch-in-with-location
export const firstPunchInWithLocation = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { latitude, longitude, distance } = req.body;

    if (distance > 50) { // Assuming MAX_DISTANCE = 50
      return res.status(400).json({ success: false, message: 'Too far from institution' });
    }

    const { today, tomorrow } = getTodayRange();

    let attendance = await Attendance.findOne({
      studentId,
      date: { $gte: today, $lt: tomorrow }
    });

    const now = new Date();

    if (attendance) {
      if (attendance.initialLocationChecked) {
        return res.status(400).json({ success: false, message: 'Location already checked for today' });
      }
      // Update existing attendance with location and first punch-in
      attendance.initialLatitude = latitude;
      attendance.initialLongitude = longitude;
      attendance.initialDistance = distance;
      attendance.initialLocationChecked = true;
      attendance.punchRecords = [{ punchIn: now, punchOut: null }];
      attendance.totalWorkingSeconds = 0;
      attendance.totalBreakSeconds = 0;
      attendance.currentBreakStart = null;
      attendance.isCurrentlyOnBreak = false;
    } else {
      // Create new attendance
      attendance = new Attendance({
        studentId,
        date: today,
        initialLatitude: latitude,
        initialLongitude: longitude,
        initialDistance: distance,
        initialLocationChecked: true,
        punchRecords: [{ punchIn: now, punchOut: null }],
        totalWorkingSeconds: 0,
        totalBreakSeconds: 0,
        currentBreakStart: null,
        isCurrentlyOnBreak: false
      });
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'First punch-in successful',
      attendance
    });
  } catch (error) {
    console.error('Error in firstPunchInWithLocation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /student/punch-in
export const punchIn = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { today, tomorrow } = getTodayRange();

    const attendance = await Attendance.findOne({
      studentId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'No attendance record for today' });
    }

    if (!attendance.initialLocationChecked) {
      return res.status(400).json({ success: false, message: 'Location check required first' });
    }

    const lastRecord = attendance.punchRecords[attendance.punchRecords.length - 1];

    if (lastRecord && !lastRecord.punchOut) {
      return res.status(400).json({ success: false, message: 'Already punched in' });
    }

    // If was on break, calculate and add break time
    if (attendance.currentBreakStart) {
      const breakEnd = new Date();
      const breakSeconds = Math.floor((breakEnd - attendance.currentBreakStart) / 1000);
      attendance.totalBreakSeconds += breakSeconds;
      attendance.currentBreakStart = null;
      attendance.isCurrentlyOnBreak = false;
    }

    // Add new punch-in record
    attendance.punchRecords.push({ punchIn: new Date(), punchOut: null });

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Punch-in successful',
      attendance
    });
  } catch (error) {
    console.error('Error in punchIn:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /student/punch-out
export const punchOut = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { today, tomorrow } = getTodayRange();

    const attendance = await Attendance.findOne({
      studentId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'No attendance record for today' });
    }

    const lastRecordIndex = attendance.punchRecords.length - 1;
    const lastRecord = attendance.punchRecords[lastRecordIndex];

    if (!lastRecord || lastRecord.punchOut) {
      return res.status(400).json({ success: false, message: 'Not punched in' });
    }

    const now = new Date();
    const sessionSeconds = Math.floor((now - lastRecord.punchIn) / 1000);

    // Update the last record
    attendance.punchRecords[lastRecordIndex].punchOut = now;
    attendance.punchRecords[lastRecordIndex].sessionWorkingSeconds = sessionSeconds;

    // Add to total working
    attendance.totalWorkingSeconds += sessionSeconds;

    // Start break
    attendance.currentBreakStart = now;
    attendance.isCurrentlyOnBreak = true;

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Punch-out successful',
      attendance
    });
  } catch (error) {
    console.error('Error in punchOut:', error);
    res.status(500).json({ success: false, message: error.message });
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

export const requestPunchIn = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { latitude, longitude, distance } = req.body;

    console.log('📍 Punch-in request from student:', studentId);

    const { today, tomorrow } = getTodayRange();

    // Check if already has attendance with location checked today
    const existingAttendance = await Attendance.findOne({
      studentId,
      date: { $gte: today, $lt: tomorrow },
      initialLocationChecked: true
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Location already checked for today' });
    }

    // Check for pending punch-in request
    const pendingRequest = await PunchingRequest.findOne({
      studentId,
      type: 'PUNCH_IN',
      status: 'PENDING',
      createdAt: { $gte: today }
    });

    if (pendingRequest) {
      return res.status(400).json({
        message: 'Punch-in request already pending',
        requestId: pendingRequest._id
      });
    }

    // Create new punch request
    const punchRequest = new PunchingRequest({
      studentId,
      type: 'PUNCH_IN',
      latitude,
      longitude,
      distance,
      punchTime: new Date(),
      status: 'PENDING'
    });

    await punchRequest.save();

    console.log('✅ Punch request created:', punchRequest._id);

    res.json({
      message: 'Punch-in request submitted successfully',
      requestId: punchRequest._id
    });
  } catch (error) {
    console.error('❌ Error creating punch-in request:', error);
    res.status(500).json({
      message: 'Failed to submit punch-in request',
      error: error.message
    });
  }
};

export const requestPunchOut = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { latitude, longitude, distance } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // ✅ Find today's attendance with CONFIRMED punch-in time
    const attendance = await Attendance.findOne({
      studentId,
      date: { $gte: today, $lt: tomorrow },
      punchInTime: { $exists: true, $ne: null }, // ✅ CRITICAL: Must have actual punch-in
      $or: [
        { punchOutTime: null }, 
        { punchOutTime: { $exists: false } }
      ]
    }).sort({ punchInTime: -1 });

    if (!attendance) {
      console.log(`❌ No confirmed punch-in found for ${studentId}`);
      return res.status(400).json({
        success: false,
        message: "Not punched in today"
      });
    }

    console.log(`✅ Punch-in confirmed at ${attendance.punchInTime}`);

    // Create punch-out request
    const requestId = `PUNCHOUT_${Date.now()}_${studentId}`;
    
    const punchOutRequest = {
      requestId,
      studentId,
      type: 'PUNCH_OUT',
      latitude,
      longitude,
      distance,
      requestTime: new Date(),
      status: 'PENDING'
    };

    // Store in database (if you have PunchRequest model)
    // await PunchRequest.create(punchOutRequest);

    // Emit to mentor
    const io = req.app.get('io');
    if (io) {
      io.emit('newPunchRequest', punchOutRequest);
    }

    res.status(200).json({
      success: true,
      message: "Punch-out request submitted",
      requestId
    });

  } catch (error) {
    console.error("❌ Error in requestPunchOut:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
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

// Get monthly attendance summary
export const getMonthlySummary = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { month, year } = req.query;

    // Default to current month and year
    const targetMonth = month ? parseInt(month) : new Date().getMonth();
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    // Get start and end of the target month
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    // Calculate total working days in the month (excluding weekends)
    let totalWorkingDays = 0;
    const today = new Date();
    const lastDayToCount = endOfMonth > today ? today : endOfMonth;

    for (let d = new Date(startOfMonth); d <= lastDayToCount; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) { // Exclude Sunday (0) and Saturday (6)
        totalWorkingDays++;
      }
    }

    // Get attendance records for the month
    const attendanceRecords = await Attendance.find({
      studentId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const presentDays = attendanceRecords.length;

    // Get approved leaves for the month
    const approvedLeaves = await Leave.find({
      studentId,
      status: "Approved",
      $or: [
        { from: { $gte: startOfMonth, $lte: endOfMonth } },
        { to: { $gte: startOfMonth, $lte: endOfMonth } }
      ]
    });

    // Calculate leave days
    let leaveDays = 0;
    approvedLeaves.forEach(leave => {
      const leaveStart = new Date(leave.from) < startOfMonth ? startOfMonth : new Date(leave.from);
      const leaveEnd = new Date(leave.to) > endOfMonth ? endOfMonth : new Date(leave.to);
      const diffTime = Math.abs(leaveEnd - leaveStart);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      leaveDays += diffDays;
    });

    // Calculate absent days (working days - present - leaves)
    const absentDays = Math.max(0, totalWorkingDays - presentDays - leaveDays);

    // Get monthly data for the past 6 months (for graph)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(targetYear, targetMonth - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthAttendance = await Attendance.countDocuments({
        studentId,
        date: { $gte: monthStart, $lte: monthEnd }
      });

      // Calculate working days for this month
      let workingDays = 0;
      const lastDay = monthEnd > today ? today : monthEnd;
      if (monthStart <= today) {
        for (let d = new Date(monthStart); d <= lastDay; d.setDate(d.getDate() + 1)) {
          const day = d.getDay();
          if (day !== 0 && day !== 6) {
            workingDays++;
          }
        }
      }

      const percentage = workingDays > 0 ? Math.round((monthAttendance / workingDays) * 100) : 0;

      monthlyData.push({
        month: monthDate.toLocaleString('default', { month: 'long' }),
        year: monthDate.getFullYear(),
        presentDays: monthAttendance,
        workingDays,
        percentage
      });
    }

    res.json({
      success: true,
      summary: {
        totalDays: totalWorkingDays,
        presentDays,
        absentDays,
        leaveDays,
        month: startOfMonth.toLocaleString('default', { month: 'long' }),
        year: targetYear
      },
      monthlyData
    });

  } catch (error) {
    console.error("Get monthly summary error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ✅ AUTO PUNCH-OUT - Called when student moves 50m away from initial location
export const autoPunchOut = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { latitude, longitude, distance } = req.body;
    const { today, tomorrow } = getTodayRange();

    console.log(`📍 Auto punch-out triggered for student ${studentId}, distance: ${distance}m`);

    // Find today's attendance
    const attendance = await Attendance.findOne({
      studentId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No attendance record for today'
      });
    }

    // Check if there's an active session (punched in but not out)
    const lastRecordIndex = attendance.punchRecords.length - 1;
    const lastRecord = attendance.punchRecords[lastRecordIndex];

    if (!lastRecord || lastRecord.punchOut) {
      return res.status(400).json({
        success: false,
        message: 'Not currently punched in'
      });
    }

    // Verify student has moved more than 50m
    if (distance <= 50) {
      return res.status(400).json({
        success: false,
        message: 'Student is still within 50m of initial location'
      });
    }

    const now = new Date();
    const sessionSeconds = Math.floor((now - new Date(lastRecord.punchIn)) / 1000);

    // Update the last record with punch-out
    attendance.punchRecords[lastRecordIndex].punchOut = now;
    attendance.punchRecords[lastRecordIndex].sessionWorkingSeconds = sessionSeconds;
    attendance.punchRecords[lastRecordIndex].autoPunchOut = true; // Mark as auto punch-out
    attendance.punchRecords[lastRecordIndex].autoPunchOutReason = `Moved ${Math.round(distance)}m from initial location`;

    // Add to total working time
    attendance.totalWorkingSeconds += sessionSeconds;

    // Set status to indicate auto punch-out
    attendance.status = "PRESENT";
    attendance.lastAutoPunchOutDistance = distance;
    attendance.lastAutoPunchOutTime = now;

    await attendance.save();

    console.log(`✅ Auto punch-out completed for student ${studentId}`);

    // Emit socket event if available
    const io = req.app.get("socketio");
    if (io) {
      io.to(studentId.toString()).emit("autoPunchOut", {
        message: `Auto punch-out: You moved ${Math.round(distance)}m from your initial location`,
        time: now,
        distance
      });
    }

    res.status(200).json({
      success: true,
      message: `Auto punch-out successful. You moved ${Math.round(distance)}m from initial location.`,
      attendance
    });

  } catch (error) {
    console.error('❌ Error in autoPunchOut:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ CHECK LOCATION - Returns initial location for distance calculation
export const getInitialLocation = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { today, tomorrow } = getTodayRange();

    const attendance = await Attendance.findOne({
      studentId,
      date: { $gte: today, $lt: tomorrow },
      initialLocationChecked: true
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No initial location found for today'
      });
    }

    // Check if there's an active session
    const lastRecord = attendance.punchRecords[attendance.punchRecords.length - 1];
    const isActive = lastRecord && !lastRecord.punchOut;

    res.status(200).json({
      success: true,
      initialLocation: {
        latitude: attendance.initialLatitude,
        longitude: attendance.initialLongitude
      },
      isActive
    });

  } catch (error) {
    console.error('Error in getInitialLocation:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ GET STUDENT ANNOUNCEMENTS - Get announcements sent to this student
export const getStudentAnnouncements = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // First, find the student to get their batch and mentor info
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const studentBatch = student.batch;
    const mentorId = student.mentorId;

    // Find announcements where:
    // 1. batch is "All", OR
    // 2. batch matches student's batch, OR
    // 3. announcement is for specific batch and matches student's batch
    const announcements = await Announcement.find({
      $or: [
        { batch: "All" },
        { batch: studentBatch },
        // Also get announcements from this student's mentor
        ...(mentorId ? [{ mentorId: mentorId }] : [])
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      announcements,
    });
  } catch (error) {
    console.error("❌ getStudentAnnouncements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};
  