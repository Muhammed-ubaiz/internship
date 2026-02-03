import Mentor from "../Model/Mentormodel.js";
import ForgetModel from "../Model/ForgetModel.js";
import bcrypt from "bcryptjs";
import Student from '../Model/Studentsmodel.js';
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer";
import PunchingRequest from '../Model/PunchingRequestmodel.js';
import Attendance from '../Model/Attendancemodel.js';
import Course from "../Model/Coursemodel.js";
import Announcement from "../Model/Announcementmodel.js";
import Batch from "../Model/Batchmodel.js";

export const getbatch = async (req, res) => {
  try {
    const mentorEmail = req.user?.email;

    if (!mentorEmail) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed - mentor email missing",
      });
    }

    // ⚠️ IMPORTANT: field name must match Course schema
    const courses = await Course.find({ mentorEmail });

    if (!courses.length) {
      return res.json({
        success: true,
        batches: [],
        message: "No batches assigned",
      });
    }

    const batches = [
      ...new Set(courses.map(c => c.batch).filter(Boolean))
    ];

    res.json({
      success: true,
      batches,
    });

  } catch (error) {
    console.error("❌ getbatch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch batches",
    });
  }
};



// POST /mentor/announcementsend
export const announcementsend = async (req, res) => {
  try {
    const { title, message, batch } = req.body;
    
    // Try to get email from different possible fields
    const mentorEmail = req.user?.email || req.user?.userEmail || req.user?.emailId;
    const mentorId = req.user?.id || req.user?._id || req.user?.userId;

    if (!mentorEmail && !mentorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed - no user info",
      });
    }

    if (!title || !message || !batch) {
      return res.status(400).json({
        success: false,
        message: "Title, message, and batch are required",
      });
    }

    // Try to find mentor by email first, then by ID
    let mentor = null;
    if (mentorEmail) {
      mentor = await Mentor.findOne({ email: mentorEmail });
    }
    if (!mentor && mentorId) {
      mentor = await Mentor.findById(mentorId);
    }

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found",
      });
    }

    // Validate batch if not "All"
    if (batch != "All") {
      const mentorBatches = mentor.course?.map(course => 
        typeof course === 'string' ? course : (course.batch || course.batchName || course.name)
      ).filter(Boolean) || [];
      if (!mentorBatches.includes(batch)) {
        return res.status(400).json({
          success: false,
          message: `Invalid batch: ${batch}`,
        });
      }
    }

    const announcement = await Announcement.create({
      title,
      message,
      batch,
      mentorEmail: mentor.email,
      mentorId: mentor._id,
    });

    // Count recipients
    let recipientCount = 0;
    if (batch === "All") {
      recipientCount = await Student.countDocuments({ mentorId: mentor._id });
    } else {
      recipientCount = await Student.countDocuments({
        mentorId: mentor._id,
        batch,
      });
    }

    res.status(201).json({
      success: true,
      message: "Announcement sent successfully",
      recipientCount,
      announcement,
    });
    

  } catch (error) {
    console.error("[announcementsend] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create announcement",
      error: error.message,
    });
  }
};




/* ===== LOGIN (existing) ===== */
export const mentorlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const mentor = await Mentor.findOne({ email });
    if (!mentor) {
      return res.status(404).json({ success: false, message: "Mentor not found" });
    }

    const isMatch = await bcrypt.compare(password, mentor.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: mentor._id, role: "mentor" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successfully",
      mentor: { name: mentor.name, email: mentor.email },
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const mentor = await Mentor.findOne({ email });
    if (!mentor) {
      return res.status(404).json({ success: false, message: "Mentor not found" });
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
      subject: "Mentor Password Reset OTP",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await ForgetModel.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (record.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    return res.json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Mentor.findOneAndUpdate({ email }, { password: hashedPassword });

    await ForgetModel.deleteOne({ email }); 

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getstudent = async (req, res) => {
  try {
    const mentorEmail = req.user.id; 
    console.log(mentorEmail);
  
    const mentor = await Mentor.findOne({ _id: mentorEmail })

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
     const course=await Course.findOne({name:mentor.course})
    
    const students = await Student.find({course:course._id}, { password: 0 });


    return res.status(200).json(students);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATED: Get punch requests with optional status filter
export const getPunchRequests = async (req, res) => {
  try {
    const { status, includeAll } = req.query;
    
    // Build query based on parameters
    let query = {};
    
    // If includeAll is true, get all requests
    // If status is provided, filter by that status
    // Otherwise, default to PENDING only
    if (!includeAll && status) {
      query.status = status;
    } else if (!includeAll) {
      query.status = 'PENDING';
    }
    
    console.log('📋 Fetching punch requests with query:', query);
    
    const requests = await PunchingRequest.find(query)
      .populate('studentId', 'name email batch course')
      .sort({ updatedAt: -1, createdAt: -1 }); // Sort by most recent first

    console.log(`✅ Found ${requests.length} requests`);
    
    res.json(requests);
  } catch (error) {
    console.error('❌ Error fetching punch requests:', error);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
};

// ✅ NEW: Get punch request history (approved/rejected only)
export const getPunchRequestHistory = async (req, res) => {
  try {
    const { days = 30 } = req.query; // Default to last 30 days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const requests = await PunchingRequest.find({
      status: { $in: ['APPROVED', 'REJECTED'] },
      updatedAt: { $gte: startDate }
    })
      .populate('studentId', 'name email batch course')
      .sort({ updatedAt: -1 });

    console.log(`✅ Found ${requests.length} history records`);
    
    res.json(requests);
  } catch (error) {
    console.error('❌ Error fetching history:', error);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
};

// ✅ FIXED: Accept punch request
export const acceptPunchRequest = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('✅ Accepting punch request:', id);

    // 1️⃣ Find punch request
    const punchRequest = await PunchingRequest.findById(id);
    if (!punchRequest) {
      return res.status(404).json({ message: "Punch request not found" });
    }

    if (punchRequest.status !== 'PENDING') {
      return res.status(400).json({ message: "Request already processed" });
    }

    console.log('📋 Punch request found:', {
      studentId: punchRequest.studentId,
      type: punchRequest.type,
      status: punchRequest.status,
      punchTime: punchRequest.punchTime
    });

    // 2️⃣ Update request status
    punchRequest.status = "APPROVED";
    punchRequest.processedAt = new Date();
    punchRequest.updatedAt = new Date(); // Explicitly set updatedAt
    await punchRequest.save();

    console.log('✅ Request status updated to APPROVED');

    // 3️⃣ Today date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 4️⃣ Find or create attendance
    let attendance = await Attendance.findOne({
      studentId: punchRequest.studentId,
      date: today,
    });

    console.log('📅 Attendance found:', attendance ? 'Yes' : 'No');

    if (!attendance) {
      attendance = new Attendance({
        studentId: punchRequest.studentId,
        date: today,
      });
    }

    // 5️⃣ Based on punch type, update attendance
    if (punchRequest.type === 'PUNCH_IN') {
      // Set punch in time
      attendance.punchInTime = punchRequest.punchTime || new Date();
      attendance.punchInAcceptedAt = new Date();
      attendance.status = 'WORKING';

      // ✅ Add to punch records for frontend compatibility
      if (!attendance.punchRecords) {
        attendance.punchRecords = [];
      }
      attendance.punchRecords.push({
        punchIn: attendance.punchInTime,
        punchOut: null,
        sessionWorkingSeconds: 0
      });

      // Update student status
      const student = await Student.findById(punchRequest.studentId);
      if (student) {
        student.isPunchedIn = true;
        student.punchInTime = attendance.punchInTime;
        student.lastPunchTime = attendance.punchInTime;
        await student.save();
        console.log('✅ Student updated with punch-in time');
      }
    }
    else if (punchRequest.type === 'PUNCH_OUT') {
      // Set punch out time
      attendance.punchOutTime = punchRequest.punchTime || new Date();
      
      // Calculate working hours if punch in exists
      if (attendance.punchInTime) {
        const workingSeconds = Math.floor(
          (attendance.punchOutTime - attendance.punchInTime) / 1000
        );
        attendance.totalWorkingSeconds = (attendance.totalWorkingSeconds || 0) + workingSeconds;
        
        // Update the last punch record with punch out time
        if (attendance.punchRecords && attendance.punchRecords.length > 0) {
          const lastRecord = attendance.punchRecords[attendance.punchRecords.length - 1];
          lastRecord.punchOut = attendance.punchOutTime;
          lastRecord.sessionWorkingSeconds = workingSeconds;
        }
        
        // Update student status
        const student = await Student.findById(punchRequest.studentId);
        if (student) {
          student.isPunchedIn = false;
          student.punchOutTime = attendance.punchOutTime;
          await student.save();
          console.log('✅ Student updated with punch-out time');
        }
      }
    }

    // 6️⃣ Save attendance
    await attendance.save();

    console.log('💾 Attendance saved:', {
      punchInTime: attendance.punchInTime,
      punchOutTime: attendance.punchOutTime,
      workingTime: attendance.totalWorkingSeconds
    });

    // 7️⃣ Emit socket event to notify student
    const io = req.app.get('socketio');
    if (io) {
      io.to(punchRequest.studentId.toString()).emit('requestApproved', {
        requestId: punchRequest._id,
        studentId: punchRequest.studentId,
        type: punchRequest.type,
        punchTime: attendance.punchInTime || attendance.punchOutTime,
        message: `Your ${punchRequest.type.toLowerCase().replace('_', ' ')} request has been approved`
      });
      console.log('📡 Socket event emitted to student');
    }

    res.status(200).json({
      success: true,
      message: `Punch ${punchRequest.type.toLowerCase().replace('_', ' ')} request approved successfully`,
      attendance: {
        punchInTime: attendance.punchInTime,
        punchOutTime: attendance.punchOutTime,
        totalWorkingSeconds: attendance.totalWorkingSeconds
      }
    });

  } catch (err) {
    console.error("❌ BACKEND ERROR in acceptPunchRequest:", err);
    res.status(500).json({ 
      message: "Failed to accept punch request",
      error: err.message 
    });
  }
};

export const rejectPunchRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log('❌ Rejecting punch request:', id);

    const punchRequest = await PunchingRequest.findById(id);
    if (!punchRequest) {
      return res.status(404).json({ message: "Punch request not found" });
    }

    if (punchRequest.status !== 'PENDING') {
      return res.status(400).json({ message: "Request already processed" });
    }

    punchRequest.status = "REJECTED";
    punchRequest.rejectionReason = reason || "No reason provided";
    punchRequest.processedAt = new Date();
    punchRequest.updatedAt = new Date(); // Explicitly set updatedAt
    await punchRequest.save();

    console.log('✅ Request status updated to REJECTED');

    // Emit socket event to notify student
    const io = req.app.get('socketio');
    if (io) {
      io.to(punchRequest.studentId.toString()).emit('requestRejected', {
        requestId: punchRequest._id,
        type: punchRequest.type,
        reason: punchRequest.rejectionReason,
        message: `Your ${punchRequest.type.toLowerCase().replace('_', ' ')} request was rejected`
      });
      console.log('📡 Socket event emitted to student');
    }

    res.status(200).json({
      success: true,
      message: "Punch request rejected successfully"
    });

  } catch (err) {
    console.error("❌ BACKEND ERROR in rejectPunchRequest:", err);
    res.status(500).json({ 
      message: "Failed to reject punch request",
      error: err.message 
    });
  }
};