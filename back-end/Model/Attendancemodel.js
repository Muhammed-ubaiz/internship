import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentemail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },   

    punchInTime: {
      type: Date,
      default: null,
    },

    punchOutTime:{
      type: Date,
      default: null,
    },
  
    // 🟡 Break handling
    breakStartTime: {
      type: Date,
      default: null,
    },


    totalBreakSeconds: {
      type: Number,
      default: 0,
    },

    // 🟢 Working time (seconds)
    workingHours: {
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
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
