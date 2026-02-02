import Mentor from "../Model/Mentormodel.js";
import ForgetModel from "../Model/ForgetModel.js";
import bcrypt from "bcryptjs";
import Student from '../Model/Studentsmodel.js';
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer";
import PunchingRequest from '../Model/PunchingRequestmodel.js';
import Attendance from '../Model/Attendancemodel.js';
import Course from "../Model/Coursemodel.js";
import Leave from "../Model/LeaveModel.js";



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

// Get all pending punch requests
export const getPunchRequests = async (req, res) => {
  try {
    const requests = await PunchingRequest.find({ status: 'PENDING' })
      .populate('studentId', 'name email batch course')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching punch requests:', error);
    res.status(500).json({ message: 'Failed to fetch requests' });
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

    console.log('📋 Punch request found:', {
      studentId: punchRequest.studentId,
      type: punchRequest.type,
      status: punchRequest.status,
      punchTime: punchRequest.punchTime
    });

    // 2️⃣ Update request status
    punchRequest.status = "APPROVED";
    punchRequest.processedAt = new Date();
    await punchRequest.save();

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
        attendance.totalWorkingTime = workingSeconds;
        
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
      workingTime: attendance.totalWorkingTime
    });

    // 7️⃣ Emit socket event to notify student
    // Make sure you have socket instance available
    const io = req.app.get('socketio');
    if (io) {
      io.to(punchRequest.studentId.toString()).emit('requestApproved', {
        requestId: punchRequest._id,
        type: punchRequest.type,
        punchTime: attendance.punchInTime || attendance.punchOutTime,
        message: `Your ${punchRequest.type.toLowerCase().replace('_', ' ')} request has been approved`
      });
    }

    res.status(200).json({
      success: true,
      message: `Punch ${punchRequest.type.toLowerCase().replace('_', ' ')} request approved successfully`,
      attendance: {
        punchInTime: attendance.punchInTime,
        punchOutTime: attendance.punchOutTime,
        totalWorkingTime: attendance.totalWorkingTime
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

    const punchRequest = await PunchingRequest.findById(id);
    if (!punchRequest) {
      return res.status(404).json({ message: "Punch request not found" });
    }

    punchRequest.status = "REJECTED";
    punchRequest.rejectionReason = reason || "No reason provided";
    await punchRequest.save();

    // Emit socket event to notify student
    const io = req.app.get('socketio');
    if (io) {
      io.to(punchRequest.studentId.toString()).emit('requestRejected', {
        requestId: punchRequest._id,
        type: punchRequest.type,
        reason: punchRequest.rejectionReason,
        message: `Your ${punchRequest.type.toLowerCase().replace('_', ' ')} request was rejected`
      });
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