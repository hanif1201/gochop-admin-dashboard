// File location: src/pages/settings/Notifications.jsx
// Used in route: <Route path='/settings/notifications' element={<Notifications />} />

import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaEnvelope,
  FaSms,
  FaMobile,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSave,
  FaFilter,
} from "react-icons/fa";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAuth from "../../hooks/useAuth";
import useAlert from "../../hooks/useAlert";

const Notifications = () => {
  const { user } = useAuth();
  const { success, error } = useAlert();
  const [loading, setLoading] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // Notification preferences state
  const [preferences, setPreferences] = useState({
    email: {
      orderUpdates: true,
      promotions: false,
      systemAnnouncements: true,
      accountActivity: true,
      marketingCommunications: false,
    },
    sms: {
      orderUpdates: true,
      promotions: false,
      systemAnnouncements: false,
      accountActivity: true,
      marketingCommunications: false,
    },
    push: {
      orderUpdates: true,
      promotions: true,
      systemAnnouncements: true,
      accountActivity: true,
      marketingCommunications: false,
    },
  });

  // Filter state
  const [filter, setFilter] = useState("all");

  // Sample notifications for demonstration
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Sample notifications data
        const sampleNotifications = [
          {
            id: 1,
            type: "order",
            title: "New Order Assigned",
            message: "A new order #ORD-12345 has been assigned to you",
            timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
            read: false,
          },
          {
            id: 2,
            type: "system",
            title: "System Maintenance",
            message:
              "Scheduled maintenance will occur on June 5th from 2:00 AM to 4:00 AM",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            read: false,
          },
          {
            id: 3,
            type: "account",
            title: "Password Changed",
            message: "Your account password was recently changed",
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            read: true,
          },
          {
            id: 4,
            type: "order",
            title: "Order Delivered",
            message: "Order #ORD-12340 has been delivered successfully",
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            read: true,
          },
          {
            id: 5,
            type: "promotion",
            title: "Weekend Special",
            message: "Get 15% off all orders this weekend with code WEEKEND15",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            read: true,
          },
          {
            id: 6,
            type: "system",
            title: "New Feature Added",
            message: "Check out our new order tracking feature in the app",
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            read: true,
          },
        ];

        setNotifications(sampleNotifications);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        error("Failed to load notifications");
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, [error]);

  // Handle notification preference change
  const handlePreferenceChange = (channel, type, checked) => {
    setPreferences((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: checked,
      },
    }));
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
    success("All notifications marked as read");
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  // Save notification preferences
  const savePreferences = async () => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      success("Notification preferences saved successfully");
    } catch (err) {
      console.error("Error saving preferences:", err);
      error("Failed to save notification preferences");
    } finally {
      setLoading(false);
    }
  };

  // Get filtered notifications
  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((notif) => !notif.read)
      : notifications.filter((notif) => notif.type === filter);

  // Format notification timestamp
  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;

    // Less than a minute
    if (diff < 60 * 1000) {
      return "Just now";
    }

    // Less than an hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    // Less than a week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    // Format date
    return timestamp.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return (
          <span className='bg-blue-100 text-blue-800 p-2 rounded-full'>
            <FaBell />
          </span>
        );
      case "system":
        return (
          <span className='bg-purple-100 text-purple-800 p-2 rounded-full'>
            <FaBell />
          </span>
        );
      case "account":
        return (
          <span className='bg-green-100 text-green-800 p-2 rounded-full'>
            <FaBell />
          </span>
        );
      case "promotion":
        return (
          <span className='bg-yellow-100 text-yellow-800 p-2 rounded-full'>
            <FaBell />
          </span>
        );
      default:
        return (
          <span className='bg-gray-100 text-gray-800 p-2 rounded-full'>
            <FaBell />
          </span>
        );
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter((notif) => !notif.read).length;

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Notifications</h1>
        <p className='mt-1 text-sm text-gray-500'>
          Manage your notifications and notification preferences
        </p>
      </div>

      <div className='grid grid-cols-1 gap-6'>
        {/* Notification Center */}
        <Card
          title='Notification Center'
          subtitle={`You have ${unreadCount} unread notification${
            unreadCount !== 1 ? "s" : ""
          }`}
        >
          <div className='mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center'>
            <div className='flex space-x-2 mb-2 sm:mb-0'>
              <Button
                variant={filter === "all" ? "primary" : "outline"}
                size='sm'
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "unread" ? "primary" : "outline"}
                size='sm'
                onClick={() => setFilter("unread")}
              >
                Unread
              </Button>
              <Button
                variant={filter === "order" ? "primary" : "outline"}
                size='sm'
                onClick={() => setFilter("order")}
              >
                Orders
              </Button>
              <Button
                variant={filter === "system" ? "primary" : "outline"}
                size='sm'
                onClick={() => setFilter("system")}
              >
                System
              </Button>
            </div>

            {unreadCount > 0 && (
              <Button variant='outline' size='sm' onClick={markAllAsRead}>
                <FaCheckCircle className='mr-1' /> Mark All as Read
              </Button>
            )}
          </div>

          {loadingNotifications ? (
            <div className='flex justify-center items-center h-40'>
              <FaSpinner className='h-8 w-8 text-primary-500 animate-spin' />
              <span className='ml-2 text-gray-600'>
                Loading notifications...
              </span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              No notifications found
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border ${
                    notification.read
                      ? "border-gray-200"
                      : "border-primary-200 bg-primary-50"
                  } rounded-lg`}
                >
                  <div className='flex items-start'>
                    <div className='flex-shrink-0'>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className='ml-3 flex-1'>
                      <div className='flex items-center justify-between'>
                        <h3
                          className={`text-sm font-medium ${
                            notification.read
                              ? "text-gray-900"
                              : "text-primary-800"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <p className='text-xs text-gray-500'>
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      <p className='mt-1 text-sm text-gray-600'>
                        {notification.message}
                      </p>
                      <div className='mt-2 flex space-x-2 justify-end'>
                        {!notification.read && (
                          <Button
                            variant='text'
                            size='xs'
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant='text'
                          size='xs'
                          onClick={() => deleteNotification(notification.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Notification Preferences */}
        <Card title='Notification Preferences'>
          <div className='mb-4'>
            <p className='text-sm text-gray-600'>
              Choose how you'd like to receive notifications from our system.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-2 mb-6'>
            <div></div>
            <div className='text-center text-sm font-medium text-gray-700'>
              <div className='flex items-center justify-center mb-1'>
                <FaEnvelope className='mr-1' /> Email
              </div>
            </div>
            <div className='text-center text-sm font-medium text-gray-700'>
              <div className='flex items-center justify-center mb-1'>
                <FaSms className='mr-1' /> SMS
              </div>
            </div>
            <div className='text-center text-sm font-medium text-gray-700'>
              <div className='flex items-center justify-center mb-1'>
                <FaMobile className='mr-1' /> Push
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            {/* Order Updates */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-2 items-center border-b border-gray-200 pb-4'>
              <div className='text-sm font-medium text-gray-700'>
                Order Updates
                <p className='text-xs font-normal text-gray-500'>
                  Updates about your orders and deliveries
                </p>
              </div>
              <div className='text-center'>
                <input
                  type='checkbox'
                  id='orderUpdates-email'
                  checked={preferences.email.orderUpdates}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "email",
                      "orderUpdates",
                      e.target.checked
                    )
                  }
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                />
              </div>
              <div className='text-center'>
                <input
                  type='checkbox'
                  id='orderUpdates-sms'
                  checked={preferences.sms.orderUpdates}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "sms",
                      "orderUpdates",
                      e.target.checked
                    )
                  }
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                />
              </div>
              <div className='text-center'>
                <input
                  type='checkbox'
                  id='orderUpdates-push'
                  checked={preferences.push.orderUpdates}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "push",
                      "orderUpdates",
                      e.target.checked
                    )
                  }
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                />
              </div>
            </div>

            {/* System Announcements */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-2 items-center border-b border-gray-200 pb-4'>
              <div className='text-sm font-medium text-gray-700'>
                System Announcements
                <p className='text-xs font-normal text-gray-500'>
                  System updates, maintenance, and new features
                </p>
              </div>
              <div className='text-center'>
                <input
                  type='checkbox'
                  id='systemAnnouncements-email'
                  checked={preferences.email.systemAnnouncements}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "email",
                      "systemAnnouncements",
                      e.target.checked
                    )
                  }
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                />
              </div>
              <div className='text-center'>
                <input
                  type='checkbox'
                  id='systemAnnouncements-sms'
                  checked={preferences.sms.systemAnnouncements}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "sms",
                      "systemAnnouncements",
                      e.target.checked
                    )
                  }
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                />
              </div>
              <div className='text-center'>
                <input
                  type='checkbox'
                  id='systemAnnouncements-push'
                  checked={preferences.push.systemAnnouncements}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "push",
                      "systemAnnouncements",
                      e.target.checked
                    )
                  }
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                />
              </div>
            </div>

            {/* Account Activity */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-2 items-center border-b border-gray-200 pb-4'>
              <div className='text-sm font-medium text-gray-700'>
                Account Activity
                <p className='text-xs font-normal text-gray-500'>
                  Password changes, login alerts, and security updates
                </p>
              </div>
              <div className='text-center'>
                <input
                  type='checkbox'
                  id='accountActivity-email'
                  checked={preferences.email.accountActivity}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "email",
                      "accountActivity",
                      e.target.checked
                    )
                  }
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                />
              </div>
              <div className='text-center'>
                <input
                  type='checkbox'
                  id='accountActivity-sms'
                  checked={preferences.sms.accountActivity}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "sms",
                      "accountActivity",
                      e.target.checked
                    )
                  }
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                />
              </div>
              <div className='text-center'>
                <input
                  type='checkbox'
                  id='accountActivity-push'
                  checked={preferences.push.accountActivity}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "push",
                      "accountActivity",
                      e.target.checked
                    )
                  }
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                />
              </div>
            </div>

            {/* Promotions */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-2 items-center border-b border-gray-200 pb-4'>
              <div className='text-sm font-medium text-gray-700'>
                Promotions
                <p className='text-xs font-normal text-gray-500'>
                  Special offers, discounts, and promotions
                </p>
              </div>
              <div className='text-center'>
                <input
                  type='checkbox'
                  id='promotions-email'
                  checked={preferences.email.promotions}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "email",
                      "promotions",
                      e.target.checked
                    )
                  }
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                />
              </div>
              <div className='text-center'>
                <input
                  type='checkbox'
                  id='promotions-sms'
                  checked={preferences.sms.promotions}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "sms",
                      "promotions",
                      e.target.checked
                    )
                  }
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                />
              </div>
              <div className='text-center'>
                <input
                  type='checkbox'
                  id='promotions-push'
                  checked={preferences.push.promotions}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "push",
                      "promotions",
                      e.target.checked
                    )
                  }
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                />
              </div>
            </div>

            {/* Marketing Communications */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-2 items-center'>
              <div className='text-sm font-medium text-gray-700'>
                Marketing Communications
                <p className='text-xs font-normal text-gray-500'>
                  Newsletters, product updates, and other marketing
                  communications
                </p>
              </div>
              <div className='text-center'>
                <input
                  type='checkbox'
                  id='marketingCommunications-email'
                  checked={preferences.email.marketingCommunications}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "email",
                      "marketingCommunications",
                      e.target.checked
                    )
                  }
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                />
              </div>
              <div className='text-center'>
                <input
                  type='checkbox'
                  id='marketingCommunications-sms'
                  checked={preferences.sms.marketingCommunications}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "sms",
                      "marketingCommunications",
                      e.target.checked
                    )
                  }
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                />
              </div>
              <div className='text-center'>
                <input
                  type='checkbox'
                  id='marketingCommunications-push'
                  checked={preferences.push.marketingCommunications}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "push",
                      "marketingCommunications",
                      e.target.checked
                    )
                  }
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                />
              </div>
            </div>
          </div>

          <div className='mt-6 flex justify-end'>
            <Button
              variant='primary'
              onClick={savePreferences}
              loading={loading}
              disabled={loading}
            >
              <FaSave className='mr-2' /> Save Preferences
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
