import React, { useState, useEffect } from 'react';
import {
  Receipt, Plus, Eye, RefreshCw, ArrowUpCircle,
  Clock, PauseCircle, PlayCircle, XCircle, AlertCircle,
  IndianRupee, Activity, TrendingUp, X, Loader2, FileText
} from 'lucide-react';
import subscriptionsService from '../services/subscriptions.service';
import plansService from '../services/plans.service';
import tenantsService from '../services/tenants.service';
import apiClient from '../services/apiClient';

const PAYMENT_METHODS = ['bank_transfer', 'upi', 'card', 'net_banking', 'manual_cash', 'cheque', 'free_trial', 'other'];

function StatusBadge({ status }) {
  const map = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    trialing: 'bg-blue-100 text-blue-700 border-blue-200',
    expired: 'bg-gray-100 text-gray-600 border-gray-200',
    canceled: 'bg-red-100 text-red-700 border-red-200',
    paused: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    past_due: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status?.toUpperCase()}
    </span>
  );
}

function fmt(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN');
}

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [stats, setStats] = useState(null);
  const [expiring, setExpiring] = useState([]);
  const [tenantSubs, setTenantSubs] = useState([]);         // GET /subscriptions/tenant/:id
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [plans, setPlans] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTenantSubs, setLoadingTenantSubs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [modal, setModal] = useState({ open: false, type: null, sub: null });
  const [subDetail, setSubDetail] = useState(null);         // GET /subscriptions/:id
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      setLoading(true);
      const [subsData, statsData, expiringData, plansData, tenantsData, dashData] = await Promise.all([
        subscriptionsService.getAll(),
        subscriptionsService.getStats(),
        subscriptionsService.getExpiringSoon(15),
        plansService.getAll(),
        tenantsService.getAll(),
        apiClient.get('/super-admin/dashboard/stats').then(r => r.data?.data || r.data),
      ]);
      setSubs(subsData?.data || subsData || []);
      setStats(statsData);
      setExpiring(expiringData || []);
      setPlans(plansData || []);
      setTenants(tenantsData || []);
      setRecentInvoices(dashData?.recentInvoices || []);
    } catch {
      setError('Data load nahi hua.');
    } finally {
      setLoading(false);
    }
  }

  async function openModal(type, sub = null) {
    setError('');
    setSubDetail(null);
    setModal({ open: true, type, sub });
    if (type === 'VIEW' && sub?._id) {
      // GET /super-admin/subscriptions/:id — fresh full detail
      setLoadingDetail(true);
      try {
        const data = await subscriptionsService.getOne(sub._id);
        setSubDetail(data);
      } catch {
        setSubDetail(sub); // fallback to table data
      } finally {
        setLoadingDetail(false);
      }
    } else if (type === 'CREATE') {
      setForm({ tenantId: '', planId: '', isTrial: false, durationMonths: 12, amountPaid: 0, paymentMethod: 'bank_transfer', paymentReference: '', notes: '' });
    } else if (type === 'RENEW') {
      setForm({ durationMonths: 12, amountPaid: 0, paymentMethod: 'bank_transfer', paymentReference: '', notes: '' });
    } else if (type === 'UPGRADE') {
      setForm({ newPlanId: '', durationMonths: 12, amountPaid: 0, paymentMethod: 'bank_transfer', notes: '' });
    } else if (type === 'EXTEND') {
      setForm({ additionalDays: 7, notes: '' });
    } else if (type === 'CANCEL') {
      setForm({ reason: '', immediate: true });
    } else if (type === 'PAUSE') {
      setForm({ reason: '' });
    }
  }

  function closeModal() {
    setModal({ open: false, type: null, sub: null });
    setError('');
    setSubDetail(null);
  }

  // GET /super-admin/subscriptions/tenant/:tenantId
  async function loadTenantSubs(tenantId) {
    if (!tenantId) { setTenantSubs([]); return; }
    try {
      setLoadingTenantSubs(true);
      const data = await subscriptionsService.getByTenant(tenantId);
      setTenantSubs(data || []);
    } catch {
      setTenantSubs([]);
    } finally {
      setLoadingTenantSubs(false);
    }
  }

  function handleTenantFilter(e) {
    const id = e.target.value;
    setSelectedTenantId(id);
    setActiveTab('tenant');
    loadTenantSubs(id);
  }

  async function handleConfirm() {
    try {
      setSaving(true);
      const id = modal.sub?._id;
      if (modal.type === 'CREATE') await subscriptionsService.create(form);
      else if (modal.type === 'RENEW') await subscriptionsService.renew(id, form);
      else if (modal.type === 'UPGRADE') await subscriptionsService.upgrade(id, form);
      else if (modal.type === 'EXTEND') await subscriptionsService.extendTrial(id, form);
      else if (modal.type === 'CANCEL') await subscriptionsService.cancel(id, form);
      else if (modal.type === 'PAUSE') await subscriptionsService.pause(id, form);
      else if (modal.type === 'RESUME') await subscriptionsService.resume(id);
      await loadAll();
      closeModal();
    } catch (e) {
      setError(e?.response?.data?.message || 'Action failed');
    } finally {
      setSaving(false);
    }
  }

  const displaySubs =
    activeTab === 'expiring' ? expiring :
      activeTab === 'tenant' ? tenantSubs :
        subs;

  return (
    <div className="p-4 sm:p-8 w-full min-h-screen bg-gray-50/50">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-600" /> Client Subscriptions
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage billing, renewals, and client packages.</p>
        </div>
        <button onClick={() => openModal('CREATE')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
          <Plus className="w-5 h-5" /> New Subscription
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active', value: stats.active, icon: Activity, color: 'emerald' },
            { label: 'Expiring (15d)', value: stats.expiringIn15Days, icon: Clock, color: 'orange' },
            { label: 'Revenue', value: `₹${(stats.totalRevenueCollected || 0).toLocaleString()}`, icon: IndianRupee, color: 'indigo' },
            { label: 'Trialing', value: stats.trialing, icon: TrendingUp, color: 'blue' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 bg-${color}-50 rounded-full flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 text-${color}-600`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">{label}</p>
                <h3 className="text-2xl font-black text-gray-900">{value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-wrap items-center border-b border-gray-200 gap-0">
          {[['all', 'All Subscriptions'], ['expiring', 'Expiring Soon'], ['tenant', 'By Tenant']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
          {/* Tenant filter dropdown — GET /subscriptions/tenant/:tenantId */}
          {activeTab === 'tenant' && (
            <div className="ml-auto px-4 py-2">
              <select
                value={selectedTenantId}
                onChange={handleTenantFilter}
                className="text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Tenant choose karo --</option>
                {tenants.map(t => (
                  <option key={t._id} value={t._id}>{t.name} ({t.slug})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading || (activeTab === 'tenant' && loadingTenantSubs) ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Client', 'Plan', 'Status', 'Start', 'End', 'Amount', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displaySubs.map((sub) => (
                  <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900">{sub.tenantId?.name || sub.tenantId}</div>
                      <div className="text-xs text-gray-400 font-mono">{sub.invoiceNumber}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-800">{sub.planId?.name || '—'}</div>
                      <div className="text-xs text-gray-500">{sub.billingCycle}</div>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={sub.status} /></td>
                    <td className="px-5 py-4 whitespace-nowrap text-gray-600">{fmt(sub.startDate)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-gray-600">{fmt(sub.endDate)}</td>
                    <td className="px-5 py-4 whitespace-nowrap font-semibold text-gray-800">₹{(sub.amountPaid || 0).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openModal('VIEW', sub)} title="View" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openModal('RENEW', sub)} title="Renew" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
                        <button onClick={() => openModal('UPGRADE', sub)} title="Upgrade" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><ArrowUpCircle className="w-4 h-4" /></button>
                        <button onClick={() => openModal('EXTEND', sub)} title="Extend Trial" className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg"><Clock className="w-4 h-4" /></button>
                        {sub.status === 'paused'
                          ? <button onClick={() => openModal('RESUME', sub)} title="Resume" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><PlayCircle className="w-4 h-4" /></button>
                          : <button onClick={() => openModal('PAUSE', sub)} title="Pause" className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg"><PauseCircle className="w-4 h-4" /></button>
                        }
                        <button onClick={() => openModal('CANCEL', sub)} title="Cancel" className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><XCircle className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {displaySubs.length === 0 && (
                  <tr><td colSpan={7} className="py-16 text-center text-gray-400">Koi subscription nahi mili</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {modal.type === 'CREATE' && <><Plus className="w-5 h-5 text-indigo-600" />New Subscription</>}
                {modal.type === 'VIEW' && <><Eye className="w-5 h-5 text-blue-600" />Details</>}
                {modal.type === 'RENEW' && <><RefreshCw className="w-5 h-5 text-emerald-600" />Renew</>}
                {modal.type === 'UPGRADE' && <><ArrowUpCircle className="w-5 h-5 text-indigo-600" />Upgrade Plan</>}
                {modal.type === 'EXTEND' && <><Clock className="w-5 h-5 text-purple-600" />Extend Trial</>}
                {modal.type === 'PAUSE' && <><PauseCircle className="w-5 h-5 text-yellow-600" />Pause</>}
                {modal.type === 'RESUME' && <><PlayCircle className="w-5 h-5 text-emerald-600" />Resume</>}
                {modal.type === 'CANCEL' && <><AlertCircle className="w-5 h-5 text-red-600" />Cancel</>}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 p-1 rounded-md"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

              {/* VIEW — GET /super-admin/subscriptions/:id */}
              {modal.type === 'VIEW' && (
                <div className="space-y-3">
                  {loadingDetail ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : (() => {
                    const s = subDetail || modal.sub;
                    return (
                      <>
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border">
                          <div>
                            <p className="font-bold text-gray-900">{s.tenantId?.name || s.tenantId}</p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{s.invoiceNumber}</p>
                          </div>
                          <StatusBadge status={s.status} />
                        </div>
                        {[
                          ['Plan', s.planId?.name],
                          ['Billing Cycle', s.billingCycle],
                          ['Amount Paid', `₹${(s.amountPaid || 0).toLocaleString()}`],
                          ['Payment Method', s.paymentMethod],
                          ['Payment Ref', s.paymentReference || '—'],
                          ['Start Date', fmt(s.startDate)],
                          ['End Date', fmt(s.endDate)],
                          ['Trial Ends', s.trialEndsAt ? fmt(s.trialEndsAt) : null],
                          ['Cancelled At', s.cancelledAt ? fmt(s.cancelledAt) : null],
                          ['Cancel Reason', s.cancelReason || null],
                          ['Paused At', s.pausedAt ? fmt(s.pausedAt) : null],
                          ['Notes', s.notes || null],
                          ['Auto Renew', s.autoRenew ? 'Yes' : 'No'],
                          ['Created At', s.createdAt ? fmt(s.createdAt) : null],
                        ].filter(([, v]) => v != null && v !== '').map(([k, v]) => (
                          <div key={k} className="flex justify-between text-sm py-2 border-b border-gray-100">
                            <span className="text-gray-500">{k}</span>
                            <span className="font-semibold text-gray-800">{v}</span>
                          </div>
                        ))}
                        {/* Timeline */}
                        {s.timeline?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Timeline ({s.timeline.length} events)</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {[...s.timeline].reverse().map((t, i) => (
                                <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs">
                                  <span className="font-bold text-indigo-700 uppercase mr-2">{t.action}</span>
                                  <span className="text-gray-500">{t.note}</span>
                                  <div className="text-gray-400 mt-0.5">{t.timestamp ? fmt(t.timestamp) : ''} • {t.performedBy}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* CREATE */}
              {modal.type === 'CREATE' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tenant</label>
                    <select value={form.tenantId} onChange={e => setForm(f => ({ ...f, tenantId: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">-- Select Tenant --</option>
                      {tenants.map(t => <option key={t._id} value={t._id}>{t.name} ({t.slug})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Plan</label>
                    <select value={form.planId} onChange={e => setForm(f => ({ ...f, planId: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">-- Select Plan --</option>
                      {plans.map(p => <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>)}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={form.isTrial} onChange={e => setForm(f => ({ ...f, isTrial: e.target.checked }))} className="rounded" />
                    Trial ke roop mein
                  </label>
                  {form.isTrial ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Trial Days</label>
                      <input type="number" value={form.trialDays || 14} onChange={e => setForm(f => ({ ...f, trialDays: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Months)</label>
                        <input type="number" value={form.durationMonths} onChange={e => setForm(f => ({ ...f, durationMonths: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₹)</label>
                        <input type="number" value={form.amountPaid} onChange={e => setForm(f => ({ ...f, amountPaid: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Method</label>
                    <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Reference</label>
                    <input type="text" value={form.paymentReference} onChange={e => setForm(f => ({ ...f, paymentReference: e.target.value }))} placeholder="UTR / Transaction ID" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              )}

              {/* RENEW */}
              {modal.type === 'RENEW' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 p-3 rounded-lg text-sm text-emerald-800 border border-emerald-100">
                    Renewing: <span className="font-bold">{modal.sub?.tenantId?.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Months)</label>
                      <input type="number" value={form.durationMonths} onChange={e => setForm(f => ({ ...f, durationMonths: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₹)</label>
                      <input type="number" value={form.amountPaid} onChange={e => setForm(f => ({ ...f, amountPaid: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Method</label>
                    <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Reference</label>
                    <input type="text" value={form.paymentReference} onChange={e => setForm(f => ({ ...f, paymentReference: e.target.value }))} placeholder="UTR / Transaction ID" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
              )}

              {/* UPGRADE */}
              {modal.type === 'UPGRADE' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Plan</label>
                    <select value={form.newPlanId} onChange={e => setForm(f => ({ ...f, newPlanId: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">-- Select New Plan --</option>
                      {plans.map(p => <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Months)</label>
                      <input type="number" value={form.durationMonths} onChange={e => setForm(f => ({ ...f, durationMonths: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₹)</label>
                      <input type="number" value={form.amountPaid} onChange={e => setForm(f => ({ ...f, amountPaid: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                </div>
              )}

              {/* EXTEND TRIAL */}
              {modal.type === 'EXTEND' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-3 rounded-lg text-sm text-purple-800 border border-purple-100">
                    Trial extend karo: <span className="font-bold">{modal.sub?.tenantId?.name}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Extra Days</label>
                    <input type="number" value={form.additionalDays} onChange={e => setForm(f => ({ ...f, additionalDays: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                    <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
              )}

              {/* PAUSE */}
              {modal.type === 'PAUSE' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 border border-yellow-100">
                    <span className="font-bold">{modal.sub?.tenantId?.name}</span> ka subscription pause hoga. Access band ho jayega.
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Reason</label>
                    <input type="text" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                  </div>
                </div>
              )}

              {/* RESUME */}
              {modal.type === 'RESUME' && (
                <div className="text-center py-4">
                  <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-100 mb-4">
                    <PlayCircle className="h-7 w-7 text-emerald-600" />
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold">{modal.sub?.tenantId?.name}</span> ka subscription resume hoga aur access wapas milega.
                  </p>
                </div>
              )}

              {/* CANCEL */}
              {modal.type === 'CANCEL' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-3">
                      <XCircle className="h-7 w-7 text-red-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      <span className="font-bold">{modal.sub?.tenantId?.name}</span> ka subscription cancel hoga.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Reason (required)</label>
                    <input type="text" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Cancellation reason..." />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={form.immediate} onChange={e => setForm(f => ({ ...f, immediate: e.target.checked }))} className="rounded" />
                    Turant suspend karo
                  </label>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                {modal.type === 'VIEW' ? 'Close' : 'Cancel'}
              </button>
              {modal.type !== 'VIEW' && (
                <button onClick={handleConfirm} disabled={saving}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 ${modal.type === 'CANCEL' ? 'bg-red-600 hover:bg-red-700' : modal.type === 'PAUSE' ? 'bg-yellow-600 hover:bg-yellow-700' : modal.type === 'RESUME' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modal.type === 'CANCEL' ? 'Cancel Subscription' : modal.type === 'PAUSE' ? 'Pause' : modal.type === 'RESUME' ? 'Resume' : 'Confirm'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
