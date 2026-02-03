// models/PunchRequest.js - FIXED

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
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
    default: null,
  },
  processedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
punchRequestSchema.index({ studentId: 1, status: 1 });
punchRequestSchema.index({ requestTime: -1 });
punchRequestSchema.index({ processedBy: 1 });

// FIXED: Remove next callback - just update the field directly
punchRequestSchema.pre('save', function() {
  if (this.isModified('status') && this.status !== 'PENDING') {
    this.processedAt = new Date();
  }
});

const PunchRequest = mongoose.model('PunchRequest', punchRequestSchema);

export default PunchRequest;