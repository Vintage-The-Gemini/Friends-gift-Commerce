// frontend/src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/api/notification';

// Create Notification Context
const NotificationContext = createContext();

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize notifications when user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadCount();
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
      setInitialized(false);
    }
  }, [user]);

  // Load notifications from server
  const loadNotifications = useCallback(async (page = 1, limit = 10) => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await notificationService.getUserNotifications({
        page,
        limit
      });

      if (response.success) {
        if (page === 1) {
          setNotifications(response.data);
        } else {
          setNotifications(prev => [...prev, ...response.data]);
        }
        setUnreadCount(response.unreadCount);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [user]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!user || !notificationId) return;

    try {
      const response = await notificationService.markAsRead({ notificationId });
      
      if (response.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        return true;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    
    return false;
  }, [user]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const response = await notificationService.markAllAsRead();
      
      if (response.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        setUnreadCount(0);
        
        return true;
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
    
    return false;
  }, [user]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!user || !notificationId) return;

    try {
      const response = await notificationService.deleteNotification({ notificationId });
      
      if (response.success) {
        // Check if deleted notification was unread
        const notification = notifications.find(n => n._id === notificationId);
        const wasUnread = notification && !notification.isRead;
        
        // Update local state
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        
        // Update unread count if needed
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
    
    return false;
  }, [user, notifications]);

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    if (user) {
      await loadNotifications();
      await loadUnreadCount();
    }
  }, [user, loadNotifications, loadUnreadCount]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const response = await notificationService.deleteNotification({ all: true });
      
      if (response.success) {
        setNotifications([]);
        setUnreadCount(0);
        return true;
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
    
    return false;
  }, [user]);

  // Get notification by ID
  const getNotificationById = useCallback((notificationId) => {
    return notifications.find(n => n._id === notificationId);
  }, [notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.isRead);
  }, [notifications]);

  // Check if user has unread notifications
  const hasUnreadNotifications = useCallback(() => {
    return unreadCount > 0;
  }, [unreadCount]);

  // Set up real-time notifications if WebSocket is available
  useEffect(() => {
    if (!user || !window.io) return;

    // Join user-specific room
    const socket = window.io();
    socket.emit('join', `user_${user._id}`);

    // Listen for new notifications
    socket.on('new_notification', (notification) => {
      addNotification(notification);
    });

    // Cleanup
    return () => {
      socket.off('new_notification');
      socket.disconnect();
    };
  }, [user, addNotification]);

  const contextValue = {
    // State
    notifications,
    unreadCount,
    loading,
    initialized,
    
    // Methods
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    refreshNotifications,
    clearAllNotifications,
    
    // Getters
    getNotificationById,
    getUnreadNotifications,
    hasUnreadNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;