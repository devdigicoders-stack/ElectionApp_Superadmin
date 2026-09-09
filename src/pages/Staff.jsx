import React, { useState, useEffect } from 'react';
import {
  UserPlus, Edit, Trash2, Eye, ShieldAlert, Key,
  Shield, Mail, Phone, Search, ShieldCheck, X, Loader2, RefreshCw
} from 'lucide-react';
import staffService from '../services/staff.service';

// ── Fallback data — backend se na aaye toh yeh use hoga ──────
const DEFAULT_ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'sales_manager', label: 'Sales Manager' },
  { value: 'support_executive', label: 'Support Executive' },
  { value: 'technical_support', label: 'Technical Support' },
  { value: 'finance_manager', label: 'Finance Manager' },
];

const DEFAULT_PERMISSIONS = [
  'tenants:read', 'tenants:create', 'tenants:impersonate', 'tenants:domain',
  'plans:read', 'subscriptions:read', 'subscriptions:manage',
  'invoices:read', 'revenue:read', 'audit_logs:read',
  'complaints:read', 'usage:read', 'system:health',
];

const emptyForm = { name: '', email: '', password: '', role: 'support_executive', phone: '', permissions: [] };

// ── Sub-components ────────────────────────────────────────────
function RoleBadge({ role, roles }) {
  const map = {
    super_admin: 'bg-red-100 text-red-700 border-red-200',
    sales_manager: 'bg-purple-100 text-purple-700 border-purple-200',
    support_executive: 'bg-blue-100 text-blue-700 border-blue-200',
    technical_support: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    finance_manager: 'bg-amber-100 text-amber-700 border-amber-200',
  };
  const label = roles?.find(r => r.value === role)?.label || role;
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${map[role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {label}
    </span>
  );
}

function StatusBadge({ isActive }) {
  return isActive
    ? <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">ACTIVE</span>
    : <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-200">INACTIVE</span>;
}

// ── Main Component ────────────────────────────────────────────
export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState(DEFAULT_ROLES);        // GET /staff/roles
  const [allPermissions, setAllPermissions] = useState(DEFAULT_PERMISSIONS); // GET /staff/roles
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [modal, setModal] = useState({ open: false, type: null, data: null });
  const [staffDetail, setStaffDetail] = useState(null);   // GET /staff/:id
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [newPassword, setNewPassword] = useState('');

  // On mount — staff list + roles dono load karo
  useEffect(() => {
    loadStaff();
    loadRoles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // GET /super-admin/staff/roles — backend se dynamic roles + permissions
  async function loadRoles() {
    try {
      const res = await staffService.getRoles();
      if (res?.roles?.length) {
        const formatted = res.roles.map(r => ({
          value: r,
          label: r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        }));
        setRoles(formatted);
      }
      if (res?.defaultPermissions) {
        const allPerms = [...new Set(Object.values(res.defaultPermissions).flat())];
        if (allPerms.length) setAllPermissions(allPerms);
      }
    } catch {
      // Silent fail — DEFAULT_ROLES / DEFAULT_PERMISSIONS already set as safe fallback
    }
  }

  async function loadStaff() {
    try {
      setLoading(true);
      const res = await staffService.getAll({ search, role: filterRole || undefined });
      setStaff(res?.items || res || []);
    } catch {
      setError('Staff load nahi hua. Backend check karo.');
    } finally {
      setLoading(false);
    }
  }

  // openModal — VIEW pe GET /super-admin/staff/:id call hoti hai
  async function openModal(type, data = null) {
    setError('');
    setNewPassword('');
    setStaffDetail(null);
    setModal({ open: true, type, data });

    if (type === 'VIEW' && data?._id) {
      setLoadingDetail(true);
      try {
        const res = await staffService.getOne(data._id);
        setStaffDetail(res);
      } catch {
        setStaffDetail(data); // fallback to table row data
      } finally {
        setLoadingDetail(false);
      }
    } else if (type === 'ADD') {
      setForm(emptyForm);
    } else if (type === 'EDIT' && data) {
      setForm({
        name: data.name || '',
        email: data.email || '',
        password: '',
        role: data.role || 'support_executive',
        phone: data.phone || '',
        permissions: data.permissions || [],
      });
    }
  }

  function closeModal() {
    setModal({ open: false, type: null, data: null });
    setError('');
    setNewPassword('');
    setStaffDetail(null);
  }

  function togglePermission(perm) {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter(p => p !== perm)
        : [...f.permissions, perm],
    }));
  }

  async function handleCreate() {
    try {
      setSaving(true);
      await staffService.create(form);
      await loadStaff();
      closeModal();
    } catch (e) {
      setError(e?.response?.data?.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    try {
      setSaving(true);
      const { password, email, ...updateData } = form;
      await staffService.update(modal.data._id, updateData);
      await loadStaff();
      closeModal();
    } catch (e) {
      setError(e?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus() {
    try {
      setSaving(true);
      await staffService.toggleStatus(modal.data._id);
      await loadStaff();
      closeModal();
    } catch (e) {
      setError(e?.response?.data?.message || 'Status toggle failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword() {
    if (!newPassword || newPassword.length < 6) {
      setError('Password kam se kam 6 characters ka hona chahiye');
      return;
    }
    try {
      setSaving(true);
      await staffService.resetPassword(modal.data._id, newPassword);
      closeModal();
      alert('Password reset ho gaya!');
    } catch (e) {
      setError(e?.response?.data?.message || 'Reset failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setSaving(true);
      await staffService.remove(modal.data._id);
      await loadStaff();
      closeModal();
    } catch (e) {
      setError(e?.response?.data?.message || 'Delete failed');
    } finally {
      setSaving(false);
    }
  }

  function handleConfirm() {
    if (modal.type === 'ADD') handleCreate();
    else if (modal.type === 'EDIT') handleUpdate();
    else if (modal.type === 'TOGGLE_STATUS') handleToggleStatus();
    else if (modal.type === 'RESET_PWD') handleResetPassword();
    else if (modal.type === 'DELETE') handleDelete();
  }

  const filtered = staff.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 w-full min-h-screen bg-gray-50/50">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" /> Admin & Staff Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Platform staff members manage karo — roles, permissions aur access.
          </p>
        </div>
        <button
          onClick={() => openModal('ADD')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <UserPlus className="w-5 h-5" /> Add New Staff
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadStaff()}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="">All Roles</option>
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <button
              onClick={loadStaff}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Staff Member</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{s.name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{s._id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 flex items-center gap-1.5 mb-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {s.email}
                      </div>
                      {s.phone && (
                        <div className="text-sm text-gray-700 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {s.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <RoleBadge role={s.role} roles={roles} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge isActive={s.isActive} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => openModal('VIEW', s)} title="View" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openModal('EDIT', s)} title="Edit" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => openModal('RESET_PWD', s)} title="Reset Password" className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                          <Key className="w-4 h-4" />
                        </button>
                        {s.isActive ? (
                          <button onClick={() => openModal('TOGGLE_STATUS', s)} title="Deactivate" className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => openModal('TOGGLE_STATUS', s)} title="Activate" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => openModal('DELETE', s)} title="Delete" className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400 font-medium">
                      Koi staff member nahi mila.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 ${modal.type === 'DELETE' ? 'bg-red-50' : 'bg-gray-50'}`}>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {modal.type === 'ADD' && <><UserPlus className="w-5 h-5 text-indigo-600" /> Add New Staff</>}
                {modal.type === 'EDIT' && <><Edit className="w-5 h-5 text-emerald-600" /> Edit Staff</>}
                {modal.type === 'VIEW' && <><Eye className="w-5 h-5 text-blue-600" /> Staff Details</>}
                {modal.type === 'RESET_PWD' && <><Key className="w-5 h-5 text-purple-600" /> Reset Password</>}
                {modal.type === 'TOGGLE_STATUS' && <><ShieldAlert className="w-5 h-5 text-orange-600" /> Toggle Status</>}
                {modal.type === 'DELETE' && <><Trash2 className="w-5 h-5 text-red-600" /> Delete Staff</>}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 p-1 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
              )}

              {/* ADD / EDIT */}
              {(modal.type === 'ADD' || modal.type === 'EDIT') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                    <input type="text" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                    <input type="email" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="staff@platform.com"
                      disabled={modal.type === 'EDIT'}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>
                  {modal.type === 'ADD' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Password *</label>
                      <input type="password" value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Min 6 characters"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                      <input type="text" value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+91 9876543210"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Role *</label>
                      <select value={form.role}
                        onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Permissions</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-100 rounded-lg bg-gray-50">
                      {allPermissions.map(perm => (
                        <label key={perm} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                          <input type="checkbox"
                            checked={form.permissions.includes(perm)}
                            onChange={() => togglePermission(perm)}
                            className="rounded text-indigo-600"
                          />
                          {perm}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW — GET /super-admin/staff/:id */}
              {modal.type === 'VIEW' && (
                <div className="space-y-4">
                  {loadingDetail ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    </div>
                  ) : (() => {
                    const s = staffDetail || modal.data;
                    return (
                      <>
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{s.name}</h4>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">{s._id}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <StatusBadge isActive={s.isActive} />
                            <RoleBadge role={s.role} roles={roles} />
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                          <div className="flex items-center gap-3 text-sm text-gray-700">
                            <Mail className="w-4 h-4 text-gray-400" /> {s.email}
                          </div>
                          {s.phone && (
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                              <Phone className="w-4 h-4 text-gray-400" /> {s.phone}
                            </div>
                          )}
                        </div>
                        {[
                          ['Created At', s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : '—'],
                          ['Last Updated', s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('en-IN') : '—'],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                            <span className="text-gray-500">{label}</span>
                            <span className="font-semibold text-gray-800">{value}</span>
                          </div>
                        ))}
                        {s.permissions?.length > 0 && (
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                              Permissions ({s.permissions.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {s.permissions.map(p => (
                                <span key={p} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-md font-mono">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* RESET PASSWORD */}
              {modal.type === 'RESET_PWD' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 text-sm text-purple-800">
                    <span className="font-bold">{modal.data?.name}</span> ka password reset karo.
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Password *</label>
                    <input type="password" value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}

              {/* TOGGLE STATUS */}
              {modal.type === 'TOGGLE_STATUS' && (
                <div className="text-center py-4">
                  <div className={`mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4 ${modal.data?.isActive ? 'bg-orange-100' : 'bg-emerald-100'}`}>
                    <ShieldAlert className={`h-7 w-7 ${modal.data?.isActive ? 'text-orange-600' : 'text-emerald-600'}`} />
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold">{modal.data?.name}</span> ko{' '}
                    <span className="font-bold">{modal.data?.isActive ? 'Deactivate' : 'Activate'}</span> karna chahte ho?
                  </p>
                </div>
              )}

              {/* DELETE */}
              {modal.type === 'DELETE' && (
                <div className="text-center py-4">
                  <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
                    <Trash2 className="h-7 w-7 text-red-600" />
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold">{modal.data?.name}</span> ko permanently delete karna chahte ho?
                  </p>
                  <p className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded-lg mt-3 border border-red-100">
                    Yeh action undo nahi ho sakta. Last super_admin delete nahi hoga.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {modal.type === 'VIEW' ? 'Close' : 'Cancel'}
              </button>
              {modal.type !== 'VIEW' && (
                <button onClick={handleConfirm} disabled={saving}
                  className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 ${modal.type === 'DELETE' ? 'bg-red-600 hover:bg-red-700' :
                      modal.type === 'TOGGLE_STATUS' ? (modal.data?.isActive ? 'bg-orange-600 hover:bg-orange-700' : 'bg-emerald-600 hover:bg-emerald-700') :
                        modal.type === 'RESET_PWD' ? 'bg-purple-600 hover:bg-purple-700' :
                          'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modal.type === 'ADD' && 'Create Staff'}
                  {modal.type === 'EDIT' && 'Save Changes'}
                  {modal.type === 'RESET_PWD' && 'Reset Password'}
                  {modal.type === 'TOGGLE_STATUS' && (modal.data?.isActive ? 'Deactivate' : 'Activate')}
                  {modal.type === 'DELETE' && 'Delete'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
