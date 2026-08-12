const express = require('express')
const router = express.Router()
const { auth } = require('../middleware/auth')
const NotificationService = require('../services/notificationService')

router.use(auth)

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const { limit = 20, skip = 0, unreadOnly = false } = req.query
    let query = { userId: req.userId }
    
    if (unreadOnly === 'true') {
      query.isRead = false
    }

    const notifications = await require('../models/Notification')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean()

    const total = await require('../models/Notification').countDocuments(
      query
    )
    const unreadCount = await NotificationService.getUnreadCount(req.userId)

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
      unreadCount,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: err.message,
    })
  }
})

// Mark notification as read
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const notification = await NotificationService.markAsRead(
      req.params.notificationId,
      req.userId
    )

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      })
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update notification',
      error: err.message,
    })
  }
})

// Mark all notifications as read
router.patch('/read-all', async (req, res) => {
  try {
    await NotificationService.markAllAsRead(req.userId)
    res.json({
      success: true,
      message: 'All notifications marked as read',
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update notifications',
      error: err.message,
    })
  }
})

// Get unread count
router.get('/unread-count', async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount(req.userId)
    res.json({
      success: true,
      unreadCount: count,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: err.message,
    })
  }
})

// Delete notification
router.delete('/:notificationId', async (req, res) => {
  try {
    await require('../models/Notification').findByIdAndDelete(
      req.params.notificationId
    )
    res.json({
      success: true,
      message: 'Notification deleted',
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: err.message,
    })
  }
})

module.exports = router
