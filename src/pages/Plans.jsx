import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Power, Eye, UserPlus, X, AlertCircle,
  CheckCircle2, IndianRupee, Layers, Loader2
} from 'lucide-react';
import plansService from '../services/plans.service';

const FEATURE_OPTIONS = [
  { key: 'complaints', label: 'Complaints' },
  { key: 'works', label: 'Works / Development' },
  { key: 'events', label: 'Events' },
  { key: 'polls', label: 'Polls' },
  { key: 'membership', label: 'Membership' },
  { key: 'volunteers', label: 'Volunteers' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'manifesto', label: 'Manifesto' },
  { key: 'poster_generator', label: 'Poster Generator' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'banners', label: 'Banners' },
];

const BILLING_CYCLES = ['monthly', 'quarterly', 'yearly', 'one_time'];

export const SUPPORT_LEVELS = [
  { value: 'community', label: 'Community Support (Forums / Docs)' },
  { value: 'email_24h', label: 'Email Support (24h SLA)' },
  { value: 'priority_whatsapp', label: 'Priority WhatsApp Hotline' },
  { value: 'dedicated_manager', label: 'Dedicated Account Manager' },
];

export const TARGET_SEGMENTS = [
  { value: 'gram_panchayat', label: 'Gram Panchayat / Ward' },
  { value: 'municipal_ward', label: 'Municipal Corporation / Ward' },
  { value: 'vidhan_sabha', label: 'Vidhan Sabha (MLA Candidate)' },
  { value: 'lok_sabha', label: 'Lok Sabha (MP Candidate)' },
  { value: 'political_party', label: 'Political Party / State HQ' },
  { value: 'all', label: 'All Segments (General)' },
];

const emptyForm = {
  name: '', slug: '', description: '', price: 0, currency: 'INR',
  billingCycle: 'yearly', trialDays: 14,
  supportLevel: 'email_24h',
  targetSegment: 'vidhan_sabha',
  features: [],
  limits: { maxCitizens: -1, maxStaffUsers: -1, maxPostersPerMonth: -1, maxNotificationsPerMonth: -1, maxStorageMB: -1 },
  overageRates: { citizenPer1kRate: 0, storagePerGbRate: 0, smsRate: 0, whatsappRate: 0 },
  isPopular: false, isActive: true, sortOrder: 0,
};

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, type: null, plan: null });
  const [planDetail, setPlanDetail] = useState(null);   // GET /super-admin/plans/:id
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [assignForm, setAssignForm] = useState({ tenantId: '', isTrial: false, durationMonths: 12, trialDays: 14 });

  useEffect(() => { loadPlans(); }, []);

  async function loadPlans() {
    try {
      setLoading(true);
      const data = await plansService.getAll();
      setPlans(data);
    } catch {
      setError('Plans load nahi hue.');
    } finally {
      setLoading(false);
    }
  }

  async function openModal(type, plan = null) {
    setError('');
    setPlanDetail(null);
    setModal({ open: true, type, plan });
    if (type === 'VIEW' && plan) {
      // GET /super-admin/plans/:id — fresh detail from backend
      setLoadingDetail(true);
      try {
        const data = await plansService.getOne(plan._id);
        setPlanDetail(data);
      } catch {
        setPlanDetail(plan); // fallback to list data
      } finally {
        setLoadingDetail(false);
      }
    } else if (type === 'EDIT' && plan) {
      setForm({
        name: plan.name || '',
        slug: plan.slug || '',
        description: plan.description || '',
        price: plan.price ?? 0,
        currency: plan.currency || 'INR',
        billingCycle: plan.billingCycle || 'yearly',
        trialDays: plan.trialDays ?? 14,
        features: plan.features || [],
        limits: plan.limits || emptyForm.limits,
        supportLevel: plan.supportLevel || 'email_24h',
        targetSegment: plan.targetSegment || 'vidhan_sabha',
        overageRates: {
          citizenPer1kRate: plan.overageRates?.citizenPer1kRate ?? 0,
          storagePerGbRate: plan.overageRates?.storagePerGbRate ?? 0,
          smsRate: plan.overageRates?.smsRate ?? 0,
          whatsappRate: plan.overageRates?.whatsappRate ?? 0,
        },
        isPopular: plan.isPopular || false,
        isActive: plan.isActive ?? true,
        sortOrder: plan.sortOrder || 0,
      });
    } else if (type === 'ADD') {
      setForm(emptyForm);
    } else if (type === 'ASSIGN') {
      setAssignForm({ tenantId: '', isTrial: false, durationMonths: 12, trialDays: 14 });
      try {
        const t = await plansService.getTenants();
        setTenants(t);
      } catch { setTenants([]); }
    }
  }

  function closeModal() {
    setModal({ open: false, type: null, plan: null });
    setError('');
    setPlanDetail(null);
  }

  function handleFeatureToggle(key) {
    setForm(f => ({
      ...f,
      features: f.features.includes(key)
        ? f.features.filter(k => k !== key)
        : [...f.features, key],
    }));
  }

  async function handleSave() {
    try {
      setSaving(true);
      if (modal.type === 'ADD') {
        await plansService.create({ ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') });
      } else if (modal.type === 'EDIT') {
        await plansService.update(modal.plan._id, form);
      }
      await loadPlans();
      closeModal();
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setSaving(true);
      await plansService.remove(modal.plan._id);
      await loadPlans();
      closeModal();
    } catch (e) {
      setError(e?.response?.data?.message || 'Delete failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(plan) {
    try {
      await plansService.toggleActive(plan._id, !plan.isActive);
      await loadPlans();
    } catch (e) {
      alert(e?.response?.data?.message || 'Toggle failed');
    }
  }

  async function handleAssign() {
    if (!assignForm.tenantId) { setError('Tenant select karo'); return; }
    try {
      setSaving(true);
      await plansService.assignToTenant(assignForm.tenantId, {
        planId: modal.plan._id,
        isTrial: assignForm.isTrial,
        durationMonths: assignForm.isTrial ? undefined : Number(assignForm.durationMonths),
        trialDays: assignForm.isTrial ? Number(assignForm.trialDays) : undefined,
      });
      closeModal();
      alert('Plan assign ho gaya!');
    } catch (e) {
      setError(e?.response?.data?.message || 'Assign failed');
    } finally {
      setSaving(false);
    }
  }

  function handleConfirm() {
    if (modal.type === 'ADD' || modal.type === 'EDIT') handleSave();
    else if (modal.type === 'DELETE') handleDelete();
    else if (modal.type === 'ASSIGN') handleAssign();
  }

  return (
    <div className="w-full font-sans space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Subscription Plans</h1>
          <p className="text-sm text-gray-500 mt-1">Manage billing packages, features, and plan assignments.</p>
        </div>
        <button
          onClick={() => openModal('ADD')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="w-5 h-5" /> Create New Plan
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan._id} className={`bg-white rounded-2xl border ${plan.isActive ? 'border-emerald-500/20' : 'border-gray-200'} shadow-sm p-6 flex flex-col hover:shadow-md transition-all relative overflow-hidden group`}>
              <div className={`absolute top-0 right-0 text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider ${plan.isActive ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {plan.isActive ? 'ACTIVE' : 'DISABLED'}
              </div>

              <div className="mb-3 pr-12">
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold">
                    {TARGET_SEGMENTS.find(s => s.value === plan.targetSegment)?.label || plan.targetSegment || 'Vidhan Sabha'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                    {SUPPORT_LEVELS.find(s => s.value === plan.supportLevel)?.label?.split(' (')[0] || plan.supportLevel || 'Email Support'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{plan.name}</h3>
                <div className="text-xs text-gray-400 mt-0.5 font-mono">{plan.slug}</div>
                {plan.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{plan.description}</p>}
              </div>

              <div className="mb-4 flex items-baseline">
                <span className="text-3xl font-extrabold text-gray-900">₹{(plan.price || 0).toLocaleString()}</span>
                <span className="text-sm font-medium text-gray-500 ml-1">/ {plan.billingCycle}</span>
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1.5">Features & Limits</p>
                <ul className="space-y-1.5">
                  {(plan.features || []).slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-center text-xs text-gray-600 gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {FEATURE_OPTIONS.find(o => o.key === f)?.label || f}
                    </li>
                  ))}
                  {(plan.features || []).length > 4 && (
                    <li className="text-[11px] text-gray-400">+{plan.features.length - 4} more features...</li>
                  )}
                </ul>

                {/* Overage Rates Summary */}
                <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-500 space-y-1 bg-gray-50/70 p-2 rounded-lg">
                  <div className="flex justify-between">
                    <span>Extra 1k Voters:</span>
                    <span className="font-bold text-gray-800">₹{plan.overageRates?.citizenPer1kRate || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Extra 1 GB Media:</span>
                    <span className="font-bold text-gray-800">₹{plan.overageRates?.storagePerGbRate || 0}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button onClick={() => openModal('VIEW', plan)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => openModal('EDIT', plan)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => openModal('ASSIGN', plan)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Assign">
                    <UserPlus className="w-4 h-4" />
                  </button>
                  <button onClick={() => openModal('DELETE', plan)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleToggleActive(plan)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${plan.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  title={plan.isActive ? 'Disable' : 'Enable'}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${plan.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          ))}

          {plans.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
              <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No plans found</h3>
              <p className="text-sm text-gray-500">Create your first subscription plan to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {modal.type === 'ADD' && <><Plus className="w-5 h-5 text-emerald-600" /> Create Plan</>}
                {modal.type === 'EDIT' && <><Edit className="w-5 h-5 text-emerald-600" /> Edit Plan</>}
                {modal.type === 'VIEW' && <><Eye className="w-5 h-5 text-blue-600" /> Plan Details</>}
                {modal.type === 'ASSIGN' && <><UserPlus className="w-5 h-5 text-purple-600" /> Assign Plan</>}
                {modal.type === 'DELETE' && <><AlertCircle className="w-5 h-5 text-red-600" /> Delete Plan</>}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

              {/* ADD / EDIT */}
              {(modal.type === 'ADD' || modal.type === 'EDIT') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Plan Name</label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Vidhan Sabha Pro" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Slug</label>
                    <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. vidhan-sabha-pro" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
                      <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Billing Cycle</label>
                      <select value={form.billingCycle} onChange={e => setForm(f => ({ ...f, billingCycle: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white">
                        {BILLING_CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Trial Days</label>
                      <input type="number" value={form.trialDays} onChange={e => setForm(f => ({ ...f, trialDays: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Sort Order</label>
                      <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                    </div>
                  </div>

                  {/* Target Segment & Support Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/70 p-3.5 rounded-xl border border-gray-200/80">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Target Segment (SRS Sec 47)</label>
                      <select
                        value={form.targetSegment}
                        onChange={e => setForm(f => ({ ...f, targetSegment: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold bg-white"
                      >
                        {TARGET_SEGMENTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Support Level SLA</label>
                      <select
                        value={form.supportLevel}
                        onChange={e => setForm(f => ({ ...f, supportLevel: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold bg-white"
                      >
                        {SUPPORT_LEVELS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Overage Rates */}
                  <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/60">
                    <label className="block text-xs font-black text-emerald-950 uppercase tracking-wider mb-2">
                      Overage Rates (Extra Consumption Charges)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">+1,000 Voters (₹)</label>
                        <input
                          type="number"
                          value={form.overageRates?.citizenPer1kRate ?? 0}
                          onChange={e => setForm(f => ({ ...f, overageRates: { ...f.overageRates, citizenPer1kRate: Number(e.target.value) } }))}
                          placeholder="e.g. 500"
                          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">+1 GB Media Storage (₹)</label>
                        <input
                          type="number"
                          value={form.overageRates?.storagePerGbRate ?? 0}
                          onChange={e => setForm(f => ({ ...f, overageRates: { ...f.overageRates, storagePerGbRate: Number(e.target.value) } }))}
                          placeholder="e.g. 100"
                          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">+1 DLT SMS (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={form.overageRates?.smsRate ?? 0}
                          onChange={e => setForm(f => ({ ...f, overageRates: { ...f.overageRates, smsRate: Number(e.target.value) } }))}
                          placeholder="e.g. 0.25"
                          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">+1 WhatsApp Msg (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={form.overageRates?.whatsappRate ?? 0}
                          onChange={e => setForm(f => ({ ...f, overageRates: { ...f.overageRates, whatsappRate: Number(e.target.value) } }))}
                          placeholder="e.g. 0.65"
                          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Features (select karo)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {FEATURE_OPTIONS.map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input type="checkbox" checked={form.features.includes(key)} onChange={() => handleFeatureToggle(key)} className="rounded text-emerald-600" />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Limits (-1 = Unlimited)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'maxCitizens', label: 'Max Citizens' },
                        { key: 'maxStaffUsers', label: 'Max Staff' },
                        { key: 'maxPostersPerMonth', label: 'Posters/Month' },
                        { key: 'maxNotificationsPerMonth', label: 'Notifications/Month' },
                        { key: 'maxStorageMB', label: 'Storage (MB)' },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-xs text-gray-500 mb-1">{label}</label>
                          <input type="number" value={form.limits[key]} onChange={e => setForm(f => ({ ...f, limits: { ...f.limits, [key]: Number(e.target.value) } }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded text-emerald-600" />
                      Active
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={form.isPopular} onChange={e => setForm(f => ({ ...f, isPopular: e.target.checked }))} className="rounded text-emerald-600" />
                      Mark as Popular
                    </label>
                  </div>
                </div>
              )}

              {/* VIEW — GET /super-admin/plans/:id */}
              {modal.type === 'VIEW' && (
                <div className="space-y-4">
                  {loadingDetail ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    </div>
                  ) : (() => {
                    const p = planDetail || modal.plan;
                    return (
                      <>
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{p.name}</h4>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                              <span className="font-semibold text-gray-700 mr-1">{(p.price || 0).toLocaleString()}</span>
                              / {p.billingCycle}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Trial: {p.trialDays} days</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${p.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                              {p.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {p.isPopular && (
                              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">⭐ Popular</span>
                            )}
                          </div>
                        </div>
                        {p.description && (
                          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">{p.description}</p>
                        )}
                        {[
                          ['Slug', p.slug],
                          ['Currency', p.currency],
                          ['Sort Order', p.sortOrder ?? '—'],
                          ['Created At', p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'],
                          ['Updated At', p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-IN') : '—'],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                            <span className="text-gray-500">{label}</span>
                            <span className="font-semibold text-gray-800">{value}</span>
                          </div>
                        ))}
                        <div>
                          <h5 className="text-sm font-bold text-gray-800 mb-2">Features ({(p.features || []).length})</h5>
                          <div className="grid grid-cols-2 gap-2">
                            {(p.features || []).map((f, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                {FEATURE_OPTIONS.find(o => o.key === f)?.label || f}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-gray-800 mb-2">Limits</h5>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            {p.limits && Object.entries(p.limits).map(([k, v]) => (
                              <div key={k} className="flex justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                <span className="text-gray-500 text-xs">{k}</span>
                                <span className="font-semibold">{v === -1 ? '∞' : v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* ASSIGN */}
              {modal.type === 'ASSIGN' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 text-purple-800 p-3 rounded-lg text-sm border border-purple-100">
                    <span className="font-bold">"{modal.plan?.name}"</span> plan tenant ko assign karo.
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tenant Select Karo</label>
                    <select value={assignForm.tenantId} onChange={e => setAssignForm(f => ({ ...f, tenantId: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white">
                      <option value="">-- Tenant choose karo --</option>
                      {tenants.map(t => <option key={t._id} value={t._id}>{t.name} ({t.slug})</option>)}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={assignForm.isTrial} onChange={e => setAssignForm(f => ({ ...f, isTrial: e.target.checked }))} className="rounded text-purple-600" />
                    Trial ke roop mein assign karo
                  </label>
                  {assignForm.isTrial ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Trial Days</label>
                      <input type="number" value={assignForm.trialDays} onChange={e => setAssignForm(f => ({ ...f, trialDays: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Months)</label>
                      <input type="number" value={assignForm.durationMonths} onChange={e => setAssignForm(f => ({ ...f, durationMonths: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                    </div>
                  )}
                </div>
              )}

              {/* DELETE */}
              {modal.type === 'DELETE' && (
                <div className="text-center py-4">
                  <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
                    <Trash2 className="h-7 w-7 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Plan?</h3>
                  <p className="text-sm text-gray-500">
                    <span className="font-bold text-gray-800">"{modal.plan?.name}"</span> plan delete hoga. Agar koi tenant is plan pe hai toh delete nahi hoga.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                {modal.type === 'VIEW' ? 'Close' : 'Cancel'}
              </button>
              {modal.type === 'VIEW' ? (
                <button onClick={() => openModal('EDIT', modal.plan)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  Edit Plan
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={saving}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 ${modal.type === 'DELETE' ? 'bg-red-600 hover:bg-red-700' : modal.type === 'ASSIGN' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modal.type === 'DELETE' ? 'Delete' : modal.type === 'ASSIGN' ? 'Assign Plan' : 'Save Plan'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
