
import Batch from "../Model/Batchmodel.js";
import Course from "../Model/Coursemodel.js";
import jwt from "jsonwebtoken";
import Student from "../Model/Studentsmodel.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import Location from "../Model/Locationmodel.js";
import Mentor from "../Model/Mentormodel.js";
import Attendancemodel from "../Model/Attendancemodel.js";
import Leave from "../Model/LeaveModel.js";
import Notification from "../Model/NotificationModel.js";
import resetTokenStore from "../tokenStore.js";




const adminemail = "admin@gmail.com";
const adminpass = "admin123";
const JWT_SECRET = process.env.JWT_SECRET || "key321";

const Login = (req, res) => {
  const { email, password } = req.body;

  if (email === adminemail && password === adminpass) {
    const token = jwt.sign(
      { id: "admin", email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "1d" } // Same as mentor/student
    );

    return res.json({
      success: true,
      token,
      role: "admin",
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid email or password",
  });
};





export const addCourse = async (req, res) => {
  try {
    const { name, duration } = req.body;

    if (!name || !duration) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const exists = await Course.findOne({ name });
    if (exists) {
      return res.status(400).json({ success: false, message: "Course already exists" });
    }

    const course = await Course.create({ name, duration });

    res.status(201).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};


export const getCourse = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ success: false });
  }
};


export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await Course.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};



export const addStudent = async (req, res) => {
  try {
    const { name, email, password, course, batch } = req.body;

    if (!name || !email || !password || !course || !batch) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const exists = await Student.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Student already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      course,
      batch,
      status: "Active",
    });

    res.status(201).json({ success: true, student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ success: false });
  }
};


export const getBatches = async (req, res) => {
  try {
    const { courseName } = req.params;
    const batches = await Batch.find({ courseName });
    res.json({ batches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


export const addBatch = async (req, res) => {
  try {
    const { courseName } = req.params;
    const { name } = req.body;

    if (!courseName) return res.status(400).json({ message: "Course name missing" });
    if (!name) return res.status(400).json({ message: "Batch name missing" });

    const batch = await Batch.create({ courseName, name });
    res.status(201).json({ batch });
  } catch (err) {
    console.error("ADD BATCH ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};



export const updateCourse = async (req, res) => {
  try {
    const { _id } = req.params;
    const { editCourseName, editDuration } = req.body;

    if (!_id || !editCourseName || !editDuration) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      _id,
      { name: editCourseName, duration: editDuration },
      { new: true }
    );

    if (!updatedCourse) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    res.json({
      success: true,
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};







export const deleteBatch = async (req, res) => {
  const { batchId } = req.params;

  try {
    if (!batchId) {
      return res.status(400).json({ message: "Batch ID is required" });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    await batch.deleteOne();
    res.json({ message: "Batch deleted successfully" });
  } catch (error) {
    console.error("Delete batch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const toggleStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }


    student.status = student.status === "Active" ? "Inactive" : "Active";
    await student.save();

    res.status(200).json({
      success: true,
      msg: "Status updated successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error toggling status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, course, batch, password } = req.body;

    if (!name || !email || !course || !batch) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }
    const updateData = { name, email, course, batch };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const student = await Student.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, student });
  } catch (error) {
    console.error("Update student error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const toggleCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }


    course.status = course.status === "active" ? "inactive" : "active";

    await course.save();

    res.status(200).json({
      success: true,
      msg: "Course status updated successfully",
      data: course,
    });
  } catch (error) {
    console.error("Error toggling course status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Store for password reset tokens is imported from tokenStore.js

// Generate random token without crypto module
const generateToken = () => {
  return Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

// Send Password Reset Link
export const sendPasswordResetLink = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required"
      });
    }

    // Generate secure random token
    const token = generateToken();

    // Store token with expiration (30 minutes)
    resetTokenStore[email] = {
      token,
      expiresAt: Date.now() + 30 * 60 * 1000
    };

    console.log(`Password reset link generated for ${email}`);

    // Create reset link - use environment variable for frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/set-password?token=${token}&email=${encodeURIComponent(email)}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: `"PUNCHING APP" <${process.env.APP_EMAIL}>`,
      to: email,
      subject: "Set Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #141E46;">Set Your Password</h2>
          <p>Hello,</p>
          <p>Click the button below to set your password for your new account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #141E46; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Set Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link in your browser:<br>
            <a href="${resetLink}" style="color: #141E46;">${resetLink}</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 30 minutes.
          </p>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    });

    res.json({
      success: true,
      message: "Password reset link sent to email"
    });

  } catch (err) {
    console.error("Error sending password link:", err);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: err.message
    });
  }
};



export const saveLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body; // req.body must exist

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "Latitude & longitude required" });
    }

    await Location.create({ latitude, longitude });

    res.status(201).json({ message: "Location saved successfully" });
  } catch (error) {
    console.error("SAVE LOCATION ERROR:", error);
    res.status(500).json({ message: "Failed to save location" });
  }
};


export const addMentor = async (req, res) => {
  try {
    const { name, email, password, course } = req.body;

    if (!name || !email || !password || !course) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const exists = await Mentor.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Mentor already exists" }); // corrected message
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const mentor = await Mentor.create({
      name,
      email,
      password: hashedPassword,
      course,
      status: "Active",
    });

    res.status(201).json({ success: true, mentor });
  } catch (error) {
    console.error("Add Mentor Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find().sort({ createdAt: -1 });
    res.json({ success: true, mentors });
  } catch (error) {
    console.error("Get mentors error:", error);
    res.status(500).json({ success: false });
  }
};

export const updateMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, course } = req.body;

    if (!name || !email || !course) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const updateData = { name, email, course };

    const mentor = await Mentor.findByIdAndUpdate(id, updateData, { new: true });

    if (!mentor) {
      return res.status(404).json({ success: false, message: "Mentor not found" });
    }

    res.json({ success: true, mentor });
  } catch (error) {
    console.error("Update mentor error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const toggleMentorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const mentor = await Mentor.findById(id);

    if (!mentor) {
      return res.status(404).json({ success: false, message: "Mentor not found" });
    }

    mentor.status = mentor.status === "Active" ? "Inactive" : "Active";
    await mentor.save();

    res.status(200).json({ success: true, mentor });
  } catch (error) {
    console.error("Toggle mentor status error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getDailyAttendance = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required (format: YYYY-MM-DD)"
      });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const records = await Attendancemodel.aggregate([
      {
        $match: {
          date: { $gte: start, $lt: end }
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          courseObjectId: {
            $cond: {
              if: { $eq: [{ $type: "$student.course" }, "string"] },
              then: {
                $cond: {
                  if: { $regexMatch: { input: "$student.course", regex: /^[0-9a-fA-F]{24}$/ } },
                  then: { $toObjectId: "$student.course" },
                  else: null
                }
              },
              else: "$student.course"
            }
          }
        }
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseObjectId",
          foreignField: "_id",
          as: "courseByObjectId"
        }
      },
      {
        $lookup: {
          from: "courses",
          localField: "student.course",
          foreignField: "name",
          as: "courseByName"
        }
      },
      {
        $addFields: {
          courseDoc: {
            $cond: {
              if: { $gt: [{ $size: "$courseByObjectId" }, 0] },
              then: { $arrayElemAt: ["$courseByObjectId", 0] },
              else: { $arrayElemAt: ["$courseByName", 0] }
            }
          }
        }
      },
      {
        $project: {
          studentName: { $ifNull: ["$student.name", "Unknown"] },
          course: { $ifNull: ["$courseDoc.name", "$student.course"] },
          batch: { $ifNull: ["$student.batch", "—"] },
          attendance: "$$ROOT"
        }
      },
      { $sort: { studentName: 1 } }
    ]);

    res.status(200).json({
      success: true,
      attendanceData: records,
      count: records.length
    });

  } catch (error) {
    console.error("getDailyAttendance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching daily attendance",
      error: error.message
    });
  }
};

export const getAllPendingLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: "Pending" })
      .populate("studentId", "name email course batch");

    res.json({ success: true, leaves });
  } catch (error) {
    console.error("Get all pending leaves error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all leaves (all statuses) for admin leave history
export const getAllLeaves = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = {};
    if (status && status !== "All") {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate({
        path: "studentId",
        select: "name email course batch",
        populate: {
          path: "course",
          select: "name"
        }
      })
      .sort({ createdAt: -1 });

    // Format the response with course name
    const formattedLeaves = leaves.map(leave => {
      // Get course name - could be a populated object or a string
      let courseName = "N/A";
      if (leave.studentId?.course) {
        if (typeof leave.studentId.course === 'object' && leave.studentId.course.name) {
          courseName = leave.studentId.course.name;
        } else if (typeof leave.studentId.course === 'string') {
          courseName = leave.studentId.course;
        }
      }

      return {
        _id: leave._id,
        studentName: leave.studentId?.name || "Unknown",
        studentEmail: leave.studentId?.email || "",
        course: courseName,
        batch: leave.studentId?.batch || "N/A",
        type: leave.type,
        from: new Date(leave.from).toLocaleDateString("en-CA"),
        to: new Date(leave.to).toLocaleDateString("en-CA"),
        reason: leave.reason,
        status: leave.status,
        createdAt: leave.createdAt
      };
    });

    // Apply search filter if provided
    let filteredLeaves = formattedLeaves;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLeaves = formattedLeaves.filter(leave =>
        leave.studentName.toLowerCase().includes(searchLower) ||
        leave.reason.toLowerCase().includes(searchLower)
      );
    }

    res.json({ success: true, leaves: filteredLeaves });
  } catch (error) {
    console.error("Get all leaves error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update leave status (approve/reject)
export const updateLeaveStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params; // leave id
    const { status } = req.body; // Approved / Rejected

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

    leave.status = status;
    await leave.save();

    res.json({ success: true, leave });
  } catch (error) {
    console.error("Update leave status admin error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const sendInformation = async (req, res) => {
  try {

    const { title, message, audience } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        message: "Title and message required",
      });
    }

    const notification = new Notification({
      title,
      message,
      audience,
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: "Information sent successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};




// ✅ GET MONTHLY SUMMARY FOR ADMIN - Get attendance summary for all students
export const getMonthlySummaryForAdmin = async (req, res) => {
  try {
    const { month, year, course, batch } = req.query;

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
      if (day !== 0 && day !== 6) {
        totalWorkingDays++;
      }
    }

    // Build student query based on filters
    let studentQuery = {};
    if (course) studentQuery.course = course;
    if (batch) studentQuery.batch = batch;

    // Get all students
    const students = await Student.find(studentQuery)
      .select('_id name batch course');

    // Get attendance and leave data for each student
    const summaryData = await Promise.all(
      students.map(async (student) => {
        // Get attendance records for the month
        const attendanceCount = await Attendancemodel.countDocuments({
          studentId: student._id,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        // Get approved leaves for the month
        const approvedLeaves = await Leave.find({
          studentId: student._id,
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

        // Get course name - handle ObjectId string or course name string
        let courseName = "N/A";
        if (student.course) {
          // Check if it's a valid ObjectId string (24 hex characters)
          if (typeof student.course === 'string' && /^[0-9a-fA-F]{24}$/.test(student.course)) {
            // It's an ObjectId string, fetch the course document
            const courseDoc = await Course.findById(student.course);
            courseName = courseDoc?.name || student.course;
          } else {
            // It's a course name string
            courseName = student.course;
          }
        }

        return {
          studentId: student._id,
          name: student.name,
          batch: student.batch,
          course: courseName,
          totalDays: totalWorkingDays,
          presentDays: attendanceCount,
          leaveDays: leaveDays,
          absentDays: Math.max(0, totalWorkingDays - attendanceCount - leaveDays)
        };
      })
    );

    res.json({
      success: true,
      month: startOfMonth.toLocaleString('default', { month: 'long' }),
      year: targetYear,
      totalWorkingDays,
      students: summaryData
    });

  } catch (error) {
    console.error("❌ getMonthlySummaryForAdmin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch monthly summary",
      error: error.message
    });
  }
};

export { Login, toggleStudentStatus, toggleCourseStatus }




