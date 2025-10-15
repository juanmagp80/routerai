'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotifications } from '@/hooks/useNotifications';
import { useUserSync } from '@/hooks/useUserSync';
import { getNotificationAction, getNotificationActionSecondary } from '@/lib/notification-actions';
import { SignOutButton } from '@clerk/nextjs';
import { Bell, CheckCircle, ExternalLink, LogOut, Search, Trash2, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export function Header() {
  const { dbUser, clerkUser, isLoading } = useUserSync();
  const { getRecentNotifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format relative time for notifications
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'limit_warning':
        return '⚠️';
      case 'limit_reached':
        return '🚨';
      case 'trial_expiring':
        return '⏰';
      case 'trial_expired':
        return '❌';
      case 'upgrade_suggestion':
        return '📈';
      default:
        return '🔔';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="px-6 py-4">
        <div className="flex h-10 items-center justify-between">
          {/* Search */}
          <div className="flex flex-1 items-center">
            <div className="w-full max-w-lg">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  className="block w-full rounded-md border-slate-300 pl-10 pr-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Search..."
                  type="search"
                />
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5 text-slate-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                  <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900">Notifications</h3>
                      <Link href="/admin/notifications">
                        <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View All
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {getRecentNotifications().length === 0 ? (
                      <div className="p-6 text-center text-slate-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {getRecentNotifications().map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                              }`}
                          >
                            <div className="flex items-start space-x-3">
                              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                  {notification.title}
                                </p>
                                <p className={`text-xs mt-1 ${!notification.read ? 'text-slate-700' : 'text-slate-500'}`}>
                                  {notification.message.length > 100
                                    ? `${notification.message.substring(0, 100)}...`
                                    : notification.message
                                  }
                                </p>
                                <div className="flex items-center justify-between mt-3">
                                  <span className="text-xs text-slate-400">
                                    {formatRelativeTime(notification.created_at)}
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    {!notification.read && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markAsRead(notification.id);
                                        }}
                                        className="text-emerald-600 hover:text-emerald-700 p-1"
                                        title="Mark as read"
                                      >
                                        <CheckCircle className="w-3 h-3" />
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                      }}
                                      className="text-red-600 hover:text-red-700 p-1"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2 mt-2">
                                  {(() => {
                                    const primaryAction = getNotificationAction(notification.type);
                                    const secondaryAction = getNotificationActionSecondary(notification.type);

                                    return (
                                      <>
                                        {primaryAction && (
                                          <Link
                                            href={primaryAction.href}
                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                                            onClick={() => setShowNotifications(false)}
                                          >
                                            <span>{primaryAction.icon}</span>
                                            {primaryAction.label}
                                          </Link>
                                        )}

                                        {secondaryAction && (
                                          <Link
                                            href={secondaryAction.href}
                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors"
                                            onClick={() => setShowNotifications(false)}
                                          >
                                            <span>{secondaryAction.icon}</span>
                                            {secondaryAction.label}
                                          </Link>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {getRecentNotifications().length > 0 && (
                    <div className="p-3 border-t border-slate-200 text-center">
                      <Link href="/admin/notifications">
                        <Button variant="ghost" size="sm" className="w-full text-emerald-600 hover:text-emerald-700">
                          View All Notifications
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User actions */}
            <div className="flex items-center space-x-3">
              {/* Custom User Menu */}
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="hidden md:block text-sm text-slate-700 truncate max-w-32">
                    {clerkUser?.emailAddresses[0]?.emailAddress || 'User'}
                  </span>
                </Button>

                {/* Dropdown menu for user actions */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50">
                    <Link href="/admin/profile">
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </button>
                    </Link>
                    <SignOutButton redirectUrl="/">
                      <button className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </SignOutButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}