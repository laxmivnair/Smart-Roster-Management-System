const mongoose = require('mongoose');

const BrandProcessSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: [true, 'Brand reference is required'],
      index: true,
    },
    processType: {
      type: String,
      enum: ['CS', 'ACC', 'NDR', 'RETENTION'],
      required: [true, 'Process type is required'],
    },
    operatingCalendar: {
      type: String,
      enum: [
        'EVERYDAY_365',             // 7 days/week, including Sundays and public holidays
        'EXCEPT_HOLIDAYS',          // 7 days/week, off on gazetted public holidays
        'MON_SAT_EXCEPT_HOLIDAYS',  // Mon-Sat, off on Sundays and public holidays
        'MON_FRI_EXCEPT_HOLIDAYS',  // Mon-Fri, off on weekends and public holidays
      ],
      default: 'EVERYDAY_365',
      required: true,
    },
    minDailyStaffing: {
      type: Number,
      default: 1,
      min: 1,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

BrandProcessSchema.index({ brandId: 1, processType: 1 }, { unique: true });

module.exports = mongoose.model('BrandProcess', BrandProcessSchema);
