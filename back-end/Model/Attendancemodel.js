import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },   

    punchInTime: {
      type: Date,
      default: null,
    },

    punchInAcceptedAt: {
      type: Date,
      default: null,
    },

    punchOutTime: {
      type: Date,
      default: null,
    },
  
    // ✅ Break handling - FIXED field names
    breakStartTime: {
      type: Date,
      default: null,
    },

    totalBreakTime: {  // ✅ Changed from totalBreakSeconds
      type: Number,
      default: 0,
    },

    // ✅ Working time (seconds) - FIXED field name
    totalWorkingTime: {  // ✅ Changed from workingHours
      type: Number,
      default: 0,
    },

    latitude: Number,
    longitude: Number,
    punchOutLatitude: Number,
    punchOutLongitude: Number,
    distance: Number,

    date: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      },
    },

    // ✅ Punch records for multiple sessions
    punchRecords: [{
      punchIn: { type: Date, required: true },
      punchOut: { type: Date, default: null },
      sessionWorkingSeconds: { type: Number, default: 0 }
    }],

    // ✅ Working and break time tracking
    totalWorkingSeconds: {
      type: Number,
      default: 0,
    },

    totalBreakSeconds: {
      type: Number,
      default: 0,
    },

    currentBreakStart: {
      type: Date,
      default: null,
    },

    isCurrentlyOnBreak: {
      type: Boolean,
      default: false,
    },

    // ✅ Initial location check
    initialLatitude: Number,
    initialLongitude: Number,
    initialDistance: Number,
    initialLocationChecked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);