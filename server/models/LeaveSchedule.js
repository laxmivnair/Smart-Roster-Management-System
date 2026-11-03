const mongoose = require('mongoose');

const LeaveScheduleSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD format for timezone-agnostic exact date matching
      required: [true, 'Leave date (YYYY-MM-DD) is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['PLANNED_LEAVE', 'COMP_OFF', 'SICK_LEAVE'],
      default: 'PLANNED_LEAVE',
    },
    status: {
      type: String,
      enum: ['APPROVED', 'PENDING', 'REJECTED'],
      default: 'APPROVED',
    },
    reason: {
      type: String,
      default: 'Planned leave',
    },
  },
  { timestamps: true }
);

LeaveScheduleSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('LeaveSchedule', LeaveScheduleSchema);
