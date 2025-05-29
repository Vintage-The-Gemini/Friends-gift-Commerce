// frontend/src/pages/notifications/NotificationManagement.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  RefreshCw,
  Filter,
  Archive,
  AlertCircle,
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { toast } from 'react-toastify';

const NotificationManagement = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refresh,
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Initial load
  useEffect(() => {
    fetchNotifications(true);
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  // Format relative time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    const iconMap = {
      event_contribution: '💰',
      event_target_reached: '🎉',
      event_ending_soon: '⏰',
      product_approved: '✅',
      product_rejected: '❌',
      new_order: '🛍️',
      order_shipped: '📦',
      welcome: '👋',
      payment_received: '💳',
      payment_failed: '⚠️',
    };
    return iconMap[type] || '🔔';
  };

  // Handle notification selection
  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  // Select all notifications
  const selectAllNotifications = () => {
    setSelectedNotifications(filteredNotifications.map(n => n._id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  // Bulk mark as read
  const bulkMarkAsRead = async () => {
    if (selectedNotifications.length === 0) return;

    setBulkLoading(true);
    try {
      await Promise.all(
        selectedNotifications.map(id => markAsRead(id))
      );
      toast.success(`${selectedNotifications.length} notifications marked as read`);
      clearSelection();
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    } finally {
      setBulkLoading(false);
    }
  };

  // Bulk delete
  const bulkDelete = async () => {
    if (selectedNotifications.length === 0) return;

    setBulkLoading(true);
    try {
      await Promise.all(
        selectedNotifications.map(id => deleteNotification(id))
      );
      toast.success(`${selectedNotifications.length} notifications deleted`);
      clearSelection();
    } catch (error) {
      toast.error('Failed to delete notifications');
    } finally {
      setBulkLoading(false);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              Manage your notifications and stay updated
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Bell className="w-8 h-8 text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <BellRing className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <CheckCheck className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Read</p>
                <p className="text-2xl font-bold text-green-600">
                  {notifications.length - unreadCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Bulk Actions */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
            {/* Filters */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Filter:</span>
              <div className="flex space-x-1">
                {['all', 'unread', 'read'].map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      filter === filterType
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedNotifications.length} selected
                </span>
                <button
                  onClick={bulkMarkAsRead}
                  disabled={bulkLoading}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 text-sm"
                >
                  Mark Read
                </button>
                <button
                  onClick={bulkDelete}
                  disabled={bulkLoading}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Select All */}
            {filteredNotifications.length > 0 && selectedNotifications.length === 0 && (
              <button
                onClick={selectAllNotifications}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Select All
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'read' ? 'No read notifications' : 
               'No notifications'}
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "You'll receive notifications here when there's activity on your account."
                : `You don't have any ${filter} notifications at the moment.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer ${
                  !notification.isRead ? 'border-l-4 border-l-indigo-500 bg-indigo-50/30' : ''
                } ${
                  selectedNotifications.includes(notification._id) ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleNotificationSelection(notification._id);
                      }}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </div>

                  {/* Icon */}
                  <div className="flex-shrink-0 text-2xl pt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium text-gray-900 ${
                          !notification.isRead ? 'font-semibold' : ''
                        }`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification._id);
                            }}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        {notification.actionUrl && (
                          <Link
                            to={notification.actionUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-gray-400 hover:text-indigo-600"
                            title="View details"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationManagement;