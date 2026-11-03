const mongoose = require('mongoose');

const PodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pod name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Pod code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pod', PodSchema);
