import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    // Student reference
    studentemail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    // Punch timings
    punchInTime: {
      type: Date,
      default: null,
    },

    punchOutTime: {
      type: Date,
      default: null,
    },

    // 🔔 Break tracking
    breakStartTime: {
      type: Date,
      default: null,
    },

    // ❌ breakEndTime direct aayi store cheyyenda avashyam illa
    // totalBreakSeconds use cheyyumbo mathi
    // breakEndTime remove cheythu

    totalBreakSeconds: {
      type: Number,
      default: 0, // total break time (seconds)
    },

    // Location tracking
    latitude: Number,
    longitude: Number,

    punchOutLatitude: Number,
    punchOutLongitude: Number,

    distance: Number,

    // Working hours (seconds) → punchOut time il calculate cheyyum
    workingHours: {
      type: Number,
      default: 0,
    },

    // Date (today only one record)
    date: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Attendance", attendanceSchema);
