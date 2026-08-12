import React, { useState } from 'react'
import { Bell, X, Check, Trash2, Circle } from 'lucide-react'
import axiosInstance from '../services/api'

const NotificationCenter = ({ unreadCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(unreadCount)

  const fetchNotifications = async () => {
    if (loading) return
    setLoading(true)
    try {
      const response = await axiosInstance.get('/api/notifications?limit=20')
      setNotifications(response.data.data)
      setUnread(response.data.unreadCount)
    } catch (err) {
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    fetchNotifications()
  }

  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.patch(`/api/notifications/${notificationId}/read`)
      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      )
      fetchNotifications()
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axiosInstance.patch('/api/notifications/read-all')
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
      setUnread(0)
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await axiosInstance.delete(`/api/notifications/${notificationId}`)
      setNotifications(notifications.filter((n) => n._id !== notificationId))
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-600'
      case 'HIGH':
        return 'text-orange-600'
      case 'MEDIUM':
        return 'text-blue-600'
      default:
        return 'text-green-600'
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-surface-600 hover:text-surface-950 hover:bg-surface-100 rounded-lg transition"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-surface-200 z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-surface-200 bg-surface-50">
            <h3 className="font-semibold text-surface-950">Notifications</h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-surface-200 rounded"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading && (
              <div className="p-4 text-center text-surface-600">Loading...</div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="p-6 text-center">
                <Bell size={32} className="mx-auto text-surface-300 mb-2" />
                <p className="text-surface-600">No notifications</p>
              </div>
            )}

            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 border-b border-surface-100 hover:bg-surface-50 transition ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-3">
                  <Circle
                    size={8}
                    className={`mt-1.5 flex-shrink-0 ${
                      !notification.isRead ? 'fill-blue-600 text-blue-600' : 'text-surface-300'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-950 text-sm">
                      {notification.title}
                    </p>
                    <p className="text-sm text-surface-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-surface-500 mt-2">
                      {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
