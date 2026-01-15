
import Batch from "../Model/Batchmodel.js";
import Course from "../Model/Coursemodel.js";
import jwt from "jsonwebtoken";
import Student from "../Model/Studentsmodel.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import Location from "../Model/Locationmodel.js";
import Mentor from "../Model/Mentormodel.js";



const adminemail = "admin@gmail.com";
const adminpass = "admin123";
const JWT_SECRET = "key321";

const Login = (req, res) => {
  const { email, password } = req.body;

  if (email === adminemail && password === adminpass) {
    const token = jwt.sign(
      { email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "10m" } //  expiry
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
     password: hashedPassword, // store hashed password
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
    console.log(students);
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

    await batch.deleteOne(); // safely delete the batch
    res.json({ message: "Batch deleted successfully" });
  } catch (error) {
    console.error("Delete batch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const toggleStudentStatus = async (req, res) => {
    try {
      const { id } = req.params; // student id
      const student = await Student.findById(id);
  
      if (!student) {
        return res.status(404).json({ msg: "Student not found" });
      }
  
      // toggle status
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


let otpStore = {}; // temporary in-memory store

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email required" });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // expires in 5 min

  // Nodemailer transporter (Gmail)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASSWORD, // 16-char Gmail App Password
    },
    tls: { rejectUnauthorized: false },
  });

  try {
    await transporter.sendMail({
      from: `"PUNCHING APP" <${process.env.APP_EMAIL}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// Verify OTP
export const verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) return res.json({ success: false, message: "No OTP found for this email" });
  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.json({ success: false, message: "OTP expired" });
  }

  if (record.otp.toString() === otp) {
    delete otpStore[email];
    return res.json({ success: true, message: "OTP verified" });
  }

  res.json({ success: false, message: "Invalid OTP" });
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




export{Login,toggleStudentStatus, toggleCourseStatus}




