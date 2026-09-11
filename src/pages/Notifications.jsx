import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, Search, CheckCircle, Info, AlertTriangle, Send, Users,
  MapPin, XCircle, Clock, Smartphone, Globe, Shield, RefreshCw,
  Trash2, Check, Radio, CheckSquare, Sparkles, Layers, Eye,
  ExternalLink, ArrowRight, Zap, Loader2, Volume2, VolumeX, Music
} from 'lucide-react';
import Swal from 'sweetalert2';
import notificationsService from '../services/notifications.service';
import plansService from '../services/plans.service';
import tenantsService from '../services/tenants.service';
import { requestNotificationPermissionAndGetToken } from '../config/firebase';
import { playNotificationSound, isSoundEnabled, setSoundEnabled } from '../utils/sound';

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'system', label: 'System Alerts' },
  { id: 'tenant', label: 'Tenant Events' },
  { id: 'subscription', label: 'Subscriptions' },
  { id: 'payment', label: 'Payments' },
  { id: 'domain', label: 'Domains' },
  { id: 'maintenance', label: 'Maintenance' },
];

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('Inbox'); // 'Inbox' | 'Broadcast' | 'History'
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Inbox state
  const [inboxItems, setInboxItems] = useState([]);
  const [inboxMeta, setInboxMeta] = useState({ total: 0, unreadCount: 0 });
  const [loadingInbox, setLoadingInbox] = useState(true);

  // Broadcast form state
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'announcement',
    priority: 'normal',
    targetAudience: 'ALL_TENANTS',
    targetPlanId: '',
    targetStatus: 'active',
    targetTenantIds: [],
    channels: ['in_app', 'push'],
    actionUrl: '',
  });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Auxiliary data for targets
  const [plans, setPlans] = useState([]);
  const [tenants, setTenants] = useState([]);

  // History state
  const [broadcastHistory, setBroadcastHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Firebase status
  const [fcmStatus, setFcmStatus] = useState({ loading: true, ready: false, projectId: '' });
  const [pushPermissionGranted, setPushPermissionGranted] = useState(false);
  const [testingPing, setTestingPing] = useState(false);

  // Notification Sound & Ringtone State
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [soundPreset, setSoundPreset] = useState(localStorage.getItem('notification_sound_preset') || 'crystal');

  const handleToggleSound = () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    setSoundEnabled(nextState);
    if (nextState) {
      playNotificationSound(soundPreset);
    }
  };

  const handleTestRingtone = (preset = soundPreset) => {
    playNotificationSound(preset);
  };

  // Check browser notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermissionGranted(Notification.permission === 'granted');
    }
  }, []);

  // Check Firebase backend status
  useEffect(() => {
    notificationsService.getFirebaseStatus()
      .then((res) => {
        setFcmStatus({ loading: false, ready: res.success, projectId: res.projectId || 'device-streaming-3d1aacd5' });
      })
      .catch(() => {
        setFcmStatus({ loading: false, ready: false, projectId: '' });
      });
  }, []);

  // Load auxiliary data on mount
  useEffect(() => {
    plansService.getAll().then((data) => setPlans(data || [])).catch(() => {});
    tenantsService.getAll().then((data) => setTenants(data || [])).catch(() => {});
  }, []);

  // Fetch Inbox alerts
  const loadInbox = useCallback(async () => {
    try {
      setLoadingInbox(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter !== 'all') params.category = categoryFilter;

      const res = await notificationsService.getInbox(params);
      setInboxItems(res.data || []);
      setInboxMeta(res.meta || { total: 0, unreadCount: 0 });
    } catch (err) {
      console.error('Failed to load inbox:', err);
    } finally {
      setLoadingInbox(false);
    }
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    if (activeTab === 'Inbox') {
      loadInbox();
    }
  }, [activeTab, loadInbox]);

  // Fetch Broadcast history
  const loadBroadcastHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await notificationsService.getBroadcasts({ page: 1, limit: 30 });
      setBroadcastHistory(res.data || []);
    } catch (err) {
      console.error('Failed to load broadcast history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'History') {
      loadBroadcastHistory();
    }
  }, [activeTab, loadBroadcastHistory]);

  // Mark single alert read
  const handleMarkRead = async (id) => {
    try {
      await notificationsService.markRead(id);
      setInboxItems((prev) => prev.map((item) => (item._id === id ? { ...item, isRead: true } : item)));
      setInboxMeta((prev) => ({ ...prev, unreadCount: Math.max(prev.unreadCount - 1, 0) }));
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all alerts read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllRead();
      setInboxItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setInboxMeta((prev) => ({ ...prev, unreadCount: 0 }));
      Swal.fire({
        icon: 'success',
        title: 'All Alerts Marked as Read',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Delete alert
  const handleDeleteAlert = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationsService.deleteAlert(id);
      setInboxItems((prev) => prev.filter((item) => item._id !== id));
      setInboxMeta((prev) => ({ ...prev, total: Math.max(prev.total - 1, 0) }));
    } catch (err) {
      console.error(err);
    }
  };

  // Enable Push Notifications
  const handleEnablePush = async () => {
    const res = await requestNotificationPermissionAndGetToken();
    if (res.success) {
      setPushPermissionGranted(true);
      Swal.fire({
        icon: 'success',
        title: 'Push Notifications Enabled!',
        text: 'Your browser device token has been linked. You will receive real-time push alerts.',
        confirmButtonColor: '#072F2B',
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Permission Required',
        text: res.error || 'Could not enable notifications. Please grant notification permissions in browser settings.',
        confirmButtonColor: '#072F2B',
      });
    }
  };

  // Send Test FCM Ping
  const handleSendTestFcm = async () => {
    try {
      setTestingPing(true);
      const token = localStorage.getItem('fcm_web_token');
      playNotificationSound(soundPreset);
      const res = await notificationsService.sendTestFcm(token);
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'FCM Ping Dispatched!',
          text: `Message ID: ${res.messageId || 'Success'}. Check your desktop notifications!`,
          confirmButtonColor: '#072F2B',
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Push Dispatch Failed',
          text: res.message || res.error || 'Could not deliver test notification.',
          confirmButtonColor: '#072F2B',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Test Error',
        text: err.response?.data?.message || err.message,
        confirmButtonColor: '#072F2B',
      });
    } finally {
      setTestingPing(false);
    }
  };

  // Send Broadcast Submission
  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Fields',
        text: 'Please provide both Title and Message Body.',
        confirmButtonColor: '#072F2B',
      });
      return;
    }

    const confirm = await Swal.fire({
      title: 'Send Platform Broadcast?',
      html: `
        <div class="text-left text-sm space-y-2">
          <p><strong>Title:</strong> ${broadcastForm.title}</p>
          <p><strong>Audience:</strong> ${broadcastForm.targetAudience}</p>
          <p><strong>Channels:</strong> ${broadcastForm.channels.join(', ').toUpperCase()}</p>
          <p class="text-gray-500 mt-2">This announcement will be dispatched immediately to all matching leaders and devices.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Broadcast Now',
      confirmButtonColor: '#072F2B',
      cancelButtonText: 'Review',
    });

    if (!confirm.isConfirmed) return;

    try {
      setSendingBroadcast(true);
      const res = await notificationsService.sendBroadcast(broadcastForm);
      Swal.fire({
        icon: 'success',
        title: 'Broadcast Dispatched!',
        html: `
          <div class="text-left text-sm space-y-1">
            <p><strong>Recipients Reached:</strong> ${res.recipientCount}</p>
            ${res.pushStats?.tokensTargeted > 0 ? `<p><strong>Push Devices:</strong> ${res.pushStats.tokensTargeted} (${res.pushStats.success} delivered)</p>` : ''}
          </div>
        `,
        confirmButtonColor: '#072F2B',
      });

      // Reset form
      setBroadcastForm({
        title: '',
        message: '',
        type: 'announcement',
        priority: 'normal',
        targetAudience: 'ALL_TENANTS',
        targetPlanId: '',
        targetStatus: 'active',
        targetTenantIds: [],
        channels: ['in_app', 'push'],
        actionUrl: '',
      });

      // Switch to history tab
      setActiveTab('History');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Broadcast Failed',
        text: err.response?.data?.message || err.message,
        confirmButtonColor: '#072F2B',
      });
    } finally {
      setSendingBroadcast(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'alert':
        return (
          <div className="w-10 h-10 rounded-xl bg-rose-100/80 flex items-center justify-center shrink-0 text-rose-600 border border-rose-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-100/80 flex items-center justify-center shrink-0 text-amber-600 border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'success':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center shrink-0 text-emerald-600 border border-emerald-200">
            <CheckCircle className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-teal-100/80 flex items-center justify-center shrink-0 text-teal-700 border border-teal-200">
            <Info className="w-5 h-5" />
          </div>
        );
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full font-sans space-y-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-[#072F2B] via-[#0B4640] to-[#072F2B] p-6 rounded-2xl text-white shadow-xl shadow-emerald-950/10">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center backdrop-blur-md">
              <Bell className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Notification & Broadcast Center</h1>
              <p className="text-xs font-medium text-emerald-100/70 mt-0.5">
                Real-time operational alerts, tenant broadcasts, and Firebase Cloud Messaging (FCM).
              </p>
            </div>
          </div>
        </div>

        {/* Firebase FCM & Push Status Pill */}
        <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-xs">
          <div className="flex items-center gap-2 px-2 py-1 bg-black/20 rounded-lg">
            <span className={`w-2 h-2 rounded-full ${fcmStatus.ready ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-mono text-[11px] text-emerald-200">FCM: {fcmStatus.ready ? 'ONLINE' : 'CONNECTING'}</span>
          </div>

          {!pushPermissionGranted ? (
            <button
              onClick={handleEnablePush}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition-all shadow-sm cursor-pointer text-xs"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Enable Browser Push
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30 text-[11px]">
              <Check className="w-3.5 h-3.5" /> Push Active
            </span>
          )}

          {/* Dynamic Audio Ringtone Controls */}
          <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-lg border border-white/10">
            <button
              onClick={handleToggleSound}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold transition-all text-xs cursor-pointer ${
                soundOn
                  ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
              }`}
              title={soundOn ? 'Ringtone Enabled' : 'Ringtone Muted'}
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-300" /> : <VolumeX className="w-3.5 h-3.5 text-rose-300" />}
              <span>{soundOn ? 'Sound ON' : 'Muted'}</span>
            </button>

            <select
              value={soundPreset}
              onChange={(e) => {
                const val = e.target.value;
                setSoundPreset(val);
                localStorage.setItem('notification_sound_preset', val);
                handleTestRingtone(val);
              }}
              className="bg-black/40 text-emerald-100 border border-white/15 rounded-md px-2 py-1 text-[11px] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="crystal" className="text-gray-900">🔔 Crystal Bell</option>
              <option value="marimba" className="text-gray-900">🎶 Marimba Chime</option>
              <option value="urgent" className="text-gray-900">⚠️ Urgent Ping</option>
            </select>

            <button
              onClick={() => handleTestRingtone(soundPreset)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white font-semibold transition-all border border-white/15 cursor-pointer text-[11px]"
              title="Test audio ringtone chime"
            >
              <Music className="w-3 h-3 text-pink-300" />
              Play
            </button>
          </div>

          <button
            onClick={handleSendTestFcm}
            disabled={testingPing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-all border border-white/20 cursor-pointer text-xs disabled:opacity-50"
          >
            {testingPing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-300" />}
            Test Ping
          </button>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[640px]">

        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 overflow-x-auto shrink-0 hide-scrollbar">
          <button
            onClick={() => setActiveTab('Inbox')}
            className={`px-8 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'Inbox'
                ? 'border-[#072F2B] text-[#072F2B] bg-white shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <Bell className="w-4 h-4 text-teal-600" />
            System Inbox
            {inboxMeta.unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full ml-1">
                {inboxMeta.unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('Broadcast')}
            className={`px-8 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'Broadcast'
                ? 'border-[#072F2B] text-[#072F2B] bg-white shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <Send className="w-4 h-4 text-emerald-600" />
            Send Platform Broadcast
          </button>

          <button
            onClick={() => setActiveTab('History')}
            className={`px-8 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'History'
                ? 'border-[#072F2B] text-[#072F2B] bg-white shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            Broadcast Audit Log
          </button>
        </div>

        {/* ── TAB 1: SYSTEM INBOX ────────────────────────────────────────── */}
        {activeTab === 'Inbox' && (
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search system alerts by keyword..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-gray-50/50 transition-all"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={loadInbox}
                  className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingInbox ? 'animate-spin' : ''}`} />
                </button>
                {inboxMeta.unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/70 border border-teal-200/80 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4 sm:p-6">
              {loadingInbox ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
                  <p className="text-sm font-semibold">Loading system alerts...</p>
                </div>
              ) : inboxItems.length > 0 ? (
                <div className="max-w-5xl mx-auto space-y-3">
                  {inboxItems.map((note) => (
                    <div
                      key={note._id}
                      onClick={() => !note.isRead && handleMarkRead(note._id)}
                      className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group ${
                        note.isRead
                          ? 'bg-white border-gray-100 hover:border-gray-200'
                          : 'bg-white border-teal-200 shadow-sm shadow-teal-500/5 hover:border-teal-300'
                      }`}
                    >
                      {getAlertIcon(note.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`text-sm font-bold tracking-tight ${note.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                              {note.title}
                            </h4>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                              {note.category}
                            </span>
                            {!note.isRead && (
                              <span className="w-2 h-2 rounded-full bg-teal-600" />
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-400 flex items-center gap-1 shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTimestamp(note.createdAt)}
                          </span>
                        </div>

                        <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${note.isRead ? 'text-gray-500 font-normal' : 'text-gray-700 font-medium'}`}>
                          {note.message}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDeleteAlert(note._id, e)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-rose-600 transition-all rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Delete alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 text-gray-400">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 border border-teal-100">
                    <Bell className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">Inbox is Clear</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    No active system alerts match your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: BROADCAST CENTER ───────────────────────────────────── */}
        {activeTab === 'Broadcast' && (
          <div className="flex-1 p-6 sm:p-10 bg-white">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">

              {/* Banner */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-2xl border border-teal-100/80 flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-teal-700/20">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-teal-950">Platform-Wide Broadcast Dispatcher</h3>
                  <p className="text-xs text-teal-800/80 mt-1 leading-relaxed">
                    Broadcast critical platform notices, maintenance downtimes, billing alerts, or product releases to leaders and staff accounts.
                    Supports dual delivery via <strong>In-App Dashboard Alerts</strong> and <strong>Firebase Web Push Notifications</strong>.
                  </p>
                </div>
              </div>

              <form onSubmit={handleBroadcastSubmit} className="space-y-6">

                {/* Audience Selection */}
                <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100 space-y-4">
                  <label className="flex items-center gap-2 text-sm font-black text-gray-800 uppercase tracking-wider">
                    <Users className="w-4 h-4 text-teal-700" /> Target Audience
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'ALL_TENANTS', title: 'All Clients / Tenants', desc: 'Every registered political leader' },
                      { id: 'BY_PLAN', title: 'By Subscription Plan', desc: 'Specific tier (e.g. Pro, Basic)' },
                      { id: 'BY_STATUS', title: 'By Client Status', desc: 'Active, Trial, or Expired' },
                      { id: 'SPECIFIC_TENANTS', title: 'Specific Tenant(s)', desc: 'Selected client accounts' },
                      { id: 'SYSTEM_STAFF', title: 'Platform Staff Only', desc: 'Internal super admin team' },
                    ].map((aud) => (
                      <div
                        key={aud.id}
                        onClick={() => setBroadcastForm({ ...broadcastForm, targetAudience: aud.id })}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          broadcastForm.targetAudience === aud.id
                            ? 'border-[#072F2B] bg-emerald-50/40 text-gray-900 shadow-xs'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black">{aud.title}</span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            broadcastForm.targetAudience === aud.id ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300'
                          }`}>
                            {broadcastForm.targetAudience === aud.id && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium">{aud.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Plan Picker */}
                  {broadcastForm.targetAudience === 'BY_PLAN' && (
                    <div className="pt-3 border-t border-gray-200/70">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Target Plan</label>
                      <select
                        value={broadcastForm.targetPlanId}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, targetPlanId: e.target.value })}
                        className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">-- Choose Plan --</option>
                        {plans.map((p) => (
                          <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Status Picker */}
                  {broadcastForm.targetAudience === 'BY_STATUS' && (
                    <div className="pt-3 border-t border-gray-200/70">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Client Status</label>
                      <select
                        value={broadcastForm.targetStatus}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, targetStatus: e.target.value })}
                        className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="active">Active Tenants Only</option>
                        <option value="trial">Trialing Tenants Only</option>
                        <option value="expired">Expired Tenants Only</option>
                      </select>
                    </div>
                  )}

                  {/* Specific Tenant Multi-picker */}
                  {broadcastForm.targetAudience === 'SPECIFIC_TENANTS' && (
                    <div className="pt-3 border-t border-gray-200/70">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Specific Client(s)</label>
                      <select
                        multiple
                        value={broadcastForm.targetTenantIds}
                        onChange={(e) => {
                          const opts = Array.from(e.target.selectedOptions, (o) => o.value);
                          setBroadcastForm({ ...broadcastForm, targetTenantIds: opts });
                        }}
                        className="w-full h-28 p-2 border border-gray-200 rounded-xl bg-white text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        {tenants.map((t) => (
                          <option key={t._id} value={t._id}>{t.name} ({t.slug})</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-400 mt-1">Hold Ctrl / Cmd to select multiple clients.</p>
                    </div>
                  )}
                </div>

                {/* Message Meta: Type & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">Message Category</label>
                    <select
                      value={broadcastForm.type}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                      className="w-full h-11 px-3 border border-gray-200 rounded-xl bg-white text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="announcement">📢 Platform Announcement</option>
                      <option value="maintenance">⚙️ Maintenance Downtime</option>
                      <option value="billing">💳 Billing & Renewal Advisory</option>
                      <option value="feature">✨ New Feature Release</option>
                      <option value="alert">⚠️ Urgent System Advisory</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">Priority Level</label>
                    <select
                      value={broadcastForm.priority}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                      className="w-full h-11 px-3 border border-gray-200 rounded-xl bg-white text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="normal">Normal (Standard Notification)</option>
                      <option value="high">High (Prominent Highlight)</option>
                      <option value="critical">Critical (Banner & Sound Alert)</option>
                    </select>
                  </div>
                </div>

                {/* Title & Body */}
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">Notification Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scheduled Core Database Maintenance Notice"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">Message Content *</label>
                    <span className="text-[11px] text-gray-400 font-mono">{broadcastForm.message.length} chars</span>
                  </div>
                  <textarea
                    required
                    rows="4"
                    placeholder="Write detailed broadcast message..."
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    className="w-full p-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>

                {/* Delivery Channels */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">Dispatch Channels</h4>
                    <p className="text-[11px] text-gray-500">Choose where this announcement should appear</p>
                  </div>

                  <div className="flex items-center gap-5">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={broadcastForm.channels.includes('in_app')}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...broadcastForm.channels, 'in_app']
                            : broadcastForm.channels.filter((c) => c !== 'in_app');
                          setBroadcastForm({ ...broadcastForm, channels: updated });
                        }}
                        className="rounded text-teal-700 focus:ring-teal-500 w-4 h-4"
                      />
                      <span>In-App Dashboard Alert</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={broadcastForm.channels.includes('push')}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...broadcastForm.channels, 'push']
                            : broadcastForm.channels.filter((c) => c !== 'push');
                          setBroadcastForm({ ...broadcastForm, channels: updated });
                        }}
                        className="rounded text-teal-700 focus:ring-teal-500 w-4 h-4"
                      />
                      <span className="flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                        Firebase Web Push (FCM)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={sendingBroadcast}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#072F2B] hover:bg-[#0B4640] text-white font-bold text-sm shadow-md shadow-emerald-950/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {sendingBroadcast ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sendingBroadcast ? 'Broadcasting Across Platform...' : 'Dispatch Platform Broadcast'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB 3: BROADCAST HISTORY ──────────────────────────────────── */}
        {activeTab === 'History' && (
          <div className="flex-1 flex flex-col bg-white">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-gray-800">Historical Broadcast Audits</h3>
                <p className="text-xs text-gray-400">Complete record of platform announcements and transmission logs.</p>
              </div>
              <button
                onClick={loadBroadcastHistory}
                className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex-1 overflow-x-auto p-4">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
                  <p className="text-sm font-semibold">Loading broadcast logs...</p>
                </div>
              ) : broadcastHistory.length > 0 ? (
                <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Broadcast Details</th>
                      <th className="p-3.5">Audience Target</th>
                      <th className="p-3.5">Channels</th>
                      <th className="p-3.5">Recipients</th>
                      <th className="p-3.5">Push Status</th>
                      <th className="p-3.5">Dispatched By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {broadcastHistory.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="p-3.5 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                          {formatTimestamp(item.createdAt || item.sentAt)}
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <div className="font-bold text-gray-900 line-clamp-1">{item.title}</div>
                          <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{item.message}</div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-bold text-[10px]">
                            {item.targetAudience}
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {item.channels?.map((ch) => (
                              <span key={ch} className="px-1.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded text-[9px] font-bold uppercase">
                                {ch}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap font-bold text-gray-800">
                          {item.recipientCount || 1} accounts
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          {item.pushSuccessCount > 0 ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> {item.pushSuccessCount} delivered
                            </span>
                          ) : (
                            <span className="text-gray-400">In-App only</span>
                          )}
                        </td>
                        <td className="p-3.5 whitespace-nowrap text-gray-600 font-semibold">
                          {item.sentByName || 'Super Admin'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <Layers className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-semibold">No platform broadcasts recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
