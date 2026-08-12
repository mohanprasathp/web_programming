const mongoose = require('mongoose')

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: String,
    userRole: String,
    action: {
      type: String,
      enum: [
        'LOGIN',
        'LOGOUT',
        'CREATE_PLAN',
        'SIGN_PLAN',
        'ASSIGN_SCHOOLS',
        'START_INSPECTION',
        'SUBMIT_CHECKLIST',
        'CREATE_ISSUE',
        'RESOLVE_ISSUE',
        'UPLOAD_PHOTO',
        'SUBMIT_REPORT',
        'CREATE_CORRECTIVE_ACTION',
        'EXTEND_DEADLINE',
        'VIEW_REPORT',
        'VIEW_ISSUE',
        'UPDATE_PROFILE',
      ],
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      enum: ['Inspection', 'Issue', 'Plan', 'School', 'User', 'Report'],
    },
    resourceId: mongoose.Schema.Types.ObjectId,
    description: String,
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
    },
    ipAddress: String,
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
)

// TTL index - auto-delete logs older than 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 })

module.exports = mongoose.model('ActivityLog', activityLogSchema)
