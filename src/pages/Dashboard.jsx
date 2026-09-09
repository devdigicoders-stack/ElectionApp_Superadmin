import React from 'react';
import { 
  Users, UserCheck, Clock, AlertTriangle, Database, ArrowUpRight, ArrowDownRight, 
  Calendar, Plus, UserPlus, Receipt, UserMinus, FileText, Globe, MoreHorizontal,
  LayoutGrid, UserCog, Settings, FileBarChart, BarChart3
} from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart 
} from 'recharts';

const platformGrowthData = [
  { name: 'Jan', total: 60000, new: 30000 }, { name: 'Feb', total: 70000, new: 35000 },
  { name: 'Mar', total: 65000, new: 32000 }, { name: 'Apr', total: 80000, new: 40000 },
  { name: 'May', total: 85000, new: 42000 }, { name: 'Jun', total: 95000, new: 48000 },
  { name: 'Jul', total: 110000, new: 55000 }, { name: 'Aug', total: 123450, new: 61000 },
  { name: 'Sep', total: 105000, new: 52000 }, { name: 'Oct', total: 125000, new: 62000 },
  { name: 'Nov', total: 120000, new: 60000 }, { name: 'Dec', total: 140000, new: 70000 },
];

const tenantStatusData = [
  { name: 'Active', value: 98, color: '#047857' },
  { name: 'Trial', value: 12, color: '#FCD34D' },
  { name: 'Expired', value: 10, color: '#EF4444' },
  { name: 'Suspended', value: 4, color: '#059669' }, // Using a different shade for suspended
];

const revenueData = [
  { name: 'Jan', val: 300 }, { name: 'Feb', val: 400 }, { name: 'Mar', val: 350 },
  { name: 'Apr', val: 500 }, { name: 'May', val: 450 }, { name: 'Jun', val: 600 },
  { name: 'Jul', val: 650 }, { name: 'Aug', val: 750 }, { name: 'Sep', val: 800 },
  { name: 'Oct', val: 950 }, { name: 'Nov', val: 1000 }, { name: 'Dec', val: 1245 },
];

const TopTenants = [
  { id: 1, name: 'Jan Seva Party', users: '12,450', status: 'Active' },
  { id: 2, name: 'Vikas Morcha', users: '8,920', status: 'Active' },
  { id: 3, name: 'Nayi Soch Foundation', users: '6,780', status: 'Trial' },
  { id: 4, name: 'Janata Vikas Dal', users: '5,430', status: 'Active' },
  { id: 5, name: 'Yuva Shakti', users: '4,980', status: 'Expired' },
];

const RecentTenants = [
  { id: 1, name: 'Jan Seva Party', leader: 'Ramesh Kumar', plan: 'Pro', users: '12,450', status: 'Active', expiry: '21 Dec 2025' },
  { id: 2, name: 'Vikas Morcha', leader: 'Suresh Patel', plan: 'Basic', users: '2,340', status: 'Trial', expiry: '15 Jan 2026' },
  { id: 3, name: 'Nayi Soch Foundation', leader: 'Anita Singh', plan: 'Premium', users: '25,600', status: 'Active', expiry: '10 Nov 2025' },
  { id: 4, name: 'Janata Vikas Dal', leader: 'Vikram Rao', plan: 'Basic', users: '980', status: 'Expired', expiry: '01 Oct 2025' },
  { id: 5, name: 'Yuva Shakti', leader: 'Amit Yadav', plan: 'Pro', users: '8,420', status: 'Active', expiry: '18 Jan 2026' },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#072F2B] text-white p-3 rounded-lg shadow-xl border border-[#0B4640] text-sm">
        <p className="font-bold mb-1">{payload[0].payload.name} 2026</p>
        <p className="text-emerald-400 font-semibold">{payload[0].value.toLocaleString()} users</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  return (
    <div className="space-y-6 pb-10 text-gray-800">
      
      {/* Welcome Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl">👋</div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Good Morning, Super Admin</h1>
            <p className="text-sm font-medium text-gray-500 mt-0.5">Here's what's happening on your platform today.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-700">Monday, 08 Sep 2026</span>
              <span className="text-[10px] font-semibold text-gray-400">Make Impact at Scale</span>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-[#072F2B] hover:bg-[#0B4640] text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md">
            <Plus className="w-4 h-4" strokeWidth={3} />
            Add New Tenant
          </button>
        </div>
      </div>

      {/* Top Stats - 6 Columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { title: 'Total Tenants', value: '120', icon: Users, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', trend: '+12%', trendUp: true },
          { title: 'Active Tenants', value: '98', icon: UserCheck, iconColor: 'text-green-600', iconBg: 'bg-green-50', trend: '+8%', trendUp: true },
          { title: 'Trial Tenants', value: '12', icon: Clock, iconColor: 'text-red-500', iconBg: 'bg-red-50', trend: '-4%', trendUp: false },
          { title: 'Expired Tenants', value: '10', icon: AlertTriangle, iconColor: 'text-red-600', iconBg: 'bg-red-50', trend: '+2%', trendUp: true },
          { title: 'Total Users', value: '2,45,000', icon: Users, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', trend: '+18%', trendUp: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-none">{stat.value}</h3>
                <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">{stat.title}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              {stat.trendUp ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
              <span className={`text-xs font-bold ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>{stat.trend}</span>
              <span className="text-[10px] font-semibold text-gray-400">from last month</span>
            </div>
          </div>
        ))}
        
        {/* Storage Card - Custom */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-50">
              <Database className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
            </div>
            <div className="w-full">
              <h3 className="text-2xl font-black text-gray-900 leading-none">68%</h3>
              <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">Storage Usage</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-100 rounded-full h-2 mb-1.5">
              <div className="bg-[#072F2B] h-2 rounded-full" style={{ width: '68%' }}></div>
            </div>
            <div className="flex justify-end">
              <span className="text-[10px] font-bold text-gray-400">340 GB of 500 GB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Growth, Status, Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Platform Growth */}
        <div className="xl:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-extrabold text-gray-900">Platform Growth</h3>
            <select className="text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none">
              <option>Last 12 Months</option>
            </select>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={platformGrowthData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }} tickFormatter={(value) => value >= 1000 ? `${value/1000}K` : value} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="new" barSize={12} fill="#bbf7d0" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="total" stroke="#072F2B" strokeWidth={3} dot={{ r: 4, fill: '#072F2B', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#072F2B]"></div>
              <span className="text-xs font-bold text-gray-600">Total Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#bbf7d0]"></div>
              <span className="text-xs font-bold text-gray-600">New Users</span>
            </div>
          </div>
        </div>

        {/* Tenant Status Donut */}
        <div className="xl:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-extrabold text-gray-900">Tenant Status</h3>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={tenantStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                  {tenantStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-gray-900">120</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase">Tenants</span>
            </div>
          </div>
          <div className="space-y-3 mt-2">
            {tenantStatusData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs font-bold text-gray-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-900">{item.value}</span>
                  <span className="text-[10px] font-semibold text-gray-400 w-10 text-right">({((item.value/124)*100).toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="xl:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-extrabold text-gray-900">Recent Activities</h3>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {[
              { title: 'New tenant registered', sub: 'Jan Seva Party', time: '10 min ago', icon: UserPlus, bg: 'bg-emerald-50', color: 'text-emerald-600' },
              { title: 'Subscription renewed', sub: 'Vikas Morcha', time: '2 hours ago', icon: Receipt, bg: 'bg-green-50', color: 'text-green-600' },
              { title: 'Tenant suspended', sub: 'Nayi Soch Foundation', time: '5 hours ago', icon: UserMinus, bg: 'bg-red-50', color: 'text-red-500' },
              { title: 'New plan created', sub: 'Premium Plan', time: '1 day ago', icon: FileText, bg: 'bg-blue-50', color: 'text-blue-600' },
              { title: 'Custom domain connected', sub: 'janseva.org', time: '1 day ago', icon: Globe, bg: 'bg-emerald-50', color: 'text-emerald-600' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.bg}`}>
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800 leading-tight">{activity.title}</p>
                  <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{activity.sub}</p>
                </div>
                <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lower Middle Row: Top Tenants, Revenue, Modules */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Top Tenants Table */}
        <div className="xl:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-gray-900">Top Tenants by Users</h3>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2 text-[10px] font-bold text-gray-400 uppercase">#</th>
                  <th className="py-2 text-[10px] font-bold text-gray-400 uppercase">Tenant</th>
                  <th className="py-2 text-[10px] font-bold text-gray-400 uppercase text-right">Users</th>
                  <th className="py-2 text-[10px] font-bold text-gray-400 uppercase text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {TopTenants.map((t) => (
                  <tr key={t.id}>
                    <td className="py-3 text-xs font-bold text-gray-500">{t.id}</td>
                    <td className="py-3 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px]">Logo</div>
                      <span className="text-xs font-bold text-gray-800">{t.name}</span>
                    </td>
                    <td className="py-3 text-xs font-bold text-gray-600 text-right">{t.users}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase ${
                        t.status === 'Active' ? 'bg-green-100 text-green-700' :
                        t.status === 'Trial' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscription Revenue */}
        <div className="xl:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-gray-900">Subscription Revenue</h3>
            <select className="text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
              <option>This Year</option>
            </select>
          </div>
          <div className="mb-4">
            <h2 className="text-3xl font-black text-gray-900">₹12,45,000</h2>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-600">+26%</span>
              <span className="text-[10px] font-semibold text-gray-400">from last year</span>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} dy={5} />
                <YAxis axisLine={false} tickLine={false} tick={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                <Bar dataKey="val" fill="#072F2B" radius={[2, 2, 0, 0]} barSize={16}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index > 8 ? '#072F2B' : '#6ee7b7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Module Usage */}
        <div className="xl:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-extrabold text-gray-900">Module Usage</h3>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-5 flex-1">
            {[
              { name: 'Development Works', icon: FileBarChart, val: 78 },
              { name: 'Complaints', icon: AlertTriangle, val: 62 },
              { name: 'Events', icon: Calendar, val: 58 },
              { name: 'Poll & Surveys', icon: FileText, val: 46 },
              { name: 'Membership', icon: Users, val: 52 },
              { name: 'Poster Generator', icon: LayoutGrid, val: 38 },
            ].map((mod, i) => (
              <div key={i} className="flex items-center gap-3">
                <mod.icon className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-xs font-bold text-gray-700 w-32 truncate">{mod.name}</span>
                <span className="text-[10px] font-bold text-gray-500 w-8 text-right">{mod.val}%</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#072F2B] rounded-full" style={{ width: `${mod.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row: Recent Tenants & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Recent Tenants (Wide Table) */}
        <div className="xl:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-gray-900">Recent Tenants</h3>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-2 text-[10px] font-bold text-gray-400 uppercase">#</th>
                  <th className="py-3 px-2 text-[10px] font-bold text-gray-400 uppercase">Tenant Name</th>
                  <th className="py-3 px-2 text-[10px] font-bold text-gray-400 uppercase">Leader / Organization</th>
                  <th className="py-3 px-2 text-[10px] font-bold text-gray-400 uppercase">Plan</th>
                  <th className="py-3 px-2 text-[10px] font-bold text-gray-400 uppercase">Users</th>
                  <th className="py-3 px-2 text-[10px] font-bold text-gray-400 uppercase">Status</th>
                  <th className="py-3 px-2 text-[10px] font-bold text-gray-400 uppercase">Expiry Date</th>
                  <th className="py-3 px-2 text-[10px] font-bold text-gray-400 uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {RecentTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-2 text-xs font-bold text-gray-500">{t.id}</td>
                    <td className="py-3 px-2 text-xs font-bold text-gray-900">{t.name}</td>
                    <td className="py-3 px-2 text-xs font-semibold text-gray-600">{t.leader}</td>
                    <td className="py-3 px-2 text-xs font-semibold text-gray-600">{t.plan}</td>
                    <td className="py-3 px-2 text-xs font-bold text-gray-700">{t.users}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2.5 py-1 text-[9px] font-black rounded-full uppercase ${
                        t.status === 'Active' ? 'bg-green-100 text-green-700' :
                        t.status === 'Trial' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs font-semibold text-gray-500">{t.expiry}</td>
                    <td className="py-3 px-2 text-center">
                      <button className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="xl:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-base font-extrabold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3 flex-1">
            {[
              { icon: UserPlus, label: 'Add New Tenant' },
              { icon: FileText, label: 'Create Plan' },
              { icon: LayoutGrid, label: 'Manage Modules' },
              { icon: UserCog, label: 'Add Staff' },
              { icon: Receipt, label: 'View Subscriptions' },
              { icon: Globe, label: 'Domain Settings' },
              { icon: Settings, label: 'System Settings' },
              { icon: BarChart3, label: 'View Reports' },
            ].map((action, i) => (
              <button key={i} className="flex flex-col items-center justify-center gap-2 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all group">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                  <action.icon className="w-4 h-4 text-gray-600 group-hover:text-[#072F2B]" />
                </div>
                <span className="text-[9px] font-bold text-gray-600 text-center leading-tight px-1">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
