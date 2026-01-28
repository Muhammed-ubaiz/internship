import Student from "../Model/Studentsmodel.js";
import Attendance from "../Model/Attendancemodel.js";
import Location from "../Model/Locationmodel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";
import ForgetModel from "../Model/ForgetModel.js";
import nodemailer from "nodemailer"
import PunchingRequest from "../Model/PunchingRequestmodel.js";

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
