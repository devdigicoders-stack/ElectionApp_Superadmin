import React, { useState } from 'react';
import { 
  Receipt, Plus, MoreVertical, Eye, RefreshCw, ArrowUpCircle, 
  Clock, PauseCircle, PlayCircle, XCircle, AlertCircle, Calendar, 
  IndianRupee, Activity, TrendingUp, X
} from 'lucide-react';

const mockStats = {
  totalActive: 145,
  expiringSoon: 12,
  revenue: 245000,
  upgrades: 24
};

const mockSubscriptions = [
  { id: 'sub_1', tenant: 'Amit Sharma', plan: 'Pro', status: 'Active', startDate: '2023-01-15', endDate: '2024-01-15', price: 4999 },
  { id: 'sub_2', tenant: 'Priya Singh', plan: 'Premium', status: 'Expiring Soon', startDate: '2022-10-01', endDate: '2023-10-01', price: 49999 },
  { id: 'sub_3', tenant: 'Ravi Kumar', plan: 'Basic (Free)', status: 'Active', startDate: '2023-05-20', endDate: '2024-05-20', price: 0 },
  { id: 'sub_4', tenant: 'Anita Desai', plan: 'Pro', status: 'Paused', startDate: '2023-02-10', endDate: '2024-02-10', price: 4999 },
  { id: 'sub_5', tenant: 'Suresh Patel', plan: 'Trial', status: 'Active', startDate: '2023-09-01', endDate: '2023-09-15', price: 0 },
];

export default function Subscriptions() {
  const [activeTab, setActiveTab] = useState('All');
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });

  const filteredSubs = activeTab === 'All' 
    ? mockSubscriptions 
    : mockSubscriptions.filter(s => s.status === 'Expiring Soon');

  const openModal = (type, data = null) => {
    setModalConfig({ isOpen: true, type, data });
  };

  const closeModal = () => setModalConfig({ isOpen: false, type: null, data: null });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">ACTIVE</span>;
      case 'Expiring Soon': return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold border border-orange-200">EXPIRING SOON</span>;
      case 'Paused': return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold border border-yellow-200">PAUSED</span>;
      case 'Trial': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200">TRIAL</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold border border-gray-200">{status.toUpperCase()}</span>;
    }
  };

  return (
    <div className="p-4 sm:p-8 w-full min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-600" /> Client Subscriptions
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage billing, renewals, and client packages.</p>
        </div>
        <button onClick={() => openModal('CREATE')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
          <Plus className="w-5 h-5" /> Custom Subscription
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-0.5">Total Active</p>
            <h3 className="text-2xl font-black text-gray-900">{mockStats.totalActive}</h3>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-0.5">Expiring Soon</p>
            <h3 className="text-2xl font-black text-gray-900">{mockStats.expiringSoon}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-0.5">Est. Revenue</p>
            <h3 className="text-2xl font-black text-gray-900">₹{mockStats.revenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-0.5">Recent Upgrades</p>
            <h3 className="text-2xl font-black text-gray-900">{mockStats.upgrades}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('All')}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'All' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            All Subscriptions
          </button>
          <button 
            onClick={() => setActiveTab('Expiring Soon')}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Expiring Soon' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            Expiring Soon <span className="bg-orange-100 text-orange-700 py-0.5 px-2 rounded-full text-xs">{mockStats.expiringSoon}</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{sub.tenant}</div>
                    <div className="text-xs text-gray-500 mt-0.5 font-mono">ID: {sub.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{sub.plan}</div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center">
                      <IndianRupee className="w-3 h-3 mr-0.5" />{sub.price.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(sub.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" /> {sub.startDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" /> {sub.endDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openModal('VIEW', sub)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => openModal('RENEW', sub)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Renew Plan">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button onClick={() => openModal('UPGRADE', sub)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Upgrade Plan">
                        <ArrowUpCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => openModal('EXTEND', sub)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Extend Trial">
                        <Clock className="w-4 h-4" />
                      </button>
                      {sub.status === 'Paused' ? (
                        <button onClick={() => openModal('RESUME', sub)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Resume Plan">
                          <PlayCircle className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => openModal('PAUSE', sub)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Pause Plan">
                          <PauseCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => openModal('CANCEL', sub)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancel Plan">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between ${modalConfig.type === 'CANCEL' ? 'bg-red-50' : 'bg-gray-50'}`}>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {modalConfig.type === 'CREATE' && <><Plus className="w-5 h-5 text-indigo-600" /> Create Custom Plan</>}
                {modalConfig.type === 'VIEW' && <><Eye className="w-5 h-5 text-blue-600" /> Subscription Details</>}
                {modalConfig.type === 'RENEW' && <><RefreshCw className="w-5 h-5 text-emerald-600" /> Renew Subscription</>}
                {modalConfig.type === 'UPGRADE' && <><ArrowUpCircle className="w-5 h-5 text-indigo-600" /> Upgrade Plan</>}
                {modalConfig.type === 'EXTEND' && <><Clock className="w-5 h-5 text-purple-600" /> Extend Trial Period</>}
                {modalConfig.type === 'PAUSE' && <><PauseCircle className="w-5 h-5 text-yellow-600" /> Pause Subscription</>}
                {modalConfig.type === 'RESUME' && <><PlayCircle className="w-5 h-5 text-emerald-600" /> Resume Subscription</>}
                {modalConfig.type === 'CANCEL' && <><AlertCircle className="w-5 h-5 text-red-600" /> Cancel Subscription</>}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 p-1 rounded-md transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {/* Body */}
            <div className="p-6">
              
              {/* Dynamic Modal Content based on Type */}
              {modalConfig.type === 'VIEW' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">Client</p>
                      <h4 className="font-bold text-gray-900 text-lg">{modalConfig.data?.tenant}</h4>
                    </div>
                    {getStatusBadge(modalConfig.data?.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Plan</p>
                      <p className="font-bold text-gray-900">{modalConfig.data?.plan}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Price</p>
                      <p className="font-bold text-gray-900">₹{modalConfig.data?.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Start Date</p>
                      <p className="text-sm font-semibold text-gray-800">{modalConfig.data?.startDate}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">End Date</p>
                      <p className="text-sm font-semibold text-gray-800">{modalConfig.data?.endDate}</p>
                    </div>
                  </div>
                </div>
              )}

              {['CANCEL', 'PAUSE', 'RESUME'].includes(modalConfig.type) && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Are you sure you want to <strong>{modalConfig.type.toLowerCase()}</strong> the subscription for <span className="font-bold">{modalConfig.data?.tenant}</span>?
                  </p>
                  {modalConfig.type === 'CANCEL' && <p className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded-lg">This action is permanent and will immediately revoke client access.</p>}
                  {modalConfig.type === 'PAUSE' && <p className="text-xs text-yellow-600 font-medium">Billing and access will be paused until resumed manually.</p>}
                </div>
              )}

              {modalConfig.type === 'UPGRADE' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Select New Plan</label>
                    <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white">
                      <option>Pro (₹4,999/mo)</option>
                      <option>Premium (₹49,999/yr)</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">Prorated charges will be applied based on the remaining days of the current billing cycle.</p>
                </div>
              )}

              {modalConfig.type === 'EXTEND' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Extra Days to Add</label>
                    <input type="number" defaultValue={7} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm" />
                  </div>
                  <p className="text-xs text-gray-500">This will change the end date without generating an invoice.</p>
                </div>
              )}

              {['CREATE', 'RENEW'].includes(modalConfig.type) && (
                <div className="space-y-4">
                  {modalConfig.type === 'CREATE' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Select Client</label>
                      <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white">
                        <option>Amit Sharma</option>
                        <option>Priya Singh</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Subscription Plan</label>
                    <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white">
                      <option>Pro (Monthly)</option>
                      <option>Premium (Yearly)</option>
                      <option>Custom Pricing</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                      <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                      <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                Cancel
              </button>
              
              {modalConfig.type === 'CANCEL' ? (
                <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors">
                  Yes, Cancel Plan
                </button>
              ) : modalConfig.type === 'PAUSE' ? (
                <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg shadow-sm transition-colors">
                  Pause Plan
                </button>
              ) : modalConfig.type === 'VIEW' ? (
                <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-white bg-gray-800 hover:bg-gray-900 rounded-lg shadow-sm transition-colors">
                  Done
                </button>
              ) : (
                <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors">
                  Confirm & Save
                </button>
              )}
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
