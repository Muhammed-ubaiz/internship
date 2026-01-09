import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  studentEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  // 📅 Punch In Date (only date)
  punchInDate: {
    type: Date,
    default: () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    },
  },

  // ⏰ Punch In Time (only time stored as string)
  punchInTime: {
    type: String, // example: "09:15 AM"
    default: null,
  },

  // 📅 Punch Out Date
  punchOutDate: {
    type: Date,
    default: null,
  },

  // ⏰ Punch Out Time
  punchOutTime: {
    type: String, // example: "05:30 PM"
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
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
