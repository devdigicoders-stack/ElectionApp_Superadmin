import React, { useState, useEffect } from 'react';
import {
  Edit, Palette, Settings,
  LogOut, History, ShieldAlert, CheckCircle2, XCircle, Plus, X, Loader2, Eye, UserPlus,
  Upload, Image, Trash2
} from 'lucide-react';
import tenantsService from '../services/tenants.service';

const FEATURE_KEYS = [
  { key: 'complaints', label: 'Complaints Management' },
  { key: 'events', label: 'Events Module' },
  { key: 'polls', label: 'Opinion Polls' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'manifesto', label: 'Manifesto' },
  { key: 'membership', label: 'Membership & ID Cards' },
  { key: 'volunteers', label: 'Volunteers' },
  { key: 'poster_generator', label: 'Poster Generator' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'banners', label: 'Banners' },
  { key: 'works', label: 'Works / Development' },
];

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState('');
  const [modalType, setModalType] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetail, setClientDetail] = useState(null);   // GET /tenants/:id
  const [features, setFeatures] = useState([]);
  const [impersonationHistory, setImpersonationHistory] = useState([]);
  const [impersonationToken, setImpersonationToken] = useState(null); // impersonate result

  // Form states
  const [form, setForm] = useState({});

  useEffect(() => {
    loadClients();
  }, []);

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      setError('');
      const uploadedPath = await tenantsService.uploadLogo(file);
      setForm(f => ({ ...f, logoUrl: uploadedPath }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Logo upload failed. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  }

  async function loadClients() {
    try {
      setLoading(true);
      const data = await tenantsService.getAll();
      setClients(data);
    } catch (e) {
      setError('Clients load nahi hue. Backend check karo.');
    } finally {
      setLoading(false);
    }
  }

  async function openModal(type, client = null) {
    setModalType(type);
    setSelectedClient(client);
    setError('');
    setForm({});
    setClientDetail(null);
    setImpersonationToken(null);

    if (type === 'VIEW' && client) {
      // GET /super-admin/tenants/:id — single tenant detail
      try {
        const data = await tenantsService.getOne(client._id);
        setClientDetail(data);
      } catch {
        setClientDetail(null);
      }
    }
    if (type === 'EDIT' && client) {
      setForm({ name: client.name, customDomain: client.customDomain || '' });
    }
    if (type === 'BRANDING' && client) {
      setForm({ ...client.branding });
    }
    if (type === 'FEATURES' && client) {
      try {
        const data = await tenantsService.getFeatures(client._id);
        setFeatures(data);
      } catch {
        setFeatures([]);
      }
    }
    if (type === 'CREATE_ADMIN' && client) {
      setForm({ name: client.branding?.leaderName || client.name || '', email: '', password: '', role: 'leader' });
    }
    if (type === 'HISTORY' && client) {
      try {
        const data = await tenantsService.getImpersonationHistory(client._id);
        setImpersonationHistory(data?.items || []);
      } catch {
        setImpersonationHistory([]);
      }
    }
  }

  function closeModal() {
    setModalType(null);
    setSelectedClient(null);
    setForm({});
    setError('');
    setClientDetail(null);
    setImpersonationToken(null);
  }

  async function handleCreate() {
    try {
      setSaving(true);
      await tenantsService.create(form);
      await loadClients();
      closeModal();
    } catch (e) {
      setError(e?.response?.data?.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit() {
    try {
      setSaving(true);
      await tenantsService.update(selectedClient._id, form);
      await loadClients();
      closeModal();
    } catch (e) {
      setError(e?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleBranding() {
    try {
      setSaving(true);
      await tenantsService.updateBranding(selectedClient._id, form);
      await loadClients();
      closeModal();
    } catch (e) {
      setError(e?.response?.data?.message || 'Branding update failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleFeature(featureKey, isEnabled) {
    try {
      await tenantsService.toggleFeature(selectedClient._id, featureKey, isEnabled);
      setFeatures(prev =>
        prev.map(f => f.featureKey === featureKey ? { ...f, isEnabled } : f)
      );
    } catch (e) {
      setError('Feature toggle failed');
    }
  }

  async function handleSuspendToggle() {
    try {
      setSaving(true);
      if (selectedClient.status === 'active') {
        await tenantsService.suspend(selectedClient._id);
      } else {
        await tenantsService.activate(selectedClient._id);
      }
      await loadClients();
      closeModal();
    } catch (e) {
      setError(e?.response?.data?.message || 'Action failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleImpersonate(client) {
    try {
      const data = await tenantsService.impersonate(client._id, { reason: 'Super Admin support access', durationHours: 2 });
      setImpersonationToken(data);
      setSelectedClient(client);
      setModalType('IMPERSONATE_RESULT');
    } catch (e) {
      alert(e?.response?.data?.message || 'Impersonation failed');
    }
  }

  // POST /super-admin/tenants/:id/impersonate/exit
  async function handleExitImpersonation() {
    if (!selectedClient) return;
    try {
      setSaving(true);
      await tenantsService.exitImpersonation(selectedClient._id, { notes: 'Session ended by Super Admin' });
      alert('Impersonation session khatam ho gayi aur audit log record ho gaya!');
      closeModal();
    } catch (e) {
      setError(e?.response?.data?.message || 'Exit failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateAdminUser() {
    if (!form.name?.trim() || !form.email?.trim() || !form.password?.trim()) {
      setError('Name, Email aur Password teeno zaroori hain.');
      return;
    }
    try {
      setSaving(true);
      await tenantsService.createAdminUser(selectedClient._id, form);
      alert(`✅ Admin User "${form.email}" successfully create ho gaya!`);
      closeModal();
    } catch (e) {
      setError(e?.response?.data?.message || 'Admin user create karne mein dikkat aayi.');
    } finally {
      setSaving(false);
    }
  }

  function handleConfirm() {
    if (modalType === 'ADD') handleCreate();
    else if (modalType === 'EDIT') handleEdit();
    else if (modalType === 'BRANDING') handleBranding();
    else if (modalType === 'SUSPEND') handleSuspendToggle();
    else if (modalType === 'CREATE_ADMIN') handleCreateAdminUser();
  }

  return (
    <div className="p-4 sm:p-8 w-full mx-auto font-sans">
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

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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
                  <tr key={client._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {client.branding?.logoUrl ? (
                          <img
                            src={client.branding.logoUrl.startsWith('http') ? client.branding.logoUrl : `http://localhost:3001${client.branding.logoUrl}`}
                            alt={client.name}
                            className="w-9 h-9 rounded-lg object-contain bg-gray-50 border border-gray-200 p-0.5 shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: client.branding?.primaryColor || '#2563EB' }}
                          >
                            {client.name ? client.name[0].toUpperCase() : 'C'}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">{client.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{client.branding?.leaderName || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-md px-2 py-1">
                        {client.slug}.madiyayu.com
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${client.status === 'active'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : client.status === 'trial'
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {client.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {client.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-medium">
                      {new Date(client.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => openModal('VIEW', client)} title="View Detail" className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-md transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openModal('EDIT', client)} title="Edit Info" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => openModal('BRANDING', client)} title="Branding" className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors">
                          <Palette className="w-4 h-4" />
                        </button>
                        <button onClick={() => openModal('FEATURES', client)} title="Features" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button onClick={() => openModal('CREATE_ADMIN', client)} title="Create Leader / Admin User" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors">
                          <UserPlus className="w-4 h-4" />
                        </button>
                        <div className="w-px h-5 bg-gray-200 mx-1"></div>
                        <button onClick={() => handleImpersonate(client)} title="Login as Client" className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors">
                          <LogOut className="w-4 h-4" />
                        </button>
                        <button onClick={() => openModal('HISTORY', client)} title="Impersonation Logs" className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-md transition-colors">
                          <History className="w-4 h-4" />
                        </button>
                        <div className="w-px h-5 bg-gray-200 mx-1"></div>
                        <button
                          onClick={() => openModal('SUSPEND', client)}
                          title={client.status === 'active' ? 'Suspend' : 'Activate'}
                          className={`p-1.5 rounded-md transition-colors ${client.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
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
      )}

      {/* MODAL */}
      {modalType && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {modalType === 'VIEW' && 'Tenant Detail'}
                {modalType === 'ADD' && 'Register New Client'}
                {modalType === 'EDIT' && 'Edit Client Info'}
                {modalType === 'BRANDING' && 'Theme & Branding'}
                {modalType === 'FEATURES' && 'Enable / Disable Features'}
                {modalType === 'CREATE_ADMIN' && `Create Leader / Admin — ${selectedClient?.name}`}
                {modalType === 'HISTORY' && 'Impersonation Logs'}
                {modalType === 'SUSPEND' && 'Confirm Action'}
                {modalType === 'IMPERSONATE_RESULT' && '🔐 Login as Client — Token'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
              )}

              {/* VIEW — GET /super-admin/tenants/:id */}
              {modalType === 'VIEW' && (
                <div className="space-y-3">
                  {!clientDetail ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{clientDetail.name}</h4>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{clientDetail._id}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${clientDetail.status === 'active' ? 'bg-green-50 text-green-700' : clientDetail.status === 'trial' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                          {clientDetail.status?.toUpperCase()}
                        </span>
                      </div>
                      {[
                        ['Slug', clientDetail.slug],
                        ['Custom Domain', clientDetail.customDomain || '—'],
                        ['Leader Name', clientDetail.branding?.leaderName || '—'],
                        ['Tagline', clientDetail.branding?.tagline || '—'],
                        ['Primary Color', clientDetail.branding?.primaryColor || '—'],
                        ['Trial Ends', clientDetail.trialEndsAt ? new Date(clientDetail.trialEndsAt).toLocaleDateString('en-IN') : '—'],
                        ['Sub Starts', clientDetail.subscriptionStartsAt ? new Date(clientDetail.subscriptionStartsAt).toLocaleDateString('en-IN') : '—'],
                        ['Sub Ends', clientDetail.subscriptionEndsAt ? new Date(clientDetail.subscriptionEndsAt).toLocaleDateString('en-IN') : '—'],
                        ['Created At', clientDetail.createdAt ? new Date(clientDetail.createdAt).toLocaleDateString('en-IN') : '—'],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between text-sm py-2 border-b border-gray-100">
                          <span className="text-gray-500 font-medium">{label}</span>
                          <span className="font-semibold text-gray-900">{value}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* IMPERSONATE RESULT — token + exit button */}
              {modalType === 'IMPERSONATE_RESULT' && impersonationToken && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <p className="text-sm font-bold text-amber-800 mb-1">⚠️ Temporary Access Token — Sirf ek baar use karo</p>
                    <p className="text-xs text-amber-700">Yeh token <strong>{impersonationToken.impersonation?.expiresAt ? new Date(impersonationToken.impersonation.expiresAt).toLocaleString('en-IN') : '—'}</strong> tak valid hai.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">JWT Token</label>
                    <textarea
                      readOnly
                      rows={4}
                      value={impersonationToken.token || ''}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono bg-gray-50 text-gray-700 resize-none focus:outline-none"
                    />
                  </div>
                  {[
                    ['Tenant', impersonationToken.tenant?.name],
                    ['Tenant Slug', impersonationToken.tenant?.slug],
                    ['Admin User', impersonationToken.adminUser?.name],
                    ['Admin Email', impersonationToken.adminUser?.email],
                    ['Duration', `${impersonationToken.expiresIn ? Math.round(impersonationToken.expiresIn / 3600) : '—'} hour(s)`],
                    ['Reason', impersonationToken.impersonation?.reason],
                  ].map(([label, value]) => value && (
                    <div key={label} className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-900">{value}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-dashed border-amber-200">
                    <button
                      onClick={handleExitImpersonation}
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60"
                    >
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      🚪 Exit Impersonation (Audit Log mein record hoga)
                    </button>
                  </div>
                </div>
              )}

              {/* ADD */}
              {modalType === 'ADD' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Rahul Kumar" onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain (Slug)</label>
                    <div className="flex">
                      <input type="text" className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="rahulkumar" onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                      <span className="inline-flex items-center px-4 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-lg">.madiyayu.com</span>
                    </div>
                  </div>
                </div>
              )}

              {/* EDIT */}
              {modalType === 'EDIT' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                    <input type="text" value={form.name || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Domain</label>
                    <input type="text" value={form.customDomain || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. rahulkumar.in" onChange={e => setForm(f => ({ ...f, customDomain: e.target.value }))} />
                  </div>
                </div>
              )}

              {/* BRANDING */}
              {modalType === 'BRANDING' && (
                <div className="space-y-4">
                  {/* Party / Campaign Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Party / Campaign Logo</label>
                    <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="w-16 h-16 rounded-xl border border-dashed border-gray-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                        {form.logoUrl ? (
                          <img
                            src={form.logoUrl.startsWith('http') ? form.logoUrl : `http://localhost:3001${form.logoUrl}`}
                            alt="Logo Preview"
                            className="w-full h-full object-contain p-1"
                            onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Logo'; }}
                          />
                        ) : (
                          <Image className="w-7 h-7 text-gray-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer shadow-xs transition-colors">
                            {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" /> : <Upload className="w-3.5 h-3.5 text-blue-600" />}
                            <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/svg+xml"
                              className="hidden"
                              disabled={uploadingLogo}
                              onChange={handleLogoUpload}
                            />
                          </label>

                          {form.logoUrl && (
                            <button
                              type="button"
                              onClick={() => setForm(f => ({ ...f, logoUrl: '' }))}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove Logo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">PNG, JPG, or WebP (e.g. Party symbol)</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Leader Name</label>
                    <input type="text" value={form.leaderName || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g. Narendra Kumar" onChange={e => setForm(f => ({ ...f, leaderName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tagline / Slogan</label>
                    <input type="text" value={form.tagline || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g. Vikas Ki Nayi Udaan" onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                    <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
                      <input type="color" value={form.primaryColor || '#2563EB'} className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent" onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} />
                      <span className="text-sm font-mono text-gray-700">{form.primaryColor || '#2563EB'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                    <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
                      <input type="color" value={form.secondaryColor || '#F59E0B'} className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent" onChange={e => setForm(f => ({ ...f, secondaryColor: e.target.value }))} />
                      <span className="text-sm font-mono text-gray-700">{form.secondaryColor || '#F59E0B'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* FEATURES */}
              {modalType === 'FEATURES' && (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {FEATURE_KEYS.map(({ key, label }) => {
                    const f = features.find(x => x.featureKey === key);
                    return (
                      <div key={key} className="flex items-center justify-between p-3.5 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors">
                        <span className="text-sm font-medium text-gray-800">{label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={f?.isEnabled || false} onChange={e => handleToggleFeature(key, e.target.checked)} />
                          <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}



              {/* CREATE ADMIN */}
              {modalType === 'CREATE_ADMIN' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg text-xs text-emerald-800">
                    Aap <strong>{selectedClient?.name}</strong> (Slug: <code>{selectedClient?.slug}</code>) ke liye naya login account create kar rahe hain.
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={form.name || ''}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. Narendra Kumar"
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Login ID)</label>
                    <input
                      type="email"
                      value={form.email || ''}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="leader@campaign.com"
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={form.password || ''}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Minimum 6 characters"
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={form.role || 'leader'}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                      onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    >
                      <option value="leader">Leader (Main Candidate - Full Access)</option>
                      <option value="admin">Admin (Election Office Head)</option>
                      <option value="content_manager">Content Manager (Media / Events)</option>
                      <option value="complaint_manager">Complaint Manager (Shikayat Prabhari)</option>
                      <option value="volunteer_manager">Volunteer Manager (Karyakarta Prabhari)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* HISTORY */}
              {modalType === 'HISTORY' && (
                <div className="overflow-hidden border border-gray-200 rounded-xl">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 font-semibold text-gray-900">Date & Time</th>
                        <th className="py-3 px-4 font-semibold text-gray-900">Accessed By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {impersonationHistory.length === 0 ? (
                        <tr><td colSpan={2} className="py-6 text-center text-gray-400">Koi history nahi mili</td></tr>
                      ) : impersonationHistory.map((log, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="py-3 px-4">{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-blue-600">{log.performedBy?.name || 'Super Admin'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUSPEND */}
              {modalType === 'SUSPEND' && (
                <div className="text-center py-4">
                  <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${selectedClient?.status === 'active' ? 'bg-red-100' : 'bg-green-100'}`}>
                    <ShieldAlert className={`h-8 w-8 ${selectedClient?.status === 'active' ? 'text-red-600' : 'text-green-600'}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedClient?.status === 'active' ? 'Suspend this client?' : 'Activate this client?'}
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    {selectedClient?.status === 'active'
                      ? `${selectedClient?.name} ka account suspend hoga. Unka access turant band ho jayega.`
                      : `${selectedClient?.name} ka account reactivate hoga.`}
                  </p>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="mt-6 flex justify-end gap-3 pt-5 border-t border-gray-100">
                <button onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                  {modalType === 'HISTORY' || modalType === 'FEATURES' || modalType === 'VIEW' || modalType === 'IMPERSONATE_RESULT' ? 'Close' : 'Cancel'}
                </button>
                {modalType !== 'HISTORY' && modalType !== 'FEATURES' && modalType !== 'VIEW' && modalType !== 'IMPERSONATE_RESULT' && (
                  <button
                    onClick={handleConfirm}
                    disabled={saving}
                    className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors shadow-sm flex items-center gap-2 ${modalType === 'SUSPEND' && selectedClient?.status === 'active'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                      } disabled:opacity-60`}
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {modalType === 'SUSPEND' ? 'Confirm' : modalType === 'CREATE_ADMIN' ? 'Create Admin User' : 'Save Changes'}
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
