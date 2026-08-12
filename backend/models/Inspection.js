const mongoose = require('mongoose')

const inspectionSchema = new mongoose.Schema(
  {
    inspectionPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InspectionPlan',
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    inspectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deadline: Date,
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    startTime: Date,
    startLocation: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
    },
    currentLocation: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      timestamp: Date,
    },
    endTime: Date,
    endLocation: {
      latitude: Number,
      longitude: Number,
    },
    checklist: {
      infrastructure: String,
      academic: String,
      governmentSchemes: String,
      safety: String,
    },
    remarks: String,
    photos: [
      {
        url: String,
        filename: String,
        timestamp: Date,
        latitude: Number,
        longitude: Number,
        accuracy: Number,
      },
    ],
    findings: String,
    recommendations: String,
    overallRating: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'SATISFACTORY', 'NEEDS_IMPROVEMENT'],
    },
    gpsLocations: [
      {
        latitude: Number,
        longitude: Number,
        timestamp: Date,
        accuracy: Number,
      },
    ],
    locationHistory: [
      {
        latitude: Number,
        longitude: Number,
        timestamp: Date,
        accuracy: Number,
      },
    ],
    issues: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
      },
    ],
    submittedAt: Date,
    signatureVerified: {
      type: Boolean,
      default: false,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Inspection', inspectionSchema)
