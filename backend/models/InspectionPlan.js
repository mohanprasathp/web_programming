const mongoose = require('mongoose')

const inspectionPlanSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: String,
    description: String,
    schools: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
      },
    ],
    assignedTo: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        schools: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School',
          },
        ],
        deadline: Date,
      },
    ],
    checklist: {
      infrastructure: [String],
      academic: [String],
      governmentSchemes: [String],
      safety: [String],
    },
    plannedStartDate: Date,
    plannedEndDate: Date,
    status: {
      type: String,
      enum: ['DRAFT', 'SIGNED', 'ACTIVE', 'COMPLETED'],
      default: 'DRAFT',
    },
    signedAt: Date,
    signedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('InspectionPlan', inspectionPlanSchema)
