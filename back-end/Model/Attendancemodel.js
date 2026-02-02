import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  initialLocationChecked: {
    type: Boolean,
    default: false,
  },
  punchRecords: [
    {
      punchIn: {
        type: Date,
        required: true,
      },
      punchOut: {
        type: Date,
        default: null,
      },
      // NEW: Auto punch-out tracking
      autoPunchOut: {
        type: Boolean,
        default: false,
      },
      autoPunchOutReason: {
        type: String,
        default: null,
      },
      _id: false, // Optional: prevents Mongoose from creating _id for subdocuments
    }
  ],
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
}, {
  timestamps: true,
});

// Index for faster queries
attendanceSchema.index({ studentId: 1, date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;