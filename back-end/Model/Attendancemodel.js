import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },

  punchInTime: {
    type: Date,   // ✅ CORRECT
    default: null,
  },

  punchOutTime: {
    type: Date,   // ✅ CORRECT
    default: null,
  },

  punchInLocation: {
    latitude: Number,
    longitude: Number,
  },

  punchOutLocation: {
    latitude: Number,
    longitude: Number,
  },

  // Stores ONLY the date (00:00:00)
  date: {
    type: Date,
    required: true,
    default: () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    },
  },
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
