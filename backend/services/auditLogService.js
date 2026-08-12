const ActivityLog = require('../models/ActivityLog')

class AuditLogService {
  static async log({
    userId,
    userName,
    userRole,
    action,
    resourceType = null,
    resourceId = null,
    description = null,
    changes = null,
    ipAddress = null,
    status = 'SUCCESS',
  }) {
    try {
      const log = new ActivityLog({
        userId,
        userName,
        userRole,
        action,
        resourceType,
        resourceId,
        description,
        changes,
        ipAddress,
        status,
      })
      await log.save()
      return log
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  static async getActivityLogs({
    userId = null,
    action = null,
    resourceType = null,
    startDate = null,
    endDate = null,
    limit = 50,
    skip = 0,
  } = {}) {
    const query = {}

    if (userId) query.userId = userId
    if (action) query.action = action
    if (resourceType) query.resourceType = resourceType
    
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    return ActivityLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
  }

  static async getUserActivitySummary(userId, days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    return ActivityLog.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ])
  }

  static async getSystemActivityStats(days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    return ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            action: '$action',
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.action',
          total: { $sum: '$count' },
          success: {
            $sum: {
              $cond: [{ $eq: ['$_id.status', 'SUCCESS'] }, '$count', 0],
            },
          },
          failed: {
            $sum: {
              $cond: [{ $eq: ['$_id.status', 'FAILED'] }, '$count', 0],
            },
          },
        },
      },
      {
        $sort: { total: -1 },
      },
    ])
  }

  static async deleteOldLogs(daysOld = 90) {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
    return ActivityLog.deleteMany({ createdAt: { $lt: cutoffDate } })
  }
}

module.exports = AuditLogService
