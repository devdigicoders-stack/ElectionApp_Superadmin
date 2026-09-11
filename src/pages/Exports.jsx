import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet, Download, RefreshCw, Search, Shield, History,
  Users, UserCheck, AlertCircle, Calendar, Vote, UserPlus, CheckCircle2,
  Building2, Filter, Loader2, ArrowDownToLine, Clock, Laptop, Eye,
  Sparkles, FileText, ExternalLink, ChevronRight
} from 'lucide-react';
import exportsService from '../services/exports.service';

const DOMAIN_ICONS = {
  citizens: Users,
  members: UserCheck,
  complaints: AlertCircle,
  events: Calendar,
  polls: Vote,
  volunteers: UserPlus,
  'volunteer-tasks': CheckCircle2,
  tenants: Building2,
};

const DOMAIN_GRADIENTS = {
  citizens: 'from-blue-500 to-indigo-600',
  members: 'from-emerald-500 to-teal-700',
  complaints: 'from-amber-500 to-orange-600',
  events: 'from-purple-500 to-pink-600',
  polls: 'from-rose-500 to-red-600',
  volunteers: 'from-cyan-500 to-blue-600',
  'volunteer-tasks': 'from-teal-500 to-emerald-600',
  tenants: 'from-[#072F2B] to-[#0B4640]',
};

export default function Exports() {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'history'
  const [catalog, setCatalog] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [downloadingDomain, setDownloadingDomain] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [format, setFormat] = useState('csv'); // 'csv' | 'excel'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Auxiliary params modal (e.g. for eventId / pollId)
  const [paramModal, setParamModal] = useState({ open: false, domain: null, extraId: '' });

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);
      setErrorMessage('');
      const [catData, tenantsData] = await Promise.all([
        exportsService.getCatalog(),
        exportsService.getTenants(),
      ]);
      setCatalog(catData?.domains || []);
      setTenants(tenantsData || []);
    } catch (err) {
      console.error('Failed to load export catalog:', err);
      setErrorMessage('Export catalog load karne me dikkat aayi. Please refresh karein.');
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    try {
      setLoadingHistory(true);
      const res = await exportsService.getHistory(100);
      setHistory(res?.history || []);
    } catch (err) {
      console.error('Failed to load export history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === 'history') {
      loadHistory();
    }
  }

  async function handleDownload(domainKey, requiresId = false) {
    if (requiresId && !paramModal.extraId && !paramModal.open) {
      setParamModal({ open: true, domain: domainKey, extraId: '' });
      return;
    }

    try {
      setDownloadingDomain(domainKey);
      setErrorMessage('');
      setSuccessMessage('');

      const params = {
        format,
      };

      if (selectedTenantId) {
        params.tenantId = selectedTenantId;
      }
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (statusFilter) params.status = statusFilter;

      if (domainKey === 'events' && paramModal.extraId) {
        params.eventId = paramModal.extraId;
      }
      if (domainKey === 'polls' && paramModal.extraId) {
        params.pollId = paramModal.extraId;
      }

      const res = await exportsService.downloadExport(domainKey, params);
      setSuccessMessage(`File "${res.filename}" successfully exported and downloaded.`);
      if (paramModal.open) {
        setParamModal({ open: false, domain: null, extraId: '' });
      }

      // Auto-clear notification after 5s
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Download error:', err);
      const msg = err?.response?.data?.message || 'Export generate karne me samasya aayi. Query parameters check karein.';
      setErrorMessage(msg);
    } finally {
      setDownloadingDomain(null);
    }
  }

  const filteredCatalog = catalog.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.key.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12 font-sans text-gray-800">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#072F2B] to-[#0B4640] flex items-center justify-center text-white shadow-md shadow-emerald-950/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            Data Exports Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            SRS Section 58 & 59: Direct CSV & Excel exports with granular filters and permission-controlled audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (activeTab === 'catalog') loadInitialData();
              else loadHistory();
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading || loadingHistory ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Status Notifications ── */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2.5 animate-in fade-in-50 duration-200 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-center gap-2.5 animate-in fade-in-50 duration-200 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── Navigation Tabs ── */}
      <div className="flex border-b border-gray-200 space-x-6 text-sm font-bold">
        <button
          onClick={() => handleTabChange('catalog')}
          className={`pb-3.5 flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-[#072F2B] text-[#072F2B]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ArrowDownToLine className="w-4 h-4" />
          Available Export Catalogs ({catalog.length})
        </button>

        <button
          onClick={() => handleTabChange('history')}
          className={`pb-3.5 flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
            activeTab === 'history'
              ? 'border-[#072F2B] text-[#072F2B]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <History className="w-4 h-4" />
          Download Audit Log & History
        </button>
      </div>

      {/* ── TAB 1: CATALOG & EXPORT CONTROLS ── */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Universal Filter & Options Toolbar */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#072F2B]" /> Universal Export Settings
              </span>
              <span className="text-xs text-gray-400 font-medium">Applied automatically to all export domains below</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Target Client / Tenant Picker */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Target Client / Tenant</label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                >
                  <option value="">-- All Clients (or Platform Scope) --</option>
                  {tenants.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.leaderName || t.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* Format Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Export Format</label>
                <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setFormat('csv')}
                    className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      format === 'csv'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    CSV (.csv)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('excel')}
                    className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      format === 'excel'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Excel (.xlsx)
                  </button>
                </div>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Date Created (From)</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Date Created (To)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                />
              </div>
            </div>

            {/* Search within catalogs */}
            <div className="pt-2 border-t border-gray-100 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter export domains by name or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                />
              </div>
              {(selectedTenantId || startDate || endDate || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedTenantId('');
                    setStartDate('');
                    setEndDate('');
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Catalog Cards Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200">
              <Loader2 className="w-8 h-8 animate-spin text-[#072F2B] mb-3" />
              <p className="text-sm font-semibold text-gray-500">Loading export catalog from backend...</p>
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
              <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">Koi domain match nahi hua</h3>
              <p className="text-xs text-gray-500 mt-1">Search filter ko clear karein.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCatalog.map((domain) => {
                const Icon = DOMAIN_ICONS[domain.key] || FileSpreadsheet;
                const gradient = DOMAIN_GRADIENTS[domain.key] || 'from-[#072F2B] to-[#0B4640]';
                const isDownloading = downloadingDomain === domain.key;
                const requiresParam = Boolean(domain.requiredQueryParam);

                return (
                  <div
                    key={domain.key}
                    className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md hover:border-gray-300 transition-all p-5 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Row: Icon + Key badge */}
                      <div className="flex items-center justify-between gap-3 mb-3.5">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-mono text-[10px] font-bold uppercase tracking-wider">
                          {domain.key}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-gray-900 tracking-tight leading-snug group-hover:text-[#072F2B] transition-colors">
                        {domain.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                        {domain.description}
                      </p>

                      {/* Supported Filter Tags */}
                      {domain.supportedFilters?.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-gray-100 flex flex-wrap gap-1">
                          {domain.supportedFilters.slice(0, 4).map((f) => (
                            <span
                              key={f}
                              className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/80 text-slate-500 text-[9px] font-semibold"
                            >
                              +{f}
                            </span>
                          ))}
                          {domain.supportedFilters.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 text-[9px] font-semibold">
                              +{domain.supportedFilters.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-gray-400 font-semibold uppercase">
                        Format: {format.toUpperCase()}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDownload(domain.key, requiresParam)}
                        disabled={isDownloading}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                          isDownloading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-[#072F2B] hover:bg-[#0B4640] text-white hover:shadow-md'
                        }`}
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Exporting...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download {format.toUpperCase()}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: AUDIT & EXPORT HISTORY ── */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                Export Audit Trail (SRS Section 58 & 59)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Full chronological log of downloaded data files with admin identification, IP, record counts, and format.
              </p>
            </div>
            <button
              onClick={loadHistory}
              disabled={loadingHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className={`w-3 h-3 ${loadingHistory ? 'animate-spin' : ''}`} />
              Refresh Log
            </button>
          </div>

          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-[#072F2B] mb-2" />
              <p className="text-xs font-semibold text-gray-500">Loading audit history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 p-6">
              <History className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">Abhi tak koi export log darj nahi hua hai.</p>
              <p className="text-xs text-gray-400 mt-1">Jab bhi koi admin data export karega, yahan audit record banega.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-100/70 text-gray-500 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">Domain</th>
                    <th className="px-5 py-3">Records</th>
                    <th className="px-5 py-3">Performed By</th>
                    <th className="px-5 py-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {history.map((log) => {
                    const performed = log.performedBy || {};
                    const details = log.details || log.metadata || {};
                    const date = log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN') : '—';

                    return (
                      <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 text-gray-600 font-mono flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {date}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {log.action || 'DATA_EXPORT_DOWNLOADED'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-gray-900 uppercase font-mono">
                          {details.domain || 'Export'}
                        </td>
                        <td className="px-5 py-3.5 text-gray-700 font-semibold">
                          {details.recordCount !== undefined ? details.recordCount.toLocaleString() : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-gray-800">
                          <div className="font-bold">{performed.name || 'Admin'}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{performed.email || performed.id}</div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 font-mono">
                          {log.ipAddress || '127.0.0.1'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Required Param Modal (For Events / Polls) ── */}
      {paramModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              {paramModal.domain === 'events' ? 'Event Attendees Export' : 'Poll Survey Export'}
            </h3>
            <p className="text-xs text-gray-500">
              Is export ke liye specific ID dena anivarya hai:
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {paramModal.domain === 'events' ? 'Event ID' : 'Poll ID'}
              </label>
              <input
                type="text"
                placeholder={paramModal.domain === 'events' ? 'Enter MongoDB Event ID...' : 'Enter Poll ID...'}
                value={paramModal.extraId}
                onChange={(e) => setParamModal(prev => ({ ...prev, extraId: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setParamModal({ open: false, domain: null, extraId: '' })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDownload(paramModal.domain, false)}
                disabled={!paramModal.extraId.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#072F2B] text-white hover:bg-[#0B4640] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Start Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
