import React, { useState, useEffect } from 'react';
import {
  Globe, Plus, ShieldCheck, Trash2, Edit, AlertCircle,
  Search, CheckCircle, Clock, XCircle, Link, Loader2, Copy, Eye
} from 'lucide-react';
import domainsService from '../services/domains.service';

function StatusBadge({ status }) {
  const map = {
    verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending: 'bg-orange-100 text-orange-700 border-orange-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
    unconfigured: 'bg-gray-100 text-gray-500 border-gray-200',
  };
  const icons = {
    verified: <CheckCircle className="w-3.5 h-3.5" />,
    pending: <Clock className="w-3.5 h-3.5" />,
    failed: <XCircle className="w-3.5 h-3.5" />,
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 w-max ${map[status] || map.unconfigured}`}>
      {icons[status]} {status?.toUpperCase()}
    </span>
  );
}

function fmt(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN');
}

const TABS = [
  { id: 'all', label: 'All Clients' },
  { id: 'pending', label: 'Pending' },
  { id: 'verified', label: 'Verified' },
  { id: 'failed', label: 'Failed' },
];

export default function Domains() {
  const [domains, setDomains] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, type: null, item: null });
  const [domainInput, setDomainInput] = useState('');
  const [verifyForm, setVerifyForm] = useState({ forceVerify: false, method: 'AUTO' });
  const [verifyResult, setVerifyResult] = useState(null);
  const [dnsInstructions, setDnsInstructions] = useState(null);
  const [domainDetail, setDomainDetail] = useState(null);

  useEffect(() => { loadDomains(); }, [activeTab, search]);

  async function loadDomains() {
    try {
      setLoading(true);
      const params = { status: activeTab === 'all' ? undefined : activeTab };
      if (search) params.search = search;
      const res = await domainsService.getAll(params);
      setDomains(res?.data || res || []);
      setMeta(res?.meta || null);
    } catch {
      setError('Domains load nahi hue.');
    } finally {
      setLoading(false);
    }
  }

  function openModal(type, item = null) {
    setError('');
    setVerifyResult(null);
    setDnsInstructions(null);
    setDomainDetail(null);
    setModal({ open: true, type, item });
    if (type === 'SET') setDomainInput(item?.domain || '');
    if (type === 'VERIFY') setVerifyForm({ forceVerify: false, method: 'AUTO' });
    if (type === 'VIEW' && item?.tenantId) {
      domainsService.getDomainStatus(item.tenantId)
        .then(res => setDomainDetail(res))
        .catch(() => setDomainDetail(null));
    }
  }

  function closeModal() {
    setModal({ open: false, type: null, item: null });
    setError('');
    setVerifyResult(null);
    setDnsInstructions(null);
  }

  async function handleConfigure() {
    const clean = domainInput
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .trim()
      .toLowerCase();

    if (!clean) { setError('Domain enter karo (e.g. www.wncoders.com)'); return; }
    try {
      setSaving(true);
      const res = await domainsService.configureDomain(modal.item.tenantId, clean);
      setDnsInstructions(res);
      await loadDomains();
    } catch (e) {
      setError(e?.response?.data?.message || 'Configure failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleVerify() {
    try {
      setSaving(true);
      const res = await domainsService.verifyDomain(modal.item.tenantId, verifyForm);
      setVerifyResult(res);
      if (res.verified) await loadDomains();
    } catch (e) {
      setError(e?.response?.data?.message || 'Verify failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    try {
      setSaving(true);
      await domainsService.removeDomain(modal.item.tenantId);
      await loadDomains();
      closeModal();
    } catch (e) {
      setError(e?.response?.data?.message || 'Remove failed');
    } finally {
      setSaving(false);
    }
  }

  function copyText(text) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="w-full font-sans space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Globe className="w-6 h-6 text-indigo-600" /> Custom Domain Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">Configure and verify white-labeled domains for tenants.</p>
        {meta?.stats && (
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center min-w-[100px]">
              <div className="text-xl font-black text-blue-700">{meta.total || domains.length}</div>
              <div className="text-xs font-semibold text-blue-600">Total Clients</div>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2 text-center min-w-[100px]">
              <div className="text-xl font-black text-indigo-700">{meta.stats.totalConfigured}</div>
              <div className="text-xs font-semibold text-indigo-600">Domains Set</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-center min-w-[100px]">
              <div className="text-xl font-black text-emerald-700">{meta.stats.verified}</div>
              <div className="text-xs font-semibold text-emerald-600">Verified</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-center min-w-[100px]">
              <div className="text-xl font-black text-amber-700">{meta.stats.pending}</div>
              <div className="text-xs font-semibold text-amber-600">Pending</div>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-2 text-center min-w-[100px]">
              <div className="text-xl font-black text-rose-700">{meta.stats.failed}</div>
              <div className="text-xs font-semibold text-rose-600">Failed</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search tenant or domain..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Tenant', 'Custom Domain', 'Status', 'Last Checked', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {domains.map((item) => (
                  <tr key={item.tenantId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{item.tenantName}</div>
                      <div className="text-xs text-gray-400 font-mono">{item.tenantSlug}</div>
                    </td>
                    <td className="px-6 py-4">
                      {item.domain ? (
                        <div className="flex items-center gap-2">
                          <Link className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-semibold text-gray-800">{item.domain}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{fmt(item.lastCheckedAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {item.domain && (
                          <button onClick={() => openModal('VIEW', item)} title="View Detail" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                        )}
                        {item.status === 'unconfigured' ? (
                          <button onClick={() => openModal('SET', item)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors">
                            <Plus className="w-3.5 h-3.5" /> Add Domain
                          </button>
                        ) : (
                          <>
                            <button onClick={() => openModal('SET', item)} title="Edit" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => openModal('VERIFY', item)} title="Verify DNS" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><ShieldCheck className="w-4 h-4" /></button>
                            <button onClick={() => openModal('DELETE', item)} title="Remove" className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {domains.length === 0 && (
                  <tr><td colSpan={5} className="py-16 text-center text-gray-400">Koi domain nahi mila</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {modal.type === 'SET' && <><Globe className="w-5 h-5 text-indigo-600" />Configure Domain</>
                }
                {modal.type === 'VIEW'   && <><Eye className="w-5 h-5 text-blue-600" />Domain Detail</>}
                {modal.type === 'VERIFY' && <><ShieldCheck className="w-5 h-5 text-emerald-600" />Verify Domain</>}
                {modal.type === 'DELETE' && <><Trash2 className="w-5 h-5 text-red-600" />Remove Domain</>}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 p-1 rounded-md">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

              {/* Tenant info */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase">Tenant</span>
                <span className="font-bold text-gray-900">{modal.item?.tenantName}</span>
              </div>

              {modal.type === 'VIEW' && (
                <div className="space-y-3">
                  {!domainDetail ? (
                    <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
                  ) : (
                    <>
                      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <p className="text-xs font-bold text-indigo-500 uppercase mb-1">Domain</p>
                        <p className="font-bold text-indigo-900 text-lg">{domainDetail.domain || '—'}</p>
                      </div>
                      {[
                        ['Status',       domainDetail.status],
                        ['Tenant',       domainDetail.tenantName || modal.item?.tenantName],
                        ['Slug',         domainDetail.tenantSlug || modal.item?.tenantSlug],
                        ['Last Checked', domainDetail.lastCheckedAt ? fmt(domainDetail.lastCheckedAt) : '—'],
                        ['Verified At',  domainDetail.verifiedAt   ? fmt(domainDetail.verifiedAt)   : '—'],
                      ].map(([k, v]) => v && (
                        <div key={k} className="flex justify-between text-sm py-2 border-b border-gray-100">
                          <span className="text-gray-500 font-medium">{k}</span>
                          <span className="font-bold text-gray-800">{v}</span>
                        </div>
                      ))}
                      {domainDetail.dnsRecords?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-2">DNS Records</p>
                          {domainDetail.dnsRecords.map((rec, i) => (
                            <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono mb-2">
                              <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded mr-2">{rec.type}</span>
                              <span className="text-gray-600">{rec.name} → {rec.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* SET / CONFIGURE */}
              {modal.type === 'SET' && !dnsInstructions && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Custom Domain</label>
                  <input type="text" value={domainInput} onChange={e => setDomainInput(e.target.value)}
                    placeholder="e.g. www.wncoders.com or wncoders.com"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                    Sirf domain name dalein (bina https:// ya slash / ke). Save karne par DNS CNAME & TXT challenge records generate honge.
                  </p>
                </div>
              )}

              {/* DNS Instructions after configure */}
              {modal.type === 'SET' && dnsInstructions && (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-sm text-emerald-800 font-medium">
                    ✅ Domain configured! Client ko yeh DNS records add karne honge:
                  </div>
                  {dnsInstructions.dnsRecords?.map((rec, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">{rec.type}</span>
                        <button onClick={() => copyText(rec.value)} className="text-gray-400 hover:text-gray-700">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-gray-600"><span className="font-semibold">Name:</span> {rec.name}</div>
                      <div className="text-gray-600 break-all"><span className="font-semibold">Value:</span> {rec.value}</div>
                      <div className="text-gray-400 mt-1">{rec.purpose}</div>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500">DNS propagation mein 5-30 minute lag sakte hain. Baad mein Verify karo.</p>
                </div>
              )}

              {/* VERIFY */}
              {modal.type === 'VERIFY' && !verifyResult && (
                <div className="space-y-4">
                  <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                    <p className="text-xs font-semibold text-indigo-600 uppercase mb-1">Domain</p>
                    <p className="font-bold text-indigo-900">{modal.item?.domain}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Verification Method</label>
                    <select value={verifyForm.method} onChange={e => setVerifyForm(f => ({ ...f, method: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="AUTO">AUTO (CNAME + TXT dono check)</option>
                      <option value="TXT">TXT Record only</option>
                      <option value="CNAME">CNAME Record only</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={verifyForm.forceVerify}
                      onChange={e => setVerifyForm(f => ({ ...f, forceVerify: e.target.checked }))}
                      className="rounded text-emerald-600" />
                    Force Verify (DNS check bypass — Super Admin override)
                  </label>
                </div>
              )}

              {/* Verify Result */}
              {modal.type === 'VERIFY' && verifyResult && (
                <div className={`p-4 rounded-lg border ${verifyResult.verified ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                  <p className={`font-bold text-lg mb-2 ${verifyResult.verified ? 'text-emerald-700' : 'text-red-700'}`}>
                    {verifyResult.verified ? '✅ Domain Verified!' : '❌ Verification Failed'}
                  </p>
                  <p className="text-sm text-gray-700">{verifyResult.message}</p>
                  {verifyResult.matchedVia && (
                    <p className="text-xs text-emerald-600 mt-1 font-semibold">Matched via: {verifyResult.matchedVia}</p>
                  )}
                  {!verifyResult.verified && verifyResult.troubleshooting && (
                    <ul className="mt-3 space-y-1">
                      {verifyResult.troubleshooting.map((t, i) => (
                        <li key={i} className="text-xs text-red-600 flex items-start gap-1">
                          <span className="shrink-0">•</span>{t}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* DELETE */}
              {modal.type === 'DELETE' && (
                <div className="text-center py-2">
                  <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-3">
                    <Trash2 className="h-7 w-7 text-red-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Domain <span className="font-bold text-gray-900">{modal.item?.domain}</span> remove hoga.
                  </p>
                  <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                    Yeh tenant ka white-label routing turant band kar dega.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                {dnsInstructions || verifyResult ? 'Close' : 'Cancel'}
              </button>

              {modal.type === 'SET' && !dnsInstructions && (
                <button onClick={handleConfigure} disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 disabled:opacity-60">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Globe className="w-4 h-4" /> Save Domain
                </button>
              )}

              {modal.type === 'VERIFY' && !verifyResult && (
                <button onClick={handleVerify} disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2 disabled:opacity-60">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <ShieldCheck className="w-4 h-4" /> Run Verification
                </button>
              )}

              {modal.type === 'DELETE' && (
                <button onClick={handleRemove} disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 disabled:opacity-60">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
