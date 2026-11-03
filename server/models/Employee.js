const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    podId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pod',
      required: [true, 'Pod assignment is required'],
      index: true,
    },
    role: {
      type: String,
      enum: ['POD_LEAD', 'SENIOR_ASSOCIATE', 'OPERATIONS_ASSOCIATE'],
      default: 'OPERATIONS_ASSOCIATE',
    },
    skills: {
      type: [String],
      enum: ['CS', 'ACC', 'NDR', 'RETENTION'],
      required: [true, 'At least one skill is required'],
      default: ['CS'],
    },
    defaultWeeklyOffDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Sunday'],
    },
    maxConsecutiveDays: {
      type: Number,
      default: 6,
      min: 1,
      max: 14,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', EmployeeSchema);
