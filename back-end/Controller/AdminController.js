import Batchmodel from "../Model/Batchmodel.js";
import Batch from "../Model/Batchmodel.js";
import Course from "../Model/Coursemodel.js";
import jwt from "jsonwebtoken";

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
   try {
    const course = await Course.findByIdAndUpdate(
      id,
      { editCourseName: duration },
      { new: true } // returns the updated course
    );

    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.json({ course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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




export{Login,}

