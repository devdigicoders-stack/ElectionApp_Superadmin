import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, Clock, AlertTriangle,
  Plus, Receipt, TrendingUp, HardDrive,
  ShieldAlert, CheckCircle2, ChevronRight, RefreshCw,
  Globe, AlertCircle
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
  const navigate = useNavigate();
  const [stats, setStats]           = useState(null);
  const [growth, setGrowth]         = useState(null);
  const [overview, setOverview]     = useState(null);
  const [loadingStats, setLoadingStats]     = useState(true);
  const [loadingGrowth, setLoadingGrowth]   = useState(true);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [growthDays, setGrowthDays] = useState(30);
  const [alertFilter, setAlertFilter] = useState('ALL');

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
  const tenantExpired   = stats?.tenants?.expired ?? stats?.subscriptions?.expired ?? 0;
  const totalCitizens       = stats?.citizens?.total ?? stats?.citizens?.registered ?? 0;
  const activeCitizens      = stats?.citizens?.active ?? totalCitizens;
  const activeRateStr       = stats?.citizens?.activeRate ?? (totalCitizens > 0 ? `${Math.round((activeCitizens / totalCitizens) * 100)}%` : '100%');
  const activeRateNum       = stats?.citizens?.activeRateNum ?? (totalCitizens > 0 ? Math.round((activeCitizens / totalCitizens) * 100) : 100);
  const inactiveCitizens    = stats?.citizens?.inactive ?? Math.max(totalCitizens - activeCitizens, 0);
  const newCitizens30d      = stats?.citizens?.newInLast30Days ?? 0;
  const totalRevenue        = stats?.subscriptions?.totalRevenue ?? 0;
  const storageUsedFmt      = stats?.storage?.usedFormatted || stats?.storage?.formatted || '0 MB';
  const storageAllocatedFmt = stats?.storage?.allocatedFormatted || '50.00 GB';
  const storagePercentUsed  = stats?.storage?.percentUsed ?? 0;
  const storageStatus       = stats?.storage?.status || 'normal';
  const storageUploadsFmt   = stats?.storage?.physicalUploadsFormatted || '0 MB';
  const storageDbFmt        = stats?.storage?.databaseFormatted || '0 MB';
  const storageFileCount    = stats?.storage?.fileCount || 0;

  // ── Dynamic System Alerts (SRS Sec 45.1) ──────────────────────
  const alertsData = stats?.alerts || { total: 0, criticalCount: 0, warningCount: 0, infoCount: 0, items: [] };
  const alertItems = alertsData.items || [];
  const filteredAlerts = alertItems.filter(a => {
    if (alertFilter === 'ALL') return true;
    if (alertFilter === 'critical') return a.severity === 'critical';
    if (alertFilter === 'warning') return a.severity === 'warning';
    return a.category === alertFilter;
  });

  const tenantPieData = [
    { name: 'Active',    value: tenantActive,    color: '#047857' },
    { name: 'Trial',     value: tenantTrial,     color: '#3B82F6' },
    { name: 'Expired',   value: tenantExpired,   color: '#F59E0B' },
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
        <button
          onClick={() => navigate('/clients')}
          className="flex items-center gap-2 bg-[#072F2B] hover:bg-[#0B4640] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md w-fit cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          Add New Tenant
        </button>
      </div>

      {/* ── Stat Cards (SRS Section 45.1) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-9 gap-3.5">
        <StatCard title="Total Tenants"    value={tenantTotal}                    icon={Users}        iconColor="text-emerald-600" iconBg="bg-emerald-50"  loading={loadingStats} />
        <StatCard title="Active Tenants"   value={tenantActive}                   icon={UserCheck}    iconColor="text-green-600"   iconBg="bg-green-50"    loading={loadingStats} />
        <StatCard title="Trial Tenants"    value={tenantTrial}                    icon={Clock}        iconColor="text-blue-500"    iconBg="bg-blue-50"     loading={loadingStats} />
        <StatCard title="Expired"          value={tenantExpired}                  icon={Clock}        iconColor="text-amber-600"   iconBg="bg-amber-50"    loading={loadingStats} />
        <StatCard title="Suspended"        value={tenantSuspended}                icon={AlertTriangle}iconColor="text-red-600"     iconBg="bg-red-50"      loading={loadingStats} />

        {/* 1. Total Registered Users (SRS Sec 45.1) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-purple-50">
            <Users className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            {loadingStats ? (
              <Skeleton className="h-7 w-20 mb-1" />
            ) : (
              <h3 className="text-xl font-black text-gray-900 leading-none truncate">
                {totalCitizens.toLocaleString()}
              </h3>
            )}
            <div className="flex items-center justify-between gap-1 mt-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Registered</p>
              {newCitizens30d > 0 && (
                <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                  +{newCitizens30d} 30d
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Total Active Users (SRS Sec 45.1) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-teal-50">
            <UserCheck className="w-5 h-5 text-teal-600" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            {loadingStats ? (
              <Skeleton className="h-7 w-20 mb-1" />
            ) : (
              <h3 className="text-xl font-black text-gray-900 leading-none truncate">
                {activeCitizens.toLocaleString()}
              </h3>
            )}
            <div className="flex items-center justify-between gap-1 mt-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Active Users</p>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                {activeRateStr}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Dynamic Total Storage Usage Card (SRS Sec 45.1) */}
        <div
          onClick={() => navigate('/usage')}
          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-3.5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view detailed per-tenant usage breakdown"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
            <HardDrive className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            {loadingStats ? (
              <Skeleton className="h-7 w-20 mb-1" />
            ) : (
              <h3 className="text-xl font-black text-gray-900 leading-none truncate">
                {storageUsedFmt}
              </h3>
            )}
            <div className="flex items-center justify-between gap-1 mt-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Storage Used</p>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                storageStatus === 'critical' ? 'bg-red-100 text-red-700' :
                storageStatus === 'warning' ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                {storagePercentUsed}%
              </span>
            </div>
          </div>
        </div>

        {/* 4. Revenue Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-yellow-50">
            <Receipt className="w-5 h-5 text-yellow-600" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            {loadingStats ? <Skeleton className="h-7 w-20 mb-1" /> : (
              <h3 className="text-xl font-black text-gray-900 leading-none truncate">
                ₹{totalRevenue.toLocaleString()}
              </h3>
            )}
            <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wider truncate">Total Revenue</p>
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
              {/* Dynamic Platform Storage Utilization (SRS Sec 45.1 & 48) */}
              <div className="p-3.5 bg-gradient-to-br from-indigo-50/60 to-white rounded-xl border border-indigo-100/90 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100/80 flex items-center justify-center shrink-0">
                      <HardDrive className="w-3.5 h-3.5 text-indigo-700" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-tight">Storage Utilization</p>
                      <p className="text-[10px] font-medium text-gray-500">Live physical & DB usage</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/usage')}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    Manage →
                  </button>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-baseline mb-1 text-[11px]">
                    <span className="font-extrabold text-gray-900">{storageUsedFmt}</span>
                    <span className="font-semibold text-gray-400">of {storageAllocatedFmt} ({storagePercentUsed}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        storageStatus === 'critical' ? 'bg-red-500' :
                        storageStatus === 'warning' ? 'bg-amber-500' :
                        'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.max(storagePercentUsed, 2)}%` }}
                    />
                  </div>
                </div>

                {/* Breakdown chips */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-gray-100 text-[10px]">
                  <div className="flex items-center gap-1 text-gray-600 truncate" title={`${storageUploadsFmt} in ${storageFileCount} uploaded files`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span className="truncate">Files: <strong>{storageUploadsFmt}</strong> ({storageFileCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 truncate" title={`Database documents: ${storageDbFmt}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                    <span className="truncate">DB: <strong>{storageDbFmt}</strong></span>
                  </div>
                </div>
              </div>

              {/* Dynamic User Activity & Retention Widget (SRS Sec 45.1) */}
              <div className="p-3.5 bg-gradient-to-br from-purple-50/60 to-white rounded-xl border border-purple-100/90 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100/80 flex items-center justify-center shrink-0">
                      <UserCheck className="w-3.5 h-3.5 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-tight">Active vs Registered</p>
                      <p className="text-[10px] font-medium text-gray-500">Citizen platform engagement</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                    {activeRateStr} Active
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-baseline mb-1 text-[11px]">
                    <span className="font-extrabold text-gray-900">{activeCitizens.toLocaleString()} Active</span>
                    <span className="font-semibold text-gray-400">of {totalCitizens.toLocaleString()} Registered</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-600 transition-all duration-500"
                      style={{ width: `${Math.min(Math.max(activeRateNum, 2), 100)}%` }}
                    />
                  </div>
                </div>

                {/* Breakdown chips */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-gray-100 text-[10px]">
                  <div className="flex items-center gap-1 text-gray-600 truncate" title={`New citizen signups in last 30 days: +${newCitizens30d}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">New (30d): <strong>+{newCitizens30d}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 truncate" title={`Inactive / non-engaging citizens: ${inactiveCitizens}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                    <span className="truncate">Inactive: <strong>{inactiveCitizens}</strong></span>
                  </div>
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

      {/* ── System Alerts & Quick Warning Feed (SRS Section 45.1) ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-50/80 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-extrabold text-gray-900">System Alerts & Quick Warnings</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Feed
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time operational alerts for expiring subscriptions, quota thresholds, domain issues & tenant status.
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges & Refresh */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {alertsData.criticalCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                {alertsData.criticalCount} Critical
              </span>
            )}
            {alertsData.warningCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {alertsData.warningCount} Warnings
              </span>
            )}
            {alertsData.criticalCount === 0 && alertsData.warningCount === 0 && !loadingStats && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                All Systems Healthy
              </span>
            )}
            <button
              onClick={() => {
                setLoadingStats(true);
                apiClient.get('/super-admin/dashboard/stats')
                  .then(res => setStats(res.data?.data || res.data))
                  .finally(() => setLoadingStats(false));
              }}
              title="Refresh Alert Feed"
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-2.5 border-b border-gray-100 bg-gray-50/40 flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'ALL', label: `All Alerts (${alertItems.length})` },
            { id: 'critical', label: `Critical (${alertsData.criticalCount})`, disabled: alertsData.criticalCount === 0 },
            { id: 'warning', label: `Warnings (${alertsData.warningCount})`, disabled: alertsData.warningCount === 0 },
            { id: 'subscription', label: 'Subscriptions & Renewals' },
            { id: 'storage', label: 'Storage & Quotas' },
            { id: 'domain', label: 'Custom Domains' },
            { id: 'tenant', label: 'Tenants' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAlertFilter(tab.id)}
              disabled={tab.disabled}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                alertFilter === tab.id
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/60 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Alerts Content Feed */}
        <div className="p-5">
          {loadingStats ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 border border-emerald-100 shadow-2xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">
                {alertFilter === 'ALL' ? 'No Active Operational Warnings' : 'No Alerts in this Category'}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 max-w-sm">
                {alertFilter === 'ALL'
                  ? 'All tenant subscriptions are active, storage quotas are within limits, and domains are functioning properly.'
                  : 'Try selecting "All Alerts" to view any other platform items.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between gap-3 ${
                    alert.severity === 'critical'
                      ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                      : alert.severity === 'warning'
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                      : 'bg-blue-50/40 border-blue-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
                      alert.severity === 'critical' ? 'bg-rose-100 text-rose-700' :
                      alert.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {alert.category === 'subscription' ? <Clock className="w-4 h-4" /> :
                       alert.category === 'storage' ? <HardDrive className="w-4 h-4" /> :
                       alert.category === 'domain' ? <Globe className="w-4 h-4" /> :
                       alert.category === 'tenant' ? <Users className="w-4 h-4" /> :
                       <AlertCircle className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${
                          alert.severity === 'critical' ? 'bg-rose-200/70 text-rose-800' :
                          alert.severity === 'warning' ? 'bg-amber-200/70 text-amber-800' :
                          'bg-blue-200/70 text-blue-800'
                        }`}>
                          {alert.severity}
                        </span>

                        {alert.tenantName && (
                          <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1">
                            <span>{alert.tenantName}</span>
                            {alert.tenantSlug && (
                              <span className="font-mono text-[9px] text-gray-400 font-normal">({alert.tenantSlug})</span>
                            )}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-gray-900 leading-snug">{alert.title}</h4>
                      <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{alert.message}</p>
                    </div>
                  </div>

                  {/* Action Link Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100/80 mt-1">
                    <span className="text-[10px] text-gray-400 font-medium">
                      Category: <strong className="capitalize text-gray-600">{alert.category}</strong>
                    </span>
                    <button
                      onClick={() => {
                        if (alert.actionUrl) navigate(alert.actionUrl);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                        alert.severity === 'critical'
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : alert.severity === 'warning'
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <span>{alert.actionLabel || 'Take Action'}</span>
                      <ChevronRight className="w-3 h-3 stroke-[3]" />
                    </button>
                  </div>
                </div>
              ))}
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
