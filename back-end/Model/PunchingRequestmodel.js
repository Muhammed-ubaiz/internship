// models/PunchRequest.js - Schema for punch-in approval requests

import mongoose from 'mongoose';

const punchRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['PUNCH_IN', 'PUNCH_OUT'],
    default: 'PUNCH_IN',
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  distance: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
    index: true,
  },
  requestTime: {
    type: Date,
    default: Date.now,
    index: true,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  rejectedAt: {
    type: Date,
    default: null,
  },
  rejectionReason: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

// Index for faster queries
punchRequestSchema.index({ studentId: 1, status: 1 });
punchRequestSchema.index({ requestTime: -1 });

const PunchRequest = mongoose.model('PunchRequest', punchRequestSchema);

export default PunchRequest;