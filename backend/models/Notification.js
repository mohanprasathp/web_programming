const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['INSPECTION_ASSIGNED', 'ISSUE_CREATED', 'REPORT_SUBMITTED', 'EXTENSION_REQUESTED', 'ISSUE_RESOLVED', 'DEADLINE_ALERT'],
      required: true,
    },
    title: String,
    message: String,
    relatedId: mongoose.Schema.Types.ObjectId,
    relatedModel: String,
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  { timestamps: true }
)

module.exports = mongoose.model('Notification', notificationSchema)
