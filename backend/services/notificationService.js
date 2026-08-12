const Notification = require('../models/Notification')

class NotificationService {
  static async createNotification({
    userId,
    type,
    title,
    message,
    priority = 'MEDIUM',
    relatedResource = null,
    actionUrl = null,
    metadata = null,
  }) {
    try {
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        priority,
        relatedResource,
        actionUrl,
        metadata,
      })
      await notification.save()
      
      // Emit to WebSocket if connected
      if (global.io) {
        global.io.to(`user_${userId}`).emit('notification', {
          id: notification._id,
          type,
          title,
          message,
          priority,
          createdAt: notification.createdAt,
        })
      }
      
      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }

  static async getUserNotifications(userId, { limit = 20, skip = 0 } = {}) {
    return Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
  }

  static async markAsRead(notificationId, userId) {
    return Notification.findByIdAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    )
  }

  static async markAllAsRead(userId) {
    return Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    )
  }

  static async getUnreadCount(userId) {
    return Notification.countDocuments({ userId, isRead: false })
  }

  static async deleteOldNotifications(daysOld = 30) {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
    return Notification.deleteMany({ createdAt: { $lt: cutoffDate } })
  }

  // Bulk notifications for specific role
  static async notifyByRole(role, { type, title, message, priority = 'MEDIUM' }) {
    const User = require('../models/User')
    const users = await User.find({ role }).select('_id')
    
    const notifications = users.map((user) => ({
      userId: user._id,
      type,
      title,
      message,
      priority,
    }))
    
    await Notification.insertMany(notifications)
  }
}

module.exports = NotificationService
