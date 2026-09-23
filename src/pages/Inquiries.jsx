import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  UserX,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Trash2,
  Check,
  Send,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import inquiriesService from '../services/inquiries.service';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  contacted: { label: 'Contacted', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Phone },
  demo_scheduled: { label: 'Demo Scheduled', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Sparkles },
  converted: { label: 'Converted', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: UserX },
};

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, contacted: 0, scheduled: 0, converted: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await inquiriesService.getAll({
        search,
        status: statusFilter,
        page,
        limit: 15,
      });
      setInquiries(data?.items || []);
      setTotalPages(data?.totalPages || 1);
      if (data?.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [search, statusFilter, page]);

  const handleOpenStatusModal = (item) => {
    setSelectedInquiry(item);
    setEditStatus(item.status || 'pending');
    setAdminNotes(item.adminNotes || '');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    setUpdating(true);
    try {
      await inquiriesService.updateStatus(selectedInquiry._id, {
        status: editStatus,
        adminNotes,
      });
      setStatusModalOpen(false);
      fetchInquiries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await inquiriesService.delete(id);
      fetchInquiries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete inquiry');
    }
  };

  const openWhatsApp = (inquiry) => {
    const cleanPhone = (inquiry.phone || '').replace(/[^0-9]/g, '');
    const num = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    const msg = encodeURIComponent(`Namaste ${inquiry.name} ji, this is regarding your inquiry for the Vikas Darpan platform for ${inquiry.constituency}.`);
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Website Inquiries & Leads</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time VIP demo requests and queries submitted directly from the Vikas Darpan landing portal.
          </p>
        </div>
        <button
          onClick={fetchInquiries}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'all' ? 'bg-[#072F2B] text-white border-teal-950 shadow-md' : 'bg-white text-gray-800 border-gray-200 hover:border-teal-300'}`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">Total Inquiries</span>
          <p className="text-2xl font-black mt-1">{stats.total}</p>
        </div>

        <div 
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'pending' ? 'bg-amber-500 text-white border-amber-600 shadow-md' : 'bg-white text-amber-800 border-amber-200 hover:border-amber-400'}`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">Pending Action</span>
          <p className="text-2xl font-black mt-1">{stats.pending}</p>
        </div>

        <div 
          onClick={() => setStatusFilter('contacted')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'contacted' ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-white text-blue-800 border-blue-200 hover:border-blue-400'}`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">Contacted</span>
          <p className="text-2xl font-black mt-1">{stats.contacted}</p>
        </div>

        <div 
          onClick={() => setStatusFilter('demo_scheduled')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'demo_scheduled' ? 'bg-purple-600 text-white border-purple-700 shadow-md' : 'bg-white text-purple-800 border-purple-200 hover:border-purple-400'}`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">Demo Scheduled</span>
          <p className="text-2xl font-black mt-1">{stats.scheduled}</p>
        </div>

        <div 
          onClick={() => setStatusFilter('converted')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'converted' ? 'bg-emerald-600 text-white border-emerald-700 shadow-md' : 'bg-white text-emerald-800 border-emerald-200 hover:border-emerald-400'}`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">Converted (Tenants)</span>
          <p className="text-2xl font-black mt-1">{stats.converted}</p>
        </div>

        <div 
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'rejected' ? 'bg-rose-600 text-white border-rose-700 shadow-md' : 'bg-white text-rose-800 border-rose-200 hover:border-rose-400'}`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">Closed / Dropped</span>
          <p className="text-2xl font-black mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Name, Phone, Area or Role..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full md:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-600"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="demo_scheduled">Demo Scheduled</option>
            <option value="converted">Converted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Inquiries List Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Prospect / Leader</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Constituency & State</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4">Received On</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                    Fetching inquiries from database...
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    No website inquiries found matching your filters.
                  </td>
                </tr>
              ) : (
                inquiries.map((item) => {
                  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                  const Icon = cfg.icon;

                  return (
                    <tr key={item._id} className="hover:bg-teal-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                        {item.message && (
                          <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5" title={item.message}>
                            "{item.message}"
                          </div>
                        )}
                        {item.adminNotes && (
                          <div className="inline-block mt-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded text-[10px] font-medium">
                            Note: {item.adminNotes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-900 font-semibold">
                          <Phone className="w-3.5 h-3.5 text-teal-600" />
                          <a href={`tel:${item.phone}`} className="hover:underline">{item.phone}</a>
                        </div>
                        {item.email && (
                          <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{item.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-gray-900 font-bold">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{item.constituency || 'General'}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 pl-4">{item.state || 'India'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-[11px] font-semibold border border-slate-200">
                          {item.role || 'Leader'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 pl-4">
                          {new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleOpenStatusModal(item)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${cfg.color}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{cfg.label}</span>
                          <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openWhatsApp(item)}
                            title="Chat on WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <a
                            href={`tel:${item.phone}`}
                            title="Call Prospect"
                            className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-700 hover:text-white transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(item._id)}
                            title="Delete Inquiry"
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-gray-100 rounded-lg font-semibold disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-gray-100 rounded-lg font-semibold disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Status & Notes Modal */}
      {statusModalOpen && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Update Inquiry Status</h3>
            <p className="text-xs text-gray-500 mb-4">
              Leader: <strong className="text-gray-800">{selectedInquiry.name}</strong> ({selectedInquiry.constituency})
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-600"
                >
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="demo_scheduled">Demo Scheduled</option>
                  <option value="converted">Converted to Client</option>
                  <option value="rejected">Rejected / Dropped</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Internal Admin Note</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Spoke with PA, agreed for Saturday 4 PM zoom demo..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:border-teal-600"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-[#072F2B] hover:bg-[#0b4640] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {updating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
