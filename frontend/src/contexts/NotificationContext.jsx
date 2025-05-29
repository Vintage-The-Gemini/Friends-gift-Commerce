// frontend/src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/api/notification';

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
};

// Action types
const NOTIFICATION_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATIONS: 'ADD_NOTIFICATIONS',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
  SET_ERROR: 'SET_ERROR',
  SET_HAS_MORE: 'SET_HAS_MORE',
  INCREMENT_PAGE: 'INCREMENT_PAGE',
  RESET_PAGE: 'RESET_PAGE',
};

// Reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case NOTIFICATION_ACTIONS.SET_NOTIFICATIONS:
      return { 
        ...state, 
        notifications: action.payload, 
        loading: false,
        error: null 
      };

    case NOTIFICATION_ACTIONS.ADD_NOTIFICATIONS:
      return { 
        ...state, 
        notifications: [...state.notifications, ...action.payload],
        loading: false,
        error: null 
      };

    case NOTIFICATION_ACTIONS.SET_UNREAD_COUNT:
      return { ...state, unreadCount: action.payload };

    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };

    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      };

    case NOTIFICATION_ACTIONS.DELETE_NOTIFICATION:
      const deletedNotification = state.notifications.find(n => n._id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n._id !== action.payload),
        unreadCount: deletedNotification && !deletedNotification.isRead 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount,
      };

    case NOTIFICATION_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case NOTIFICATION_ACTIONS.SET_HAS_MORE:
      return { ...state, hasMore: action.payload };

    case NOTIFICATION_ACTIONS.INCREMENT_PAGE:
      return { ...state, page: state.page + 1 };

    case NOTIFICATION_ACTIONS.RESET_PAGE:
      return { ...state, page: 1 };

    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user } = useAuth();

  // Fetch notifications
  const fetchNotifications = async (reset = false) => {
    if (!user || state.loading) return;

    try {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });
      
      const page = reset ? 1 : state.page;
      const response = await notificationService.getUserNotifications({
        page,
        limit: 20,
      });

      if (response.success) {
        if (reset) {
          dispatch({ type: NOTIFICATION_ACTIONS.SET_NOTIFICATIONS, payload: response.data });
          dispatch({ type: NOTIFICATION_ACTIONS.RESET_PAGE });
        } else {
          dispatch({ type: NOTIFICATION_ACTIONS.ADD_NOTIFICATIONS, payload: response.data });
        }
        
        dispatch({ type: NOTIFICATION_ACTIONS.SET_UNREAD_COUNT, payload: response.unreadCount });
        dispatch({ 
          type: NOTIFICATION_ACTIONS.SET_HAS_MORE, 
          payload: response.pagination.page < response.pagination.totalPages 
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Fetch unread count only
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_UNREAD_COUNT, payload: response.count });
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await notificationService.markAsRead({ notificationId });
      if (response.success) {
        dispatch({ type: NOTIFICATION_ACTIONS.MARK_AS_READ, payload: notificationId });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        dispatch({ type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await notificationService.deleteNotification({ notificationId });
      if (response.success) {
        dispatch({ type: NOTIFICATION_ACTIONS.DELETE_NOTIFICATION, payload: notificationId });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Load more notifications
  const loadMore = async () => {
    if (!state.hasMore || state.loading) return;
    
    dispatch({ type: NOTIFICATION_ACTIONS.INCREMENT_PAGE });
    await fetchNotifications(false);
  };

  // Refresh notifications
  const refresh = async () => {
    await fetchNotifications(true);
  };

  // Initial load and periodic updates
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      // Set up polling for unread count (every 30 seconds)
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Context value
  const value = {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    
    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refresh,
  };

  return (
    <NotificationContext.Provider value={value}>
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