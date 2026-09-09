import React, { useState } from 'react';
import { 
  Globe, Plus, ShieldCheck, Trash2, Edit, AlertCircle, 
  Search, CheckCircle, Clock, XCircle, Link, Copy, Server
} from 'lucide-react';

const mockDomains = [
  { id: 't_1', tenant: 'Amit Sharma', domain: 'www.amitsharma.in', status: 'verified', method: 'CNAME', lastChecked: '2023-09-08 10:00 AM' },
  { id: 't_2', tenant: 'Priya Singh', domain: 'neta-priya.com', status: 'pending', method: 'TXT', lastChecked: '2023-09-09 01:15 PM' },
  { id: 't_3', tenant: 'Ravi Kumar', domain: null, status: 'unconfigured', method: null, lastChecked: null },
  { id: 't_4', tenant: 'Anita Desai', domain: 'anitadesai.org', status: 'failed', method: 'AUTO', lastChecked: '2023-09-09 09:30 AM' },
];

export default function Domains() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });

  const filteredDomains = mockDomains.filter(d => 
    (activeTab === 'all' || d.status === activeTab) &&
    (d.tenant.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (d.domain && d.domain.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const openModal = (type, data = null) => setModalConfig({ isOpen: true, type, data });
  const closeModal = () => setModalConfig({ isOpen: false, type: null, data: null });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'verified': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 flex items-center gap-1 w-max"><CheckCircle className="w-3.5 h-3.5"/> VERIFIED</span>;
      case 'pending': return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold border border-orange-200 flex items-center gap-1 w-max"><Clock className="w-3.5 h-3.5"/> PENDING</span>;
      case 'failed': return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-200 flex items-center gap-1 w-max"><XCircle className="w-3.5 h-3.5"/> FAILED</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold border border-gray-200 w-max">UNCONFIGURED</span>;
    }
  };

  const tabs = [
    { id: 'all', label: 'All Clients' },
    { id: 'pending', label: 'Pending Verification' },
    { id: 'verified', label: 'Verified Domains' },
    { id: 'failed', label: 'Failed Checks' },
  ];

  return (
    <div className="p-4 sm:p-8 w-full min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-600" /> Custom Domain Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Configure and verify white-labeled domains for tenants.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 hide-scrollbar">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by tenant or domain..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Client (Tenant)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Custom Domain</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Checked</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDomains.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900">{item.tenant}</div>
                    <div className="text-xs text-gray-500 mt-0.5 font-mono">ID: {item.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.domain ? (
                      <div className="flex items-center gap-2">
                        <Link className="w-4 h-4 text-indigo-500" />
                        <span className="font-semibold text-gray-800">{item.domain}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.lastChecked || '--'}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      
                      {item.status === 'unconfigured' ? (
                        <button onClick={() => openModal('SET', item)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold px-3">
                          <Plus className="w-4 h-4" /> Add Domain
                        </button>
                      ) : (
                        <>
                          <button onClick={() => openModal('SET', item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Domain">
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button onClick={() => openModal('VERIFY', item)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Check / Verify DNS">
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                          
                          <button onClick={() => openModal('DELETE', item)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove Domain">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                    </div>
                  </td>
                </tr>
              ))}
              {filteredDomains.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No domains found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between ${modalConfig.type === 'DELETE' ? 'bg-red-50' : 'bg-gray-50'}`}>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {modalConfig.type === 'SET' && <><Globe className="w-5 h-5 text-indigo-600" /> Configure Domain</>}
                {modalConfig.type === 'VERIFY' && <><ShieldCheck className="w-5 h-5 text-emerald-600" /> Verify Domain</>}
                {modalConfig.type === 'DELETE' && <><Trash2 className="w-5 h-5 text-red-600" /> Remove Domain</>}
              </h3>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-500 uppercase">Tenant</span>
                <span className="font-bold text-gray-900">{modalConfig.data?.tenant}</span>
              </div>

              {modalConfig.type === 'SET' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Enter Custom Domain</label>
                  <input 
                    type="text" 
                    defaultValue={modalConfig.data?.domain || ''} 
                    placeholder="e.g. www.rajeshsharma.in" 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium" 
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-indigo-400" />
                    Ensure the client has pointed their DNS A Record or CNAME to our servers before setting this up.
                  </p>
                </div>
              )}

              {modalConfig.type === 'VERIFY' && (
                <div className="space-y-4">
                  <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                    <p className="text-xs font-semibold text-indigo-600 uppercase mb-1">Target Domain</p>
                    <p className="font-bold text-indigo-900">{modalConfig.data?.domain}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Verification Method</label>
                    <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white">
                      <option value="AUTO">AUTO (Detect CNAME/A Record)</option>
                      <option value="CNAME">CNAME Validation</option>
                      <option value="TXT">TXT Record Validation</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="forceVerify" className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" />
                    <label htmlFor="forceVerify" className="text-sm font-semibold text-gray-700">Force Verify (Bypass DNS check delay)</label>
                  </div>
                </div>
              )}

              {modalConfig.type === 'DELETE' && (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-600 mb-3">
                    Are you sure you want to remove the domain <strong className="text-gray-900">{modalConfig.data?.domain}</strong>?
                  </p>
                  <p className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded-lg">
                    This will immediately break the white-label routing for this tenant. Traffic will no longer reach their profile.
                  </p>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                Cancel
              </button>
              
              {modalConfig.type === 'DELETE' ? (
                <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              ) : modalConfig.type === 'VERIFY' ? (
                <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Run Verification
                </button>
              ) : (
                <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Save Domain
                </button>
              )}
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
