import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollText, Search, Shield, Globe, Trash2, Lock, AlertTriangle,
  Filter, Eye, X, Loader2, RefreshCw, Clock, User, CheckCircle2,
  Copy, Check, ChevronLeft, ChevronRight, Laptop, Building2,
  KeyRound, ArrowUpRight, Activity, Calendar
} from 'lucide-react';
import apiClient from '../services/apiClient';

// ── Action Badge & Category Meta ──────────────────────────────────────
const ACTION_META = {
  TENANT_SUSPENDED:             { label: 'Tenant Suspended',      category: 'tenant',   badge: 'bg-amber-50 text-amber-700 border-amber-200/80',      icon: AlertTriangle, iconColor: 'text-amber-600' },
  TENANT_ACTIVATED:             { label: 'Tenant Activated',      category: 'tenant',   badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', icon: CheckCircle2, iconColor: 'text-emerald-600' },
  TENANT_CREATED:               { label: 'Tenant Created',        category: 'tenant',   badge: 'bg-teal-50 text-teal-700 border-teal-200/80',          icon: Building2,     iconColor: 'text-teal-600' },
  TENANT_DELETED:               { label: 'Tenant Deleted',        category: 'tenant',   badge: 'bg-rose-50 text-rose-700 border-rose-200/80',          icon: Trash2,        iconColor: 'text-rose-600' },
  TENANT_IMPERSONATION_STARTED: { label: 'Impersonation Started', category: 'security', badge: 'bg-purple-50 text-purple-700 border-purple-200/80',    icon: KeyRound,      iconColor: 'text-purple-600' },
  TENANT_IMPERSONATION_ENDED:   { label: 'Impersonation Ended',   category: 'security', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',    icon: Shield,        iconColor: 'text-indigo-600' },
  SUBSCRIPTION_RENEWED:         { label: 'Subscription Renewed',  category: 'billing',  badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', icon: ArrowUpRight, iconColor: 'text-emerald-600' },
  SUBSCRIPTION_CREATED:         { label: 'Subscription Created',  category: 'billing',  badge: 'bg-teal-50 text-teal-700 border-teal-200/80',          icon: ScrollText,    iconColor: 'text-teal-600' },
  SUBSCRIPTION_CANCELLED:       { label: 'Subscription Cancelled',category: 'billing',  badge: 'bg-rose-50 text-rose-700 border-rose-200/80',          icon: AlertTriangle, iconColor: 'text-rose-600' },
  PLAN_ASSIGNED:                { label: 'Plan Assigned',         category: 'billing',  badge: 'bg-blue-50 text-blue-700 border-blue-200/80',          icon: ScrollText,    iconColor: 'text-blue-600' },
  DOMAIN_CONFIGURED:            { label: 'Domain Configured',     category: 'domain',   badge: 'bg-sky-50 text-sky-700 border-sky-200/80',             icon: Globe,         iconColor: 'text-sky-600' },
  DOMAIN_VERIFIED:              { label: 'Domain Verified',       category: 'domain',   badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', icon: CheckCircle2, iconColor: 'text-emerald-600' },
  DOMAIN_REMOVED:               { label: 'Domain Removed',        category: 'domain',   badge: 'bg-rose-50 text-rose-700 border-rose-200/80',          icon: Trash2,        iconColor: 'text-rose-600' },
  ADMIN_PASSWORD_RESET:         { label: 'Password Reset',        category: 'security', badge: 'bg-amber-50 text-amber-700 border-amber-200/80',      icon: Lock,          iconColor: 'text-amber-600' },
  STAFF_CREATED:                { label: 'Staff Member Added',    category: 'security', badge: 'bg-blue-50 text-blue-700 border-blue-200/80',          icon: User,          iconColor: 'text-blue-600' },
};

function formatTimestamp(dateStr) {
  if (!dateStr) return { relative: '—', full: '' };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { relative: dateStr, full: '' };
    
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relative = '';
    if (diffMins < 1) relative = 'Just now';
    else if (diffMins < 60) relative = `${diffMins}m ago`;
    else if (diffHours < 24) relative = `${diffHours}h ago`;
    else if (diffDays === 1) relative = 'Yesterday';
    else if (diffDays < 7) relative = `${diffDays}d ago`;
    else relative = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    const full = d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    return { relative, full };
  } catch {
    return { relative: dateStr, full: '' };
  }
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [page, filterAction]);

  async function loadLogs() {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const params = { page, limit: 15 };
      if (filterAction) params.action = filterAction;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await apiClient.get('/super-admin/audit-logs', { params });
      const data = res.data?.data || res.data;
      setLogs(data?.items || data || []);
      setMeta(data?.meta || null);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadLogs();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterAction('');
    setActiveCategory('ALL');
    setPage(1);
  };

  const getMeta = (action) => {
    return ACTION_META[action] || {
      label: action ? action.replace(/_/g, ' ') : 'System Action',
      category: 'general',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Activity,
      iconColor: 'text-slate-500'
    };
  };

  // Filter logs by quick category tabs & client search
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Category filter
      if (activeCategory !== 'ALL') {
        const meta = getMeta(log.action);
        if (meta.category !== activeCategory) return false;
      }
      // Search term
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      const actionMatch = (log.action || '').toLowerCase().includes(s);
      const tenantMatch = (log.tenantName || '').toLowerCase().includes(s);
      const userMatch = (log.performedBy?.name || '').toLowerCase().includes(s) ||
                         (log.performedBy?.email || '').toLowerCase().includes(s);
      const ipMatch = (log.ipAddress || '').includes(s);
      return actionMatch || tenantMatch || userMatch || ipMatch;
    });
  }, [logs, activeCategory, searchTerm]);

  // Compute stat metrics
  const stats = useMemo(() => {
    const total = meta?.total ?? logs.length;
    let securityCount = 0;
    let tenantCount = 0;
    const actors = new Set();

    logs.forEach(l => {
      const cat = getMeta(l.action).category;
      if (cat === 'security') securityCount++;
      if (cat === 'tenant') tenantCount++;
      if (l.performedBy?.email) actors.add(l.performedBy.email);
    });

    return {
      total,
      security: securityCount,
      tenants: tenantCount,
      uniqueActors: actors.size || (total > 0 ? 1 : 0)
    };
  }, [meta, logs]);

  const handleCopyJson = () => {
    if (!selectedLog) return;
    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/70">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-500/10">
              <ScrollText className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800 tracking-tight">System Audit Logs</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Comprehensive tamper-evident security audit trail across all tenants and operators.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => { setPage(1); loadLogs(); }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all disabled:opacity-60 active:scale-95"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Logs'}</span>
          </button>
        </div>
      </div>

      {/* ── Metrics Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 hover:border-emerald-200 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Actions</p>
            <h3 className="text-2xl font-black text-gray-900 leading-tight">
              {loading ? '...' : stats.total}
            </h3>
            <span className="text-[10px] font-semibold text-emerald-600">Historical records</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 hover:border-purple-200 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Security Events</p>
            <h3 className="text-2xl font-black text-gray-900 leading-tight">
              {loading ? '...' : stats.security}
            </h3>
            <span className="text-[10px] font-semibold text-purple-600">Impersonation & Auth</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 hover:border-teal-200 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tenant Activity</p>
            <h3 className="text-2xl font-black text-gray-900 leading-tight">
              {loading ? '...' : stats.tenants}
            </h3>
            <span className="text-[10px] font-semibold text-teal-600">Lifecycle & Status</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Actors</p>
            <h3 className="text-2xl font-black text-gray-900 leading-tight">
              {loading ? '...' : stats.uniqueActors}
            </h3>
            <span className="text-[10px] font-semibold text-blue-600">Authorized personnel</span>
          </div>
        </div>
      </div>

      {/* ── Main Data Card ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col">
        
        {/* Category Filter Pills & Search Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Quick Filter Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Records' },
              { id: 'security', label: '🛡️ Security' },
              { id: 'tenant', label: '🏢 Tenants' },
              { id: 'billing', label: '💳 Subscriptions' },
              { id: 'domain', label: '🌐 Domains' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#072F2B] text-emerald-300 shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Action Select & Keyword Search */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            {/* Action Dropdown */}
            <div className="relative w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={filterAction}
                onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
                className="w-full sm:w-48 pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer transition-colors shadow-xs"
              >
                <option value="">All Action Types</option>
                {Object.keys(ACTION_META).map(key => (
                  <option key={key} value={key}>{ACTION_META[key].label}</option>
                ))}
              </select>
            </div>

            {/* Keyword Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search action, tenant, user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(''); loadLogs(); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </form>

            {(searchTerm || filterAction || activeCategory !== 'ALL') && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 hover:bg-rose-50 rounded-lg transition-colors whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* ── Table Area ───────────────────────────────────────────── */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Loading Audit Trail...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
              <ScrollText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-gray-800">No Audit Logs Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mt-1">
              There are no audit events matching the selected filters. Try clearing your search or switching categories.
            </p>
            {(searchTerm || filterAction || activeCategory !== 'ALL') && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[960px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Time & Date</th>
                  <th className="py-3.5 px-5">Action Performed</th>
                  <th className="py-3.5 px-5">Operator (Who)</th>
                  <th className="py-3.5 px-5">Target / Scope</th>
                  <th className="py-3.5 px-5">Network IP</th>
                  <th className="py-3.5 px-5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/70 text-xs">
                {filteredLogs.map((log) => {
                  const meta = getMeta(log.action);
                  const IconComponent = meta.icon;
                  const time = formatTimestamp(log.createdAt);

                  return (
                    <tr 
                      key={log._id || log.id || Math.random()} 
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <div>
                            <span className="font-bold text-gray-900 block">{time.relative}</span>
                            <span className="text-[10px] text-gray-400 font-medium">{time.full}</span>
                          </div>
                        </div>
                      </td>

                      {/* Action Badge */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-2xs ${meta.badge}`}>
                          <IconComponent className={`w-3.5 h-3.5 shrink-0 ${meta.iconColor}`} />
                          {meta.label}
                        </span>
                      </td>

                      {/* Operator (Performed By) */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-200/60">
                            {(log.performedBy?.name?.[0] || 'A').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 block truncate">
                              {log.performedBy?.name || 'System Operator'}
                            </span>
                            <span className="text-[11px] text-gray-500 truncate block">
                              {log.performedBy?.email || '—'}
                            </span>
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-extrabold tracking-wider uppercase bg-gray-100 text-gray-600">
                              {log.performedBy?.role || 'SUPER_ADMIN'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Target / Tenant */}
                      <td className="py-3.5 px-5">
                        {log.tenantName ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 border border-gray-200/80">
                            <Building2 className="w-3 h-3 text-teal-600 shrink-0" />
                            <span className="font-bold text-gray-800">{log.tenantName}</span>
                          </div>
                        ) : log.targetUser ? (
                          <div>
                            <span className="font-bold text-gray-800 block">{log.targetUser.name || 'User'}</span>
                            <span className="text-[11px] text-gray-400">{log.targetUser.email}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-medium">Platform Level</span>
                        )}
                      </td>

                      {/* IP Address */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-gray-600 bg-gray-100/80 px-2 py-1 rounded-md border border-gray-200/50">
                          <Laptop className="w-3 h-3 text-gray-400" />
                          <span>{log.ipAddress || '127.0.0.1'}</span>
                        </div>
                      </td>

                      {/* Detail Trigger */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-all active:scale-95 shadow-2xs group-hover:shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination Footer ────────────────────────────────────── */}
        {meta && meta.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-gray-500 font-medium">
              Showing page <span className="font-bold text-gray-800">{meta.page}</span> of{' '}
              <span className="font-bold text-gray-800">{meta.totalPages}</span> ({meta.total} total logs)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg font-bold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg font-bold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Drawer / Modal ─────────────────────────────────── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight leading-tight">Security Event Details</h3>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">ID: {selectedLog._id || selectedLog.id || 'N/A'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Event Badge Banner */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Action Type</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${getMeta(selectedLog.action).badge}`}>
                    {getMeta(selectedLog.action).label}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Timestamp</span>
                  <span className="text-xs font-bold text-gray-800">{formatTimestamp(selectedLog.createdAt).full || '—'}</span>
                </div>
              </div>

              {/* Key Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Performed By</span>
                  <span className="text-xs font-bold text-gray-900 mt-1 block">{selectedLog.performedBy?.name || 'System Operator'}</span>
                  <span className="text-[11px] text-gray-500 font-mono">{selectedLog.performedBy?.email || '—'}</span>
                </div>

                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target / Tenant</span>
                  <span className="text-xs font-bold text-gray-900 mt-1 block">{selectedLog.tenantName || 'Platform General'}</span>
                  <span className="text-[11px] text-gray-500">{selectedLog.targetUser?.email || (selectedLog.tenantId ? `Tenant ID: ${selectedLog.tenantId}` : '—')}</span>
                </div>

                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">IP Address</span>
                  <span className="text-xs font-mono font-bold text-gray-800 mt-1 block">{selectedLog.ipAddress || '127.0.0.1'}</span>
                </div>

                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Operator Role</span>
                  <span className="text-xs font-bold text-emerald-700 mt-1 block uppercase tracking-wide">
                    {selectedLog.performedBy?.role || 'SUPER_ADMIN'}
                  </span>
                </div>
              </div>

              {/* JSON Payload Viewer */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Payload & Context Details</span>
                  <button
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 px-2 py-0.5 rounded hover:bg-emerald-50 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>
                <div className="rounded-xl bg-[#0f172a] p-4 text-emerald-400 font-mono text-xs overflow-x-auto max-h-48 border border-slate-800 shadow-inner">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.details || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-end shrink-0">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
