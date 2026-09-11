import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, BellOff, Check, CheckCheck, CheckCircle2, AlertTriangle,
  AlertCircle, Info, ExternalLink, RefreshCw, Trash2, Globe,
  CreditCard, HardDrive, ShieldAlert, Sparkles, Volume2, VolumeX,
  ArrowRight, X, Radio, ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';
import apiClient from '../services/apiClient';
import notificationsService from '../services/notifications.service';
import { onForegroundMessage, requestNotificationPermissionAndGetToken } from '../config/firebase';
import { playNotificationSound, isSoundEnabled, setSoundEnabled } from '../utils/sound';

/**
 * Format relative time (e.g., 'Just now', '5m ago', '2h ago', 'Yesterday')
 */
function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Recently';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Recently';

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function NotificationBellDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'alerts' | 'inbox'
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [dashboardAlerts, setDashboardAlerts] = useState([]);
  const [inboxAlerts, setInboxAlerts] = useState([]);
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);
  
  // UX states
  const [isRinging, setIsRinging] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ── Fetch Alerts & Inbox ──────────────────────────────────────────────────
  const fetchAllNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      // 1. Fetch live operational warnings from dashboard
      const dashPromise = apiClient.get('/super-admin/dashboard/alerts')
        .then(res => {
          const payload = res.data?.data || res.data;
          return Array.isArray(payload?.items) ? payload.items : [];
        })
        .catch(err => {
          console.warn('Dashboard alerts error:', err);
          return [];
        });

      // 2. Fetch system inbox alerts
      const inboxPromise = notificationsService.getInbox({ limit: 15 })
        .then(res => {
          const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
          const unread = res?.meta?.unreadCount ?? list.filter(i => !i.isRead).length;
          return { list, unread };
        })
        .catch(err => {
          console.warn('Inbox alerts error:', err);
          return { list: [], unread: 0 };
        });

      const [dashList, inboxRes] = await Promise.all([dashPromise, inboxPromise]);

      setDashboardAlerts(dashList);
      setInboxAlerts(inboxRes.list);
      setInboxUnreadCount(inboxRes.unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch and auto-sync every 30 seconds
  useEffect(() => {
    fetchAllNotifications(false);

    const interval = setInterval(() => {
      fetchAllNotifications(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAllNotifications]);

  // ── Firebase Foreground Message Listener ──────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      requestNotificationPermissionAndGetToken();
    }

    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title || payload.data?.title || 'System Notification';
      const body = payload.notification?.body || payload.data?.body || '';

      // Bell chime sound
      playNotificationSound('crystal');

      // Trigger bell ring animation for 2 seconds
      setIsRinging(true);
      setTimeout(() => setIsRinging(false), 2000);

      // Refresh data
      fetchAllNotifications(true);

      // Toast notification popup
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: title,
        text: body,
        showConfirmButton: false,
        timer: 6000,
        timerProgressBar: true,
      });
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [fetchAllNotifications]);

  // ── Click outside & ESC handling ──────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // ── Total Unread / Active Count Calculation ───────────────────────────────
  const activeAlertsCount = dashboardAlerts.filter(a => a.severity === 'critical' || a.severity === 'warning').length;
  const totalBadgeCount = activeAlertsCount + inboxUnreadCount;

  // ── Toggle Sound ──────────────────────────────────────────────────────────
  const handleToggleSound = (e) => {
    e.stopPropagation();
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      playNotificationSound('crystal');
    }
  };

  // ── Mark All Read ─────────────────────────────────────────────────────────
  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationsService.markAllRead();
      setInboxAlerts(prev => prev.map(item => ({ ...item, isRead: true })));
      setInboxUnreadCount(0);
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'All notifications marked as read',
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  // ── Mark Single Read ──────────────────────────────────────────────────────
  const handleMarkSingleRead = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationsService.markRead(id);
      setInboxAlerts(prev => prev.map(item => item._id === id ? { ...item, isRead: true } : item));
      setInboxUnreadCount(c => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  // ── Delete Single Alert ───────────────────────────────────────────────────
  const handleDeleteAlert = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationsService.deleteAlert(id);
      const wasUnread = inboxAlerts.find(i => i._id === id && !i.isRead);
      setInboxAlerts(prev => prev.filter(item => item._id !== id));
      if (wasUnread) setInboxUnreadCount(c => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  // ── Handle Action Navigation ──────────────────────────────────────────────
  const handleActionClick = (url) => {
    setIsOpen(false);
    if (url) {
      navigate(url);
    }
  };

  // ── Category Icon & Color Resolver ────────────────────────────────────────
  const getCategoryTheme = (category, severity = 'info') => {
    if (severity === 'critical') {
      return {
        icon: AlertTriangle,
        bg: 'bg-red-50 text-red-600 border-red-200',
        badge: 'bg-red-100 text-red-700',
      };
    }
    if (severity === 'warning') {
      return {
        icon: AlertCircle,
        bg: 'bg-amber-50 text-amber-600 border-amber-200',
        badge: 'bg-amber-100 text-amber-700',
      };
    }
    switch (category) {
      case 'subscription':
      case 'payment':
        return {
          icon: CreditCard,
          bg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          badge: 'bg-emerald-100 text-emerald-700',
        };
      case 'domain':
        return {
          icon: Globe,
          bg: 'bg-blue-50 text-blue-600 border-blue-200',
          badge: 'bg-blue-100 text-blue-700',
        };
      case 'storage':
        return {
          icon: HardDrive,
          bg: 'bg-purple-50 text-purple-600 border-purple-200',
          badge: 'bg-purple-100 text-purple-700',
        };
      case 'security':
        return {
          icon: ShieldAlert,
          bg: 'bg-rose-50 text-rose-600 border-rose-200',
          badge: 'bg-rose-100 text-rose-700',
        };
      case 'system':
      default:
        return {
          icon: Radio,
          bg: 'bg-teal-50 text-teal-600 border-teal-200',
          badge: 'bg-teal-100 text-teal-700',
        };
    }
  };

  // ── Filtering Items by Active Tab ─────────────────────────────────────────
  const combinedItems = [
    // Dashboard operational warnings
    ...dashboardAlerts.map(a => ({
      _id: a.id,
      isDashboardAlert: true,
      title: a.title,
      message: a.message,
      category: a.category || 'system',
      severity: a.severity || 'warning',
      actionUrl: a.actionUrl,
      actionLabel: a.actionLabel,
      tenantName: a.tenantName,
      timestamp: a.timestamp,
      isRead: false,
    })),
    // Inbox alerts
    ...inboxAlerts.map(i => ({
      ...i,
      isDashboardAlert: false,
      timestamp: i.createdAt,
    })),
  ];

  let displayItems = combinedItems;
  if (activeTab === 'alerts') {
    displayItems = combinedItems.filter(i => i.isDashboardAlert || i.type === 'critical' || i.type === 'warning');
  } else if (activeTab === 'inbox') {
    displayItems = combinedItems.filter(i => !i.isDashboardAlert);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bell Trigger Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        title={totalBadgeCount > 0 ? `${totalBadgeCount} active alerts & notifications` : 'Notifications'}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className={`relative p-2.5 rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
          isOpen ? 'bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/30' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
        }`}
      >
        <Bell
          className={`w-5 h-5 transition-transform duration-300 ${
            isRinging ? 'animate-[bounce_0.6s_ease-in-out_infinite] text-emerald-600' : ''
          }`}
        />

        {/* Dynamic Badge */}
        {totalBadgeCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white shadow-sm animate-pulse">
            {totalBadgeCount > 99 ? '99+' : totalBadgeCount}
          </span>
        )}
      </button>

      {/* ── Flyout Dropdown Popover ── */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[360px] sm:w-[420px] max-w-[calc(100vw-20px)] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                  {totalBadgeCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[11px] font-bold rounded-full">
                      {totalBadgeCount} active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500">Real-time alerts & platform events</p>
              </div>
            </div>

            {/* Quick Header Actions */}
            <div className="flex items-center gap-1">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={handleToggleSound}
                title={soundOn ? 'Notification audio active (click to mute)' : 'Notification audio muted'}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  soundOn ? 'text-emerald-700 hover:bg-emerald-100/60' : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Refresh */}
              <button
                type="button"
                onClick={() => fetchAllNotifications(true)}
                title="Refresh notifications"
                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
              </button>

              {/* Mark All Read */}
              {inboxUnreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  title="Mark all inbox alerts as read"
                  className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}

              {/* Close */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center px-4 pt-2 border-b border-gray-100 bg-gray-50/50 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`pb-2.5 px-2 text-xs font-semibold tracking-wide transition-all border-b-2 cursor-pointer ${
                activeTab === 'all'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              All ({combinedItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('alerts')}
              className={`pb-2.5 px-2 text-xs font-semibold tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'alerts'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Operational Alerts
              {activeAlertsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inbox')}
              className={`pb-2.5 px-2 text-xs font-semibold tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'inbox'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              System Inbox
              {inboxUnreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  {inboxUnreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Notification List Body */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50 bg-white">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Checking live notifications...</span>
              </div>
            ) : displayItems.length === 0 ? (
              <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-gray-800 text-sm">All caught up!</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
                  No pending operational alerts or unread messages at this moment.
                </p>
              </div>
            ) : (
              displayItems.map((item) => {
                const theme = getCategoryTheme(item.category, item.severity || item.type);
                const IconComponent = theme.icon;

                return (
                  <div
                    key={item._id}
                    className={`p-3.5 hover:bg-gray-50/80 transition-colors flex items-start gap-3 group relative ${
                      !item.isRead && !item.isDashboardAlert ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    {/* Severity / Category Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${theme.bg}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {item.tenantName ? item.tenantName : (item.category || 'System')}
                        </span>
                        <span className="text-[11px] text-gray-400 shrink-0">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>

                      <h4 className={`text-xs font-bold leading-snug mb-1 ${
                        item.severity === 'critical' ? 'text-red-900' : 'text-gray-900'
                      }`}>
                        {item.title}
                      </h4>

                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>

                      {/* Direct Action Button (if dashboard alert with action) */}
                      {item.isDashboardAlert && item.actionUrl && (
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleActionClick(item.actionUrl)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            <span>{item.actionLabel || 'Resolve Issue'}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Quick Item Actions (for inbox items) */}
                    {!item.isDashboardAlert && (
                      <div className="flex flex-col items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                        {!item.isRead && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkSingleRead(e, item._id)}
                            title="Mark as read"
                            className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAlert(e, item._id)}
                          title="Dismiss / Delete"
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-medium text-gray-500">Live Push Active</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
            >
              <span>Notification Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
