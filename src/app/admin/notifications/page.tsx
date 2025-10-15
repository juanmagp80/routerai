'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { getNotificationAction, getNotificationActionSecondary } from "@/lib/notification-actions";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  ExternalLink,
  Filter,
  MoreVertical,
  RefreshCw,
  Settings,
  Trash2,
  TrendingUp,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'limit_warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'limit_reached':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'trial_expiring':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'trial_expired':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'upgrade_suggestion':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'limit_warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'limit_reached':
        return 'border-l-red-500 bg-red-50';
      case 'trial_expiring':
        return 'border-l-orange-500 bg-orange-50';
      case 'trial_expired':
        return 'border-l-red-500 bg-red-50';
      case 'upgrade_suggestion':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-slate-500 bg-slate-50';
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Handle notification click (mark as read)
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  // Handle bulk actions
  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length > 0) {
      await markAsRead(undefined, selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length > 0) {
      await deleteNotification(undefined, selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  // Toggle notification selection
  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center">
            <Bell className="w-8 h-8 mr-3 text-emerald-600" />
            Notifications
          </h2>
          <p className="text-muted-foreground">
            Stay updated with your account activity and system alerts
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => refresh()}
            disabled={isLoading}
            className="flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(n.created_at) > weekAgo;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium">Filter:</span>
              </div>
              <div className="flex space-x-2">
                {['all', 'unread', 'read'].map((filterOption) => (
                  <Button
                    key={filterOption}
                    variant={filter === filterOption ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(filterOption as any)}
                    className="capitalize"
                  >
                    {filterOption}
                    {filterOption === 'unread' && unreadCount > 0 && (
                      <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">
                  {selectedNotifications.length} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkMarkAsRead}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark Read
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => refresh()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 
                 filter === 'read' ? 'No read notifications' : 
                 'No notifications yet'}
              </p>
              <p className="text-sm text-slate-400">
                {filter === 'all' && "You'll see system alerts and updates here"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 cursor-pointer transition-all duration-200 hover:bg-slate-50 border-l-4 ${
                    !notification.read ? getNotificationColor(notification.type) : 'border-l-slate-200 bg-white'
                  } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-emerald-500' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleNotificationSelection(notification.id);
                      }}
                      className="mt-1 h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />

                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-sm font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
                            {notification.title}
                          </h3>
                          <p className={`mt-1 text-sm ${!notification.read ? 'text-slate-700' : 'text-slate-500'}`}>
                            {notification.message}
                          </p>
                          <div className="mt-2 flex items-center space-x-4">
                            <span className="text-xs text-slate-400">
                              {formatRelativeTime(notification.created_at)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {notification.type.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {!notification.read && (
                              <Badge className="bg-emerald-500 text-xs">
                                New
                              </Badge>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-3 flex items-center space-x-2">
                            {(() => {
                              const primaryAction = getNotificationAction(notification.type, notification.metadata);
                              const secondaryAction = getNotificationActionSecondary(notification.type);

                              return (
                                <>
                                  {primaryAction && (
                                    <Link href={primaryAction.href}>
                                      <Button
                                        size="sm"
                                        variant={primaryAction.variant}
                                        className="text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Mark as read when user takes action
                                          if (!notification.read) {
                                            markAsRead(notification.id);
                                          }
                                        }}
                                      >
                                        <span className="mr-1">{primaryAction.icon}</span>
                                        {primaryAction.label}
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                      </Button>
                                    </Link>
                                  )}
                                  
                                  {secondaryAction && (
                                    <Link href={secondaryAction.href}>
                                      <Button
                                        size="sm"
                                        variant={secondaryAction.variant}
                                        className="text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                        }}
                                      >
                                        <span className="mr-1">{secondaryAction.icon}</span>
                                        {secondaryAction.label}
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                      </Button>
                                    </Link>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;