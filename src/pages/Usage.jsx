import React, { useState } from 'react';
import { BarChart3, HardDrive, MessageSquare, Zap, Search, AlertTriangle, CheckCircle, AlertCircle, Eye, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

// Mock Overall Data
const overallUsage = {
  storage: { used: '4.2', limit: '10', unit: 'TB', percentage: 42 },
  sms: { used: '1.2M', limit: '5M', unit: 'Messages', percentage: 24 },
  bandwidth: { used: '850', limit: '1000', unit: 'GB', percentage: 85 },
};

// Mock Tenant Usage Data
const mockTenantsUsage = [
  { id: 't_1', name: 'Jan Seva Party', storage: 85, sms: 45, bandwidth: 92, status: 'warning', storageUsed: '425 GB', smsUsed: '45,000' },
  { id: 't_2', name: 'Vikas Morcha', storage: 20, sms: 10, bandwidth: 15, status: 'normal', storageUsed: '100 GB', smsUsed: '10,000' },
  { id: 't_3', name: 'Nayi Soch Foundation', storage: 98, sms: 99, bandwidth: 100, status: 'restricted', storageUsed: '490 GB', smsUsed: '99,000' },
  { id: 't_4', name: 'Yuva Shakti', storage: 45, sms: 60, bandwidth: 50, status: 'normal', storageUsed: '225 GB', smsUsed: '60,000' },
  { id: 't_5', name: 'Janata Vikas Dal', storage: 75, sms: 80, bandwidth: 82, status: 'warning', storageUsed: '375 GB', smsUsed: '80,000' },
];

const mockChartData = [
  { name: 'Jan', storage: 200, sms: 100 },
  { name: 'Feb', storage: 250, sms: 150 },
  { name: 'Mar', storage: 320, sms: 200 },
  { name: 'Apr', storage: 420, sms: 350 }, // Big jump
  { name: 'May', storage: 425, sms: 380 },
  { name: 'Jun', storage: 450, sms: 400 },
];

export default function Usage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  const filteredTenants = mockTenantsUsage.filter(t => 
    (filterStatus === 'all' || t.status === filterStatus) &&
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'warning': return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 w-max border border-orange-200"><AlertTriangle className="w-3 h-3"/> Approaching Limit</span>;
      case 'restricted': return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 w-max border border-red-200"><AlertCircle className="w-3 h-3"/> Limit Exceeded</span>;
      default: return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 w-max border border-emerald-200"><CheckCircle className="w-3 h-3"/> Normal</span>;
    }
  };

  const getBarColor = (percentage) => {
    if (percentage >= 95) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  const openTenantModal = (tenant) => {
    setSelectedTenant(tenant);
    setModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-8 w-full min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" /> Platform Usage & Limits
        </h1>
        <p className="text-sm text-gray-500 mt-1">Monitor global resource consumption and track per-tenant usage for billing.</p>
      </div>

      {/* Platform Overall Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Total DB Storage', icon: HardDrive, data: overallUsage.storage, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Total SMS Sent', icon: MessageSquare, data: overallUsage.sms, color: 'text-purple-600', bg: 'bg-purple-50' },
          { title: 'Global Bandwidth', icon: Zap, data: overallUsage.bandwidth, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.title}</h3>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-2xl font-black text-gray-900 leading-none">{stat.data.used}</span>
                  <span className="text-sm font-bold text-gray-500 mb-0.5">/ {stat.data.limit} {stat.data.unit}</span>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className={`h-full ${getBarColor(stat.data.percentage)}`} style={{ width: `${stat.data.percentage}%` }}></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs font-semibold text-gray-500">{stat.data.percentage}% Utilized</span>
              {stat.data.percentage > 80 && <span className="text-xs font-bold text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Critical</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Tenant Usage Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Table Toolbar */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <h3 className="text-base font-extrabold text-gray-900 hidden sm:block whitespace-nowrap">Tenant Usage Overview</h3>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="normal">Normal</option>
              <option value="warning">Warning (High Usage)</option>
              <option value="restricted">Restricted (Exceeded)</option>
            </select>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search tenant..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tenant Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-48">Storage Usage</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-48">SMS Usage</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTenants.map(tenant => (
                <tr key={tenant.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{tenant.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">ID: {tenant.id}</div>
                  </td>
                  
                  {/* Storage Progress */}
                  <td className="px-6 py-4">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-[11px] font-bold text-gray-700">{tenant.storageUsed}</span>
                      <span className="text-[10px] font-bold text-gray-400">{tenant.storage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`h-full rounded-full ${getBarColor(tenant.storage)}`} style={{ width: `${tenant.storage}%` }}></div>
                    </div>
                  </td>
                  
                  {/* SMS Progress */}
                  <td className="px-6 py-4">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-[11px] font-bold text-gray-700">{tenant.smsUsed}</span>
                      <span className="text-[10px] font-bold text-gray-400">{tenant.sms}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`h-full rounded-full ${getBarColor(tenant.sms)}`} style={{ width: `${tenant.sms}%` }}></div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(tenant.status)}
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openTenantModal(tenant)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                    No tenants found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Usage Modal */}
      {modalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-black text-gray-900">{selectedTenant.name} Usage Report</h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Billing cycle: 01 Sep - 30 Sep 2026</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              
              <div className="flex justify-between items-center mb-6">
                {getStatusBadge(selectedTenant.status)}
                <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                  Generate Invoice <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              {/* Chart */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-800 mb-4">Usage Trend (Last 6 Months)</h4>
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} dy={5} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                      <Bar dataKey="storage" name="Storage (GB)" fill="#4f46e5" radius={[2, 2, 0, 0]} barSize={10} />
                      <Bar dataKey="sms" name="SMS (Thousands)" fill="#10b981" radius={[2, 2, 0, 0]} barSize={10} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button className="w-full py-3 bg-white border-2 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50 rounded-xl text-sm font-bold text-indigo-700 transition-all">
                  Upgrade Plan Limits
                </button>
                {selectedTenant.status === 'restricted' ? (
                  <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all">
                    Remove Restriction
                  </button>
                ) : (
                  <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all">
                    Apply Soft Restriction
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
