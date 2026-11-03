const mongoose = require('mongoose');

const ResourceAllocationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: [true, 'Brand reference is required'],
      index: true,
    },
    processId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BrandProcess',
      required: [true, 'Process reference is required'],
      index: true,
    },
    roleType: {
      type: String,
      enum: ['PRIMARY', 'BACKUP'],
      default: 'PRIMARY',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

ResourceAllocationSchema.index({ employeeId: 1, brandId: 1, processId: 1 }, { unique: true });

module.exports = mongoose.model('ResourceAllocation', ResourceAllocationSchema);
