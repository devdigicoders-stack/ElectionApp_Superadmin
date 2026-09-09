import React, { useState } from 'react';
import { ScrollText, Search, Shield, User, Globe, Trash2, Lock, AlertTriangle, Filter, Eye, X } from 'lucide-react';

const mockAuditLogs = [
  {
    id: 'log_1',
    action: 'TENANT_SUSPENDED',
    tenantName: 'Jan Seva Party',
    performedBy: { name: 'Super Admin', email: 'admin@platform.com', role: 'super_admin' },
    targetUser: { name: 'Ramesh Kumar', email: 'ramesh@janseva.com' },
    ipAddress: '103.21.12.45',
    details: { reason: 'Non-payment of subscription', affectedUsers: 12450 },
    createdAt: '2026-09-09 02:45:30',
  },
  {
    id: 'log_2',
    action: 'TENANT_IMPERSONATION_STARTED',
    tenantName: 'Vikas Morcha',
    performedBy: { name: 'Super Admin', email: 'admin@platform.com', role: 'super_admin' },
    targetUser: { name: 'Suresh Patel', email: 'suresh@vikasmorcha.com' },
    ipAddress: '103.21.12.45',
    details: { sessionId: 'imp_sess_ab12cd' },
    createdAt: '2026-09-09 01:15:00',
  },
  {
    id: 'log_3',
    action: 'SUBSCRIPTION_RENEWED',
    tenantName: 'Nayi Soch Foundation',
    performedBy: { name: 'Sneha Gupta (Staff)', email: 'sneha@platform.com', role: 'manager' },
    targetUser: null,
    ipAddress: '182.64.11.21',
    details: { plan: 'Pro', amount: '₹9,999', duration: '1 year' },
    createdAt: '2026-09-08 23:00:15',
  },
  {
    id: 'log_4',
    action: 'DOMAIN_VERIFIED',
    tenantName: 'Jan Seva Party',
    performedBy: { name: 'Super Admin', email: 'admin@platform.com', role: 'super_admin' },
    targetUser: null,
    ipAddress: '103.21.12.45',
    details: { domain: 'www.janseva.in', method: 'CNAME' },
    createdAt: '2026-09-08 20:30:00',
  },
  {
    id: 'log_5',
    action: 'ADMIN_PASSWORD_RESET',
    tenantName: null,
    performedBy: { name: 'Super Admin', email: 'admin@platform.com', role: 'super_admin' },
    targetUser: { name: 'Vikram Singh', email: 'vikram@platform.com' },
    ipAddress: '103.21.12.45',
    details: { method: 'Manual reset by super admin' },
    createdAt: '2026-09-08 18:00:45',
  },
  {
    id: 'log_6',
    action: 'TENANT_DELETED',
    tenantName: 'Old Party Foundation',
    performedBy: { name: 'Super Admin', email: 'admin@platform.com', role: 'super_admin' },
    targetUser: { name: 'Ravi Verma', email: 'ravi@oldparty.com' },
    ipAddress: '103.21.12.45',
    details: { permanent: true, dataRetained: false },
    createdAt: '2026-09-07 14:20:00',
  },
];

const ACTION_META = {
  TENANT_SUSPENDED: { label: 'Tenant Suspended', color: 'text-orange-700 bg-orange-50 border-orange-200', icon: AlertTriangle, iconColor: 'text-orange-500' },
  TENANT_IMPERSONATION_STARTED: { label: 'Impersonation Started', color: 'text-purple-700 bg-purple-50 border-purple-200', icon: Shield, iconColor: 'text-purple-500' },
  SUBSCRIPTION_RENEWED: { label: 'Subscription Renewed', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: ScrollText, iconColor: 'text-emerald-500' },
  DOMAIN_VERIFIED: { label: 'Domain Verified', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: Globe, iconColor: 'text-blue-500' },
  ADMIN_PASSWORD_RESET: { label: 'Password Reset', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: Lock, iconColor: 'text-yellow-500' },
  TENANT_DELETED: { label: 'Tenant Deleted', color: 'text-red-700 bg-red-50 border-red-200', icon: Trash2, iconColor: 'text-red-500' },
};

const ALL_ACTIONS = Object.keys(ACTION_META);

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);

  const filtered = mockAuditLogs.filter(log =>
    (filterAction === 'all' || log.action === filterAction) &&
    (
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.tenantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.targetUser?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getMeta = (action) => ACTION_META[action] || { label: action, color: 'text-gray-700 bg-gray-50 border-gray-200', icon: ScrollText, iconColor: 'text-gray-500' };

  return (
    <div className="p-4 sm:p-8 w-full min-h-screen bg-gray-50/50">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-indigo-600" /> System Audit Logs
        </h1>
        <p className="text-sm text-gray-500 mt-1">Complete security history — every action taken on the platform, who did it, when, and from where.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Events Today', value: '24', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'High Risk Actions', value: '3', color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Staff Activities', value: '8', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Super Admin Actions', value: '13', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} shrink-0`}>
              <Shield className={`w-5 h-5 ${card.color}`} />
            </div>
            <div>
              <div className={`text-2xl font-black ${card.color}`}>{card.value}</div>
              <div className="text-[11px] font-semibold text-gray-500 leading-tight">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative">
              <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={filterAction}
                onChange={e => setFilterAction(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">All Actions</option>
                {ALL_ACTIONS.map(a => (
                  <option key={a} value={a}>{ACTION_META[a].label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by action, tenant, user..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Performed By</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Target / Tenant</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(log => {
                const meta = getMeta(log.action);
                const IconComp = meta.icon;
                return (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-500">{log.createdAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${meta.color}`}>
                        <IconComp className={`w-3 h-3 ${meta.iconColor}`} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{log.performedBy.name}</div>
                      <div className="text-[11px] text-gray-500 font-medium">{log.performedBy.email}</div>
                      <div className="text-[10px] font-bold text-indigo-400 uppercase mt-0.5">{log.performedBy.role}</div>
                    </td>
                    <td className="px-6 py-4">
                      {log.tenantName && <div className="text-sm font-bold text-gray-800">{log.tenantName}</div>}
                      {log.targetUser && <div className="text-[11px] text-gray-500 font-medium">{log.targetUser.email}</div>}
                      {!log.tenantName && !log.targetUser && <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{log.ipAddress}</code>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-gray-400 font-medium">
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-indigo-600" /> Log Entry Details
              </h3>
              <button onClick={() => setSelectedLog(null)} className="p-2 rounded-full text-gray-400 hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Action', value: getMeta(selectedLog.action).label },
                { label: 'Timestamp', value: selectedLog.createdAt },
                { label: 'Performed By', value: `${selectedLog.performedBy.name} (${selectedLog.performedBy.role})` },
                { label: 'Email', value: selectedLog.performedBy.email },
                { label: 'Target User', value: selectedLog.targetUser ? `${selectedLog.targetUser.name} — ${selectedLog.targetUser.email}` : '—' },
                { label: 'Tenant', value: selectedLog.tenantName || '—' },
                { label: 'IP Address', value: selectedLog.ipAddress || '—' },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-start gap-4 border-b border-gray-50 pb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-32 shrink-0">{row.label}</span>
                  <span className="text-sm font-semibold text-gray-900 text-right">{row.value}</span>
                </div>
              ))}
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Additional Details</span>
                <pre className="bg-gray-50 rounded-xl p-4 text-xs font-mono text-gray-700 border border-gray-100 overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
