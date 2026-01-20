import mongoose from 'mongoose';

const punchingRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  type: {
    type: String,
    enum: ['PUNCH_IN', 'PUNCH_OUT'],
    required: true
  },
  punchTime: {
    type: Date,
    default: Date.now
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  status: {
  type: String,
  enum: ["PENDING", "APPROVED", "REJECTED"],
  default: "PENDING"
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor'
  },
  processedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
punchingRequestSchema.index({ studentId: 1, status: 1 });
punchingRequestSchema.index({ createdAt: -1 });

const PunchingRequest = mongoose.model('PunchingRequest', punchingRequestSchema);

export default PunchingRequest;