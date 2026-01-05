import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  number: String,
  course: String,
  batch: String,
  admission: String,
  password: String,
  status: { type: String, default: "Active" },  
});

export default mongoose.model("Student", studentSchema);
