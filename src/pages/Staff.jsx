import React, { useState } from 'react';
import { 
  UserPlus, Edit, Trash2, Eye, ShieldAlert, Key, 
  CheckCircle, Shield, Mail, Phone, Calendar, Search, ShieldCheck, X
} from 'lucide-react';

const mockStaff = [
  { id: 'emp_1', name: 'Ramesh Verma', email: 'ramesh@politicaladmin.com', phone: '+91 9876543210', role: 'Manager', status: 'Active', joined: '2023-01-10', permissions: ['Users', 'Billing'], assignedArea: 'Delhi Central', isSuperAdmin: false },
  { id: 'emp_2', name: 'Sneha Gupta', email: 'sneha@politicaladmin.com', phone: '+91 8765432109', role: 'Support', status: 'Active', joined: '2023-03-15', permissions: ['Users'], assignedArea: 'Noida', isSuperAdmin: false },
  { id: 'emp_3', name: 'Vikram Singh', email: 'vikram@politicaladmin.com', phone: '+91 7654321098', role: 'Manager', status: 'Blocked', joined: '2022-11-05', permissions: ['Users', 'Billing', 'Settings'], assignedArea: 'All', isSuperAdmin: true },
  { id: 'emp_4', name: 'Pooja Rani', email: 'pooja@politicaladmin.com', phone: '+91 6543210987', role: 'Support', status: 'Active', joined: '2023-08-20', permissions: [], assignedArea: 'Gurugram', isSuperAdmin: false },
];

export default function Staff() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });

  const filteredStaff = mockStaff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (type, data = null) => setModalConfig({ isOpen: true, type, data });
  const closeModal = () => setModalConfig({ isOpen: false, type: null, data: null });

  const getRoleBadge = (role) => {
    return role === 'Manager' 
      ? <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold border border-purple-200">{role}</span>
      : <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200">{role}</span>;
  };

  const getStatusBadge = (status) => {
    return status === 'Active'
      ? <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">ACTIVE</span>
      : <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-200">BLOCKED</span>;
  };

  return (
    <div className="p-4 sm:p-8 w-full min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" /> Admin & Staff Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage company managers, support agents, and roles.</p>
        </div>
        <button onClick={() => openModal('ADD')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
          <UserPlus className="w-5 h-5" /> Add New Staff
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
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
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Employee Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900">{staff.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 font-mono">ID: {staff.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 flex items-center gap-1.5 mb-1">
                      <Mail className="w-3.5 h-3.5 text-gray-400" /> {staff.email}
                    </div>
                    <div className="text-sm text-gray-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> {staff.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {getRoleBadge(staff.role)}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {getStatusBadge(staff.status)}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openModal('VIEW', staff)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => openModal('EDIT', staff)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit Employee">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => openModal('RESET_PWD', staff)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Reset Password">
                        <Key className="w-4 h-4" />
                      </button>
                      
                      {staff.status === 'Active' ? (
                        <button onClick={() => openModal('BLOCK', staff)} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Block Employee">
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => openModal('UNBLOCK', staff)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Unblock Employee">
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}

                      <button onClick={() => openModal('DELETE', staff)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Employee">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No staff found matching your search.
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
            <div className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between ${['DELETE', 'BLOCK'].includes(modalConfig.type) ? 'bg-red-50' : 'bg-gray-50'}`}>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {modalConfig.type === 'ADD' && <><UserPlus className="w-5 h-5 text-indigo-600" /> Add New Staff</>}
                {modalConfig.type === 'EDIT' && <><Edit className="w-5 h-5 text-emerald-600" /> Edit Employee</>}
                {modalConfig.type === 'VIEW' && <><Eye className="w-5 h-5 text-blue-600" /> Employee Details</>}
                {modalConfig.type === 'RESET_PWD' && <><Key className="w-5 h-5 text-purple-600" /> Reset Password</>}
                {modalConfig.type === 'BLOCK' && <><ShieldAlert className="w-5 h-5 text-orange-600" /> Block Employee</>}
                {modalConfig.type === 'UNBLOCK' && <><ShieldCheck className="w-5 h-5 text-emerald-600" /> Unblock Employee</>}
                {modalConfig.type === 'DELETE' && <><Trash2 className="w-5 h-5 text-red-600" /> Delete Employee</>}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 p-1 rounded-md transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {/* Body */}
            <div className="p-6">
              
              {/* ADD / EDIT Form */}
              {['ADD', 'EDIT'].includes(modalConfig.type) && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <input type="text" defaultValue={modalConfig.data?.name} placeholder="e.g. Rahul Sharma" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <input type="email" defaultValue={modalConfig.data?.email} placeholder="name@company.com" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                      <input type="text" defaultValue={modalConfig.data?.phone} placeholder="+91 " className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                      <select defaultValue={modalConfig.data?.role || 'Support'} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white">
                        <option value="Support">Support</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Assigned Area</label>
                      <select defaultValue={modalConfig.data?.assignedArea || 'All'} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white">
                        <option value="All">All Areas</option>
                        <option value="Delhi Central">Delhi Central</option>
                        <option value="Noida">Noida</option>
                        <option value="Gurugram">Gurugram</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input type="checkbox" id="isSuperAdmin" defaultChecked={modalConfig.data?.isSuperAdmin} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                      <label htmlFor="isSuperAdmin" className="text-sm font-semibold text-gray-700">Is Super Admin?</label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Permissions</label>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {['Users', 'Billing', 'Settings', 'Reports', 'Roles'].map(perm => (
                        <label key={perm} className="flex items-center gap-1.5 text-sm text-gray-600">
                          <input type="checkbox" defaultChecked={modalConfig.data?.permissions?.includes(perm)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                          {perm}
                        </label>
                      ))}
                    </div>
                  </div>
                  {modalConfig.type === 'ADD' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Temporary Password</label>
                      <input type="text" placeholder="Will be sent to email" className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-500" disabled />
                    </div>
                  )}
                </div>
              )}

              {/* VIEW Details */}
              {modalConfig.type === 'VIEW' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{modalConfig.data?.name}</h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {modalConfig.data?.id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(modalConfig.data?.status)}
                      {getRoleBadge(modalConfig.data?.role)}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" /> {modalConfig.data?.email}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" /> {modalConfig.data?.phone}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" /> Joined: {modalConfig.data?.joined}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Access & Permissions</p>
                    <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-700">
                      <div className="flex gap-2"><span className="font-semibold text-gray-500">Area:</span> {modalConfig.data?.assignedArea || 'N/A'}</div>
                      <div className="flex gap-2"><span className="font-semibold text-gray-500">Super Admin:</span> {modalConfig.data?.isSuperAdmin ? 'Yes' : 'No'}</div>
                      <div className="col-span-2 flex gap-2"><span className="font-semibold text-gray-500">Permissions:</span> {modalConfig.data?.permissions?.join(', ') || 'None'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* RESET PASSWORD */}
              {modalConfig.type === 'RESET_PWD' && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    This will invalidate the current password for <span className="font-bold">{modalConfig.data?.name}</span> and send a secure password reset link to their registered email address: <br/><strong className="text-indigo-600">{modalConfig.data?.email}</strong>.
                  </p>
                </div>
              )}

              {/* BLOCK / UNBLOCK / DELETE Confirmations */}
              {['BLOCK', 'UNBLOCK', 'DELETE'].includes(modalConfig.type) && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Are you sure you want to <strong>{modalConfig.type.toLowerCase()}</strong> employee <span className="font-bold">{modalConfig.data?.name}</span>?
                  </p>
                  {modalConfig.type === 'DELETE' && <p className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded-lg mt-3">This action will completely remove them from the system and revoke all access immediately.</p>}
                  {modalConfig.type === 'BLOCK' && <p className="text-xs text-orange-600 font-medium bg-orange-50 p-2 rounded-lg mt-3">They will instantly be logged out and lose access to the dashboard until unblocked.</p>}
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                Cancel
              </button>
              
              {modalConfig.type === 'DELETE' ? (
                <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors">
                  Delete Employee
                </button>
              ) : modalConfig.type === 'BLOCK' ? (
                <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition-colors">
                  Block Access
                </button>
              ) : modalConfig.type === 'UNBLOCK' ? (
                <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors">
                  Unblock Access
                </button>
              ) : modalConfig.type === 'RESET_PWD' ? (
                <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors">
                  Send Reset Link
                </button>
              ) : modalConfig.type === 'VIEW' ? (
                <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-white bg-gray-800 hover:bg-gray-900 rounded-lg shadow-sm transition-colors">
                  Done
                </button>
              ) : (
                <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors">
                  Save Details
                </button>
              )}
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
