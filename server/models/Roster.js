const mongoose = require('mongoose');

const RosterEntrySchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      default: null,
    },
    processId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BrandProcess',
      default: null,
    },
    status: {
      type: String,
      enum: ['WORKING', 'WEEKLY_OFF', 'LEAVE', 'COMP_OFF', 'PUBLIC_HOLIDAY'],
      required: true,
      default: 'WORKING',
    },
    isCrossCoverage: {
      type: Boolean,
      default: false,
    },
    coveredForEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const CandidateReplacementSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    name: String,
    podName: String,
    skills: [String],
    currentStatus: String,
    reason: String,
  },
  { _id: false }
);

const ConflictSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    severity: {
      type: String,
      enum: ['CRITICAL_GAP', 'UNDERSTAFFED', 'OVERLOAD'],
      required: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      default: null,
    },
    brandName: {
      type: String,
      default: '',
    },
    processType: {
      type: String,
      default: '',
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    employeeName: {
      type: String,
      default: '',
    },
    explanation: {
      type: String,
      required: true,
    },
    suggestedResolution: {
      type: String,
      default: '',
    },
    candidateReplacements: [CandidateReplacementSchema],
  },
  { _id: false }
);

const RosterSchema = new mongoose.Schema(
  {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED'],
      default: 'DRAFT',
    },
    metrics: {
      totalRequiredSlots: { type: Number, default: 0 },
      coveredSlots: { type: Number, default: 0 },
      slaPercentage: { type: Number, default: 100 },
      criticalGapsCount: { type: Number, default: 0 },
      understaffedCount: { type: Number, default: 0 },
      overloadCount: { type: Number, default: 0 },
      totalConflicts: { type: Number, default: 0 },
    },
    entries: [RosterEntrySchema],
    conflicts: [ConflictSchema],
    demandMatrix: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

RosterSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Roster', RosterSchema);
