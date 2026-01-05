
import Course from "../Model/Coursemodel.js";
import jwt from "jsonwebtoken";
import Student from "../Model/Studentsmodel.js";
import bcrypt from "bcrypt";


const adminemail = "admin@gmail.com";
const adminpass = "admin123";
const JWT_SECRET = "key321";

const Login = (req, res) => {
  const { email, password } = req.body;

  if (email === adminemail && password === adminpass) {
    const token = jwt.sign(
      { email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "5m" } //  expiry
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
    res.json(students);
  } catch (error) {
    res.status(500).json({ success: false });
  }
};


export{Login,}

