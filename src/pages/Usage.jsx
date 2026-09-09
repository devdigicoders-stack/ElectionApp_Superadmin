import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, HardDrive, Users, Bell, Image, ShieldAlert,
  Search, AlertTriangle, CheckCircle, AlertCircle, Eye,
  Loader2, RefreshCw, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import apiClient from '../services/apiClient';

// ── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    normal: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-orange-100 text-orange-700 border-orange-200',
    restricted: 'bg-red-100 text-red-700 border-red-200',
  };
  const icons = {
    normal: <CheckCircle className="w-3.5 h-3.5" />,
    warning: <AlertTriangle className="w-3.5 h-3.5" />,
    restricted: <AlertCircle className="w-3.5 h-3.5" />,
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 w-max ${map[status] || map.normal}`}>
      {icons[status]} {status?.toUpperCase()}
    </span>
  );
}

// ── Metric Progress Bar ───────────────────────────────────────
function MetricBar({ label, metric, icon: Icon, color }) {
  if (!metric) return null;
  const pct = metric.limit === -1 ? 0 : Math.min(metric.percentUsed, 100);
  const isUnlimited = metric.limit === -1;
  const barColor =
    metric.status === 'restricted' ? 'bg-red-500' :
      metric.status === 'warning' ? 'bg-orange-400' :
        `bg-${color}-500`;

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-full bg-${color}-100 flex items-center justify-center shrink-0`}>
          <Icon className={`w-3.5 h-3.5 text-${color}-600`} />
        </div>
        <span className="text-xs font-bold text-gray-700">{label}</span>
        <span className="ml-auto text-[10px] font-bold text-gray-500">
          {isUnlimited ? `${metric.used} / ∞` :
            metric.formattedUsed
              ? `${metric.formattedUsed} / ${metric.formattedLimit}`
              : `${metric.used} / ${metric.limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      )}
      {!isUnlimited && (
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400">{pct}% used</span>
          {metric.status !== 'normal' && (
            <StatusBadge status={metric.status} />
          )}
        </div>
      )}
      {isUnlimited && (
        <p className="text-[10px] text-emerald-600 font-semibold mt-1">Unlimited</p>
      )}
    </div>
  );
}

const STATUS_FILTERS = ['all', 'normal', 'warning', 'restricted'];

export default function Usage() {
  // ── Overview list state (GET /super-admin/usage/overview)
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // ── Tenant detail state (GET /super-admin/tenants/:id/usage)
  const [detailModal, setDetailModal] = useState(false);
  const [tenantDetail, setTenantDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');

  // ── Load overview ─────────────────────────────────────────
  const loadOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await apiClient.get('/super-admin/usage/overview', { params });
      const data = res.data?.data || res.data;

      setSummary(data?.summary || null);
      setItems(data?.items || []);
      setMeta(data?.meta || null);
    } catch (e) {
      setError('Usage data load nahi hua. Backend check karo.');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { loadOverview(); }, [loadOverview]);

  // Search ke saath page 1 pe reset
  function handleSearch(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleStatusFilter(s) {
    setStatusFilter(s);
    setPage(1);
  }

  // ── Load tenant detail ─────────────────────────────────────
  // GET /super-admin/tenants/:id/usage
  async function openDetail(tenantId) {
    setDetailModal(true);
    setTenantDetail(null);
    setDetailError('');
    setLoadingDetail(true);
    try {
      const res = await apiClient.get(`/super-admin/tenants/${tenantId}/usage`);
      setTenantDetail(res.data?.data || res.data);
    } catch (e) {
      setDetailError(e?.response?.data?.message || 'Tenant usage load nahi hua.');
    } finally {
      setLoadingDetail(false);
    }
  }

  function closeDetail() {
    setDetailModal(false);
    setTenantDetail(null);
    setDetailError('');
  }

  // ── Summary stat cards ────────────────────────────────────
  const summaryCards = summary ? [
    { label: 'Total Tenants', value: summary.totalTenants, color: 'indigo', icon: Users },
    { label: 'Normal', value: summary.normalCount, color: 'emerald', icon: CheckCircle },
    { label: 'Warning', value: summary.warningCount, color: 'orange', icon: AlertTriangle },
    { label: 'Restricted', value: summary.restrictedCount, color: 'red', icon: AlertCircle },
  ] : [];

  return (
    <div className="p-4 sm:p-8 w-full min-h-screen bg-gray-50/50">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" /> Platform Usage & Limits
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor per-tenant resource consumption — citizens, storage, posters, notifications.
          </p>
        </div>
        <button
          onClick={loadOverview}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary stat cards */}
      {summaryCards.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryCards.map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className={`w-11 h-11 bg-${color}-50 rounded-full flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 text-${color}-600`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
                <h3 className="text-2xl font-black text-gray-900">{value ?? '—'}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">

          {/* Status filter tabs */}
          <div className="flex gap-1 flex-wrap">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => handleStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${statusFilter === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tenant..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-medium">Koi tenant nahi mila.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tenant</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Citizens</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Storage</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Posters/mo</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => {
                  const m = item.metrics || {};
                  return (
                    <tr key={item.tenant?.id} className="hover:bg-gray-50/50 transition-colors">

                      {/* Tenant */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 text-sm">{item.tenant?.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{item.tenant?.slug}</p>
                      </td>

                      {/* Plan */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-700">{item.plan?.name || '—'}</p>
                        <p className="text-[10px] text-gray-400">{item.plan?.billingCycle || ''}</p>
                      </td>

                      {/* Citizens */}
                      <td className="px-6 py-4">
                        {m.citizens ? (
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {m.citizens.used}
                              {m.citizens.limit !== -1 && (
                                <span className="text-gray-400 font-normal text-xs"> / {m.citizens.limit}</span>
                              )}
                            </p>
                            {m.citizens.limit !== -1 && (
                              <div className="w-20 bg-gray-100 rounded-full h-1 mt-1">
                                <div
                                  className={`h-full rounded-full ${m.citizens.status === 'restricted' ? 'bg-red-500' : m.citizens.status === 'warning' ? 'bg-orange-400' : 'bg-emerald-500'}`}
                                  style={{ width: `${Math.min(m.citizens.percentUsed, 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        ) : '—'}
                      </td>

                      {/* Storage */}
                      <td className="px-6 py-4">
                        {m.storageMB ? (
                          <div>
                            <p className="text-sm font-bold text-gray-800">{m.storageMB.formattedUsed || `${m.storageMB.used} MB`}</p>
                            {m.storageMB.limit !== -1 && (
                              <div className="w-20 bg-gray-100 rounded-full h-1 mt-1">
                                <div
                                  className={`h-full rounded-full ${m.storageMB.status === 'restricted' ? 'bg-red-500' : m.storageMB.status === 'warning' ? 'bg-orange-400' : 'bg-emerald-500'}`}
                                  style={{ width: `${Math.min(m.storageMB.percentUsed, 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        ) : '—'}
                      </td>

                      {/* Posters this month */}
                      <td className="px-6 py-4">
                        {m.postersThisMonth ? (
                          <p className="text-sm font-bold text-gray-800">
                            {m.postersThisMonth.used}
                            {m.postersThisMonth.limit !== -1 && (
                              <span className="text-gray-400 font-normal text-xs"> / {m.postersThisMonth.limit}</span>
                            )}
                          </p>
                        ) : '—'}
                      </td>

                      {/* Overall status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={item.overallStatus} />
                      </td>

                      {/* Detail button */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openDetail(item.tenant?.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs font-semibold text-gray-500">
              Page {meta.page} of {meta.totalPages} &nbsp;·&nbsp; {meta.total} tenants
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Tenant Detail Modal — GET /super-admin/tenants/:id/usage ── */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                {tenantDetail ? `${tenantDetail.tenant?.name} — Usage Report` : 'Tenant Usage Detail'}
              </h3>
              <button onClick={closeDetail} className="text-gray-400 hover:text-gray-700 p-1 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">

              {loadingDetail ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : detailError ? (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{detailError}</div>
              ) : tenantDetail ? (
                <div className="space-y-4">

                  {/* Tenant + Plan info */}
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-indigo-900 text-base">{tenantDetail.tenant?.name}</h4>
                      <p className="text-xs text-indigo-600 font-mono mt-0.5">{tenantDetail.tenant?.slug}</p>
                      {tenantDetail.tenant?.leaderName && (
                        <p className="text-xs text-indigo-700 mt-1">👤 {tenantDetail.tenant.leaderName}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={tenantDetail.overallStatus} />
                      {tenantDetail.plan && (
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                          {tenantDetail.plan.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Subscription info */}
                  {tenantDetail.subscription && (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ['Sub Status', tenantDetail.subscription.status],
                        ['Ends', tenantDetail.subscription.endDate ? new Date(tenantDetail.subscription.endDate).toLocaleDateString('en-IN') : '—'],
                      ].map(([k, v]) => (
                        <div key={k} className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{k}</p>
                          <p className="text-sm font-bold text-gray-800 mt-0.5">{v}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Metric bars */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Resource Metrics</p>
                    <MetricBar label="Citizens" metric={tenantDetail.metrics?.citizens} icon={Users} color="blue" />
                    <MetricBar label="Storage" metric={tenantDetail.metrics?.storageMB} icon={HardDrive} color="indigo" />
                    <MetricBar label="Staff Users" metric={tenantDetail.metrics?.staffUsers} icon={Users} color="purple" />
                    <MetricBar label="Posters This Month" metric={tenantDetail.metrics?.postersThisMonth} icon={Image} color="amber" />
                    <MetricBar label="Notifications This Month" metric={tenantDetail.metrics?.notificationsThisMonth} icon={Bell} color="teal" />
                  </div>

                  {/* Alerts */}
                  {tenantDetail.alerts?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-red-500 uppercase tracking-wider">⚠️ Alerts</p>
                      {tenantDetail.alerts.map((alert, i) => (
                        <div key={i} className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-700 font-medium flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          {alert}
                        </div>
                      ))}
                    </div>
                  )}

                  {tenantDetail.alerts?.length === 0 && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-xs text-emerald-700 font-semibold flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      Sab theek hai — koi alert nahi hai is tenant ke liye.
                    </div>
                  )}

                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={closeDetail}
                className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
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
