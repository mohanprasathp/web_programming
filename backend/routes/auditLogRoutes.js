const express = require('express')
const router = express.Router()
const { auth, roleCheck } = require('../middleware/auth')
const AuditLogService = require('../services/auditLogService')

// All audit log endpoints require CEO authorization
router.use(auth)
router.use(roleCheck(['CEO', 'ADMIN']))

// Get activity logs with filters
router.get('/', async (req, res) => {
  try {
    const { userId, action, resourceType, startDate, endDate, limit = 50, skip = 0 } = req.query

    const logs = await AuditLogService.getActivityLogs({
      userId,
      action,
      resourceType,
      startDate,
      endDate,
      limit: parseInt(limit),
      skip: parseInt(skip),
    })

    const total = await require('../models/ActivityLog').countDocuments(
      buildQuery({ userId, action, resourceType, startDate, endDate })
    )

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs',
      error: err.message,
    })
  }
})

// Get user activity summary
router.get('/user/:userId/summary', async (req, res) => {
  try {
    const { days = 30 } = req.query
    const summary = await AuditLogService.getUserActivitySummary(
      req.params.userId,
      parseInt(days)
    )

    res.json({
      success: true,
      data: summary,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity summary',
      error: err.message,
    })
  }
})

// Get system activity statistics
router.get('/system/stats', async (req, res) => {
  try {
    const { days = 30 } = req.query
    const stats = await AuditLogService.getSystemActivityStats(parseInt(days))

    res.json({
      success: true,
      data: stats,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system statistics',
      error: err.message,
    })
  }
})

function buildQuery({ userId, action, resourceType, startDate, endDate }) {
  const query = {}
  if (userId) query.userId = userId
  if (action) query.action = action
  if (resourceType) query.resourceType = resourceType
  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) query.createdAt.$gte = new Date(startDate)
    if (endDate) query.createdAt.$lte = new Date(endDate)
  }
  return query
}

module.exports = router
