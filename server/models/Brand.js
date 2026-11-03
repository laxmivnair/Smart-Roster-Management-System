const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Brand code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    podId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pod',
      required: [true, 'Pod assignment is required'],
      index: true,
    },
    tier: {
      type: String,
      enum: ['SINGLE_RESOURCE', 'MULTI_RESOURCE'],
      required: [true, 'Brand tier is required (SINGLE_RESOURCE or MULTI_RESOURCE)'],
      default: 'SINGLE_RESOURCE',
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Brand', BrandSchema);
