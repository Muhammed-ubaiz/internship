import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },

  punchInTime: {
    type: Date,
    default: null,
  },

  punchOutTime: {
    type: Date,
    default: null,
  },

  latitude: Number,
  longitude: Number,
  distance: Number,
  workingHours: Number, // seconds

  date: {
    type: Date,
    default: () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    },
  },
});

export default mongoose.model("Attendance", attendanceSchema);
