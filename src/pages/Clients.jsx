import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Edit, Palette, Settings,
  LogOut, History, ShieldAlert, CheckCircle2, Plus, X, Loader2, Eye, EyeOff, UserPlus,
  Upload, Image, Trash2, Rocket, ClipboardCheck, User, Check, AlertCircle,
  Search, Building2, Globe, Layers, MapPin, FileText, UserCheck,
  ExternalLink, Sparkles, Copy, Key, RefreshCw, MoreHorizontal, Smartphone,
  Video, Film, Shield, Users, MessageSquare, Calendar, Vote, ChevronDown, ChevronRight,
  BarChart3, Download, HardDrive
} from 'lucide-react';
import apiClient from '../services/apiClient';
import exportsService from '../services/exports.service';
import tenantsService from '../services/tenants.service';
import plansService from '../services/plans.service';
import masterAreasService from '../services/masterAreas.service';
import OnboardingWizardModal from '../components/OnboardingWizardModal';
import { generateStandardPrivacyPolicy, generateStandardTerms } from '../utils/legalTemplates';

const BRAND_COLOR_PRESETS = [
  { name: 'Emerald & Saffron', primary: '#072F2B', secondary: '#F59E0B', accent: '#10B981' },
  { name: 'Tricolor Classic', primary: '#0B4F6C', secondary: '#F26419', accent: '#33658A' },
  { name: 'Royal Saffron', primary: '#E65100', secondary: '#1E3A8A', accent: '#F59E0B' },
  { name: 'Modern Navy', primary: '#1E3A8A', secondary: '#0D9488', accent: '#3B82F6' },
  { name: 'Deep Crimson', primary: '#881337', secondary: '#F59E0B', accent: '#E11D48' },
  { name: 'Sovereign Purple', primary: '#4C1D95', secondary: '#EC4899', accent: '#8B5CF6' },
];

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
  { key: 'news', label: 'Blogs & News' },
  { key: 'payments', label: 'Payments & Contributions' },
];

const ELECTION_TYPES = [
  { value: 'lok_sabha', label: 'Lok Sabha (Parliamentary)' },
  { value: 'vidhan_sabha', label: 'Vidhan Sabha (Assembly)' },
  { value: 'municipal', label: 'Municipal Corporation (Nagar Nigam)' },
  { value: 'panchayat', label: 'Panchayat Election' },
  { value: 'by_election', label: 'By-Election (Upchunav)' },
  { value: 'other', label: 'Other Campaign' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh',
  'Dadra & Nagar Haveli', 'Daman & Diu', 'Lakshadweep', 'Puducherry', 'Andaman & Nicobar',
];

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://election.digicoders.in').replace(/\/+$/, '');

function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:image/') || url.startsWith('blob:')) return url;
  if (url.includes('localhost:3001')) {
    return url.replace(/http:\/\/localhost:3001/g, API_BASE_URL);
  }
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${cleanPath}`;
}

function AreaTreeNode({ node, levelIndex = 0, expandedIds, onToggle, searchTerm }) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = !!expandedIds[node._id];
  const levelName = node.levelId?.name || `Level ${levelIndex + 1}`;
  const levelOrder = node.levelId?.levelOrder || levelIndex + 1;

  const levelColors = [
    'bg-indigo-50 text-indigo-700 border-indigo-200',
    'bg-emerald-50 text-emerald-700 border-emerald-200',
    'bg-amber-50 text-amber-700 border-amber-200',
    'bg-purple-50 text-purple-700 border-purple-200',
    'bg-sky-50 text-sky-700 border-sky-200',
    'bg-rose-50 text-rose-700 border-rose-200',
  ];
  const levelBadgeClass = levelColors[(levelOrder - 1) % levelColors.length];

  const matchesSearch = searchTerm ? (
    (node.name && node.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (node.code && node.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (levelName && levelName.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : true;

  return (
    <div className={`transition-all duration-150 ${levelIndex > 0 ? 'ml-3 sm:ml-5 pl-2.5 sm:pl-3 border-l-2 border-dashed border-gray-200' : ''}`}>
      <div
        className={`group flex items-center justify-between p-2.5 my-1 rounded-xl border transition-all ${
          matchesSearch ? 'bg-white hover:bg-indigo-50/30 border-gray-200 shadow-2xs' : 'bg-gray-50/50 border-gray-100 opacity-60'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggle(node._id)}
              className="w-5 h-5 rounded hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors cursor-pointer shrink-0"
              title={isExpanded ? 'Collapse sub-areas' : 'Expand sub-areas'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-indigo-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            </div>
          )}

          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider border shrink-0 ${levelBadgeClass}`}>
            L{levelOrder} • {levelName}
          </span>

          <span className="font-bold text-gray-900 text-xs sm:text-sm truncate">
            {node.name}
          </span>

          {node.code && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 shrink-0">
              {node.code}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasChildren && (
            <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              {node.children.length} {node.children.length === 1 ? 'sub-area' : 'sub-areas'}
            </span>
          )}
          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-0.5 animate-in fade-in-50 duration-150">
          {node.children.map((child) => (
            <AreaTreeNode
              key={child._id}
              node={child}
              levelIndex={levelIndex + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingLeaderPhoto, setUploadingLeaderPhoto] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingPwaIcon, setUploadingPwaIcon] = useState(false);
  const [uploadingLoginBg, setUploadingLoginBg] = useState(false);
  const [error, setError] = useState('');
  const [modalType, setModalType] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetail, setClientDetail] = useState(null);   // GET /tenants/:id
  const [features, setFeatures] = useState([]);
  const [impersonationHistory, setImpersonationHistory] = useState([]);
  const [impersonationToken, setImpersonationToken] = useState(null); // impersonate result
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [loadingOnboarding, setLoadingOnboarding] = useState(false);
  const [tenantAdminUsers, setTenantAdminUsers] = useState([]);
  const [viewDetailTab, setViewDetailTab] = useState('overview');
  const [copiedDetail, setCopiedDetail] = useState(false);
  const [selectedAdminUser, setSelectedAdminUser] = useState(null);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [credentialsSuccess, setCredentialsSuccess] = useState(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [copiedSlugId, setCopiedSlugId] = useState(null);
  const [brandingTab, setBrandingTab] = useState('all');
  const [expandedAreaIds, setExpandedAreaIds] = useState({});
  const [areaSearchTerm, setAreaSearchTerm] = useState('');
  const [tenantUsage, setTenantUsage] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  function toggleAreaExpand(id) {
    setExpandedAreaIds(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function expandAllAreas(nodes) {
    const next = {};
    function traverse(list) {
      if (!list || !Array.isArray(list)) return;
      for (const node of list) {
        next[node._id] = true;
        if (node.children?.length) traverse(node.children);
      }
    }
    traverse(nodes);
    setExpandedAreaIds(next);
  }

  function collapseAllAreas() {
    setExpandedAreaIds({});
  }

  function copySubdomainUrl(slug, clientId) {
    const url = `https://${slug}.electionapp.in`;
    navigator.clipboard.writeText(url);
    setCopiedSlugId(clientId);
    setTimeout(() => setCopiedSlugId(null), 2000);
  }

  function formatClientDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  // 7-Step Onboarding Wizard Modal State (SRS Section 8 & 70)
  const [showWizard, setShowWizard] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [electionFilter, setElectionFilter] = useState('ALL');

  // Form states
  const [form, setForm] = useState({});
  const [uploadingSlideIndex, setUploadingSlideIndex] = useState(null);
  const [activeSplashSlideIndex, setActiveSplashSlideIndex] = useState(0);
  const [viewingLegalModal, setViewingLegalModal] = useState(null);
  const [syncingMasterAreas, setSyncingMasterAreas] = useState(false);
  const [masterSyncFeedback, setMasterSyncFeedback] = useState(null);

  async function handleProvisionClientMasterAreas(clientId) {
    if (!clientId) return;
    try {
      setSyncingMasterAreas(true);
      setMasterSyncFeedback(null);
      const states = await masterAreasService.getStates();
      if (!states || states.length === 0) {
        setMasterSyncFeedback({ type: 'error', message: 'No master states available. Please seed UP master areas first.' });
        return;
      }
      const upState = states.find(s => s.name?.toLowerCase().includes('uttar pradesh')) || states[0];
      const res = await masterAreasService.provisionTenant(clientId, {
        stateId: upState._id,
        scopeType: 'all',
      });
      setMasterSyncFeedback({
        type: 'success',
        message: `Successfully provisioned ${res.createdCount || 'all'} geographic entities (State ➔ Lok Sabha ➔ District ➔ Vidhan Sabha ➔ Block)!`,
      });
      try {
        const updated = await tenantsService.getFullProfile(clientId);
        if (updated) {
          setClientDetail(prev => ({
            ...prev,
            ...updated,
          }));
          if (updated._areaTree && Array.isArray(updated._areaTree)) {
            const nextExp = {};
            updated._areaTree.forEach(node => {
              nextExp[node._id] = true;
            });
            setExpandedAreaIds(nextExp);
          }
        }
      } catch (err) {
        console.warn('Failed to re-fetch client', err);
      }
    } catch (err) {
      setMasterSyncFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to provision master areas',
      });
    } finally {
      setSyncingMasterAreas(false);
    }
  }

  function generateAdminPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = 'Pass@';
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm(f => ({ ...f, password: pwd, newPassword: pwd }));
  }

  function toggleActionMenu(e, client) {
    e.stopPropagation();
    if (activeMenu?.client?._id === client._id) {
      setActiveMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 310;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

    setActiveMenu({
      client,
      top: openUpward ? rect.top - 6 : rect.bottom + 6,
      bottom: window.innerHeight - rect.top + 6,
      right: Math.max(16, window.innerWidth - rect.right),
      openUpward,
    });
  }

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (!activeMenu) return;
    function handleGlobalClose() {
      setActiveMenu(null);
    }
    window.addEventListener('click', handleGlobalClose);
    window.addEventListener('scroll', handleGlobalClose, true);
    window.addEventListener('resize', handleGlobalClose);
    return () => {
      window.removeEventListener('click', handleGlobalClose);
      window.removeEventListener('scroll', handleGlobalClose, true);
      window.removeEventListener('resize', handleGlobalClose);
    };
  }, [activeMenu]);

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

  async function handleLeaderPhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLeaderPhoto(true);
      setError('');
      const uploadedPath = await tenantsService.uploadAsset('branding', file);
      setForm(f => ({ ...f, leaderPhotoUrl: uploadedPath }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Leader photo upload failed. Please try again.');
    } finally {
      setUploadingLeaderPhoto(false);
    }
  }

  async function handleFaviconUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingFavicon(true);
      setError('');
      const uploadedPath = await tenantsService.uploadAsset('branding', file);
      setForm(f => ({ ...f, faviconUrl: uploadedPath }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Favicon upload failed. Please try again.');
    } finally {
      setUploadingFavicon(false);
    }
  }

  async function handlePwaIconUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPwaIcon(true);
      setError('');
      const uploadedPath = await tenantsService.uploadAsset('branding', file);
      setForm(f => ({ ...f, pwaIconUrl: uploadedPath }));
    } catch (err) {
      setError(err?.response?.data?.message || 'PWA icon upload failed. Please try again.');
    } finally {
      setUploadingPwaIcon(false);
    }
  }

  async function handleLoginBgUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLoginBg(true);
      setError('');
      const uploadedPath = await tenantsService.uploadAsset('branding', file);
      setForm(f => ({ ...f, loginBgUrl: uploadedPath, splashScreenUrl: uploadedPath }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Login background upload failed. Please try again.');
    } finally {
      setUploadingLoginBg(false);
    }
  }

  // Multi-Slide Splash & Onboarding Handlers (SRS Sec 49 & 70)
  async function handleSlideMediaUpload(index, file) {
    if (!file) return;
    try {
      setUploadingSlideIndex(index);
      setError('');
      const path = await tenantsService.uploadAsset('branding', file);
      setForm(f => {
        const updated = [...(f.splashScreens || [])];
        if (updated[index]) {
          updated[index] = { ...updated[index], mediaUrl: path };
        }
        return {
          ...f,
          splashScreens: updated,
          ...(index === 0 ? { splashScreenUrl: path } : {}),
        };
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Slide media upload failed. Please check format & size.');
    } finally {
      setUploadingSlideIndex(null);
    }
  }

  function handleAddSplashSlide() {
    setForm(f => {
      const current = f.splashScreens || [];
      const nextNum = current.length + 1;
      const newSlide = {
        order: nextNum,
        title: `Constituency Drive ${nextNum}`,
        subtitle: 'Connect with volunteers and stay informed on local development milestones.',
        mediaType: 'image',
        mediaUrl: '',
      };
      return {
        ...f,
        splashScreens: [...current, newSlide],
      };
    });
    setActiveSplashSlideIndex((form.splashScreens || []).length);
  }

  function handleRemoveSplashSlide(index) {
    setForm(f => {
      const current = f.splashScreens || [];
      if (current.length <= 1) return f;
      const updated = current.filter((_, idx) => idx !== index).map((s, idx) => ({ ...s, order: idx + 1 }));
      return {
        ...f,
        splashScreens: updated,
      };
    });
    setActiveSplashSlideIndex(prev => Math.max(0, Math.min(prev, (form.splashScreens?.length || 1) - 2)));
  }

  function handleUpdateSplashSlide(index, key, val) {
    setForm(f => {
      const updated = [...(f.splashScreens || [])];
      if (updated[index]) {
        updated[index] = { ...updated[index], [key]: val };
      }
      return {
        ...f,
        splashScreens: updated,
      };
    });
  }

  function handleAutoFillPrivacyPolicy() {
    const candidateName = form.leaderName || form.name || form.platformName || 'the Campaign';
    const text = generateStandardPrivacyPolicy(candidateName);
    setForm(f => ({ ...f, privacyPolicyContent: text }));
  }

  function handleAutoFillTerms() {
    const candidateName = form.leaderName || form.name || form.platformName || 'the Campaign';
    const text = generateStandardTerms(candidateName);
    setForm(f => ({ ...f, termsContent: text }));
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

  async function loadOnboardingStatus(clientId) {
    try {
      setLoadingOnboarding(true);
      setError('');
      const data = await tenantsService.getOnboardingStatus(clientId);
      setOnboardingStatus(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Onboarding status load nahi hua.');
      setOnboardingStatus(null);
    } finally {
      setLoadingOnboarding(false);
    }
  }

  async function handlePublishTenant(clientId) {
    try {
      setSaving(true);
      setError('');
      await tenantsService.publish(clientId);
      await loadClients();
      await loadOnboardingStatus(clientId);
    } catch (e) {
      setError(e?.response?.data?.message || 'Tenant publish karne mein dikkat aayi.');
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickResetPassword(client) {
    if (!client) return;
    try {
      setSaving(true);
      setError('');
      const admins = await tenantsService.getAdminUsers(client._id);
      if (!admins || admins.length === 0) {
        openModal('CREATE_ADMIN', client);
        return;
      }
      if (admins.length === 1) {
        openModal('RESET_ADMIN_PASSWORD', client, admins[0]);
      } else {
        setSelectedClient(client);
        setTenantAdminUsers(admins);
        setModalType('SELECT_ADMIN_TO_RESET');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Tenant admin users load nahi hue.');
    } finally {
      setSaving(false);
    }
  }

  async function handleExportClientsCsv() {
    try {
      setExportingCsv(true);
      await exportsService.downloadExport('tenants', { format: 'csv' });
    } catch (err) {
      console.error('Failed to export clients:', err);
      alert('Clients export download failed. Please try again.');
    } finally {
      setExportingCsv(false);
    }
  }

  async function openModal(type, client = null, extra = null) {
    setModalType(type);
    setSelectedClient(client);
    setSelectedAdminUser(extra);
    setShowAdminPassword(false);
    setError('');
    setForm({});
    if (type !== 'CREDENTIALS_SUCCESS') {
      setCredentialsSuccess(null);
    }
    setClientDetail(null);
    setImpersonationToken(null);
    setOnboardingStatus(null);
    setTenantAdminUsers([]);

    if (type === 'ADD') {
      setForm({
        name: '',
        slug: '',
        leaderName: '',
        contactPerson: '',
        mobileNumber: '',
        email: '',
        electionType: 'lok_sabha',
        gstin: '',
        billingState: '',
        billingAddress: '',
      });
    }
    if (type === 'VIEW' && client) {
      setViewDetailTab('overview');
      setClientDetail(null);
      setTenantAdminUsers([]);
      setAreaSearchTerm('');
      setExpandedAreaIds({});
      setTenantUsage(null);
      setLoadingUsage(true);

      // Comprehensive tenant detail: fetch complete dynamic profile, admins, areas, stats, onboarding, plans, and live usage
      try {
        const [fullProfile, onboarding, plansList, usageData] = await Promise.all([
          tenantsService.getFullProfile(client._id).catch(() => null),
          tenantsService.getOnboardingStatus(client._id).catch(() => null),
          plansService.getAll().catch(() => []),
          apiClient.get(`/super-admin/tenants/${client._id}/usage`).then(r => r.data?.data || r.data).catch(() => null),
        ]);
        setTenantUsage(usageData);
        setLoadingUsage(false);

        const baseData = fullProfile || client;
        const resolvedPlan = baseData._plan || (plansList || []).find(p => p._id === baseData?.planId || p._id === client?.planId);

        // Auto-expand root area nodes
        const initialExpanded = {};
        if (baseData._areaTree && Array.isArray(baseData._areaTree)) {
          baseData._areaTree.forEach(node => {
            initialExpanded[node._id] = true;
          });
        }
        setExpandedAreaIds(initialExpanded);

        setClientDetail({
          ...baseData,
          _features: Array.isArray(baseData._features) ? baseData._features : [],
          _admins: Array.isArray(baseData._admins) ? baseData._admins : [],
          _areaLevels: Array.isArray(baseData._areaLevels) ? baseData._areaLevels : [],
          _areas: Array.isArray(baseData._areas) ? baseData._areas : [],
          _areaTree: Array.isArray(baseData._areaTree) ? baseData._areaTree : [],
          _stats: baseData._stats || {
            totalCitizens: 0,
            totalVolunteers: 0,
            totalComplaints: 0,
            totalEvents: 0,
            totalPolls: 0,
            totalAreas: (baseData._areas || []).length,
            totalLevels: (baseData._areaLevels || []).length,
            totalStaff: (baseData._admins || []).length,
          },
          _registrationFields: baseData._registrationFields || baseData.settings?.registrationFields || [],
          _onboarding: onboarding,
          _plan: resolvedPlan,
          _plansList: plansList,
        });
        setTenantAdminUsers(Array.isArray(baseData._admins) ? baseData._admins : []);
      } catch (err) {
        console.error('Failed to load full profile:', err);
        setClientDetail(client);
        setTenantAdminUsers([]);
      }
    }
    if (type === 'EDIT' && client) {
      setForm({
        name: client.name || '',
        customDomain: client.customDomain || '',
        leaderName: client.branding?.leaderName || '',
        contactPerson: client.contactPerson || '',
        mobileNumber: client.mobileNumber || '',
        email: client.email || '',
        electionType: client.electionType || 'other',
        gstin: client.gstin || '',
        billingState: client.billingState || '',
        billingAddress: client.billingAddress || '',
      });
    }
    if (type === 'BRANDING' && client) {
      const defaultSlides = [
        {
          order: 1,
          title: 'Welcome to Citizen Connect',
          subtitle: 'Direct engagement with your elected leader and real-time constituency development alerts.',
          mediaType: 'image',
          mediaUrl: client.branding?.splashScreenUrl || client.branding?.loginBgUrl || '',
        },
        {
          order: 2,
          title: 'Track Constituency Progress',
          subtitle: 'Transparent monitoring of road repairs, hospitals, school infrastructure & water projects.',
          mediaType: 'image',
          mediaUrl: '',
        },
        {
          order: 3,
          title: 'Direct Grievance Redressal',
          subtitle: 'Report ward problems with photo evidence and get direct resolution from field teams.',
          mediaType: 'video',
          mediaUrl: '',
        },
        {
          order: 4,
          title: 'Join Campaign & Volunteer',
          subtitle: 'Generate branded campaign banners with your photo and share on WhatsApp.',
          mediaType: 'image',
          mediaUrl: '',
        },
      ];

      setForm({
        platformName: client.branding?.platformName || client.title || client.name || '',
        logoUrl: client.branding?.logoUrl || client.branding?.logo || '',
        leaderPhotoUrl: client.branding?.leaderPhotoUrl || '',
        leaderName: client.branding?.leaderName || '',
        tagline: client.branding?.tagline || '',
        primaryColor: client.branding?.primaryColor || '#072F2B',
        secondaryColor: client.branding?.secondaryColor || '#F59E0B',
        accentColor: client.branding?.accentColor || '#10B981',
        faviconUrl: client.branding?.faviconUrl || '',
        pwaIconUrl: client.branding?.pwaIconUrl || '',
        loginBgUrl: client.branding?.loginBgUrl || '',
        splashScreenUrl: client.branding?.splashScreenUrl || '',
        splashScreens: (client.branding?.splashScreens && client.branding.splashScreens.length > 0)
          ? client.branding.splashScreens
          : defaultSlides,
        footerText: client.branding?.footerText || `© ${new Date().getFullYear()} ${client.name}. All rights reserved.`,
        privacyPolicyUrl: client.branding?.privacyPolicyUrl || '',
        termsUrl: client.branding?.termsUrl || '',
        privacyPolicyContent: client.branding?.privacyPolicyContent || '',
        termsContent: client.branding?.termsContent || '',
      });
      setActiveSplashSlideIndex(0);
      setBrandingTab('all');
    }
    if (type === 'ONBOARDING' && client) {
      loadOnboardingStatus(client._id);
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
    if (type === 'RESET_ADMIN_PASSWORD' && client) {
      setForm({ password: '', newPassword: '' });
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
    setSelectedAdminUser(null);
    setShowAdminPassword(false);
    setCredentialsSuccess(null);
    setForm({});
    setError('');
    setClientDetail(null);
    setImpersonationToken(null);
    setOnboardingStatus(null);
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
      const updatedAdmins = await tenantsService.getAdminUsers(selectedClient._id).catch(() => []);
      setTenantAdminUsers(updatedAdmins);
      setCredentialsSuccess({
        actionTitle: 'New Admin User Created',
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role || 'leader',
        tenantName: selectedClient.name,
      });
      setModalType('CREDENTIALS_SUCCESS');
    } catch (e) {
      setError(e?.response?.data?.message || 'Admin user create karne mein dikkat aayi.');
    } finally {
      setSaving(false);
    }
  }

  async function handleResetAdminPassword() {
    const pwd = form.newPassword?.trim() || form.password?.trim();
    if (!pwd || pwd.length < 6) {
      setError('Naya password kam se kam 6 characters ka hona chahiye.');
      return;
    }
    if (!selectedAdminUser || !selectedClient) {
      setError('Admin user ya client select nahi hai.');
      return;
    }
    try {
      setSaving(true);
      await tenantsService.resetAdminPassword(selectedClient._id, selectedAdminUser._id, pwd);
      const updatedAdmins = await tenantsService.getAdminUsers(selectedClient._id).catch(() => []);
      setTenantAdminUsers(updatedAdmins);
      setCredentialsSuccess({
        actionTitle: 'Password Reset Successful',
        name: selectedAdminUser.name,
        email: selectedAdminUser.email,
        password: pwd,
        role: selectedAdminUser.role,
        tenantName: selectedClient.name,
      });
      setModalType('CREDENTIALS_SUCCESS');
    } catch (e) {
      setError(e?.response?.data?.message || 'Password reset karne mein dikkat aayi.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAdminUser() {
    if (!selectedAdminUser || !selectedClient) return;
    try {
      setSaving(true);
      await tenantsService.deleteAdminUser(selectedClient._id, selectedAdminUser._id);
      const updatedAdmins = await tenantsService.getAdminUsers(selectedClient._id).catch(() => []);
      setTenantAdminUsers(updatedAdmins);
      closeModal();
      await openModal('VIEW', selectedClient);
    } catch (e) {
      setError(e?.response?.data?.message || 'Admin user delete karne mein dikkat aayi.');
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
    else if (modalType === 'RESET_ADMIN_PASSWORD') handleResetAdminPassword();
    else if (modalType === 'DELETE_ADMIN') handleDeleteAdminUser();
  }

  const filteredClients = clients.filter(c => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      c.name?.toLowerCase().includes(term) ||
      c.slug?.toLowerCase().includes(term) ||
      c.branding?.leaderName?.toLowerCase().includes(term) ||
      c.contactPerson?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.gstin?.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'ALL' ||
      c.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full font-sans space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Client Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage political clients, features, domains, and white-label branding.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportClientsCsv}
            disabled={exportingCsv}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer"
            title="Download CSV of all registered political clients"
          >
            {exportingCsv ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-[#072F2B]" />}
            <span>Export Clients (CSV)</span>
          </button>
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Client Onboarding (7-Step Wizard)</span>
          </button>
        </div>
      </div>

      {/* Search & Status Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by name, slug, leader..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'active', 'trial', 'suspended'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#072F2B] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st} {st === 'ALL' ? `(${clients.length})` : `(${clients.filter(c => c.status === st).length})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No clients match your filter</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search term or status filter, or onboard a new client using the 7-Step wizard.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
            className="mt-4 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header Summary Bar */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-gray-50/90 to-gray-50/50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Clients List
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {filteredClients.length} {filteredClients.length === 1 ? 'Client' : 'Clients'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100"></span> Active
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-100"></span> Trial
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-100"></span> Suspended
              </span>
              <button
                onClick={loadClients}
                title="Refresh client list"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <RefreshCw className="w-3 h-3 text-gray-500" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[360px] pb-32">
            <table className="w-full text-left text-sm text-gray-600 border-collapse min-w-[1020px]">
              <thead className="bg-gray-50/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-600 select-none">
                <tr>
                  <th className="py-3.5 px-5 font-bold">Client Details</th>
                  <th className="py-3.5 px-5 font-bold">Domain (Slug)</th>
                  <th className="py-3.5 px-5 font-bold">Status</th>
                  <th className="py-3.5 px-5 font-bold">Registered</th>
                  <th className="py-3.5 px-4 text-center font-bold sticky right-0 bg-gray-50 z-20 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] border-l border-gray-200 w-[240px] min-w-[240px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.map((client) => (
                  <tr
                    key={client._id}
                    className="group hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {client.branding?.leaderPhotoUrl || client.branding?.logoUrl ? (
                          <img
                            src={resolveImageUrl(client.branding?.leaderPhotoUrl || client.branding?.logoUrl)}
                            alt={client.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-2xs shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        <div
                          className={`w-10 h-10 rounded-full bg-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs ${
                            client.branding?.leaderPhotoUrl || client.branding?.logoUrl ? 'hidden' : 'flex'
                          }`}
                        >
                          {client.name?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                            <span className="truncate max-w-[180px]">{client.name}</span>
                            {client.electionType && client.electionType !== 'other' && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md whitespace-nowrap">
                                {client.electionType.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 truncate flex items-center gap-1.5 flex-wrap">
                            {client.branding?.leaderName ? (
                              <>
                                <User className="w-3 h-3 text-gray-400 shrink-0" />
                                <span>Leader: <strong className="font-semibold text-gray-700">{client.branding.leaderName}</strong></span>
                              </>
                            ) : client.contactPerson ? (
                              <>
                                <User className="w-3 h-3 text-gray-400 shrink-0" />
                                <span>Contact: {client.contactPerson}</span>
                              </>
                            ) : (
                              <span className="text-gray-400 italic">No leader assigned</span>
                            )}
                            {client.gstin && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold" title={`GSTIN: ${client.gstin}`}>
                                GST: {client.gstin}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex flex-col gap-1 items-start">
                        <div className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-md border border-gray-200 text-xs font-mono text-gray-700 transition-colors">
                          <span className="truncate max-w-[150px] font-semibold">{client.slug}</span>
                          <button
                            onClick={() => copySubdomainUrl(client.slug, client._id)}
                            title="Copy client subdomain URL"
                            className="text-gray-400 hover:text-gray-700 transition-colors p-0.5"
                          >
                            {copiedSlugId === client._id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {client.customDomain && (
                          <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                            <Globe className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[160px]">{client.customDomain}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize shadow-2xs ${
                          client.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : client.status === 'trial'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            client.status === 'active' ? 'bg-emerald-500' : client.status === 'trial' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}></span>
                          {client.status}
                        </span>
                        {client.isLive ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded flex items-center gap-1">
                            🚀 Live
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                            Draft
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="text-xs font-semibold text-gray-700">
                        {formatClientDate(client.createdAt)}
                      </div>
                    </td>

                    {/* STICKY ACTIONS COLUMN - ALWAYS VISIBLE */}
                    <td className="py-3.5 px-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 transition-colors shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] border-l border-gray-100 w-[240px] min-w-[240px] z-10">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1. View Details */}
                        <button
                          onClick={() => openModal('VIEW', client)}
                          title="View Details & Credentials"
                          className="p-1.5 text-sky-600 hover:bg-sky-50 hover:text-sky-700 border border-sky-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* 2. PROMINENT Reset Password (Key + Text) */}
                        <button
                          onClick={() => handleQuickResetPassword(client)}
                          title="Reset Tenant Admin Password"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 rounded-lg transition-all shadow-2xs cursor-pointer"
                        >
                          <Key className="w-3.5 h-3.5 text-amber-600" />
                          <span>Reset Pwd</span>
                        </button>

                        {/* 3. Login as Client (Impersonate) */}
                        <button
                          onClick={() => handleImpersonate(client)}
                          title="Login as Client (Impersonate)"
                          className="p-1.5 text-teal-600 hover:bg-teal-50 hover:text-teal-700 border border-teal-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>

                        {/* 4. More Actions Button */}
                        <button
                          onClick={(e) => toggleActionMenu(e, client)}
                          title="More Actions"
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            activeMenu?.client?._id === client._id
                              ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 border-gray-200'
                          }`}
                        >
                          <MoreHorizontal className="w-4 h-4" />
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
          <div className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col transition-all duration-200 ${
            modalType === 'VIEW' || modalType === 'BRANDING'
              ? 'max-w-5xl'
              : modalType === 'ONBOARDING' || modalType === 'FEATURES'
              ? 'max-w-3xl'
              : modalType === 'ADD' || modalType === 'EDIT' || modalType === 'CREATE_ADMIN'
              ? 'max-w-2xl'
              : 'max-w-lg'
          }`} style={{ maxHeight: '92vh', height: (modalType === 'VIEW' || modalType === 'BRANDING') ? '88vh' : 'auto' }}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white shrink-0">
              <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {modalType === 'VIEW' && (
                  <>
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <span>Tenant Detail & Profile</span>
                  </>
                )}
                {modalType === 'ONBOARDING' && `7-Step Onboarding Status — ${selectedClient?.name}`}
                {modalType === 'ADD' && 'Register New Client'}
                {modalType === 'EDIT' && 'Edit Client Info'}
                {modalType === 'BRANDING' && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-base font-bold text-gray-900">Theme & Branding Assets</span>
                      {selectedClient?.name && (
                        <span className="ml-2.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">
                          {selectedClient.name}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {modalType === 'FEATURES' && 'Enable / Disable Features'}
                {modalType === 'CREATE_ADMIN' && `Create Leader / Admin — ${selectedClient?.name}`}
                {modalType === 'RESET_ADMIN_PASSWORD' && (
                  <>
                    <Key className="w-5 h-5 text-amber-600" />
                    <span>Reset Tenant Admin Password — {selectedClient?.name}</span>
                  </>
                )}
                {modalType === 'SELECT_ADMIN_TO_RESET' && (
                  <>
                    <Key className="w-5 h-5 text-amber-600" />
                    <span>Select Admin to Reset Password — {selectedClient?.name}</span>
                  </>
                )}
                {modalType === 'CREDENTIALS_SUCCESS' && (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Admin Credentials Updated — {selectedClient?.name}</span>
                  </>
                )}
                {modalType === 'DELETE_ADMIN' && (
                  <>
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <span>Remove Admin User — {selectedClient?.name}</span>
                  </>
                )}
                {modalType === 'HISTORY' && 'Impersonation Logs'}
                {modalType === 'SUSPEND' && 'Confirm Action'}
                {modalType === 'IMPERSONATE_RESULT' && '🔐 Login as Client — Token'}
              </div>

              <div className="flex items-center gap-2.5">
                {modalType === 'BRANDING' && (
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={saving}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{saving ? 'Saving...' : 'Save Branding'}</span>
                  </button>
                )}
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" title="Close modal">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
              )}

              {/* VIEW — Comprehensive Rich Tenant Detail (SRS Sec 8, 45, 46, 47) */}
              {modalType === 'VIEW' && (
                <div className="space-y-4">
                  {!clientDetail ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                      <p className="text-xs text-gray-500">Loading complete tenant profile...</p>
                    </div>
                  ) : (
                    <>
                      {/* Top Tenant Header Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-indigo-50/40 rounded-2xl border border-gray-200 gap-4">
                        <div className="flex items-center gap-3.5">
                          {clientDetail.branding?.logoUrl || clientDetail.branding?.logo ? (
                            <img
                              src={resolveImageUrl(clientDetail.branding?.logoUrl || clientDetail.branding?.logo)}
                              alt={clientDetail.name}
                              className="w-14 h-14 rounded-xl object-contain bg-white border border-gray-200 p-1 shadow-xs shrink-0"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-indigo-700 text-white font-black text-xl flex items-center justify-center shadow-xs shrink-0">
                              {(clientDetail.name || 'T')[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-gray-900 text-lg">{clientDetail.name}</h4>
                              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                clientDetail.status === 'active' ? 'bg-green-100 text-green-800' :
                                clientDetail.status === 'trial' ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {clientDetail.status?.toUpperCase()}
                              </span>
                              {clientDetail.isPublished ? (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                                  🚀 LIVE PLATFORM
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-200 text-gray-700">
                                  DRAFT
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap font-mono">
                              <span>slug: <strong>{clientDetail.slug}</strong></span>
                              <span>•</span>
                              <a
                                href={`http://${clientDetail.slug}.madiyayu.com`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                              >
                                <span>{clientDetail.slug}.madiyayu.com</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Impersonate & Quick Actions */}
                        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              closeModal();
                              handleImpersonate(clientDetail);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                            title="Login as Client (Impersonation)"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Impersonate</span>
                          </button>
                        </div>
                      </div>

                      {/* Operational Live Metrics Ribbon (100% Dynamic from MongoDB) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                        {/* Citizens */}
                        <div className="p-3 bg-gradient-to-br from-emerald-50/70 to-white rounded-xl border border-emerald-200/80 shadow-2xs flex flex-col justify-between">
                          <div className="flex items-center justify-between text-emerald-600 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Citizens</span>
                            <Users className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="text-xl font-black text-gray-900">
                            {(clientDetail._stats?.totalCitizens ?? 0).toLocaleString()}
                          </div>
                          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">Registered Voters</span>
                        </div>

                        {/* Volunteers */}
                        <div className="p-3 bg-gradient-to-br from-blue-50/70 to-white rounded-xl border border-blue-200/80 shadow-2xs flex flex-col justify-between">
                          <div className="flex items-center justify-between text-blue-600 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Volunteers</span>
                            <UserCheck className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="text-xl font-black text-gray-900">
                            {(clientDetail._stats?.totalVolunteers ?? 0).toLocaleString()}
                          </div>
                          <span className="text-[10px] text-blue-700 font-semibold mt-0.5">Karyakartas</span>
                        </div>

                        {/* Complaints */}
                        <div className="p-3 bg-gradient-to-br from-amber-50/70 to-white rounded-xl border border-amber-200/80 shadow-2xs flex flex-col justify-between">
                          <div className="flex items-center justify-between text-amber-600 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Grievances</span>
                            <MessageSquare className="w-4 h-4 text-amber-600" />
                          </div>
                          <div className="text-xl font-black text-gray-900">
                            {(clientDetail._stats?.totalComplaints ?? 0).toLocaleString()}
                          </div>
                          <span className="text-[10px] text-amber-700 font-semibold mt-0.5">Complaints</span>
                        </div>

                        {/* Events */}
                        <div className="p-3 bg-gradient-to-br from-purple-50/70 to-white rounded-xl border border-purple-200/80 shadow-2xs flex flex-col justify-between">
                          <div className="flex items-center justify-between text-purple-600 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Events</span>
                            <Calendar className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="text-xl font-black text-gray-900">
                            {(clientDetail._stats?.totalEvents ?? 0).toLocaleString()}
                          </div>
                          <span className="text-[10px] text-purple-700 font-semibold mt-0.5">Campaign Sabhas</span>
                        </div>

                        {/* Polls */}
                        <div className="p-3 bg-gradient-to-br from-sky-50/70 to-white rounded-xl border border-sky-200/80 shadow-2xs flex flex-col justify-between">
                          <div className="flex items-center justify-between text-sky-600 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Polls</span>
                            <Vote className="w-4 h-4 text-sky-600" />
                          </div>
                          <div className="text-xl font-black text-gray-900">
                            {(clientDetail._stats?.totalPolls ?? 0).toLocaleString()}
                          </div>
                          <span className="text-[10px] text-sky-700 font-semibold mt-0.5">Surveys</span>
                        </div>

                        {/* Areas */}
                        <div className="p-3 bg-gradient-to-br from-teal-50/70 to-white rounded-xl border border-teal-200/80 shadow-2xs flex flex-col justify-between">
                          <div className="flex items-center justify-between text-teal-600 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Areas</span>
                            <MapPin className="w-4 h-4 text-teal-600" />
                          </div>
                          <div className="text-xl font-black text-gray-900">
                            {(clientDetail._stats?.totalAreas ?? (clientDetail._areas || []).length ?? 0).toLocaleString()}
                          </div>
                          <span className="text-[10px] text-teal-700 font-semibold mt-0.5">
                            {clientDetail._stats?.totalLevels || (clientDetail._areaLevels || []).length || 0} Levels Deep
                          </span>
                        </div>

                        {/* Staff */}
                        <div className="p-3 bg-gradient-to-br from-indigo-50/70 to-white rounded-xl border border-indigo-200/80 shadow-2xs flex flex-col justify-between">
                          <div className="flex items-center justify-between text-indigo-600 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Staff</span>
                            <Shield className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="text-xl font-black text-gray-900">
                            {(clientDetail._stats?.totalStaff ?? tenantAdminUsers.length ?? 0).toLocaleString()}
                          </div>
                          <span className="text-[10px] text-indigo-700 font-semibold mt-0.5">Admin Accounts</span>
                        </div>
                      </div>

                      {/* Detail Navigation Tabs */}
                      <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto pb-px">
                        {[
                          { id: 'overview', label: 'Overview & Profile', icon: Building2 },
                          { id: 'usage', label: 'Usage & Quotas', icon: BarChart3 },
                          { id: 'hierarchy', label: `Area Hierarchy (${clientDetail._stats?.totalAreas ?? (clientDetail._areas || []).length ?? 0})`, icon: MapPin },
                          { id: 'registration_form', label: `Registration Form (${(clientDetail._registrationFields || clientDetail.settings?.registrationFields || []).length})`, icon: FileText },
                          { id: 'branding', label: 'Branding & Theme', icon: Palette },
                          { id: 'modules', label: `Modules (${(clientDetail._features || []).filter(f => f.isEnabled).length}/13)`, icon: Layers },
                          { id: 'admins', label: `Admin Users (${tenantAdminUsers.length || (clientDetail._admins || []).length})`, icon: UserCheck },
                        ].map(tab => {
                          const Icon = tab.icon;
                          const isActive = viewDetailTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setViewDetailTab(tab.id)}
                              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                                isActive
                                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* TAB 1: OVERVIEW & PROFILE */}
                      {viewDetailTab === 'overview' && (
                        <div className="space-y-4 pt-1 animate-in fade-in-50 duration-150">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                              <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tenant Identification</h5>
                              <div className="flex justify-between text-xs py-1 border-b border-gray-100">
                                <span className="text-gray-500">Organization Name</span>
                                <span className="font-bold text-gray-900">{clientDetail.name}</span>
                              </div>
                              <div className="flex justify-between text-xs py-1 border-b border-gray-100">
                                <span className="text-gray-500">Subdomain Slug</span>
                                <span className="font-mono font-bold text-indigo-700">{clientDetail.slug}</span>
                              </div>
                              <div className="flex justify-between text-xs py-1 border-b border-gray-100">
                                <span className="text-gray-500">Election Type</span>
                                <span className="font-bold text-gray-800 capitalize">
                                  {clientDetail.electionType ? clientDetail.electionType.replace('_', ' ') : 'Other'}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs py-1">
                                <span className="text-gray-500">Database ID</span>
                                <span className="font-mono text-[11px] text-gray-600">{clientDetail._id}</span>
                              </div>
                            </div>

                            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                              <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Contact & Communications</h5>
                              <div className="flex justify-between text-xs py-1 border-b border-gray-100">
                                <span className="text-gray-500">Contact Person</span>
                                <span className="font-bold text-gray-900">{clientDetail.contactPerson || '—'}</span>
                              </div>
                              <div className="flex justify-between text-xs py-1 border-b border-gray-100">
                                <span className="text-gray-500">Mobile Number</span>
                                <span className="font-mono font-bold text-gray-900">{clientDetail.mobileNumber || '—'}</span>
                              </div>
                              <div className="flex justify-between text-xs py-1">
                                <span className="text-gray-500">Email Address</span>
                                <span className="font-mono font-bold text-gray-900">{clientDetail.email || '—'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Domain & DNS Card */}
                          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                            <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                              <span>Domain & DNS Configuration</span>
                              {clientDetail.customDomain && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  clientDetail.isCustomDomainVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {clientDetail.isCustomDomainVerified ? 'Verified' : 'Pending DNS'}
                                </span>
                              )}
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                                <span className="text-gray-400 text-[11px]">Primary Platform Subdomain</span>
                                <p className="font-mono font-bold text-indigo-700 mt-0.5">{clientDetail.slug}.madiyayu.com</p>
                              </div>
                              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                                <span className="text-gray-400 text-[11px]">Custom Domain (White-Label)</span>
                                <p className="font-mono font-bold text-gray-900 mt-0.5">{clientDetail.customDomain || 'None configured'}</p>
                              </div>
                            </div>
                          </div>

                          {/* GSTIN & Commercial Tax Profile (SRS Sec 46.2 & 47) */}
                          <div className="p-3.5 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 rounded-xl border border-blue-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-blue-600" /> GSTIN & Commercial Tax Profile (SRS Sec 46.2)
                              </h5>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                clientDetail.gstin ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {clientDetail.gstin ? 'GST Registered' : 'Unregistered / Exempt'}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                                <span className="text-gray-400 text-[11px]">Client GSTIN</span>
                                <p className="font-mono font-bold text-gray-900 mt-0.5">{clientDetail.gstin || '—'}</p>
                              </div>
                              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                                <span className="text-gray-400 text-[11px]">Place of Supply / State</span>
                                <p className="font-semibold text-gray-900 mt-0.5">{clientDetail.billingState || '—'}</p>
                              </div>
                              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                                <span className="text-gray-400 text-[11px]">Billing Address</span>
                                <p className="text-gray-700 mt-0.5 whitespace-pre-line truncate" title={clientDetail.billingAddress || ''}>
                                  {clientDetail.billingAddress || '—'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Leader / Tenant Admin Access & Credentials Card */}
                          <div className="p-4 bg-gradient-to-r from-amber-50/80 to-yellow-50/40 rounded-xl border border-amber-200 space-y-2.5 shadow-2xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h5 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                                  <Key className="w-4 h-4 text-amber-600" />
                                  <span>Leader / Tenant Admin Access & Credentials</span>
                                </h5>
                                <p className="text-[11px] text-amber-800 mt-0.5">
                                  Tenant ke admin account ka password yahan se instant reset karein ya naye credentials set karein.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleQuickResetPassword(clientDetail)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs self-start sm:self-center shrink-0"
                              >
                                <Key className="w-3.5 h-3.5" />
                                <span>Reset Password</span>
                              </button>
                            </div>

                            {tenantAdminUsers.length > 0 ? (
                              <div className="space-y-1.5 pt-1">
                                {tenantAdminUsers.map((adm, i) => (
                                  <div
                                    key={adm._id || i}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200/80 text-xs gap-2"
                                  >
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-gray-900">{adm.name}</span>
                                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">
                                        {adm.role}
                                      </span>
                                      <span className="font-mono text-gray-500 text-[11px]">{adm.email}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        closeModal();
                                        openModal('RESET_ADMIN_PASSWORD', clientDetail, adm);
                                      }}
                                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors self-start sm:self-auto shrink-0"
                                    >
                                      <Key className="w-3 h-3 text-amber-700" />
                                      <span>Reset Password</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-2.5 bg-white rounded-lg border border-dashed border-amber-300 text-xs text-amber-800 flex items-center justify-between">
                                <span>Abhi koi admin user registered nahi hai.</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    closeModal();
                                    openModal('CREATE_ADMIN', clientDetail);
                                  }}
                                  className="text-indigo-600 hover:underline font-bold"
                                >
                                  + Create Admin Account
                                </button>
                              </div>
                            )}
                          </div>

                          {/* SaaS Subscription Info */}
                          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                            <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">SaaS Subscription & Validity</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                                <span className="text-gray-400 text-[11px]">Assigned Plan</span>
                                <p className="font-bold text-gray-900 mt-0.5">
                                  {clientDetail._plan?.name || (clientDetail.planId ? 'Custom SaaS Plan' : 'Free Trial')}
                                </p>
                                {clientDetail._plan?.price !== undefined && (
                                  <span className="text-[11px] text-indigo-600 font-bold">₹{clientDetail._plan.price?.toLocaleString()} / {clientDetail._plan.billingCycle || 'yr'}</span>
                                )}
                              </div>
                              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                                <span className="text-gray-400 text-[11px]">Subscription Started</span>
                                <p className="font-mono text-gray-800 mt-0.5">
                                  {clientDetail.subscriptionStartsAt ? new Date(clientDetail.subscriptionStartsAt).toLocaleDateString('en-IN') : '—'}
                                </p>
                              </div>
                              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                                <span className="text-gray-400 text-[11px]">Subscription Renewal / End</span>
                                <p className="font-mono text-gray-800 mt-0.5">
                                  {clientDetail.subscriptionEndsAt ? new Date(clientDetail.subscriptionEndsAt).toLocaleDateString('en-IN') :
                                   clientDetail.trialEndsAt ? `Trial: ${new Date(clientDetail.trialEndsAt).toLocaleDateString('en-IN')}` : '—'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB: USAGE & QUOTAS (SRS Sec 45.2 & Sec 48) */}
                      {viewDetailTab === 'usage' && (
                        <div className="space-y-4 pt-1 animate-in fade-in-50 duration-150">
                          {loadingUsage ? (
                            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                              <Loader2 className="w-7 h-7 animate-spin text-indigo-600 mb-2" />
                              <span className="text-xs text-gray-500 font-semibold">Loading tenant resource quotas...</span>
                            </div>
                          ) : tenantUsage ? (
                            <div className="space-y-4">
                              {/* Overall Status Banner */}
                              <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-white border-indigo-100">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-indigo-950">Resource Quota Status</h4>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                      tenantUsage.overallStatus === 'restricted'
                                        ? 'bg-red-100 text-red-700'
                                        : tenantUsage.overallStatus === 'warning'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                      {tenantUsage.overallStatus || 'NORMAL'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Assigned Plan: <strong className="text-gray-800">{tenantUsage.plan?.name || clientDetail._plan?.name || 'Default Plan'}</strong>
                                    {tenantUsage.subscription?.endDate && (
                                      <span> &nbsp;·&nbsp; Expiry: {new Date(tenantUsage.subscription.endDate).toLocaleDateString('en-IN')}</span>
                                    )}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLoadingUsage(true);
                                    apiClient.get(`/super-admin/tenants/${clientDetail._id}/usage`)
                                      .then(res => setTenantUsage(res.data?.data || res.data))
                                      .catch(() => {})
                                      .finally(() => setLoadingUsage(false));
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold shadow-2xs cursor-pointer self-start sm:self-auto"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  Refresh Quotas
                                </button>
                              </div>

                              {/* 5 Metric Cards */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {[
                                  { label: 'Registered Citizens', key: 'citizens', icon: Users, color: 'blue', metric: tenantUsage.metrics?.citizens },
                                  { label: 'Storage Usage', key: 'storageMB', icon: HardDrive, color: 'indigo', metric: tenantUsage.metrics?.storageMB },
                                  { label: 'Staff Admin Users', key: 'staffUsers', icon: UserCheck, color: 'purple', metric: tenantUsage.metrics?.staffUsers },
                                  { label: 'Posters This Month', key: 'postersThisMonth', icon: Image, color: 'amber', metric: tenantUsage.metrics?.postersThisMonth },
                                  { label: 'Notifications This Month', key: 'notificationsThisMonth', icon: MessageSquare, color: 'teal', metric: tenantUsage.metrics?.notificationsThisMonth },
                                ].map(({ label, icon: Icon, color, metric }) => {
                                  if (!metric) return null;
                                  const isUnlimited = metric.limit === -1;
                                  const pct = isUnlimited ? 0 : Math.min(metric.percentUsed || 0, 100);
                                  const barBg = metric.status === 'restricted' ? 'bg-red-500' : metric.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500';

                                  return (
                                    <div key={label} className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2.5">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-7 h-7 rounded-lg bg-${color}-50 text-${color}-600 flex items-center justify-center shrink-0`}>
                                            <Icon className="w-3.5 h-3.5" />
                                          </div>
                                          <span className="text-xs font-bold text-gray-800">{label}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                          metric.status === 'restricted' ? 'bg-red-100 text-red-700' :
                                          metric.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                                          'bg-gray-100 text-gray-600'
                                        }`}>
                                          {isUnlimited ? 'Unlimited' : `${pct}%`}
                                        </span>
                                      </div>

                                      <div className="space-y-1">
                                        <div className="flex justify-between text-[11px] font-semibold text-gray-600 font-mono">
                                          <span>{metric.formattedUsed || metric.used?.toLocaleString?.() || metric.used}</span>
                                          <span>/ {isUnlimited ? '∞' : (metric.formattedLimit || metric.limit?.toLocaleString?.() || metric.limit)}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                          <div
                                            className={`h-full rounded-full transition-all duration-300 ${isUnlimited ? 'bg-emerald-400 w-full opacity-30' : barBg}`}
                                            style={{ width: isUnlimited ? '100%' : `${pct}%` }}
                                          />
                                        </div>
                                      </div>

                                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                                        <span>Remaining: {isUnlimited ? 'Unlimited' : (metric.remaining?.toLocaleString?.() ?? metric.remaining)}</span>
                                        <span className="capitalize">{metric.status}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Quota Alerts if any */}
                              {tenantUsage.alerts?.length > 0 && (
                                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
                                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                    <AlertCircle className="w-4 h-4 text-amber-600" /> Active Quota Alerts:
                                  </span>
                                  <ul className="text-xs text-amber-800 space-y-1 list-disc pl-5">
                                    {tenantUsage.alerts.map((a, i) => (
                                      <li key={i}>{typeof a === 'string' ? a : a.message || JSON.stringify(a)}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-xs">
                              Usage data available nahi hai ya plan associate nahi hai.
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 2: BRANDING & THEME (SRS Sec 8 Step 2, Sec 49 & 70) */}
                      {viewDetailTab === 'branding' && (
                        <div className="space-y-4 pt-1 animate-in fade-in-50 duration-150">
                          {/* Row 1: Logo & Leader Photo */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Logo Card */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                              <h5 className="text-xs font-bold text-gray-700">Official Brand Logo</h5>
                              {clientDetail.branding?.logoUrl || clientDetail.branding?.logo ? (
                                <div className="space-y-2">
                                  <div className="h-28 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2">
                                    <img
                                      src={resolveImageUrl(clientDetail.branding?.logoUrl || clientDetail.branding?.logo)}
                                      alt="Logo"
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  </div>
                                  <p className="text-[11px] text-gray-400 font-mono truncate">
                                    {clientDetail.branding?.logoUrl || clientDetail.branding?.logo}
                                  </p>
                                </div>
                              ) : (
                                <div className="h-28 bg-white rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                                  No logo uploaded
                                </div>
                              )}
                            </div>

                            {/* Leader Photo Card */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                              <h5 className="text-xs font-bold text-gray-700">Leader Photo / Portrait</h5>
                              {clientDetail.branding?.leaderPhotoUrl ? (
                                <div className="space-y-2">
                                  <div className="h-28 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2">
                                    <img
                                      src={resolveImageUrl(clientDetail.branding?.leaderPhotoUrl)}
                                      alt="Leader"
                                      className="max-h-full max-w-full object-contain rounded-lg"
                                    />
                                  </div>
                                  <p className="text-[11px] text-gray-400 font-mono truncate">
                                    {clientDetail.branding?.leaderPhotoUrl}
                                  </p>
                                </div>
                              ) : (
                                <div className="h-28 bg-white rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                                  No leader photo uploaded
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Row 2: White-Label Web & Mobile Assets */}
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                            <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-purple-600" /> Web & Mobile App White-Label Assets (SRS Sec 49)
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {/* Favicon */}
                              <div className="p-3 bg-white rounded-lg border border-gray-200 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                                  {clientDetail.branding?.faviconUrl ? (
                                    <img src={resolveImageUrl(clientDetail.branding.faviconUrl)} alt="Favicon" className="w-6 h-6 object-contain" />
                                  ) : (
                                    <Globe className="w-5 h-5 text-gray-300" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[10px] text-gray-400 uppercase font-bold">Browser Favicon</span>
                                  <p className="text-xs font-bold text-gray-800 truncate">
                                    {clientDetail.branding?.faviconUrl ? 'Custom Icon' : 'Default'}
                                  </p>
                                </div>
                              </div>

                              {/* PWA Icon */}
                              <div className="p-3 bg-white rounded-lg border border-gray-200 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                                  {clientDetail.branding?.pwaIconUrl ? (
                                    <img src={resolveImageUrl(clientDetail.branding.pwaIconUrl)} alt="PWA Icon" className="w-full h-full object-cover" />
                                  ) : (
                                    <Smartphone className="w-5 h-5 text-gray-300" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[10px] text-gray-400 uppercase font-bold">PWA App Icon</span>
                                  <p className="text-xs font-bold text-gray-800 truncate">
                                    {clientDetail.branding?.pwaIconUrl ? 'Mobile App Icon' : 'Default'}
                                  </p>
                                </div>
                              </div>

                              {/* Splash / Login Backdrop */}
                              <div className="p-3 bg-white rounded-lg border border-gray-200 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                                  {clientDetail.branding?.loginBgUrl ? (
                                    <img src={resolveImageUrl(clientDetail.branding.loginBgUrl)} alt="Login Backdrop" className="w-full h-full object-cover" />
                                  ) : (
                                    <Image className="w-5 h-5 text-gray-300" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[10px] text-gray-400 uppercase font-bold">Login Backdrop</span>
                                  <p className="text-xs font-bold text-gray-800 truncate">
                                    {clientDetail.branding?.loginBgUrl ? 'Custom Banner' : 'Default'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Brand Colors & Text */}
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                            <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Color Palette & Typography</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-200">
                                <div
                                  className="w-9 h-9 rounded-lg border border-black/10 shadow-2xs shrink-0"
                                  style={{ backgroundColor: clientDetail.branding?.primaryColor || '#072F2B' }}
                                />
                                <div>
                                  <span className="text-[11px] text-gray-400">Primary Color</span>
                                  <p className="font-mono font-bold text-gray-900">{clientDetail.branding?.primaryColor || '#072F2B'}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-200">
                                <div
                                  className="w-9 h-9 rounded-lg border border-black/10 shadow-2xs shrink-0"
                                  style={{ backgroundColor: clientDetail.branding?.secondaryColor || '#f59e0b' }}
                                />
                                <div>
                                  <span className="text-[11px] text-gray-400">Secondary Accent</span>
                                  <p className="font-mono font-bold text-gray-900">{clientDetail.branding?.secondaryColor || '#f59e0b'}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-200">
                                <div
                                  className="w-9 h-9 rounded-lg border border-black/10 shadow-2xs shrink-0"
                                  style={{ backgroundColor: clientDetail.branding?.accentColor || '#10b981' }}
                                />
                                <div>
                                  <span className="text-[11px] text-gray-400">Highlight / Ring</span>
                                  <p className="font-mono font-bold text-gray-900">{clientDetail.branding?.accentColor || '#10b981'}</p>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                              <div>
                                <span className="text-gray-400 text-[11px]">Leader Name</span>
                                <p className="font-bold text-gray-800">{clientDetail.branding?.leaderName || '—'}</p>
                              </div>
                              <div>
                                <span className="text-gray-400 text-[11px]">Platform Title</span>
                                <p className="font-bold text-gray-800">{clientDetail.branding?.platformName || clientDetail.branding?.title || '—'}</p>
                              </div>
                              <div className="sm:col-span-2">
                                <span className="text-gray-400 text-[11px]">Campaign Slogan / Tagline</span>
                                <p className="font-semibold text-gray-800 italic">"{clientDetail.branding?.tagline || 'No tagline configured'}"</p>
                              </div>
                            </div>
                          </div>

                          {/* Multi-Slide Mobile Splash & Onboarding Screens (SRS Section 8 & 70) */}
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                <Film className="w-3.5 h-3.5 text-indigo-600" />
                                Mobile App Onboarding & Splash Screens
                              </h5>
                              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                {(clientDetail.branding?.splashScreens || []).length || 0} Slides Configured
                              </span>
                            </div>

                            {clientDetail.branding?.splashScreens && clientDetail.branding.splashScreens.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                {clientDetail.branding.splashScreens.map((slide, idx) => (
                                  <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs flex flex-col">
                                    <div className="relative aspect-9/14 bg-gray-950 flex items-center justify-center overflow-hidden">
                                      {slide.mediaType === 'video' ? (
                                        <video
                                          src={resolveImageUrl(slide.mediaUrl)}
                                          className="w-full h-full object-cover"
                                          muted
                                          loop
                                          playsInline
                                          autoPlay
                                        />
                                      ) : (
                                        <img
                                          src={resolveImageUrl(slide.mediaUrl)}
                                          alt={slide.title || `Slide ${idx + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      )}
                                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-bold text-white uppercase tracking-wider">
                                        Slide {idx + 1}
                                      </div>
                                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold text-white bg-indigo-600/90 flex items-center gap-1">
                                        {slide.mediaType === 'video' ? <Video className="w-2.5 h-2.5" /> : <Image className="w-2.5 h-2.5" />}
                                        <span className="uppercase">{slide.mediaType || 'image'}</span>
                                      </div>
                                    </div>
                                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                                      <div>
                                        <p className="font-bold text-xs text-gray-900 line-clamp-1">{slide.title || `Screen ${idx + 1}`}</p>
                                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{slide.subtitle || 'No description'}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 bg-white rounded-lg border border-dashed border-gray-200 text-center">
                                <p className="text-xs text-gray-500">Using default 4-slide onboarding flow in client mobile app.</p>
                              </div>
                            )}
                          </div>

                          {/* White-Label Compliance & Legal Statements */}
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                            <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-purple-600" /> Legal Compliance & App Policies
                            </h5>
                            <div className="space-y-2 text-xs">
                              <div className="p-2.5 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                                <span className="text-gray-400">Footer Copyright:</span>
                                <span className="font-medium text-gray-800 font-mono">{clientDetail.branding?.footerText || 'Standard Default'}</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Privacy Policy */}
                                <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-gray-700 flex items-center gap-1.5">
                                      <Shield className="w-3.5 h-3.5 text-purple-600" /> Privacy Policy
                                    </span>
                                    {clientDetail.branding?.privacyPolicyContent ? (
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        ✓ In-App Full Text ({clientDetail.branding.privacyPolicyContent.length} chars)
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-gray-400 italic">No in-app text</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {clientDetail.branding?.privacyPolicyContent && (
                                      <button
                                        type="button"
                                        onClick={() => setViewingLegalModal({
                                          title: 'Privacy Policy',
                                          clientName: clientDetail.name,
                                          content: clientDetail.branding.privacyPolicyContent,
                                        })}
                                        className="text-purple-700 bg-purple-50 hover:bg-purple-100 font-semibold px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
                                      >
                                        Read Full Statement
                                      </button>
                                    )}
                                    {clientDetail.branding?.privacyPolicyUrl && (
                                      <a
                                        href={clientDetail.branding.privacyPolicyUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-purple-600 font-medium hover:underline flex items-center gap-1 font-mono text-[11px]"
                                      >
                                        <span>External Link</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>

                                {/* Terms & Conditions */}
                                <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-gray-700 flex items-center gap-1.5">
                                      <FileText className="w-3.5 h-3.5 text-purple-600" /> Terms & Conditions
                                    </span>
                                    {clientDetail.branding?.termsContent ? (
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        ✓ In-App Full Text ({clientDetail.branding.termsContent.length} chars)
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-gray-400 italic">No in-app text</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {clientDetail.branding?.termsContent && (
                                      <button
                                        type="button"
                                        onClick={() => setViewingLegalModal({
                                          title: 'Terms & Conditions',
                                          clientName: clientDetail.name,
                                          content: clientDetail.branding.termsContent,
                                        })}
                                        className="text-purple-700 bg-purple-50 hover:bg-purple-100 font-semibold px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
                                      >
                                        Read Full Statement
                                      </button>
                                    )}
                                    {clientDetail.branding?.termsUrl && (
                                      <a
                                        href={clientDetail.branding.termsUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-purple-600 font-medium hover:underline flex items-center gap-1 font-mono text-[11px]"
                                      >
                                        <span>External Link</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 3: MODULES & FEATURES */}
                      {viewDetailTab === 'modules' && (
                        <div className="space-y-3 pt-1 animate-in fade-in-50 duration-150">
                          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                            <span>Available System Modules (13 total)</span>
                            <span className="font-bold text-emerald-700">
                              {(clientDetail._features || []).filter(f => f.isEnabled).length} Enabled
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {FEATURE_KEYS.map(fKey => {
                              const featDoc = (clientDetail._features || []).find(f => f.featureKey === fKey.key);
                              const isEnabled = featDoc ? featDoc.isEnabled : false;
                              return (
                                <div
                                  key={fKey.key}
                                  className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                                    isEnabled
                                      ? 'bg-emerald-50/50 border-emerald-200'
                                      : 'bg-gray-50 border-gray-200 opacity-70'
                                  }`}
                                >
                                  <div className="min-w-0 pr-2">
                                    <h6 className="font-bold text-gray-900 text-xs truncate">{fKey.label}</h6>
                                    <span className="text-[10px] text-gray-400 font-mono">{fKey.key}</span>
                                  </div>
                                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase shrink-0 ${
                                    isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {isEnabled ? 'Active' : 'Disabled'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* TAB 4: AREA HIERARCHY */}
                      {viewDetailTab === 'hierarchy' && (
                        <div className="space-y-4 pt-1 animate-in fade-in-50 duration-150">
                          {/* Configured Geographic Levels */}
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                            <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                              Configured Geographic Levels ({clientDetail._stats?.totalLevels || (clientDetail._areaLevels || []).length || (clientDetail.settings?.areaLevels || []).length || 0} Levels)
                            </h5>

                            {(() => {
                              const dynamicLevels = (clientDetail._areaLevels && clientDetail._areaLevels.length > 0)
                                ? clientDetail._areaLevels
                                : (clientDetail.settings?.areaLevels || []).map((name, idx) => ({ levelOrder: idx + 1, name, isRequired: true }));

                              if (dynamicLevels.length === 0) {
                                return (
                                  <p className="text-xs text-gray-400 italic">No area hierarchy levels configured.</p>
                                );
                              }

                              return (
                                <div className="space-y-3">
                                  {/* Visual Breadcrumb Flow */}
                                  <div className="p-3 bg-white rounded-lg border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2 flex-wrap">
                                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>Hierarchy Flow: {dynamicLevels.map(l => l.name).join(' ➔ ')}</span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {dynamicLevels.map((lvl, index) => (
                                      <div
                                        key={lvl._id || index}
                                        className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-gray-200 text-xs"
                                      >
                                        <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0">
                                          L{lvl.levelOrder || index + 1}
                                        </span>
                                        <span className="font-bold text-gray-800 flex-1 truncate">
                                          {lvl.name}
                                        </span>
                                        <span className="text-[10px] text-gray-400 uppercase font-medium">
                                          {lvl.isRequired ? 'Mandatory' : 'Optional'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Live Interactive Geographic Area Tree */}
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Live Geographic Area Hierarchy ({clientDetail._stats?.totalAreas ?? (clientDetail._areas || []).length ?? 0} Total Areas)</span>
                                </h5>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                  Real-time relational hierarchy from database (State ➔ Lok Sabha ➔ Vidhan Sabha ➔ Block ➔ GP ➔ Ward).
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => expandAllAreas(clientDetail._areaTree)}
                                  className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                  Expand All
                                </button>
                                <button
                                  type="button"
                                  onClick={collapseAllAreas}
                                  className="px-2.5 py-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                  Collapse All
                                </button>
                              </div>
                            </div>

                            {/* Search Bar */}
                            <div className="relative">
                              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                placeholder="Search areas by name or code (e.g. Phulpur, Rampur, Mirzapur)..."
                                value={areaSearchTerm}
                                onChange={(e) => setAreaSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                              />
                            </div>

                            {/* Tree Container */}
                            {(!clientDetail._areaTree || clientDetail._areaTree.length === 0) ? (
                              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-300 space-y-2">
                                <MapPin className="w-8 h-8 text-gray-400 mx-auto" />
                                <p className="text-xs font-bold text-gray-700">No geographic areas found for this client</p>
                                <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                                  Is client ke database mein abhi areas add nahi hue hain. Neeche diye button se 1-click mein UP ki complete administrative hierarchy provision karein.
                                </p>
                              </div>
                            ) : (
                              <div className="p-3 bg-white rounded-xl border border-gray-200 max-h-96 overflow-y-auto space-y-1">
                                {clientDetail._areaTree.map((rootNode) => (
                                  <AreaTreeNode
                                    key={rootNode._id}
                                    node={rootNode}
                                    levelIndex={0}
                                    expandedIds={expandedAreaIds}
                                    onToggle={toggleAreaExpand}
                                    searchTerm={areaSearchTerm}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          {/* 1-Click Master Database Provisioning Card */}
                          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h6 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                                  <Sparkles className="w-4 h-4 text-emerald-600" />
                                  Master Geographic Area Sync (SRS 45 & User Spec)
                                </h6>
                                <p className="text-[11px] text-emerald-700 mt-0.5">
                                  Populate official relational hierarchy: State ➔ Lok Sabha ➔ District ➔ Vidhan Sabha ➔ Block
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleProvisionClientMasterAreas(clientDetail._id)}
                                disabled={syncingMasterAreas}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                              >
                                {syncingMasterAreas ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Provisioning Areas...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>1-Click Provision Master Areas</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {masterSyncFeedback && (
                              <div
                                className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                                  masterSyncFeedback.type === 'success'
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : 'bg-red-100 text-red-900 border border-red-300'
                                }`}
                              >
                                {masterSyncFeedback.type === 'success' ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                                )}
                                <span>{masterSyncFeedback.message}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* TAB 5: REGISTRATION FORM */}
                      {viewDetailTab === 'registration_form' && (
                        <div className="space-y-3 pt-1 animate-in fade-in-50 duration-150">
                          {(() => {
                            const formFields = (clientDetail._registrationFields && clientDetail._registrationFields.length > 0)
                              ? clientDetail._registrationFields
                              : (clientDetail.settings?.registrationFields || []);

                            return (
                              <>
                                <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                                  <span>Dynamic Citizen / Voter Sign-up Form Schema</span>
                                  <span className="text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                                    {formFields.length} Fields Configured
                                  </span>
                                </div>

                                {formFields.length === 0 ? (
                                  <div className="p-6 text-center bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-400">
                                    Default standard registration fields configured in backend.
                                  </div>
                                ) : (
                                  <div className="space-y-2.5">
                                    {formFields.map((field, idx) => (
                                      <div
                                        key={field.key || idx}
                                        className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2 text-xs"
                                      >
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                          <div className="flex items-center gap-2.5">
                                            <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                                              #{idx + 1}
                                            </span>
                                            <span className="font-bold text-gray-900 text-sm">{field.label}</span>
                                            {field.isSystem && (
                                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-600 uppercase">
                                                System Field
                                              </span>
                                            )}
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                                              {field.type}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                              field.required ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                              {field.required ? 'Required' : 'Optional'}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                                          <div>
                                            <span className="text-gray-400">Database Key: </span>
                                            <strong className="font-mono text-gray-800">{field.key}</strong>
                                          </div>
                                          {field.placeholder && (
                                            <div>
                                              <span className="text-gray-400">Placeholder: </span>
                                              <span className="italic text-gray-700">"{field.placeholder}"</span>
                                            </div>
                                          )}
                                          {field.helpText && (
                                            <div className="sm:col-span-2">
                                              <span className="text-gray-400">Help Text: </span>
                                              <span className="text-gray-700">{field.helpText}</span>
                                            </div>
                                          )}
                                        </div>

                                        {field.options && field.options.length > 0 && (
                                          <div className="pt-1.5">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Configured Dropdown Options:</span>
                                            <div className="flex flex-wrap gap-1.5">
                                              {field.options.map((opt, oIdx) => (
                                                <span
                                                  key={oIdx}
                                                  className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium border border-gray-200"
                                                >
                                                  {opt}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}

                      {/* TAB 6: ADMIN USERS */}
                      {viewDetailTab === 'admins' && (
                        <div className="space-y-3 pt-1 animate-in fade-in-50 duration-150">
                          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                            <span>Tenant Administrator & Leader Accounts</span>
                            <button
                              type="button"
                              onClick={() => {
                                closeModal();
                                openModal('CREATE_ADMIN', clientDetail);
                              }}
                              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                            >
                              + Add Another Admin
                            </button>
                          </div>

                          {tenantAdminUsers.length === 0 ? (
                            <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-xs text-gray-400">
                              No admin users registered. Click "Add Another Admin" to create one.
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {tenantAdminUsers.map((admin, idx) => (
                                <div
                                  key={admin._id || idx}
                                  className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-gray-900 text-sm">{admin.name}</span>
                                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-800 uppercase">
                                        {admin.role}
                                      </span>
                                    </div>
                                    <p className="font-mono text-gray-600 mt-0.5">{admin.email}</p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(admin.email);
                                        setCopiedDetail(true);
                                        setTimeout(() => setCopiedDetail(false), 2000);
                                      }}
                                      className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                                    >
                                      {copiedDetail ? 'Copied Email' : 'Copy Email'}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        closeModal();
                                        openModal('RESET_ADMIN_PASSWORD', clientDetail, admin);
                                      }}
                                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                                    >
                                      <Key className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Reset Password</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        closeModal();
                                        openModal('DELETE_ADMIN', clientDetail, admin);
                                      }}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200"
                                      title="Remove this admin user"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1.5 mt-3">
                            <div className="flex items-center gap-2 font-bold text-slate-900">
                              <Key className="w-4 h-4 text-amber-600" />
                              <span>Why are passwords not visible in plain text?</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Passwords are encrypted using irreversible <strong>Bcrypt cryptographic hashing</strong> in the database to comply with industry security standards. To provide new login credentials to the client, click <strong>"Reset Password"</strong> to set a new password and view/copy credentials instantly.
                            </p>
                          </div>
                        </div>
                      )}
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

                  {/* 1-Click Direct Leader Admin Launch (SRS Sec 45.2) */}
                  <div className="bg-gradient-to-br from-purple-50 via-indigo-50/50 to-white border border-purple-200/80 p-4 rounded-xl space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                        <Rocket className="w-4 h-4 text-purple-600" /> 1-Click Leader Admin Auto-Login
                      </span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-md">
                        Direct Access
                      </span>
                    </div>
                    <p className="text-xs text-purple-800/90 leading-relaxed">
                      Token copy karne ki zaroorat nahi hai. Neeche diye gaye button par click karke direct Leader Admin Panel open karein:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const customDomain = impersonationToken.tenant?.customDomain;
                          const slug = impersonationToken.tenant?.slug;
                          const token = impersonationToken.token;
                          let targetUrl = '';
                          if (customDomain) {
                            targetUrl = `https://${customDomain}/login?token=${token}&impersonate=true`;
                          } else {
                            targetUrl = `${window.location.protocol}//${slug ? `${slug}.` : ''}${window.location.host}/login?token=${token}&impersonate=true`;
                          }
                          window.open(targetUrl, '_blank');
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>🚀 Open Leader Admin in New Tab</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const customDomain = impersonationToken.tenant?.customDomain;
                          const slug = impersonationToken.tenant?.slug;
                          const token = impersonationToken.token;
                          let targetUrl = customDomain
                            ? `https://${customDomain}/login?token=${token}&impersonate=true`
                            : `${window.location.protocol}//${slug ? `${slug}.` : ''}${window.location.host}/login?token=${token}&impersonate=true`;
                          navigator.clipboard.writeText(targetUrl);
                          setCopiedCredentials(true);
                          setTimeout(() => setCopiedCredentials(false), 3000);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-purple-300 bg-white hover:bg-purple-50 text-purple-900 text-xs font-bold transition-colors cursor-pointer shrink-0"
                      >
                        {copiedCredentials ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedCredentials ? 'Link Copied!' : 'Copy Direct Link'}</span>
                      </button>
                    </div>
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

              {/* ONBOARDING STATUS & PUBLISH */}
              {modalType === 'ONBOARDING' && (
                <div className="space-y-4">
                  {loadingOnboarding ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                      <p className="text-xs text-gray-500">Checking 7 onboarding steps...</p>
                    </div>
                  ) : !onboardingStatus ? (
                    <div className="text-center py-8 text-sm text-gray-500">
                      Status load nahi ho saka. Backend check karein.
                    </div>
                  ) : (
                    <>
                      {/* Progress Bar & Readiness Header */}
                      <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Setup Progress</span>
                          <span className="text-sm font-black text-blue-700">{onboardingStatus.completionPercentage}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              onboardingStatus.completionPercentage === 100
                                ? 'bg-emerald-500'
                                : onboardingStatus.completionPercentage >= 50
                                ? 'bg-blue-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${onboardingStatus.completionPercentage}%` }}
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            Platform Status:{' '}
                            <strong className={onboardingStatus.isPublished ? 'text-emerald-700 font-bold' : 'text-slate-700 font-bold'}>
                              {onboardingStatus.isPublished ? '🚀 Live & Published' : 'Draft (Unpublished)'}
                            </strong>
                          </span>
                          {onboardingStatus.isReadyToPublish && !onboardingStatus.isPublished && (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Ready to Launch
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 7 Steps List */}
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {onboardingStatus.steps &&
                          Object.entries(onboardingStatus.steps).map(([key, stepInfo]) => (
                            <div
                              key={key}
                              className={`p-3 rounded-lg border text-sm flex items-start justify-between transition-colors ${
                                stepInfo.completed
                                  ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-900'
                                  : 'bg-gray-50 border-gray-200 text-gray-700'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="mt-0.5">
                                  {stepInfo.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-semibold text-xs text-gray-900 flex items-center gap-2">
                                    <span>Step {stepInfo.step}: {stepInfo.name}</span>
                                  </div>
                                  {stepInfo.data && (
                                    <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
                                      {stepInfo.step === 1 && (stepInfo.data.contactPerson ? `Contact: ${stepInfo.data.contactPerson} (${stepInfo.data.mobileNumber || ''})` : `Slug: ${stepInfo.data.slug}`)}
                                      {stepInfo.step === 2 && (stepInfo.data.leaderName ? `Leader: ${stepInfo.data.leaderName}` : 'Colors/Logo pending')}
                                      {stepInfo.step === 3 && (stepInfo.data.customDomain ? `Domain: ${stepInfo.data.customDomain}` : `Subdomain: ${stepInfo.data.subdomain}`)}
                                      {stepInfo.step === 4 && `${stepInfo.data.enabledModulesCount || 0} module(s) active`}
                                      {stepInfo.step === 5 && `${stepInfo.data.configuredLevelCount || 0} administrative level(s)`}
                                      {stepInfo.step === 6 && `${stepInfo.data.fieldCount || 0} registration field(s)`}
                                      {stepInfo.step === 7 && `${stepInfo.data.adminCount || 0} active admin account(s)`}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                stepInfo.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {stepInfo.completed ? 'Done' : 'Pending'}
                              </span>
                            </div>
                          ))}
                      </div>

                      {/* Publish Platform Button */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {onboardingStatus.isPublished
                            ? 'Platform public access par live hai.'
                            : 'Launch karne ke baad leader portal active ho jayega.'}
                        </div>
                        {!onboardingStatus.isPublished ? (
                          <button
                            onClick={() => handlePublishTenant(selectedClient._id)}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-60"
                          >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
                            <span>Launch & Publish Platform</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800">
                            <Check className="w-3.5 h-3.5" /> Platform Published
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ADD */}
              {modalType === 'ADD' && (
                <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Client / Party Name *</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Rahul Gandhi Campaign"
                      value={form.name || ''}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Subdomain (Slug) *</label>
                    <div className="flex">
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="rahulgandhi"
                        value={form.slug || ''}
                        onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                      />
                      <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-xs font-mono rounded-r-lg">.madiyayu.com</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Leader / Candidate Name</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. Rahul Gandhi"
                        value={form.leaderName || ''}
                        onChange={e => setForm(f => ({ ...f, leaderName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Election Type</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={form.electionType || 'lok_sabha'}
                        onChange={e => setForm(f => ({ ...f, electionType: e.target.value }))}
                      >
                        {ELECTION_TYPES.map(et => (
                          <option key={et.value} value={et.value}>{et.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Campaign Manager / Contact Person</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Amit Sharma (Office Head)"
                      value={form.contactPerson || ''}
                      onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Contact Mobile Number</label>
                      <input
                        type="tel"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. 9876543210"
                        value={form.mobileNumber || ''}
                        onChange={e => setForm(f => ({ ...f, mobileNumber: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Official Email</label>
                      <input
                        type="email"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. office@campaign.com"
                        value={form.email || ''}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* GST & Commercial Tax Profile (SRS Sec 46.2) */}
                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" /> GST & Billing Details (Optional)
                      </span>
                      <span className="text-[10px] text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded font-semibold">SRS Sec 46.2</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Client GSTIN
                        </label>
                        <input
                          type="text"
                          maxLength={15}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          placeholder="e.g. 27AABCU9603R1ZX"
                          value={form.gstin || ''}
                          onChange={e => setForm(f => ({ ...f, gstin: e.target.value.toUpperCase() }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Billing State (Place of Supply)
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          value={form.billingState || ''}
                          onChange={e => setForm(f => ({ ...f, billingState: e.target.value }))}
                        >
                          <option value="">-- Select State --</option>
                          {INDIAN_STATES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Billing Address
                      </label>
                      <textarea
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white resize-none"
                        placeholder="Complete billing address for tax invoices"
                        value={form.billingAddress || ''}
                        onChange={e => setForm(f => ({ ...f, billingAddress: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* EDIT */}
              {modalType === 'EDIT' && (
                <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Client Name</label>
                    <input
                      type="text"
                      value={form.name || ''}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Custom Domain</label>
                    <input
                      type="text"
                      value={form.customDomain || ''}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. rahulkumar.in"
                      onChange={e => setForm(f => ({ ...f, customDomain: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Election Type</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={form.electionType || 'other'}
                        onChange={e => setForm(f => ({ ...f, electionType: e.target.value }))}
                      >
                        {ELECTION_TYPES.map(et => (
                          <option key={et.value} value={et.value}>{et.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Contact Person</label>
                      <input
                        type="text"
                        value={form.contactPerson || ''}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. In-charge Name"
                        onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={form.mobileNumber || ''}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="10-digit number"
                        onChange={e => setForm(f => ({ ...f, mobileNumber: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email</label>
                      <input
                        type="email"
                        value={form.email || ''}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="email@domain.com"
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* GST & Commercial Tax Profile (SRS Sec 46.2) */}
                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" /> GST & Billing Details
                      </span>
                      <span className="text-[10px] text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded font-semibold">SRS Sec 46.2</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Client GSTIN
                        </label>
                        <input
                          type="text"
                          maxLength={15}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          placeholder="e.g. 27AABCU9603R1ZX"
                          value={form.gstin || ''}
                          onChange={e => setForm(f => ({ ...f, gstin: e.target.value.toUpperCase() }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Billing State (Place of Supply)
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          value={form.billingState || ''}
                          onChange={e => setForm(f => ({ ...f, billingState: e.target.value }))}
                        >
                          <option value="">-- Select State --</option>
                          {INDIAN_STATES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Billing Address
                      </label>
                      <textarea
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white resize-none"
                        placeholder="Complete billing address for tax invoices"
                        value={form.billingAddress || ''}
                        onChange={e => setForm(f => ({ ...f, billingAddress: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* BRANDING (SRS Sec 8 Step 2, Sec 49 & 70) */}
              {modalType === 'BRANDING' && (
                <div className="space-y-5">
                  {/* Category Switcher Tabs */}
                  <div className="flex items-center gap-1.5 p-1.5 bg-gray-100/90 rounded-xl overflow-x-auto shrink-0 border border-gray-200/80 sticky top-0 z-10 backdrop-blur-md bg-white/95">
                    {[
                      { id: 'all', label: 'All Assets', icon: Sparkles },
                      { id: 'identity', label: 'Identity & Visuals', icon: Building2 },
                      { id: 'web_pwa', label: 'Favicon & PWA', icon: Globe },
                      { id: 'splash', label: 'Mobile Splash (3-4)', icon: Film },
                      { id: 'theme', label: 'Theme Colors', icon: Palette },
                      { id: 'legal', label: 'Legal & Footer', icon: FileText },
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isActive = brandingTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setBrandingTab(tab.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                            isActive
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Identity & Visuals Section */}
                  {(brandingTab === 'all' || brandingTab === 'identity') && (
                    <div className="space-y-4">
                      {/* Identity Section */}
                      <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Platform & Leader Identity
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Platform / App Name</label>
                        <input
                          type="text"
                          value={form.platformName || ''}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium"
                          placeholder="e.g. Rahul Gandhi Digital Campaign"
                          onChange={e => setForm(f => ({ ...f, platformName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Leader / Candidate Name</label>
                        <input
                          type="text"
                          value={form.leaderName || ''}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium"
                          placeholder="e.g. Rahul Gandhi"
                          onChange={e => setForm(f => ({ ...f, leaderName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Campaign Tagline</label>
                        <input
                          type="text"
                          value={form.tagline || ''}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium"
                          placeholder="e.g. Vikas Ki Nayi Udaan"
                          onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Primary Visual Assets (Logo & Leader Portrait) */}
                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-purple-600" /> Primary Visual Assets
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Party / Campaign Logo */}
                      <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
                        <div className="w-14 h-14 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                          {form.logoUrl ? (
                            <img
                              src={resolveImageUrl(form.logoUrl)}
                              alt="Logo Preview"
                              className="w-full h-full object-contain p-1"
                              onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Logo'; }}
                            />
                          ) : (
                            <Building2 className="w-6 h-6 text-gray-300" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800">Party / Campaign Logo</p>
                          <p className="text-[11px] text-gray-400 mb-1.5">PNG, SVG, WEBP (Max 10MB)</p>
                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer shadow-2xs transition-colors">
                              {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" /> : <Upload className="w-3.5 h-3.5 text-purple-600" />}
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
                        </div>
                      </div>

                      {/* Leader / Candidate Photo */}
                      <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
                        <div className="w-14 h-14 rounded-full border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                          {form.leaderPhotoUrl ? (
                            <img
                              src={resolveImageUrl(form.leaderPhotoUrl)}
                              alt="Leader Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Leader'; }}
                            />
                          ) : (
                            <User className="w-6 h-6 text-gray-300" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800">Candidate Portrait</p>
                          <p className="text-[11px] text-gray-400 mb-1.5">High-resolution portrait photo</p>
                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer shadow-2xs transition-colors">
                              {uploadingLeaderPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" /> : <Upload className="w-3.5 h-3.5 text-purple-600" />}
                              <span>{uploadingLeaderPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                disabled={uploadingLeaderPhoto}
                                onChange={handleLeaderPhotoUpload}
                              />
                            </label>
                            {form.leaderPhotoUrl && (
                              <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, leaderPhotoUrl: '' }))}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Remove Photo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Web & Mobile App Assets (SRS Sec 49 & 70) */}
              {(brandingTab === 'all' || brandingTab === 'web_pwa') && (
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-purple-600" /> Web & Mobile App Assets (SRS Sec 49 & 70)
                      </h5>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        White-Label
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Browser Favicon */}
                      <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-2 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-start gap-2.5">
                          <div className="w-10 h-10 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                            {form.faviconUrl ? (
                              <img src={resolveImageUrl(form.faviconUrl)} alt="Favicon" className="w-6 h-6 object-contain" />
                            ) : (
                              <Globe className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-800">Browser Favicon</p>
                            <p className="text-[10px] text-gray-400">.ico, .png, .svg</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
                          <label className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded text-xs font-semibold text-gray-700 cursor-pointer">
                            {uploadingFavicon ? <Loader2 className="w-3 h-3 animate-spin text-purple-600" /> : <Upload className="w-3 h-3 text-purple-600" />}
                            <span>{uploadingFavicon ? 'Uploading...' : 'Upload'}</span>
                            <input type="file" accept=".ico,.png,.svg" className="hidden" disabled={uploadingFavicon} onChange={handleFaviconUpload} />
                          </label>
                          {form.faviconUrl && (
                            <button type="button" onClick={() => setForm(f => ({ ...f, faviconUrl: '' }))} className="p-1 text-red-500 hover:bg-red-50 rounded">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* PWA Mobile App Icon */}
                      <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-2 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-start gap-2.5">
                          <div className="w-10 h-10 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                            {form.pwaIconUrl ? (
                              <img src={resolveImageUrl(form.pwaIconUrl)} alt="PWA Icon" className="w-full h-full object-cover" />
                            ) : (
                              <Smartphone className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-800">PWA App Icon</p>
                            <p className="text-[10px] text-gray-400">192×192 / 512×512</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
                          <label className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded text-xs font-semibold text-gray-700 cursor-pointer">
                            {uploadingPwaIcon ? <Loader2 className="w-3 h-3 animate-spin text-purple-600" /> : <Upload className="w-3 h-3 text-purple-600" />}
                            <span>{uploadingPwaIcon ? 'Uploading...' : 'Upload'}</span>
                            <input type="file" accept="image/png,image/webp" className="hidden" disabled={uploadingPwaIcon} onChange={handlePwaIconUpload} />
                          </label>
                          {form.pwaIconUrl && (
                            <button type="button" onClick={() => setForm(f => ({ ...f, pwaIconUrl: '' }))} className="p-1 text-red-500 hover:bg-red-50 rounded">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Login / Splash Screen Backdrop */}
                      <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-2 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-start gap-2.5">
                          <div className="w-10 h-10 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                            {form.loginBgUrl ? (
                              <img src={resolveImageUrl(form.loginBgUrl)} alt="Backdrop" className="w-full h-full object-cover" />
                            ) : (
                              <Image className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-800">Login Backdrop</p>
                            <p className="text-[10px] text-gray-400">Portal / Splash cover</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
                          <label className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded text-xs font-semibold text-gray-700 cursor-pointer">
                            {uploadingLoginBg ? <Loader2 className="w-3 h-3 animate-spin text-purple-600" /> : <Upload className="w-3 h-3 text-purple-600" />}
                            <span>{uploadingLoginBg ? 'Uploading...' : 'Upload'}</span>
                            <input type="file" accept="image/*" className="hidden" disabled={uploadingLoginBg} onChange={handleLoginBgUpload} />
                          </label>
                          {form.loginBgUrl && (
                            <button type="button" onClick={() => setForm(f => ({ ...f, loginBgUrl: '', splashScreenUrl: '' }))} className="p-1 text-red-500 hover:bg-red-50 rounded">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Multi-Slide Mobile Splash / Onboarding Walkthrough Screens (SRS Sec 49 & 70) */}
                {(brandingTab === 'all' || brandingTab === 'splash') && (
                  <div className="p-3.5 bg-gradient-to-br from-purple-50/40 via-white to-gray-50/50 border border-purple-200 rounded-xl space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-purple-100">
                      <div>
                        <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-purple-600" /> Multi-Slide Mobile Splash / Onboarding Screens (3-4 Screens)
                        </h5>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Citizen walkthrough screens on app launch. Supports images and video clips (.mp4, .webm, .mov) via multipart form-data.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSplashSlide}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Slide</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(form.splashScreens || []).map((slide, sIdx) => {
                        const isUploadingThis = uploadingSlideIndex === sIdx;
                        const isVideo = slide.mediaType === 'video';

                        return (
                          <div
                            key={sIdx}
                            className={`p-3 rounded-xl border transition-all ${
                              activeSplashSlideIndex === sIdx
                                ? 'border-purple-500 ring-2 ring-purple-500/20 bg-white shadow-xs'
                                : 'border-gray-200 bg-white hover:border-purple-300'
                            }`}
                            onClick={() => setActiveSplashSlideIndex(sIdx)}
                          >
                            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-gray-100">
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 uppercase">
                                  Slide {sIdx + 1}
                                </span>
                                <span className={`px-1 py-0.5 rounded text-[9px] font-semibold flex items-center gap-1 ${
                                  isVideo ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                  {isVideo ? <Video className="w-2.5 h-2.5" /> : <Image className="w-2.5 h-2.5" />}
                                  <span>{isVideo ? 'Video' : 'Image'}</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <div className="flex items-center bg-gray-100 p-0.5 rounded text-[9px] font-bold">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateSplashSlide(sIdx, 'mediaType', 'image');
                                    }}
                                    className={`px-1.5 py-0.5 rounded ${!isVideo ? 'bg-white text-purple-700 shadow-2xs' : 'text-gray-500'}`}
                                  >
                                    Img
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateSplashSlide(sIdx, 'mediaType', 'video');
                                    }}
                                    className={`px-1.5 py-0.5 rounded ${isVideo ? 'bg-purple-600 text-white shadow-2xs' : 'text-gray-500'}`}
                                  >
                                    Vid
                                  </button>
                                </div>

                                {(form.splashScreens || []).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveSplashSlide(sIdx);
                                    }}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                    title="Delete Slide"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1.5 mb-2">
                              <div>
                                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Title</label>
                                <input
                                  type="text"
                                  value={slide.title || ''}
                                  placeholder="e.g. Welcome to App"
                                  onChange={e => handleUpdateSplashSlide(sIdx, 'title', e.target.value)}
                                  className="w-full px-2 py-1 text-xs font-semibold rounded border border-gray-200 outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Subtitle</label>
                                <input
                                  type="text"
                                  value={slide.subtitle || ''}
                                  placeholder="e.g. Real-time updates..."
                                  onChange={e => handleUpdateSplashSlide(sIdx, 'subtitle', e.target.value)}
                                  className="w-full px-2 py-1 text-xs rounded border border-gray-200 outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-1.5 border-t border-gray-100">
                              <div className="flex items-center gap-1.5">
                                <label className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-xs font-bold text-purple-700 cursor-pointer transition-colors">
                                  {isUploadingThis ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
                                  ) : isVideo ? (
                                    <Video className="w-3 h-3 text-purple-600" />
                                  ) : (
                                    <Upload className="w-3 h-3 text-purple-600" />
                                  )}
                                  <span>{isUploadingThis ? 'Uploading...' : isVideo ? 'Upload Video (.mp4)' : 'Upload Image'}</span>
                                  <input
                                    type="file"
                                    accept={isVideo ? 'video/mp4,video/webm,video/quicktime,video/*' : 'image/*'}
                                    className="hidden"
                                    disabled={isUploadingThis}
                                    onChange={e => handleSlideMediaUpload(sIdx, e.target.files?.[0])}
                                  />
                                </label>

                                {slide.mediaUrl && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateSplashSlide(sIdx, 'mediaUrl', '');
                                    }}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                    title="Clear"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              <div className="flex rounded border border-gray-200 bg-gray-50/60 overflow-hidden">
                                <input
                                  type="text"
                                  value={slide.mediaUrl || ''}
                                  placeholder={isVideo ? 'Or video URL (/uploads/...mp4)' : 'Or image URL...'}
                                  onChange={e => handleUpdateSplashSlide(sIdx, 'mediaUrl', e.target.value)}
                                  className="flex-1 px-2 py-1 text-[10px] font-mono outline-none bg-transparent"
                                />
                                {slide.mediaUrl && (
                                  <a
                                    href={resolveImageUrl(slide.mediaUrl)}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="px-1.5 flex items-center text-gray-400 hover:text-purple-600"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>

                              {slide.mediaUrl && (
                                <div className="mt-1 rounded overflow-hidden border border-gray-200 bg-black">
                                  {isVideo ? (
                                    <video src={resolveImageUrl(slide.mediaUrl)} controls playsInline className="w-full h-24 object-contain" />
                                  ) : (
                                    <img src={resolveImageUrl(slide.mediaUrl)} alt="Preview" className="w-full h-24 object-cover" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Theme Colors & Presets */}
                {(brandingTab === 'all' || brandingTab === 'theme') && (
                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-purple-600" /> Color Theme & Presets
                      </h5>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-gray-400 font-bold">Presets:</span>
                        {BRAND_COLOR_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setForm(f => ({
                              ...f,
                              primaryColor: p.primary,
                              secondaryColor: p.secondary,
                              accentColor: p.accent,
                            }))}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white hover:bg-gray-100 border border-gray-200 rounded text-[10px] font-semibold text-gray-700 shadow-2xs cursor-pointer"
                          >
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.primary }} />
                            <span>{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-2.5 bg-white border border-gray-200 rounded-lg">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Primary Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={form.primaryColor || '#072F2B'}
                            className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                            onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
                          />
                          <input
                            type="text"
                            value={form.primaryColor || '#072F2B'}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-xs font-mono font-bold uppercase"
                            onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="p-2.5 bg-white border border-gray-200 rounded-lg">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Secondary Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={form.secondaryColor || '#F59E0B'}
                            className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                            onChange={e => setForm(f => ({ ...f, secondaryColor: e.target.value }))}
                          />
                          <input
                            type="text"
                            value={form.secondaryColor || '#F59E0B'}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-xs font-mono font-bold uppercase"
                            onChange={e => setForm(f => ({ ...f, secondaryColor: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="p-2.5 bg-white border border-gray-200 rounded-lg">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Accent / Ring Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={form.accentColor || '#10B981'}
                            className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                            onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))}
                          />
                          <input
                            type="text"
                            value={form.accentColor || '#10B981'}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-xs font-mono font-bold uppercase"
                            onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* White-Label Legal & Footer Content */}
                {(brandingTab === 'all' || brandingTab === 'legal') && (
                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                      <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-purple-600" /> White-Label Legal Compliance & Custom Footer (SRS Sec 49)
                      </h5>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        In-App Statements
                      </span>
                    </div>

                    {/* Copyright Footer Text */}
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Copyright Footer Text</label>
                      <input
                        type="text"
                        value={form.footerText || ''}
                        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium"
                        placeholder="© 2026 Party. All rights reserved."
                        onChange={e => setForm(f => ({ ...f, footerText: e.target.value }))}
                      />
                    </div>

                    {/* Privacy Policy Full Content & Generator */}
                    <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1">
                          <Shield className="w-3 h-3 text-purple-600" /> Full In-App Privacy Policy
                        </span>
                        <button
                          type="button"
                          onClick={handleAutoFillPrivacyPolicy}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
                        >
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>1-Click Generate Privacy Policy</span>
                        </button>
                      </div>

                      <textarea
                        rows={5}
                        placeholder="Enter full in-app privacy policy or click '1-Click Generate'..."
                        value={form.privacyPolicyContent || ''}
                        onChange={e => setForm(f => ({ ...f, privacyPolicyContent: e.target.value }))}
                        className="w-full p-2.5 rounded-lg border border-gray-200 text-xs font-mono leading-relaxed text-gray-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none bg-gray-50/50"
                      />

                      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0">External Link:</span>
                        <div className="flex-1 flex rounded border border-gray-200 bg-gray-50/60 overflow-hidden">
                          <input
                            type="url"
                            value={form.privacyPolicyUrl || ''}
                            className="flex-1 px-2 py-1 text-xs outline-none font-mono"
                            placeholder="https://client.in/privacy"
                            onChange={e => setForm(f => ({ ...f, privacyPolicyUrl: e.target.value }))}
                          />
                          {form.privacyPolicyUrl && (
                            <a href={form.privacyPolicyUrl} target="_blank" rel="noreferrer" className="px-2 flex items-center text-gray-400 hover:text-purple-600">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Terms & Conditions Full Content & Generator */}
                    <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1">
                          <FileText className="w-3 h-3 text-purple-600" /> Full In-App Terms & Conditions
                        </span>
                        <button
                          type="button"
                          onClick={handleAutoFillTerms}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
                        >
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>1-Click Generate Terms of Service</span>
                        </button>
                      </div>

                      <textarea
                        rows={5}
                        placeholder="Enter full in-app terms or click '1-Click Generate'..."
                        value={form.termsContent || ''}
                        onChange={e => setForm(f => ({ ...f, termsContent: e.target.value }))}
                        className="w-full p-2.5 rounded-lg border border-gray-200 text-xs font-mono leading-relaxed text-gray-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none bg-gray-50/50"
                      />

                      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0">External Link:</span>
                        <div className="flex-1 flex rounded border border-gray-200 bg-gray-50/60 overflow-hidden">
                          <input
                            type="url"
                            value={form.termsUrl || ''}
                            className="flex-1 px-2 py-1 text-xs outline-none font-mono"
                            placeholder="https://client.in/terms"
                            onChange={e => setForm(f => ({ ...f, termsUrl: e.target.value }))}
                          />
                          {form.termsUrl && (
                            <a href={form.termsUrl} target="_blank" rel="noreferrer" className="px-2 flex items-center text-gray-400 hover:text-purple-600">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                      placeholder="leader@campaign.com"
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={generateAdminPassword}
                        className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Auto-Generate
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        value={form.password || ''}
                        className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
                        placeholder="Minimum 6 characters"
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                        title={showAdminPassword ? 'Hide password' : 'Show password'}
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Eye button daba kar aap password dekh sakte hain.</p>
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

              {/* RESET ADMIN PASSWORD MODAL */}
              {modalType === 'RESET_ADMIN_PASSWORD' && selectedAdminUser && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-950">
                      <Key className="w-4 h-4 text-amber-600" /> Reset Password for: <u>{selectedAdminUser.name}</u>
                    </p>
                    <p className="text-amber-800">
                      Login Email: <strong className="font-mono">{selectedAdminUser.email}</strong> (Role: <span className="uppercase font-semibold">{selectedAdminUser.role}</span>)
                    </p>
                    <p className="text-[11px] text-amber-700">
                      Tenant: <strong>{selectedClient?.name}</strong>
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        New Password <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={generateAdminPassword}
                        className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Auto-Generate
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        value={form.newPassword || form.password || ''}
                        placeholder="Enter new password (min 6 chars)"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                        onChange={e => setForm(f => ({ ...f, newPassword: e.target.value, password: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                        title={showAdminPassword ? "Hide password" : "Show password"}
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-amber-600" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Eye button par click karke aap password dekh sakte hain.</p>
                  </div>
                </div>
              )}

              {/* SELECT ADMIN TO RESET PASSWORD */}
              {modalType === 'SELECT_ADMIN_TO_RESET' && (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900">
                    <p className="font-bold text-amber-950">Tenant: {selectedClient?.name}</p>
                    <p className="text-amber-800 mt-0.5">Kripya choose karein ki aap kis admin ka password reset karna chahte hain:</p>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {tenantAdminUsers.map((admin, idx) => (
                      <div
                        key={admin._id || idx}
                        className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs hover:border-amber-300 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{admin.name}</span>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-800 uppercase">
                              {admin.role}
                            </span>
                          </div>
                          <p className="font-mono text-gray-500 mt-0.5">{admin.email}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => openModal('RESET_ADMIN_PASSWORD', selectedClient, admin)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Reset Password</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DELETE ADMIN MODAL */}
              {modalType === 'DELETE_ADMIN' && selectedAdminUser && (
                <div className="text-center py-4 space-y-3">
                  <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-2">
                    <Trash2 className="h-7 w-7 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Remove Admin Account?</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                    Aap <strong>{selectedAdminUser.name}</strong> (<span className="font-mono">{selectedAdminUser.email}</span>) ko tenant <strong>{selectedClient?.name}</strong> se remove kar rahe hain. Unka login access turant band ho jayega.
                  </p>
                </div>
              )}

              {/* CREDENTIALS SUCCESS DISPLAY MODAL */}
              {modalType === 'CREDENTIALS_SUCCESS' && credentialsSuccess && (
                <div className="space-y-4 text-center py-2 animate-in zoom-in-95 duration-150">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <Sparkles className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{credentialsSuccess.actionTitle}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Client <strong>{credentialsSuccess.tenantName}</strong> ke login credentials update ho gaye hain.
                    </p>
                  </div>

                  <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 border border-slate-800 text-left shadow-lg space-y-2.5 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                        <Key className="w-3.5 h-3.5" /> Login Credentials
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const text = `Tenant: ${credentialsSuccess.tenantName}\nName: ${credentialsSuccess.name}\nEmail: ${credentialsSuccess.email}\nPassword: ${credentialsSuccess.password}\nRole: ${credentialsSuccess.role}`;
                          navigator.clipboard.writeText(text);
                          setCopiedCredentials(true);
                          setTimeout(() => setCopiedCredentials(false), 2500);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-emerald-400 font-sans text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                      >
                        {copiedCredentials ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCredentials ? 'Copied!' : 'Copy Credentials'}</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Admin Name:</span>
                        <span className="text-white font-bold">{credentialsSuccess.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Login Email:</span>
                        <span className="text-emerald-400 font-bold">{credentialsSuccess.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-sans">Password:</span>
                        <span className="text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">{credentialsSuccess.password}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Role:</span>
                        <span className="text-white uppercase">{credentialsSuccess.role}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500">
                    Aap is password ko copy karke tenant ya candidate ko bhej sakte hain.
                  </p>
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

            </div>

            {/* Sticky / Pinned Modal Footer — Always Visible At Bottom */}
            <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/95 backdrop-blur-xs shrink-0 flex items-center justify-between gap-3">
              <div className="text-xs text-gray-500 font-medium hidden sm:block">
                {modalType === 'BRANDING' && (
                  <span className="flex items-center gap-1.5 text-purple-700 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    White-label assets client portal par live update honge
                  </span>
                )}
                {modalType === 'VIEW' && (
                  <span className="text-gray-400">ESC dabayein ya Close par click karein</span>
                )}
              </div>

              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (modalType === 'CREDENTIALS_SUCCESS') {
                      closeModal();
                      if (selectedClient) openModal('VIEW', selectedClient);
                    } else {
                      closeModal();
                    }
                  }}
                  className="px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200/70 rounded-xl border border-gray-200 transition-colors cursor-pointer"
                >
                  {modalType === 'HISTORY' || modalType === 'FEATURES' || modalType === 'VIEW' || modalType === 'IMPERSONATE_RESULT' || modalType === 'ONBOARDING' || modalType === 'SELECT_ADMIN_TO_RESET'
                    ? 'Close'
                    : modalType === 'CREDENTIALS_SUCCESS'
                    ? 'Done & Back to Tenant'
                    : 'Cancel'}
                </button>

                {modalType !== 'HISTORY' && modalType !== 'FEATURES' && modalType !== 'VIEW' && modalType !== 'IMPERSONATE_RESULT' && modalType !== 'ONBOARDING' && modalType !== 'CREDENTIALS_SUCCESS' && modalType !== 'SELECT_ADMIN_TO_RESET' && (
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={saving}
                    className={`px-6 py-2 text-sm font-bold text-white rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer ${
                      modalType === 'SUSPEND' && selectedClient?.status === 'active'
                        ? 'bg-red-600 hover:bg-red-700'
                        : modalType === 'DELETE_ADMIN'
                        ? 'bg-red-600 hover:bg-red-700'
                        : modalType === 'RESET_ADMIN_PASSWORD'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : modalType === 'BRANDING'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/20'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    } disabled:opacity-60`}
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>
                      {modalType === 'SUSPEND'
                        ? 'Confirm'
                        : modalType === 'CREATE_ADMIN'
                        ? 'Create Admin User'
                        : modalType === 'RESET_ADMIN_PASSWORD'
                        ? 'Reset Password'
                        : modalType === 'DELETE_ADMIN'
                        ? 'Delete Admin'
                        : modalType === 'BRANDING'
                        ? 'Save Branding Changes'
                        : 'Save Changes'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7-Step Onboarding Stepper Wizard Modal (SRS Sec 8 & Sec 70) */}
      <OnboardingWizardModal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSuccess={() => loadClients()}
      />

      {/* Read Full Legal Statement Modal (Privacy Policy / Terms of Service) */}
      {viewingLegalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{viewingLegalModal.title}</h3>
                  <p className="text-xs text-gray-500">Tenant Legal Statement for {viewingLegalModal.clientName || 'Tenant'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingLegalModal(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed bg-gray-50/30">
              {viewingLegalModal.content || 'No legal statement has been drafted for this tenant yet.'}
            </div>
            <div className="px-6 py-3 border-t border-gray-100 bg-white flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono">
                {viewingLegalModal.content ? `${viewingLegalModal.content.length} characters` : 'Empty statement'}
              </span>
              <button
                type="button"
                onClick={() => setViewingLegalModal(null)}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Dot Action Menu Portal (Guaranteed to float cleanly above all table rows & sticky cells with zero clipping) */}
      {activeMenu && createPortal(
        <div
          className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 py-1 text-xs font-medium text-left w-56 animate-in fade-in zoom-in-95 duration-100 divide-y divide-gray-100"
          style={{
            zIndex: 999999,
            ...(activeMenu.openUpward
              ? { bottom: `${activeMenu.bottom}px` }
              : { top: `${activeMenu.top}px` }),
            right: `${activeMenu.right}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between bg-gray-50/70 rounded-t-xl">
            <span>Client Actions</span>
            <span className="font-mono text-[9px] text-gray-500 font-semibold truncate max-w-[90px]">{activeMenu.client.slug}</span>
          </div>

          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                const c = activeMenu.client;
                setActiveMenu(null);
                openModal('ONBOARDING', c);
              }}
              className="w-full px-3 py-2 text-left flex items-center gap-2 text-violet-700 hover:bg-violet-50 transition-colors cursor-pointer font-medium"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-violet-600 shrink-0" />
              <span>7-Step Checklist & Launch</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const c = activeMenu.client;
                setActiveMenu(null);
                openModal('EDIT', c);
              }}
              className="w-full px-3 py-2 text-left flex items-center gap-2 text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer font-medium"
            >
              <Edit className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Edit Client Info</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const c = activeMenu.client;
                setActiveMenu(null);
                openModal('BRANDING', c);
              }}
              className="w-full px-3 py-2 text-left flex items-center gap-2 text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer font-medium"
            >
              <Palette className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Theme & Branding Assets</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const c = activeMenu.client;
                setActiveMenu(null);
                openModal('FEATURES', c);
              }}
              className="w-full px-3 py-2 text-left flex items-center gap-2 text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer font-medium"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Feature Modules</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const c = activeMenu.client;
                setActiveMenu(null);
                openModal('CREATE_ADMIN', c);
              }}
              className="w-full px-3 py-2 text-left flex items-center gap-2 text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer font-medium"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Add New Admin User</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const c = activeMenu.client;
                setActiveMenu(null);
                openModal('HISTORY', c);
              }}
              className="w-full px-3 py-2 text-left flex items-center gap-2 text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer font-medium"
            >
              <History className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Impersonation Logs</span>
            </button>
          </div>

          <div className="p-1">
            <button
              type="button"
              onClick={() => {
                const c = activeMenu.client;
                setActiveMenu(null);
                openModal('SUSPEND', c);
              }}
              className={`w-full px-3 py-2 text-left flex items-center gap-2 rounded-lg transition-colors cursor-pointer font-semibold ${
                activeMenu.client.status === 'active'
                  ? 'text-rose-600 hover:bg-rose-50'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{activeMenu.client.status === 'active' ? 'Suspend Client' : 'Activate Client'}</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
