const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema(
  {
    inspectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inspection',
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
    findings: String,
    recommendations: String,
    overallRating: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'SATISFACTORY', 'NEEDS_IMPROVEMENT'],
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'REVIEWED', 'APPROVED'],
      default: 'DRAFT',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    reviewComments: String,
    signedAt: Date,
    signatureOTPVerified: Boolean,
    pdfUrl: String,
  },
  { timestamps: true }
)

module.exports = mongoose.model('Report', reportSchema)
