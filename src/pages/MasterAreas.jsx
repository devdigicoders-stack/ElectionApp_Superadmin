import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin, Plus, RefreshCw, Search, Trash2, Edit, CheckCircle2,
  AlertCircle, ChevronRight, ChevronLeft, Layers, Sparkles, Loader2, Building2,
  Globe, Landmark, ArrowRight, X, ExternalLink, Database
} from 'lucide-react';
import masterAreasService from '../services/masterAreas.service';

const LEVEL_COLORS = {
  state: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  lok_sabha: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  district: 'bg-blue-100 text-blue-800 border-blue-200',
  vidhan_sabha: 'bg-purple-100 text-purple-800 border-purple-200',
  block: 'bg-amber-100 text-amber-800 border-amber-200',
  panchayat: 'bg-teal-100 text-teal-800 border-teal-200',
  gram: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  ward: 'bg-rose-100 text-rose-800 border-rose-200',
};

const LEVEL_NAMES = {
  state: 'State',
  lok_sabha: 'Lok Sabha (PC)',
  district: 'District',
  vidhan_sabha: 'Vidhan Sabha (AC)',
  block: 'Block / Mandal',
  panchayat: 'Gram Panchayat',
  gram: 'Gram (Village)',
  ward: 'Ward / Booth',
};

export default function MasterAreas() {
  const [activeTab, setActiveTab] = useState('tree');
  const tabsContainerRef = useRef(null);

  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -220 : 220,
        behavior: 'smooth'
      });
    }
  };

  const [summary, setSummary] = useState({
    states: 0,
    lokSabhas: 0,
    districts: 0,
    vidhanSabhas: 0,
    blocks: 0,
    panchayats: 0,
    grams: 0,
    wards: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dropdown options
  const [states, setStates] = useState([]);
  const [lokSabhas, setLokSabhas] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [vidhanSabhas, setVidhanSabhas] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [panchayats, setPanchayats] = useState([]);
  const [grams, setGrams] = useState([]);
  const [wards, setWards] = useState([]);
  const [treeData, setTreeData] = useState([]);

  // Active filter state
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedLokSabhaId, setSelectedLokSabhaId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedVidhanSabhaId, setSelectedVidhanSabhaId] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [selectedPanchayatId, setSelectedPanchayatId] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingArea, setEditingArea] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    levelType: 'vidhan_sabha',
    stateId: '',
    lokSabhaId: '',
    districtId: '',
    vidhanSabhaId: '',
    blockId: '',
    panchayatId: '',
    gramId: '',
  });

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);
      setError('');
      const [sumRes, stRes, treeRes] = await Promise.all([
        masterAreasService.getSummary().catch(() => ({})),
        masterAreasService.getStates().catch(() => []),
        masterAreasService.getTree().catch(() => []),
      ]);
      setSummary(sumRes);
      setStates(stRes);
      setTreeData(treeRes);
      if (stRes.length > 0 && !selectedStateId) {
        setSelectedStateId(stRes[0]._id);
      }
    } catch {
      setError('Master geographic data load nahi ho saka.');
    } finally {
      setLoading(false);
    }
  }

  // Load level-specific lists when tab changes or filter changes
  useEffect(() => {
    if (activeTab === 'lok_sabha') {
      masterAreasService.getLokSabhas(selectedStateId).then(setLokSabhas).catch(() => setLokSabhas([]));
    }
    if (activeTab === 'district') {
      masterAreasService.getDistricts(selectedStateId).then(setDistricts).catch(() => setDistricts([]));
    }
    if (activeTab === 'vidhan_sabha') {
      masterAreasService.getVidhanSabhas({
        stateId: selectedStateId || undefined,
        lokSabhaId: selectedLokSabhaId || undefined,
        districtId: selectedDistrictId || undefined,
      }).then(setVidhanSabhas).catch(() => setVidhanSabhas([]));
    }
    if (activeTab === 'block') {
      masterAreasService.getBlocks({
        stateId: selectedStateId || undefined,
        lokSabhaId: selectedLokSabhaId || undefined,
        districtId: selectedDistrictId || undefined,
        vidhanSabhaId: selectedVidhanSabhaId || undefined,
      }).then(setBlocks).catch(() => setBlocks([]));
    }
    if (activeTab === 'panchayat') {
      masterAreasService.getPanchayats({
        stateId: selectedStateId || undefined,
        vidhanSabhaId: selectedVidhanSabhaId || undefined,
        blockId: selectedBlockId || undefined,
      }).then(setPanchayats).catch(() => setPanchayats([]));
    }
    if (activeTab === 'gram') {
      masterAreasService.getGrams({
        panchayatId: selectedPanchayatId || undefined,
        blockId: selectedBlockId || undefined,
      }).then(setGrams).catch(() => setGrams([]));
    }
    if (activeTab === 'ward') {
      masterAreasService.getWards({
        panchayatId: selectedPanchayatId || undefined,
      }).then(setWards).catch(() => setWards([]));
    }
  }, [activeTab, selectedStateId, selectedLokSabhaId, selectedDistrictId, selectedVidhanSabhaId, selectedBlockId, selectedPanchayatId]);

  // Load lookup lists when modal opens
  async function loadModalLookups(stateId) {
    const sId = stateId || selectedStateId || (states[0]?._id);
    const [ls, dist, vs, blk, gp, gm] = await Promise.all([
      masterAreasService.getLokSabhas(sId).catch(() => []),
      masterAreasService.getDistricts(sId).catch(() => []),
      masterAreasService.getVidhanSabhas({ stateId: sId }).catch(() => []),
      masterAreasService.getBlocks({ stateId: sId }).catch(() => []),
      masterAreasService.getPanchayats({ stateId: sId }).catch(() => []),
      masterAreasService.getGrams({}).catch(() => []),
    ]);
    setLokSabhas(ls);
    setDistricts(dist);
    setVidhanSabhas(vs);
    setBlocks(blk);
    setPanchayats(gp);
    setGrams(gm);
  }

  // 1-Click Seed Uttar Pradesh Master Data
  async function handleSeedUp() {
    try {
      setSeeding(true);
      setError('');
      setSuccessMsg('');
      const res = await masterAreasService.seedUttarPradesh();
      setSuccessMsg(res?.message || 'Uttar Pradesh Master Data seeded successfully!');
      await loadAllData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Seeding failed. Please check server logs.');
    } finally {
      setSeeding(false);
    }
  }

  function openCreateModal(levelType = 'vidhan_sabha') {
    openCreateChildModal(levelType, {});
  }

  function openCreateChildModal(targetLevel, parent = {}) {
    setError('');
    setSuccessMsg('');
    setModalMode('create');
    setEditingArea(null);

    let sId = parent.stateId?._id || parent.stateId || selectedStateId || states[0]?._id || '';
    let lsId = parent.lokSabhaId?._id || parent.lokSabhaId || selectedLokSabhaId || '';
    let distId = parent.districtId?._id || parent.districtId || selectedDistrictId || '';
    let vsId = parent.vidhanSabhaId?._id || parent.vidhanSabhaId || selectedVidhanSabhaId || '';
    let blkId = parent.blockId?._id || parent.blockId || selectedBlockId || '';
    let gpId = parent.panchayatId?._id || parent.panchayatId || selectedPanchayatId || '';
    let gmId = parent.gramId?._id || parent.gramId || '';

    // Inherit from parent based on parent's levelType
    if (targetLevel === 'lok_sabha' || targetLevel === 'district') {
      if (parent.levelType === 'state' || parent._id) sId = parent._id || sId;
    } else if (targetLevel === 'vidhan_sabha') {
      if (parent.levelType === 'lok_sabha') {
        lsId = parent._id;
        if (parent.stateId) sId = parent.stateId?._id || parent.stateId;
      } else if (parent.levelType === 'district') {
        distId = parent._id;
        if (parent.stateId) sId = parent.stateId?._id || parent.stateId;
      }
    } else if (targetLevel === 'block') {
      if (parent.levelType === 'vidhan_sabha') {
        vsId = parent._id;
        if (parent.lokSabhaId) lsId = parent.lokSabhaId?._id || parent.lokSabhaId;
        if (parent.districtId) distId = parent.districtId?._id || parent.districtId;
        if (parent.stateId) sId = parent.stateId?._id || parent.stateId;
      }
    } else if (targetLevel === 'panchayat') {
      if (parent.levelType === 'block') {
        blkId = parent._id;
        if (parent.vidhanSabhaId) vsId = parent.vidhanSabhaId?._id || parent.vidhanSabhaId;
        if (parent.stateId) sId = parent.stateId?._id || parent.stateId;
      }
    } else if (targetLevel === 'gram') {
      if (parent.levelType === 'panchayat') {
        gpId = parent._id;
        if (parent.blockId) blkId = parent.blockId?._id || parent.blockId;
      }
    } else if (targetLevel === 'ward') {
      if (parent.levelType === 'gram') {
        gmId = parent._id;
        if (parent.panchayatId) gpId = parent.panchayatId?._id || parent.panchayatId;
      } else if (parent.levelType === 'panchayat') {
        gpId = parent._id;
      }
    }

    setForm({
      name: '',
      code: '',
      levelType: targetLevel,
      stateId: sId,
      lokSabhaId: lsId,
      districtId: distId,
      vidhanSabhaId: vsId,
      blockId: blkId,
      panchayatId: gpId,
      gramId: gmId,
    });
    loadModalLookups(sId);
    setModalOpen(true);
  }

  function openEditModal(area) {
    setError('');
    setSuccessMsg('');
    setModalMode('edit');
    setEditingArea(area);
    const sId = area.stateId?._id || area.stateId || '';
    setForm({
      name: area.name || '',
      code: area.code || '',
      levelType: area.levelType,
      stateId: sId,
      lokSabhaId: area.lokSabhaId?._id || area.lokSabhaId || '',
      districtId: area.districtId?._id || area.districtId || '',
      vidhanSabhaId: area.vidhanSabhaId?._id || area.vidhanSabhaId || '',
      blockId: area.blockId?._id || area.blockId || '',
      panchayatId: area.panchayatId?._id || area.panchayatId || '',
      gramId: area.gramId?._id || area.gramId || '',
    });
    loadModalLookups(sId);
    setModalOpen(true);
  }

  async function handleSaveArea() {
    if (!form.name.trim()) {
      setError('Area Name anivarya hai.');
      return;
    }
    if (form.levelType !== 'state' && !form.stateId) {
      setError('State choose karna anivarya hai.');
      return;
    }
    if (form.levelType === 'vidhan_sabha' && !form.lokSabhaId) {
      setError('Vidhan Sabha ke liye Lok Sabha choose karna zaroori hai.');
      return;
    }
    if (form.levelType === 'block' && !form.vidhanSabhaId) {
      setError('Block ke liye Vidhan Sabha choose karna zaroori hai.');
      return;
    }
    if (form.levelType === 'panchayat' && !form.blockId) {
      setError('Panchayat ke liye Block choose karna zaroori hai.');
      return;
    }
    if (form.levelType === 'gram' && !form.panchayatId) {
      setError('Gram (Village) ke liye Gram Panchayat choose karna zaroori hai.');
      return;
    }
    if (form.levelType === 'ward' && !form.gramId && !form.panchayatId) {
      setError('Ward ke liye Gram (Village) ya Panchayat choose karna zaroori hai.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      if (modalMode === 'create') {
        await masterAreasService.createArea(form);
        setSuccessMsg(`New ${LEVEL_NAMES[form.levelType]} created successfully.`);
      } else {
        await masterAreasService.updateArea(editingArea._id, form);
        setSuccessMsg(`${LEVEL_NAMES[form.levelType]} updated successfully.`);
      }
      setModalOpen(false);
      await loadAllData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Area save nahi ho saka.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteArea(id, name) {
    if (!window.confirm(`Kya aap sach me "${name}" ko Master Database se delete karna chahte hain?`)) return;
    try {
      setError('');
      await masterAreasService.deleteArea(id);
      setSuccessMsg(`"${name}" successfully deleted.`);
      await loadAllData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete nahi ho saka. Child areas check karein.');
    }
  }

  return (
    <div className="space-y-6 pb-12 text-gray-800">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#072F2B] to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-950/20 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-black text-gray-900 tracking-tight">Master Geographic Area Database</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200 shadow-2xs">
                  8-Tier Architecture
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Central Electoral & Grassroots Hierarchy (State ➔ Lok Sabha ➔ District ➔ Vidhan Sabha ➔ Block ➔ Panchayat ➔ Gram ➔ Ward)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleSeedUp}
            disabled={seeding}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-60"
            title="Seed real-world Uttar Pradesh constituencies and blocks"
          >
            {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" /> : <Sparkles className="w-3.5 h-3.5 text-purple-600" />}
            <span>{seeding ? 'Seeding UP Master Data...' : 'Seed UP Master Data'}</span>
          </button>

          <button
            type="button"
            onClick={() => openCreateModal(activeTab === 'tree' ? 'vidhan_sabha' : activeTab)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#072F2B] hover:bg-[#0B4640] text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Geographic Area</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Summary KPI Cards — Balanced 5-Column Responsive Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {[
          { id: 'state', tier: 'L1 • State', label: 'States', count: summary.states, color: 'text-emerald-700', bg: 'bg-emerald-50/70', border: 'border-emerald-200/80', badgeBg: 'bg-emerald-100 text-emerald-800', icon: Globe },
          { id: 'lok_sabha', tier: 'L2 • Lok Sabha', label: 'Lok Sabhas', count: summary.lokSabhas, color: 'text-indigo-700', bg: 'bg-indigo-50/70', border: 'border-indigo-200/80', badgeBg: 'bg-indigo-100 text-indigo-800', icon: Landmark },
          { id: 'district', tier: 'L3 • District', label: 'Districts', count: summary.districts, color: 'text-blue-700', bg: 'bg-blue-50/70', border: 'border-blue-200/80', badgeBg: 'bg-blue-100 text-blue-800', icon: Building2 },
          { id: 'vidhan_sabha', tier: 'L4 • Vidhan Sabha', label: 'Vidhan Sabhas', count: summary.vidhanSabhas, color: 'text-purple-700', bg: 'bg-purple-50/70', border: 'border-purple-200/80', badgeBg: 'bg-purple-100 text-purple-800', icon: Layers },
          { id: 'block', tier: 'L5 • Block', label: 'Blocks', count: summary.blocks, color: 'text-amber-700', bg: 'bg-amber-50/70', border: 'border-amber-200/80', badgeBg: 'bg-amber-100 text-amber-800', icon: MapPin },
          { id: 'panchayat', tier: 'L6 • Panchayat', label: 'Panchayats', count: summary.panchayats || 0, color: 'text-teal-700', bg: 'bg-teal-50/70', border: 'border-teal-200/80', badgeBg: 'bg-teal-100 text-teal-800', icon: Building2 },
          { id: 'gram', tier: 'L7 • Village', label: 'Grams (Villages)', count: summary.grams || 0, color: 'text-cyan-700', bg: 'bg-cyan-50/70', border: 'border-cyan-200/80', badgeBg: 'bg-cyan-100 text-cyan-800', icon: MapPin },
          { id: 'ward', tier: 'L8 • Booth/Ward', label: 'Wards / Booths', count: summary.wards || 0, color: 'text-rose-700', bg: 'bg-rose-50/70', border: 'border-rose-200/80', badgeBg: 'bg-rose-100 text-rose-800', icon: Layers },
        ].map((item) => {
          const Icon = item.icon;
          const isCurrent = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${item.bg} ${item.border} ${
                isCurrent
                  ? 'ring-2 ring-emerald-600 ring-offset-2 shadow-sm bg-white'
                  : 'hover:shadow-xs hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${item.badgeBg}`}>
                  {item.tier}
                </span>
                <div className="w-7 h-7 rounded-xl bg-white/90 shadow-2xs flex items-center justify-center shrink-0 border border-white group-hover:scale-105 transition-transform">
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700 truncate">{item.label}</p>
                <p className={`text-2xl font-black mt-0.5 tracking-tight ${item.color}`}>{item.count}</p>
              </div>
            </button>
          );
        })}

        {/* Highlighted Master Database Grand Total Card */}
        <button
          type="button"
          onClick={() => setActiveTab('tree')}
          className={`col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-2 p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer bg-gradient-to-r from-[#072F2B] via-[#0B3F3A] to-[#0E4C46] border-[#0B4640] text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
            activeTab === 'tree' ? 'ring-2 ring-emerald-400 ring-offset-2' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 border border-emerald-400/20">
                Master Database
              </span>
              <span className="text-[10px] font-bold text-emerald-300/80">• 8 Tiers Active</span>
            </div>
            <div className="w-7 h-7 rounded-xl bg-white/10 shadow-2xs flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-105 transition-transform">
              <Database className="w-3.5 h-3.5 text-emerald-300" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-100/90">Total Master Records</p>
              <p className="text-2xl font-black mt-0.5 tracking-tight text-white">{summary.total || 0}</p>
            </div>
            <span className="text-[10px] font-semibold text-emerald-300/90 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              <span>Hierarchy Tree</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </button>
      </div>

      {/* Main Content Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
        {/* Navigation Tabs Bar — Scrollbar Hidden + Sleek Navigation */}
        <div className="relative border-b border-gray-200 bg-gray-50/90 flex items-center px-1">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scrollTabs('left')}
            className="hidden sm:flex items-center justify-center w-7 h-7 text-gray-400 hover:text-gray-800 hover:bg-gray-200/70 rounded-lg shrink-0 transition-colors cursor-pointer mr-1"
            title="Scroll tabs left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Tabs */}
          <div
            ref={tabsContainerRef}
            className="flex items-center gap-1.5 py-2 px-1 flex-1 overflow-x-auto scroll-smooth no-scrollbar"
          >
            {[
              { id: 'tree', label: 'Hierarchy Tree Flow', icon: Layers, count: null },
              { id: 'state', label: 'States', icon: Globe, count: summary.states },
              { id: 'lok_sabha', label: 'Lok Sabha', icon: Landmark, count: summary.lokSabhas },
              { id: 'district', label: 'Districts', icon: Building2, count: summary.districts },
              { id: 'vidhan_sabha', label: 'Vidhan Sabha', icon: Layers, count: summary.vidhanSabhas },
              { id: 'block', label: 'Blocks', icon: MapPin, count: summary.blocks },
              { id: 'panchayat', label: 'Panchayats', icon: Building2, count: summary.panchayats || 0 },
              { id: 'gram', label: 'Grams', icon: MapPin, count: summary.grams || 0 },
              { id: 'ward', label: 'Wards', icon: Layers, count: summary.wards || 0 },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#072F2B] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-gray-500'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200/90 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scrollTabs('right')}
            className="hidden sm:flex items-center justify-center w-7 h-7 text-gray-400 hover:text-gray-800 hover:bg-gray-200/70 rounded-lg shrink-0 transition-colors cursor-pointer ml-1"
            title="Scroll tabs right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Filters Bar */}
        <div className="p-3.5 sm:p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 flex-wrap flex-1 w-full sm:w-auto">
            {/* State Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase">State:</span>
              <select
                value={selectedStateId}
                onChange={e => setSelectedStateId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold outline-none bg-white focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                {states.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code || 'IN'})</option>
                ))}
              </select>
            </div>

            {/* Lok Sabha Filter */}
            {(activeTab === 'vidhan_sabha' || activeTab === 'block') && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Lok Sabha:</span>
                <select
                  value={selectedLokSabhaId}
                  onChange={e => setSelectedLokSabhaId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold outline-none bg-white focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                >
                  <option value="">All Lok Sabhas</option>
                  {lokSabhas.map(ls => (
                    <option key={ls._id} value={ls._id}>{ls.name} ({ls.code || ''})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Vidhan Sabha Filter for Blocks and Panchayats */}
            {(activeTab === 'block' || activeTab === 'panchayat') && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Vidhan Sabha:</span>
                <select
                  value={selectedVidhanSabhaId}
                  onChange={e => setSelectedVidhanSabhaId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold outline-none bg-white focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                >
                  <option value="">All Vidhan Sabhas</option>
                  {vidhanSabhas.map(vs => (
                    <option key={vs._id} value={vs._id}>{vs.name} ({vs.code || ''})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Block Filter for Panchayats and Grams */}
            {(activeTab === 'panchayat' || activeTab === 'gram') && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Block:</span>
                <select
                  value={selectedBlockId}
                  onChange={e => setSelectedBlockId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold outline-none bg-white focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                >
                  <option value="">All Blocks</option>
                  {blocks.map(b => (
                    <option key={b._id} value={b._id}>{b.name} ({b.code || ''})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Panchayat Filter for Grams and Wards */}
            {(activeTab === 'gram' || activeTab === 'ward') && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Panchayat:</span>
                <select
                  value={selectedPanchayatId}
                  onChange={e => setSelectedPanchayatId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold outline-none bg-white focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                >
                  <option value="">All Panchayats</option>
                  {panchayats.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.code || ''})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Search Box and Quick Add Action */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search area name or code..."
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-600 bg-gray-50/50 focus:bg-white transition-all"
              />
            </div>

            <button
              type="button"
              onClick={() => openCreateChildModal(activeTab === 'tree' ? 'vidhan_sabha' : activeTab)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#072F2B] hover:bg-[#0B4640] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer shrink-0 transition-colors"
              title={`Add new ${activeTab === 'tree' ? 'Area' : LEVEL_NAMES[activeTab]}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add {activeTab === 'tree' ? 'Area' : LEVEL_NAMES[activeTab]}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: TREE VIEW */}
        {activeTab === 'tree' && (
          <div className="p-6 overflow-y-auto max-h-[650px] space-y-6">
            {treeData.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="font-bold text-gray-700 text-sm">No Master Geographic Data Found</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Click the "Seed UP Master Data" button above to immediately populate real Uttar Pradesh electoral constituencies and blocks.
                </p>
                <button
                  type="button"
                  onClick={handleSeedUp}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  Seed Uttar Pradesh Master Data Now
                </button>
              </div>
            ) : (
              treeData.map(st => (
                <div key={st._id} className="p-5 bg-gray-50/70 rounded-2xl border border-gray-200 space-y-4">
                  {/* State Header */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-2xs flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                        State
                      </span>
                      <h3 className="font-extrabold text-base text-gray-900">{st.name}</h3>
                      <span className="text-xs font-mono text-gray-500">({st.code})</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-xs font-semibold text-gray-500 hidden sm:block">
                        <span>{(st.lokSabhas || []).length} Lok Sabhas</span> • <span>{(st.districts || []).length} Districts</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openCreateChildModal('lok_sabha', st)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                        title="Add new Lok Sabha under this State"
                      >
                        <Plus className="w-3 h-3" /> Add Lok Sabha
                      </button>
                      <button
                        type="button"
                        onClick={() => openCreateChildModal('district', st)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                        title="Add new District under this State"
                      >
                        <Plus className="w-3 h-3" /> Add District
                      </button>
                    </div>
                  </div>

                  {/* Lok Sabhas Nested Cards */}
                  <div className="space-y-3.5 pl-2 sm:pl-4 border-l-2 border-indigo-200">
                    {(st.lokSabhas || []).map(ls => (
                      <div key={ls._id} className="p-4 bg-white rounded-xl border border-gray-200 space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-800 uppercase">
                              Lok Sabha
                            </span>
                            <span className="font-bold text-sm text-gray-900">{ls.name}</span>
                            {ls.code && <span className="text-xs font-mono text-gray-400">({ls.code})</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-semibold hidden sm:inline">
                              {(ls.vidhanSabhas || []).length} Assembly Constituencies
                            </span>
                            <button
                              type="button"
                              onClick={() => openCreateChildModal('vidhan_sabha', { ...ls, stateId: st._id })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                              title={`Add Vidhan Sabha under ${ls.name}`}
                            >
                              <Plus className="w-3 h-3" /> Add Vidhan Sabha
                            </button>
                          </div>
                        </div>

                        {/* Vidhan Sabhas Grid under this Lok Sabha */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                          {(ls.vidhanSabhas || []).map(vs => (
                            <div key={vs._id} className="p-3 bg-purple-50/40 border border-purple-100 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                                  {vs.name}
                                </span>
                                {vs.code && <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">{vs.code}</span>}
                              </div>

                              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                <span>District:</span>
                                <strong className="text-gray-800">{vs.districtId?.name || '—'}</strong>
                              </div>

                              {/* Blocks Chips */}
                              <div className="pt-1.5 border-t border-purple-100/60">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] text-gray-500 uppercase font-bold">Blocks ({vs.blocks?.length || 0}):</span>
                                  <button
                                    type="button"
                                    onClick={() => openCreateChildModal('block', { ...vs, lokSabhaId: ls._id, stateId: st._id })}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-bold cursor-pointer transition-colors"
                                    title={`Add Block under ${vs.name}`}
                                  >
                                    <Plus className="w-2.5 h-2.5" /> Block
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(vs.blocks || []).map(b => (
                                    <div key={b._id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-amber-200 text-amber-900 shadow-2xs">
                                      <span>{b.name}</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openCreateChildModal('panchayat', { ...b, vidhanSabhaId: vs._id, stateId: st._id });
                                        }}
                                        className="text-amber-600 hover:text-amber-900 font-bold ml-0.5 hover:scale-125 transition-transform cursor-pointer"
                                        title={`Add Gram Panchayat under ${b.name}`}
                                      >
                                        +
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2, 3, 4, 5, 6: TABLE VIEW */}
        {activeTab !== 'tree' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Area Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Parent Linkage Hierarchy</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {(() => {
                  let list = [];
                  if (activeTab === 'state') list = states;
                  if (activeTab === 'lok_sabha') list = lokSabhas;
                  if (activeTab === 'district') list = districts;
                  if (activeTab === 'vidhan_sabha') list = vidhanSabhas;
                  if (activeTab === 'block') list = blocks;
                  if (activeTab === 'panchayat') list = panchayats;
                  if (activeTab === 'gram') list = grams;
                  if (activeTab === 'ward') list = wards;

                  const filtered = list.filter(item =>
                    !search ||
                    item.name.toLowerCase().includes(search.toLowerCase()) ||
                    (item.code && item.code.toLowerCase().includes(search.toLowerCase()))
                  );

                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-400">
                          Koi {LEVEL_NAMES[activeTab] || 'area'} nahi mila. Upar "Add {LEVEL_NAMES[activeTab] || 'Area'}" button par click karke naya add karein.
                        </td>
                      </tr>
                    );
                  }

                  return filtered.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{item.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-500">
                        {item.code || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${LEVEL_COLORS[item.levelType] || 'bg-gray-100'}`}>
                          {LEVEL_NAMES[item.levelType] || item.levelType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-medium text-gray-600">
                          {item.stateId?.name && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                              {item.stateId.name}
                            </span>
                          )}
                          {item.lokSabhaId?.name && (
                            <>
                              <ArrowRight className="w-3 h-3 text-gray-300" />
                              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 font-semibold border border-indigo-200">
                                {item.lokSabhaId.name}
                              </span>
                            </>
                          )}
                          {item.districtId?.name && (
                            <>
                              <ArrowRight className="w-3 h-3 text-gray-300" />
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                                {item.districtId.name}
                              </span>
                            </>
                          )}
                          {item.vidhanSabhaId?.name && (
                            <>
                              <ArrowRight className="w-3 h-3 text-gray-300" />
                              <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 font-semibold border border-purple-200">
                                {item.vidhanSabhaId.name}
                              </span>
                            </>
                          )}
                          {item.blockId?.name && (
                            <>
                              <ArrowRight className="w-3 h-3 text-gray-300" />
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                                {item.blockId.name}
                              </span>
                            </>
                          )}
                          {item.panchayatId?.name && (
                            <>
                              <ArrowRight className="w-3 h-3 text-gray-300" />
                              <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold border border-teal-200">
                                {item.panchayatId.name}
                              </span>
                            </>
                          )}
                          {item.gramId?.name && (
                            <>
                              <ArrowRight className="w-3 h-3 text-gray-300" />
                              <span className="px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-800 font-semibold border border-cyan-200">
                                {item.gramId.name}
                              </span>
                            </>
                          )}
                          {!item.stateId?.name && !item.lokSabhaId?.name && !item.districtId?.name && !item.vidhanSabhaId?.name && !item.blockId?.name && !item.panchayatId?.name && !item.gramId?.name && (
                            <span className="text-gray-400 italic">Top Level (State)</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Direct Quick Add Child Button based on row's level! */}
                          {item.levelType === 'state' && (
                            <button
                              type="button"
                              onClick={() => openCreateChildModal('lok_sabha', item)}
                              className="px-2 py-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md border border-indigo-200 cursor-pointer"
                              title="Add Lok Sabha under this State"
                            >
                              + LS
                            </button>
                          )}
                          {item.levelType === 'lok_sabha' && (
                            <button
                              type="button"
                              onClick={() => openCreateChildModal('vidhan_sabha', item)}
                              className="px-2 py-1 text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md border border-purple-200 cursor-pointer"
                              title="Add Vidhan Sabha under this Lok Sabha"
                            >
                              + VS
                            </button>
                          )}
                          {item.levelType === 'district' && (
                            <button
                              type="button"
                              onClick={() => openCreateChildModal('vidhan_sabha', item)}
                              className="px-2 py-1 text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md border border-purple-200 cursor-pointer"
                              title="Add Vidhan Sabha under this District"
                            >
                              + VS
                            </button>
                          )}
                          {item.levelType === 'vidhan_sabha' && (
                            <button
                              type="button"
                              onClick={() => openCreateChildModal('block', item)}
                              className="px-2 py-1 text-[10px] font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-md border border-amber-200 cursor-pointer"
                              title="Add Block under this Vidhan Sabha"
                            >
                              + Block
                            </button>
                          )}
                          {item.levelType === 'block' && (
                            <button
                              type="button"
                              onClick={() => openCreateChildModal('panchayat', item)}
                              className="px-2 py-1 text-[10px] font-bold bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-md border border-teal-200 cursor-pointer"
                              title="Add Gram Panchayat under this Block"
                            >
                              + Panchayat
                            </button>
                          )}
                          {item.levelType === 'panchayat' && (
                            <button
                              type="button"
                              onClick={() => openCreateChildModal('gram', item)}
                              className="px-2 py-1 text-[10px] font-bold bg-cyan-50 text-cyan-800 hover:bg-cyan-100 rounded-md border border-cyan-200 cursor-pointer"
                              title="Add Gram (Village) under this Panchayat"
                            >
                              + Gram
                            </button>
                          )}
                          {item.levelType === 'gram' && (
                            <button
                              type="button"
                              onClick={() => openCreateChildModal('ward', item)}
                              className="px-2 py-1 text-[10px] font-bold bg-rose-50 text-rose-800 hover:bg-rose-100 rounded-md border border-rose-200 cursor-pointer"
                              title="Add Ward / Booth under this Village"
                            >
                              + Ward
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteArea(item._id, item.name)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {modalMode === 'create' ? 'Add New Geographic Area' : `Edit ${LEVEL_NAMES[form.levelType]}`}
                  </h3>
                  <p className="text-[11px] text-gray-500">Master database record with exact hierarchy linkage</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {error}
                </div>
              )}

              {/* 1. Level Type */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Area Level Type *
                </label>
                <select
                  value={form.levelType}
                  onChange={e => setForm(f => ({ ...f, levelType: e.target.value }))}
                  disabled={modalMode === 'edit'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                >
                  <option value="state">1. State</option>
                  <option value="lok_sabha">2. Lok Sabha (Parliamentary Constituency)</option>
                  <option value="district">3. District (Administrative)</option>
                  <option value="vidhan_sabha">4. Vidhan Sabha (Assembly Constituency)</option>
                  <option value="block">5. Block / Mandal / Tehsil</option>
                  <option value="panchayat">6. Gram Panchayat</option>
                  <option value="gram">7. Gram (Village / Majra)</option>
                  <option value="ward">8. Ward / Polling Booth</option>
                </select>
              </div>

              {/* 2. Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Area Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Majhawan or Rampur"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Code / Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                    placeholder="e.g. AC-397, GP-04, W-12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 3. Parent State Dropdown (for levels > state) */}
              {form.levelType !== 'state' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Belongs to State *
                  </label>
                  <select
                    value={form.stateId}
                    onChange={e => {
                      const newSId = e.target.value;
                      setForm(f => ({ ...f, stateId: newSId, lokSabhaId: '', districtId: '', vidhanSabhaId: '', blockId: '', panchayatId: '', gramId: '' }));
                      loadModalLookups(newSId);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select State</option>
                    {states.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 4. Lok Sabha Dropdown (for Vidhan Sabha & Block) */}
              {(form.levelType === 'vidhan_sabha' || form.levelType === 'block') && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Belongs to Lok Sabha Constituency *
                  </label>
                  <select
                    value={form.lokSabhaId}
                    onChange={e => setForm(f => ({ ...f, lokSabhaId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Lok Sabha</option>
                    {lokSabhas.map(ls => (
                      <option key={ls._id} value={ls._id}>{ls.name} ({ls.code || ''})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 5. District Dropdown (for Vidhan Sabha & Block) */}
              {(form.levelType === 'vidhan_sabha' || form.levelType === 'block') && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Belongs to Revenue District (Optional)
                  </label>
                  <select
                    value={form.districtId}
                    onChange={e => setForm(f => ({ ...f, districtId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select District</option>
                    {districts.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 6. Vidhan Sabha Dropdown (for Block) */}
              {form.levelType === 'block' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Belongs to Vidhan Sabha (Assembly) *
                  </label>
                  <select
                    value={form.vidhanSabhaId}
                    onChange={e => setForm(f => ({ ...f, vidhanSabhaId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Vidhan Sabha</option>
                    {vidhanSabhas.map(vs => (
                      <option key={vs._id} value={vs._id}>{vs.name} ({vs.code || ''})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 7. Block Dropdown (for Panchayat) */}
              {form.levelType === 'panchayat' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Belongs to Block / Mandal *
                  </label>
                  <select
                    value={form.blockId}
                    onChange={e => setForm(f => ({ ...f, blockId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Block</option>
                    {blocks.map(b => (
                      <option key={b._id} value={b._id}>{b.name} ({b.code || ''})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 8. Panchayat Dropdown (for Gram / Village) */}
              {form.levelType === 'gram' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Belongs to Gram Panchayat *
                  </label>
                  <select
                    value={form.panchayatId}
                    onChange={e => setForm(f => ({ ...f, panchayatId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Gram Panchayat</option>
                    {panchayats.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.code || ''})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 9. Gram (Village) Dropdown (for Ward / Booth) */}
              {form.levelType === 'ward' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Belongs to Gram (Village) / Panchayat *
                  </label>
                  <select
                    value={form.gramId}
                    onChange={e => setForm(f => ({ ...f, gramId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Gram (Village)</option>
                    {grams.map(g => (
                      <option key={g._id} value={g._id}>{g.name} ({g.code || ''})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveArea}
                disabled={saving}
                className="px-5 py-2 text-xs font-bold text-white bg-[#072F2B] hover:bg-[#0B4640] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{modalMode === 'create' ? 'Create Master Area' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
