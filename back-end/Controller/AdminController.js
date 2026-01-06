
import Batch from "../Model/Batchmodel.js";
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
      { expiresIn: "35m" } //  expiry
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

// ADD BATCH BY COURSE NAME
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


// UPDATE COURSE
export const updateCourse = async (req, res) => {
    const { _id } = req.params;
    const { editCourseName, editDuration } = req.body;

    if (!_id || !editCourseName || !editDuration) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    await Course.findByIdAndUpdate(_id, { name: editCourseName, duration: editDuration });
    res.json({ success: true, message: "Course updated successfully" });
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



export{Login,toggleStudentStatus}

