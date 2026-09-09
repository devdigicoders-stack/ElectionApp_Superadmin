import React, { useEffect, useState } from 'react';
import {
  Users, UserCheck, Clock, AlertTriangle, Database, ArrowUpRight,
  Calendar, Plus, MoreHorizontal, Receipt, TrendingUp, FileText
} from 'lucide-react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import apiClient from '../services/apiClient';

// ─── Status Badge ───────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active:    'bg-green-100 text-green-700',
    trial:     'bg-blue-100 text-blue-700',
    suspended: 'bg-red-100 text-red-700',
    expired:   'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

// ─── Skeleton Loader ────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
}

// ─── Stat Card ──────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, iconColor, iconBg, loading }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2.5} />
      </div>
      <div>
        {loading ? (
          <Skeleton className="h-7 w-16 mb-1" />
        ) : (
          <h3 className="text-2xl font-black text-gray-900 leading-none">{value ?? '—'}</h3>
        )}
        <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats]           = useState(null);
  const [growth, setGrowth]         = useState(null);
  const [overview, setOverview]     = useState(null);
  const [loadingStats, setLoadingStats]     = useState(true);
  const [loadingGrowth, setLoadingGrowth]   = useState(true);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [growthDays, setGrowthDays] = useState(30);

  // ── API 1: GET /super-admin/dashboard/stats ──────────────────
  useEffect(() => {
    setLoadingStats(true);
    apiClient.get('/super-admin/dashboard/stats')
      .then(res => setStats(res.data?.data || res.data))
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));
  }, []);

  // ── API 2: GET /super-admin/dashboard/growth?days=N ──────────
  useEffect(() => {
    setLoadingGrowth(true);
    apiClient.get(`/super-admin/dashboard/growth?days=${growthDays}`)
      .then(res => setGrowth(res.data?.data || res.data))
      .catch(() => setGrowth(null))
      .finally(() => setLoadingGrowth(false));
  }, [growthDays]);

  // ── API 3: GET /super-admin/dashboard/tenants-overview ───────
  useEffect(() => {
    setLoadingOverview(true);
    apiClient.get('/super-admin/dashboard/tenants-overview?page=1&limit=5')
      .then(res => setOverview(res.data?.data || res.data))
      .catch(() => setOverview(null))
      .finally(() => setLoadingOverview(false));
  }, []);

  // ── Derived values from stats ────────────────────────────────
  const tenantTotal     = stats?.tenants?.total ?? 0;
  const tenantActive    = stats?.tenants?.active ?? 0;
  const tenantTrial     = stats?.tenants?.trial ?? 0;
  const tenantSuspended = stats?.tenants?.suspended ?? 0;
  const totalCitizens   = stats?.citizens?.total ?? 0;
  const totalRevenue    = stats?.subscriptions?.totalRevenue ?? 0;
  const storageFmt      = stats?.storage?.formatted ?? '0 MB';

  const tenantPieData = [
    { name: 'Active',    value: tenantActive,    color: '#047857' },
    { name: 'Trial',     value: tenantTrial,     color: '#3B82F6' },
    { name: 'Suspended', value: tenantSuspended, color: '#EF4444' },
  ].filter(d => d.value > 0);

  // ── Growth chart data (citizen signups) ──────────────────────
  const citizenChartData = (growth?.citizenGrowth || []).map(d => ({
    date: d.date?.slice(5),   // "MM-DD"
    citizens: d.count,
  }));

  // ── Revenue chart data ────────────────────────────────────────
  const revenueChartData = (growth?.revenueTrend || []).map(d => ({
    date: d.date?.slice(5),
    revenue: d.amount,
  }));

  // ── Tenants overview table ────────────────────────────────────
  const tenantRows = overview?.items || [];

  return (
    <div className="space-y-6 pb-10 text-gray-800">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live platform overview from backend</p>
        </div>
        <button className="flex items-center gap-2 bg-[#072F2B] hover:bg-[#0B4640] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md w-fit">
          <Plus className="w-4 h-4" strokeWidth={3} />
          Add New Tenant
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Tenants"    value={tenantTotal}                    icon={Users}        iconColor="text-emerald-600" iconBg="bg-emerald-50"  loading={loadingStats} />
        <StatCard title="Active Tenants"   value={tenantActive}                   icon={UserCheck}    iconColor="text-green-600"   iconBg="bg-green-50"    loading={loadingStats} />
        <StatCard title="Trial Tenants"    value={tenantTrial}                    icon={Clock}        iconColor="text-blue-500"    iconBg="bg-blue-50"     loading={loadingStats} />
        <StatCard title="Suspended"        value={tenantSuspended}                icon={AlertTriangle}iconColor="text-red-600"     iconBg="bg-red-50"      loading={loadingStats} />
        <StatCard title="Total Citizens"   value={totalCitizens.toLocaleString()} icon={Users}        iconColor="text-purple-600"  iconBg="bg-purple-50"   loading={loadingStats} />

        {/* Revenue Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-yellow-50">
            <Receipt className="w-5 h-5 text-yellow-600" strokeWidth={2.5} />
          </div>
          <div>
            {loadingStats ? <Skeleton className="h-7 w-20 mb-1" /> : (
              <h3 className="text-xl font-black text-gray-900 leading-none">
                ₹{totalRevenue.toLocaleString()}
              </h3>
            )}
            <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">Total Revenue</p>
          </div>
        </div>
      </div>

      {/* ── Middle Row: Growth Chart + Tenant Pie + Storage ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Citizen Growth Chart */}
        <div className="xl:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-gray-900">Citizen Signups</h3>
            <select
              value={growthDays}
              onChange={e => setGrowthDays(Number(e.target.value))}
              className="text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
          </div>
          <div className="h-[220px]">
            {loadingGrowth ? <Skeleton className="h-full w-full" /> : (
              citizenChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-400 font-medium">No data for this period</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={citizenChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="citizenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#072F2B" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#072F2B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="citizens" stroke="#072F2B" strokeWidth={2.5} fill="url(#citizenGrad)" dot={false} activeDot={{ r: 5, fill: '#072F2B' }} />
                  </AreaChart>
                </ResponsiveContainer>
              )
            )}
          </div>
        </div>

        {/* Tenant Status Donut */}
        <div className="xl:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-base font-extrabold text-gray-900 mb-2">Tenant Status</h3>
          {loadingStats ? <Skeleton className="flex-1 w-full" /> : (
            <>
              <div className="flex-1 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={tenantPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                      {tenantPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-gray-900">{tenantTotal}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Tenants</span>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                {tenantPieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-semibold text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Storage + Complaints Stats */}
        <div className="xl:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5">
          <h3 className="text-base font-extrabold text-gray-900">Platform Stats</h3>

          {loadingStats ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Storage */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{storageFmt}</p>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase">Est. Storage Used</p>
                </div>
              </div>

              {/* Complaints */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{stats?.complaints?.total ?? 0}</p>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase">Total Complaints</p>
                </div>
              </div>

              {/* Resolution Rate */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{stats?.complaints?.resolutionRate ?? '0%'}</p>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase">Resolution Rate</p>
                </div>
              </div>

              {/* Active Subscriptions */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{stats?.subscriptions?.active ?? 0}</p>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase">Active Subscriptions</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Revenue Trend Chart ── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-gray-900">Revenue Trend</h3>
          <span className="text-xs font-semibold text-gray-400">Last {growthDays} days (paid invoices)</span>
        </div>
        <div className="h-[180px]">
          {loadingGrowth ? <Skeleton className="h-full w-full" /> : (
            revenueChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400 font-medium">No revenue data for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revenueChartData} margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} tickFormatter={v => `₹${v}`} />
                  <Tooltip formatter={v => [`₹${v}`, 'Revenue']} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                  <Bar dataKey="revenue" fill="#bbf7d0" radius={[4, 4, 0, 0]} barSize={14} />
                  <Line type="monotone" dataKey="revenue" stroke="#072F2B" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )
          )}
        </div>
      </div>

      {/* ── Tenants Overview Table (API 3) ── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-gray-900">Recent Tenants</h3>
          <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
            <span>Total: {overview?.meta?.total ?? '—'}</span>
          </div>
        </div>

        {loadingOverview ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : tenantRows.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400 font-medium">No tenants found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Tenant', 'Leader', 'Plan', 'Citizens', 'Complaints', 'Status', 'Subscription'].map(h => (
                    <th key={h} className="py-3 px-2 text-[10px] font-bold text-gray-400 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tenantRows.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-2">
                      <p className="text-xs font-bold text-gray-900">{t.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{t.slug}</p>
                    </td>
                    <td className="py-3 px-2 text-xs text-gray-600 font-medium">{t.leaderName || '—'}</td>
                    <td className="py-3 px-2 text-xs text-gray-600 font-medium">{t.plan?.name || '—'}</td>
                    <td className="py-3 px-2 text-xs font-bold text-gray-700">{t.metrics?.totalCitizens ?? 0}</td>
                    <td className="py-3 px-2 text-xs font-bold text-gray-700">{t.metrics?.totalComplaints ?? 0}</td>
                    <td className="py-3 px-2"><StatusBadge status={t.status} /></td>
                    <td className="py-3 px-2">
                      {t.subscription ? (
                        <div>
                          <StatusBadge status={t.subscription.status} />
                          {t.subscription.endDate && (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Ends: {new Date(t.subscription.endDate).toLocaleDateString('en-IN')}
                            </p>
                          )}
                        </div>
                      ) : <span className="text-[10px] text-gray-400">No subscription</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
