import Mentor from "../Model/Mentormodel.js";
import ForgetModel from "../Model/ForgetModel.js";
import bcrypt from "bcryptjs";
import Student from '../Model/Studentsmodel.js';
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer";
import PunchingRequest from '../Model/PunchingRequestmodel.js';
import Attendance from '../Model/Attendancemodel.js';
import Course from "../Model/Coursemodel.js";
import Attendancemodel from "../Model/Attendancemodel.js";
import Leave from "../Model/LeaveModel.js";
import Notification from "../Model/NotificationModel.js";
import PunchRequest from "../Model/PunchingRequestmodel.js";

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



export const getMentorNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      audience: { $in: ["mentors", "all"] },
      deletedBy: { $ne: "mentor" }, // ⭐ mentor deleted ones hidden
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false });
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

export const getPunchRequests = async (req, res) => {
  try {
    const { status, includeAll } = req.query;
    
    let query = {};
    
    
    if (!includeAll && status) {
      query.status = status;
    } else if (!includeAll) {
      query.status = 'PENDING';
    }
        
    const requests = await PunchingRequest.find(query)
      .populate('studentId', 'name email batch course')
      .sort({ updatedAt: -1, createdAt: -1 }); 

    
    res.json(requests);
  } catch (error) {
    console.error('❌ Error fetching punch requests:', error);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
};

export const getPunchRequestHistory = async (req, res) => {
  try {
    const { days = 30 } = req.query; 
    
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


export const acceptPunchRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const mentorId = req.userId;

    console.log("📝 Accept request - ID:", requestId, "Mentor:", mentorId);

    const punchRequest = await PunchRequest.findById(requestId);
    
    if (!punchRequest) {
      console.log("❌ Punch request not found");
      return res.status(404).json({ message: 'Punch request not found' });
    }

    console.log("✅ Found punch request:", punchRequest);

    if (punchRequest.status !== 'PENDING') {
      console.log("⚠️ Request already processed:", punchRequest.status);
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update the request
    punchRequest.status = 'APPROVED';
    punchRequest.approvedAt = new Date();
    punchRequest.processedBy = mentorId;
    
    console.log("💾 Saving punch request...");
    await punchRequest.save();
    console.log("✅ Punch request saved");

    // ✅ GET TODAY'S DATE (start and end of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log("📅 Finding/creating attendance for student:", punchRequest.studentId);

    // ✅ FIND OR CREATE TODAY'S ATTENDANCE
    let attendance = await Attendance.findOne({
      studentId: punchRequest.studentId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    const now = new Date();

    if (!attendance) {
      // ✅ CREATE NEW ATTENDANCE FOR TODAY
      console.log("📝 Creating new attendance record");
      
      attendance = new Attendance({
        studentId: punchRequest.studentId,
        date: today,
        punchRecords: [{
          punchIn: now,
          punchOut: null
        }],
        totalWorkingSeconds: 0,
        totalBreakSeconds: 0,
        initialLocationChecked: true,
        currentBreakStart: null
      });

      await attendance.save();
      console.log("✅ New attendance created:", attendance);
    } else {
      // ✅ UPDATE EXISTING ATTENDANCE
      console.log("📝 Updating existing attendance");
      
      // Add new punch record
      attendance.punchRecords.push({
        punchIn: now,
        punchOut: null
      });

      // Mark initial location as checked
      attendance.initialLocationChecked = true;

      // Clear current break if student was on break
      if (attendance.currentBreakStart) {
        const breakDuration = Math.floor((now - new Date(attendance.currentBreakStart)) / 1000);
        attendance.totalBreakSeconds += breakDuration;
        attendance.currentBreakStart = null;
      }

      await attendance.save();
      console.log("✅ Attendance updated:", attendance);
    }

    // ✅ Emit socket event
    const io = req.app.get("socketio");
    
    if (io) {
      const studentRoom = String(punchRequest.studentId);
      
      const emitData = {
        studentId: String(punchRequest.studentId),
        type: punchRequest.type,
        punchTime: now,
        requestId: punchRequest._id
      };
      
      console.log("📡 Emitting to room:", studentRoom);
      console.log("📦 Emit data:", emitData);
      
      io.to(studentRoom).emit("requestApproved", emitData);
      
      console.log("✅ Approval emitted to student");
    } else {
      console.warn("⚠️ Socket.IO not initialized");
    }

    res.json({ 
      success: true, 
      data: punchRequest,
      attendance: attendance,
      message: 'Punch request approved successfully' 
    });
  } catch (err) {
    console.error("❌ ERROR in acceptPunchRequest:", err);
    console.error("Stack trace:", err.stack);
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
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
    punchRequest.updatedAt = new Date();
    await punchRequest.save();

    console.log('✅ Request status updated to REJECTED');

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

export const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendancemodel.find({
      date: { $gte: today }
    })
      .populate({
        path: "studentId",
        select: "name rollNo course batch email"
      });

    res.status(200).json({
      success: true,
      data: attendance
    });

  } catch (error) {
    console.error("Mentor today attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch today attendance",
      error: error.message
    });
  }
};

export const deleteMentorNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findByIdAndUpdate(id, {
      $addToSet: { deletedBy: "mentor" }, // ⭐ only mentor removed
    });


    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ✅ FIXED: Get leave requests for mentor - ONLY their course students
export const getStudentLeavesForMentor = async (req, res) => {
  try {
    const mentorId = req.user.id;
    console.log("🔍 Fetching leaves for mentor:", mentorId);

    // 1️⃣ Find the mentor
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ success: false, message: "Mentor not found" });
    }

    console.log("👨‍🏫 Mentor course:", mentor.course);

    // 2️⃣ Find the course by name
    const course = await Course.findOne({ name: mentor.course });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    console.log("📚 Course ID:", course._id);

    // 3️⃣ Find all students in this course
    const studentsInCourse = await Student.find({ course: course._id }).select("_id name email batch");
    const studentIds = studentsInCourse.map(s => s._id);

    console.log("👥 Students in course:", studentIds.length);

    // 4️⃣ Find pending leaves for these students only
    const pendingLeaves = await Leave.find({ 
      studentId: { $in: studentIds }, 
      status: "Pending" 
    })
    .populate("studentId", "name email batch")
    .sort({ createdAt: -1 });

    console.log("📋 Pending leaves found:", pendingLeaves.length);

    // 5️⃣ Format the response to match frontend expectations
    const formattedLeaves = pendingLeaves.map(leave => ({
      _id: leave._id,
      studentName: leave.studentId.name,
      studentEmail: leave.studentId.email,
      batch: leave.studentId.batch,
      leaveType: leave.type,
      fromDate: new Date(leave.from).toLocaleDateString(),
      toDate: new Date(leave.to).toLocaleDateString(),
      reason: leave.reason,
      status: leave.status,
      createdAt: leave.createdAt
    }));

    res.json(formattedLeaves);
  } catch (error) {
    console.error("❌ Mentor get leaves error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ✅ FIXED: Update leave status to match frontend endpoint format
export const updateStudentLeaveStatus = async (req, res) => {
  try {
    const { id, action } = req.params; // id = leave id, action = "approved" or "rejected"
    
    console.log("📝 Updating leave:", id, "Action:", action);

    // Map action to status
    const statusMap = {
      'approved': 'Approved',
      'rejected': 'Rejected'
    };

    const status = statusMap[action.toLowerCase()];

    if (!status) {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }

    leave.status = status;
    await leave.save();

    console.log("✅ Leave updated:", leave._id, "New status:", leave.status);

    res.json({ success: true, message: `Leave ${status.toLowerCase()} successfully`, leave });
  } catch (error) {
    console.error("❌ Update leave status error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


export const getMentorProfile = async (req, res) => {
  try {
    const mentorId = req.params.mentorId || req.user.id;

    const mentor = await Mentor.findById(mentorId)
      .select("name email course batch");

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: mentor,
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false });
  }
};


