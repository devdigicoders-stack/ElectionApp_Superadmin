import React, { useState } from 'react';
import { 
  Edit, Palette, Settings, UserPlus, 
  LogOut, History, ShieldAlert, CheckCircle2, XCircle, Plus, X 
} from 'lucide-react';

// Mock Data for the UI
const MOCK_CLIENTS = [
  { id: 1, name: 'Amit Sharma', slug: 'amitsharma', email: 'amit@example.com', status: 'active', createdAt: '2023-10-15' },
  { id: 2, name: 'Priya Singh', slug: 'priyasingh', email: 'priya@example.com', status: 'suspended', createdAt: '2024-01-22' },
  { id: 3, name: 'Ravi Kumar', slug: 'ravikumar', email: 'ravi@example.com', status: 'active', createdAt: '2024-03-10' },
];

export default function Clients() {
  const [clients] = useState(MOCK_CLIENTS);
  const [modalType, setModalType] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  const openModal = (type, client = null) => {
    setModalType(type);
    setSelectedClient(client);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedClient(null);
  };

  return (
    <div className="p-4 sm:p-8 w-full mx-auto font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Client Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage political clients, features, and branding.</p>
        </div>
        <button 
          onClick={() => openModal('ADD')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add New Client
        </button>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200" style={{ minHeight: '400px' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-900 font-semibold">
              <tr>
                <th className="py-4 px-6 font-medium">Client Details</th>
                <th className="py-4 px-6 font-medium">Domain (Slug)</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium">Registered</th>
                <th className="py-4 px-6 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-gray-900">{client.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{client.email}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-mono text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-md px-2 py-1">
                      {client.slug}.jansaas.com
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      client.status === 'active' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {client.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {client.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-500 font-medium">{client.createdAt}</td>
                  
                  {/* Actions Column - Expanded View */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => openModal('EDIT', client)} 
                        title="Edit Info"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openModal('BRANDING', client)} 
                        title="Branding & Theme"
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                      >
                        <Palette className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openModal('FEATURES', client)} 
                        title="Features Configuration"
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-5 bg-gray-200 mx-1"></div>
                      
                      <button 
                        onClick={() => openModal('STAFF', client)} 
                        title="Add Staff Account"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button 
                        title="Login as Client"
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openModal('HISTORY', client)} 
                        title="Impersonation Logs"
                        className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      <div className="w-px h-5 bg-gray-200 mx-1"></div>
                      
                      <button 
                        onClick={() => openModal('SUSPEND', client)} 
                        title={client.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                        className={`p-1.5 rounded-md transition-colors ${
                          client.status === 'active' 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        <ShieldAlert className="w-4 h-4" /> 
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable Modal Component (Mock) */}
      {modalType && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-none shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {modalType === 'ADD' && 'Register New Client'}
                {modalType === 'EDIT' && `Edit Information`}
                {modalType === 'BRANDING' && `Theme & Branding`}
                {modalType === 'FEATURES' && `Enable/Disable Features`}
                {modalType === 'STAFF' && `Create Staff Account`}
                {modalType === 'HISTORY' && `Access Logs`}
                {modalType === 'SUSPEND' && `Confirm Action`}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-none transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              {selectedClient && modalType !== 'ADD' && (
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Target Client</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-none flex items-center justify-center font-bold text-lg">
                      {selectedClient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selectedClient.name}</p>
                      <p className="text-xs text-gray-500">{selectedClient.slug}.jansaas.com</p>
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'ADD' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                    <input type="text" className="w-full border border-gray-300 rounded-none shadow-sm px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="e.g. Rahul Kumar" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" className="w-full border border-gray-300 rounded-none shadow-sm px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="rahul@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain (Slug)</label>
                    <div className="flex shadow-sm">
                      <input type="text" className="flex-1 border border-gray-300 rounded-none px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="rahulkumar" />
                      <span className="inline-flex items-center px-4 rounded-none border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-medium">.jansaas.com</span>
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'EDIT' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                    <input type="text" defaultValue={selectedClient?.name} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" defaultValue={selectedClient?.email} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" />
                  </div>
                </div>
              )}

              {modalType === 'BRANDING' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Theme Color</label>
                    <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
                      <input type="color" defaultValue="#2563EB" className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent" />
                      <span className="text-sm font-mono text-gray-700 font-medium">#2563EB</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Theme Color</label>
                    <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
                      <input type="color" defaultValue="#F59E0B" className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent" />
                      <span className="text-sm font-mono text-gray-700 font-medium">#F59E0B</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Logo</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="space-y-1 text-center">
                        <Palette className="mx-auto h-10 w-10 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center mt-2">
                          <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input type="file" className="sr-only" />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG up to 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'FEATURES' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-800">
                    Toggle the features available for this client's portal. Features will instantly appear or disappear from their dashboard.
                  </p>
                  {['Complaints Management', 'Events Module', 'Opinion Polls', 'Poster Generator', 'Membership & ID Cards'].map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-gray-300 transition-colors">
                      <span className="text-sm font-medium text-gray-800">{feature}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={idx % 2 === 0} />
                        <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {modalType === 'STAFF' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 mb-4">Create a new staff member account for this client's portal.</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="e.g. Rahul Team" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="staff@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                    <input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="••••••••" />
                  </div>
                </div>
              )}

              {modalType === 'HISTORY' && (
                <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold text-gray-900">Date & Time</th>
                        <th className="py-3.5 px-4 font-semibold text-gray-900">Accessed By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-700">Today, 14:30 PM</td>
                        <td className="py-3 px-4 text-blue-600 font-medium">Super Admin (You)</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-700">Feb 05, 2024 09:15 AM</td>
                        <td className="py-3 px-4 text-gray-600">Support Team</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {modalType === 'SUSPEND' && (
                <div className="text-center py-6">
                  <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${selectedClient?.status === 'active' ? 'bg-red-100' : 'bg-green-100'}`}>
                    <ShieldAlert className={`h-8 w-8 ${selectedClient?.status === 'active' ? 'text-red-600' : 'text-green-600'}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedClient?.status === 'active' ? 'Suspend this client?' : 'Activate this client?'}
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    {selectedClient?.status === 'active' 
                      ? `Are you sure you want to suspend ${selectedClient?.name}'s account? They and their staff will lose access immediately.`
                      : `Are you sure you want to reactivate ${selectedClient?.name}'s account? They will regain full access to the portal.`}
                  </p>
                </div>
              )}
              
              <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-gray-100">
                <button onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                  {modalType === 'HISTORY' ? 'Close' : 'Cancel'}
                </button>
                {modalType !== 'HISTORY' && (
                  <button onClick={closeModal} className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${
                    modalType === 'SUSPEND' && selectedClient?.status === 'active'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}>
                    {modalType === 'SUSPEND' ? 'Confirm Action' : 'Save Changes'}
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
