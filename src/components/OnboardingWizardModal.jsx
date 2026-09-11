import React, { useState, useEffect } from 'react';
import {
  X, Check, ChevronRight, ChevronLeft, Building2, Palette, Globe,
  CreditCard, MapPin, FileText, UserCheck, Upload, Loader2, Sparkles,
  Copy, CheckCircle2, AlertCircle, RefreshCw, Key, Shield,
  Rocket, Trash2, Plus, Eye, EyeOff, ExternalLink, Smartphone, Image as ImageIcon,
  Video, Film
} from 'lucide-react';
import tenantsService from '../services/tenants.service';
import plansService from '../services/plans.service';
import masterAreasService from '../services/masterAreas.service';
import { generateStandardPrivacyPolicy, generateStandardTerms } from '../utils/legalTemplates';

const BRAND_COLOR_PRESETS = [
  { name: 'Emerald & Saffron', primary: '#072F2B', secondary: '#F59E0B', accent: '#10B981' },
  { name: 'Tricolor Classic', primary: '#0B4F6C', secondary: '#F26419', accent: '#33658A' },
  { name: 'Royal Saffron', primary: '#E65100', secondary: '#1E3A8A', accent: '#F59E0B' },
  { name: 'Modern Navy', primary: '#1E3A8A', secondary: '#0D9488', accent: '#3B82F6' },
  { name: 'Deep Crimson', primary: '#881337', secondary: '#F59E0B', accent: '#E11D48' },
  { name: 'Sovereign Purple', primary: '#4C1D95', secondary: '#EC4899', accent: '#8B5CF6' },
];

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://election.digicoders.in').replace(/\/+$/, '');

function resolveAssetUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:image/') || url.startsWith('blob:')) return url;
  if (url.includes('localhost:3001')) {
    return url.replace(/http:\/\/localhost:3001/g, API_BASE_URL);
  }
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const clean = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${clean}`;
}

const STEPS = [
  { id: 1, title: 'Profile', subtitle: 'Basic Details', icon: Building2 },
  { id: 2, title: 'Branding', subtitle: 'Colors & Logos', icon: Palette },
  { id: 3, title: 'Domain', subtitle: 'URL & DNS', icon: Globe },
  { id: 4, title: 'Plan', subtitle: 'Package & Modules', icon: CreditCard },
  { id: 5, title: 'Areas', subtitle: 'Hierarchy Levels', icon: MapPin },
  { id: 6, title: 'Form', subtitle: 'Registration Fields', icon: FileText },
  { id: 7, title: 'Admin', subtitle: 'Login Credentials', icon: UserCheck },
];

const ELECTION_PRESETS = {
  vidhan_sabha: {
    label: 'Vidhan Sabha (Assembly / MLA)',
    scopeLabel: 'Vidhan Sabha',
    icon: '🏢',
    targetLevelName: 'Vidhan Sabha',
    description: 'Constituency scope: Vidhan Sabha (e.g. Chunar). Internal portal hierarchy: Block ➔ Gram Panchayat ➔ Ward/Booth.',
    levels: ['Block', 'Gram Panchayat', 'Ward / Polling Booth'],
  },
  lok_sabha: {
    label: 'Lok Sabha (Parliamentary / MP)',
    scopeLabel: 'Lok Sabha',
    icon: '🏛️',
    targetLevelName: 'Lok Sabha',
    description: 'Constituency scope: Lok Sabha (e.g. Mirzapur). Internal portal hierarchy: Vidhan Sabha ➔ Block ➔ Gram Panchayat ➔ Ward/Booth.',
    levels: ['Vidhan Sabha', 'Block', 'Gram Panchayat', 'Ward / Polling Booth'],
  },
  block: {
    label: 'Block / Mandal (BDC / Pramukh)',
    scopeLabel: 'Block',
    icon: '🌾',
    targetLevelName: 'Block',
    description: 'Constituency scope: Block / Mandal. Internal portal hierarchy: Gram Panchayat ➔ Ward/Booth.',
    levels: ['Gram Panchayat', 'Ward / Polling Booth'],
  },
  panchayat: {
    label: 'Gram Panchayat (Pradhan / Sarpanch)',
    scopeLabel: 'Gram Panchayat',
    icon: '🏡',
    targetLevelName: 'Gram Panchayat',
    description: 'Constituency scope: Gram Panchayat (e.g. Basadhi). Internal portal hierarchy: Village/Majra ➔ Ward/Booth.',
    levels: ['Village / Majra', 'Ward / Polling Booth'],
  },
  municipal: {
    label: 'Municipal Corporation (Nagar Nigam / Parshad)',
    scopeLabel: 'Municipal Zone',
    icon: '🏙️',
    targetLevelName: 'Municipal Zone / Ward',
    description: 'Constituency scope: Urban Municipal. Internal portal hierarchy: Municipal Zone ➔ Ward ➔ Booth.',
    levels: ['Municipal Zone', 'Ward', 'Polling Booth'],
  },
  state: {
    label: 'State Level (State Party Committee)',
    scopeLabel: 'State',
    icon: '🇮🇳',
    targetLevelName: 'State',
    description: 'Full State apex jurisdiction: State ➔ Lok Sabha ➔ Vidhan Sabha ➔ Block ➔ Gram Panchayat ➔ Ward.',
    levels: ['Lok Sabha', 'Vidhan Sabha', 'Block', 'Gram Panchayat', 'Ward'],
  },
  other: {
    label: 'Custom Campaign Scope',
    scopeLabel: 'Custom',
    icon: '✨',
    targetLevelName: 'Custom Scope',
    description: 'Custom hierarchy adapted for political campaign structure.',
    levels: ['Block', 'Gram Panchayat', 'Ward / Polling Booth'],
  },
};

const DEFAULT_REGISTRATION_FIELDS = [
  { key: 'name', label: 'Full Name', type: 'text', required: true },
  { key: 'mobile', label: 'Mobile Number', type: 'phone', required: true },
  { key: 'dob', label: 'Date of Birth', type: 'date', required: false },
  { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
  { key: 'area', label: 'Your Area', type: 'area_selector', required: true },
];

const PRESET_REGISTRATION_FIELDS = [
  { label: 'Voter ID (EPIC)', key: 'voter_id', type: 'text', required: false },
  { label: 'WhatsApp Number', key: 'whatsapp_number', type: 'phone', required: false },
  { label: "Father's / Husband's Name", key: 'guardian_name', type: 'text', required: false },
  { label: 'Profession', key: 'profession', type: 'select', options: ['Farmer', 'Business', 'Private Job', 'Govt Employee', 'Student', 'Homemaker', 'Self-Employed', 'Other'], required: false },
  { label: 'Category / Caste', key: 'caste_category', type: 'select', options: ['General', 'OBC', 'SC', 'ST', 'EWS'], required: false },
  { label: 'Blood Group', key: 'blood_group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: false },
  { label: 'Pincode', key: 'pincode', type: 'text', required: false },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh',
  'Dadra & Nagar Haveli', 'Daman & Diu', 'Lakshadweep', 'Puducherry', 'Andaman & Nicobar',
];

export default function OnboardingWizardModal({ isOpen, onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [plans, setPlans] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Step 6 Registration Fields Management State
  const [showAddField, setShowAddField] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [newFieldData, setNewFieldData] = useState({
    label: '',
    key: '',
    type: 'text',
    required: false,
    optionsInput: '',
  });

  // Uploading flags
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingPwaIcon, setUploadingPwaIcon] = useState(false);
  const [uploadingLoginBg, setUploadingLoginBg] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [activeSplashSlideIndex, setActiveSplashSlideIndex] = useState(0);
  const [uploadingSlideIndex, setUploadingSlideIndex] = useState(null);

  // Master Area Hierarchy State (SRS Sec 7 & User Specification)
  const [masterStates, setMasterStates] = useState([]);
  const [masterLokSabhas, setMasterLokSabhas] = useState([]);
  const [masterDistricts, setMasterDistricts] = useState([]);
  const [masterVidhanSabhas, setMasterVidhanSabhas] = useState([]);
  const [masterBlocks, setMasterBlocks] = useState([]);
  const [masterPanchayats, setMasterPanchayats] = useState([]);
  const [masterGrams, setMasterGrams] = useState([]);
  const [masterWards, setMasterWards] = useState([]);
  const [loadingMasterAreas, setLoadingMasterAreas] = useState(false);
  const [seedingUp, setSeedingUp] = useState(false);
  const [selectedMasterStateId, setSelectedMasterStateId] = useState('');
  const [selectedMasterLsId, setSelectedMasterLsId] = useState('');
  const [selectedMasterDistrictId, setSelectedMasterDistrictId] = useState('');
  const [selectedMasterVsId, setSelectedMasterVsId] = useState('');
  const [selectedMasterBlockId, setSelectedMasterBlockId] = useState('');
  const [selectedMasterPanchayatId, setSelectedMasterPanchayatId] = useState('');
  const [selectedMasterGramId, setSelectedMasterGramId] = useState('');
  const [selectedMasterWardId, setSelectedMasterWardId] = useState('');
  const [quickAddLevel, setQuickAddLevel] = useState(null); // 'state' | 'lok_sabha' | 'district' | 'vidhan_sabha' | 'block' | 'panchayat' | 'gram' | 'ward'
  const [quickAddName, setQuickAddName] = useState('');
  const [quickAddCode, setQuickAddCode] = useState('');
  const [savingQuickAdd, setSavingQuickAdd] = useState(false);
  const [masterScope, setMasterScope] = useState({
    enabled: false,
    stateId: '',
    scopeType: 'all',
    scopeId: '',
    summaryText: '',
  });

  // Unified Multi-Step Form State
  const [form, setForm] = useState({
    // Step 1: Profile
    name: '',
    slug: '',
    leaderName: '',
    electionType: 'vidhan_sabha',
    contactPerson: '',
    mobileNumber: '',
    email: '',
    gstin: '',
    billingState: '',
    billingAddress: '',

    // Step 2: Branding (SRS Sec 8 Step 2, Sec 49 & 70)
    branding: {
      platformName: '',
      leaderName: '',
      logoUrl: '',
      leaderPhotoUrl: '',
      primaryColor: '#072F2B',
      secondaryColor: '#f59e0b',
      accentColor: '#10b981',
      tagline: '',
      faviconUrl: '',
      pwaIconUrl: '',
      loginBgUrl: '',
      splashScreenUrl: '',
      splashScreens: [
        {
          order: 1,
          title: 'Welcome to Citizen Connect',
          subtitle: 'Direct engagement with your elected leader and real-time constituency development alerts.',
          mediaType: 'image',
          mediaUrl: '',
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
      ],
      footerText: '',
      privacyPolicyUrl: '',
      termsUrl: '',
      privacyPolicyContent: '',
      termsContent: '',
    },

    // Step 3: Domain
    customDomain: '',

    // Step 4: Plan
    planId: '',
    subscriptionStartDate: new Date().toISOString().split('T')[0],
    subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],

    // Step 5: Area Hierarchy
    areaLevels: [
      { levelOrder: 1, name: 'District', isRequired: true },
      { levelOrder: 2, name: 'Vidhan Sabha', isRequired: true },
      { levelOrder: 3, name: 'Block', isRequired: true },
      { levelOrder: 4, name: 'Gram Panchayat / Ward', isRequired: true },
    ],

    // Step 6: Registration Form
    settings: {
      registrationFields: [
        { key: 'name', label: 'Full Name', type: 'text', required: true },
        { key: 'mobile', label: 'Mobile Number', type: 'phone', required: true },
        { key: 'dob', label: 'Date of Birth', type: 'date', required: false },
        { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
        { key: 'area', label: 'Your Area', type: 'area_selector', required: true },
      ],
    },

    // Step 7: Admin Account
    adminUser: {
      name: '',
      email: '',
      password: '',
      role: 'leader',
    },
  });

  // Load SaaS plans when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  async function loadPlans() {
    try {
      setLoadingPlans(true);
      const data = await plansService.getAll();
      const activePlans = (data || []).filter(p => p.isActive !== false);
      setPlans(activePlans);
      if (activePlans.length > 0 && !form.planId) {
        setForm(f => ({ ...f, planId: activePlans[0]._id }));
      }
    } catch {
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }

  // Master Area Data Fetchers
  useEffect(() => {
    if (isOpen && masterStates.length === 0) {
      loadMasterStates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentStep === 5 && masterStates.length === 0) {
      loadMasterStates();
    }
  }, [isOpen, currentStep]);

  async function loadMasterStates() {
    try {
      setLoadingMasterAreas(true);
      const res = await masterAreasService.getStates();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setMasterStates(list);
      if (list.length > 0 && !selectedMasterStateId) {
        const first = list[0];
        setSelectedMasterStateId(first._id);
        loadMasterLokSabhas(first._id);
        loadMasterDistricts(first._id);
      }
    } catch (err) {
      console.error('Failed to fetch master states', err);
    } finally {
      setLoadingMasterAreas(false);
    }
  }

  async function loadMasterLokSabhas(stateId) {
    if (!stateId) { setMasterLokSabhas([]); return; }
    try {
      const res = await masterAreasService.getLokSabhas(stateId);
      setMasterLokSabhas(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Failed to fetch master Lok Sabhas', err);
      setMasterLokSabhas([]);
    }
  }

  async function loadMasterDistricts(stateId) {
    if (!stateId) { setMasterDistricts([]); return; }
    try {
      const res = await masterAreasService.getDistricts(stateId);
      setMasterDistricts(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Failed to fetch master Districts', err);
      setMasterDistricts([]);
    }
  }

  async function loadMasterVidhanSabhas(filters = {}) {
    try {
      const res = await masterAreasService.getVidhanSabhas(filters);
      setMasterVidhanSabhas(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Failed to fetch master Vidhan Sabhas', err);
      setMasterVidhanSabhas([]);
    }
  }

  async function loadMasterBlocks(filters = {}) {
    try {
      const res = await masterAreasService.getBlocks(filters);
      setMasterBlocks(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Failed to fetch master Blocks', err);
      setMasterBlocks([]);
    }
  }

  async function loadMasterPanchayats(filters = {}) {
    try {
      const res = await masterAreasService.getPanchayats(filters);
      setMasterPanchayats(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Failed to fetch master Panchayats', err);
      setMasterPanchayats([]);
    }
  }

  async function loadMasterGrams(filters = {}) {
    try {
      const res = await masterAreasService.getGrams(filters);
      setMasterGrams(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Failed to fetch master Grams', err);
      setMasterGrams([]);
    }
  }

  async function loadMasterWards(filters = {}) {
    try {
      const res = await masterAreasService.getWards(filters);
      setMasterWards(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Failed to fetch master Wards', err);
      setMasterWards([]);
    }
  }

  async function handleSeedUp() {
    try {
      setSeedingUp(true);
      setError('');
      await masterAreasService.seedUttarPradesh();
      await loadMasterStates();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to seed UP data');
    } finally {
      setSeedingUp(false);
    }
  }

  function handleMasterStateChange(stateId) {
    setSelectedMasterStateId(stateId);
    setSelectedMasterLsId('');
    setSelectedMasterDistrictId('');
    setSelectedMasterVsId('');
    setSelectedMasterBlockId('');
    setSelectedMasterPanchayatId('');
    setSelectedMasterGramId('');
    setSelectedMasterWardId('');
    setMasterLokSabhas([]);
    setMasterDistricts([]);
    setMasterVidhanSabhas([]);
    setMasterBlocks([]);
    setMasterPanchayats([]);
    setMasterGrams([]);
    setMasterWards([]);
    if (stateId) {
      loadMasterLokSabhas(stateId);
      loadMasterDistricts(stateId);
    }
    updateScopeAndLevels({ stateId, lokSabhaId: '', districtId: '', vidhanSabhaId: '' });
  }

  function handleMasterLokSabhaChange(lsId) {
    setSelectedMasterLsId(lsId);
    setSelectedMasterVsId('');
    setSelectedMasterBlockId('');
    setSelectedMasterPanchayatId('');
    setSelectedMasterGramId('');
    setSelectedMasterWardId('');
    setMasterVidhanSabhas([]);
    setMasterBlocks([]);
    setMasterPanchayats([]);
    setMasterGrams([]);
    setMasterWards([]);
    if (lsId) {
      loadMasterVidhanSabhas({ stateId: selectedMasterStateId, lokSabhaId: lsId });
    } else if (selectedMasterStateId) {
      loadMasterVidhanSabhas({ stateId: selectedMasterStateId });
    }
    updateScopeAndLevels({ stateId: selectedMasterStateId, lokSabhaId: lsId, vidhanSabhaId: '' });
  }

  function handleMasterDistrictChange(districtId) {
    setSelectedMasterDistrictId(districtId);
    setSelectedMasterVsId('');
    setSelectedMasterBlockId('');
    setSelectedMasterPanchayatId('');
    setSelectedMasterGramId('');
    setSelectedMasterWardId('');
    setMasterVidhanSabhas([]);
    setMasterBlocks([]);
    setMasterPanchayats([]);
    setMasterGrams([]);
    setMasterWards([]);
    if (districtId) {
      loadMasterVidhanSabhas({ stateId: selectedMasterStateId, districtId });
      loadMasterBlocks({ stateId: selectedMasterStateId, districtId });
    }
    updateScopeAndLevels({ stateId: selectedMasterStateId, districtId, vidhanSabhaId: '' });
  }

  function handleMasterVidhanSabhaChange(vsId) {
    setSelectedMasterVsId(vsId);
    setSelectedMasterBlockId('');
    setSelectedMasterPanchayatId('');
    setSelectedMasterGramId('');
    setSelectedMasterWardId('');
    setMasterBlocks([]);
    setMasterPanchayats([]);
    setMasterGrams([]);
    setMasterWards([]);
    if (vsId) {
      const vsObj = masterVidhanSabhas.find(v => v._id === vsId);
      if (vsObj && vsObj.lokSabhaId && !selectedMasterLsId) {
        const parentLsId = typeof vsObj.lokSabhaId === 'object' ? vsObj.lokSabhaId._id : vsObj.lokSabhaId;
        if (parentLsId) setSelectedMasterLsId(parentLsId);
      }
      loadMasterBlocks({ vidhanSabhaId: vsId });
    }
    updateScopeAndLevels({ stateId: selectedMasterStateId, lokSabhaId: selectedMasterLsId, vidhanSabhaId: vsId });
  }

  function handleMasterBlockChange(blockId) {
    setSelectedMasterBlockId(blockId);
    setSelectedMasterPanchayatId('');
    setSelectedMasterGramId('');
    setSelectedMasterWardId('');
    setMasterPanchayats([]);
    setMasterGrams([]);
    setMasterWards([]);
    if (blockId) {
      loadMasterPanchayats({ blockId });
    }
    updateScopeAndLevels({ stateId: selectedMasterStateId, lokSabhaId: selectedMasterLsId, vidhanSabhaId: selectedMasterVsId, blockId });
  }

  function handleMasterPanchayatChange(panchayatId) {
    setSelectedMasterPanchayatId(panchayatId);
    setSelectedMasterGramId('');
    setSelectedMasterWardId('');
    setMasterGrams([]);
    setMasterWards([]);
    if (panchayatId) {
      loadMasterGrams({ panchayatId });
      loadMasterWards({ panchayatId });
    }
    updateScopeAndLevels({ stateId: selectedMasterStateId, lokSabhaId: selectedMasterLsId, vidhanSabhaId: selectedMasterVsId, blockId: selectedMasterBlockId, panchayatId });
  }

  function handleMasterGramChange(gramId) {
    setSelectedMasterGramId(gramId);
    setSelectedMasterWardId('');
    setMasterWards([]);
    if (gramId) {
      loadMasterWards({ gramId });
    }
    updateScopeAndLevels({ stateId: selectedMasterStateId, lokSabhaId: selectedMasterLsId, vidhanSabhaId: selectedMasterVsId, blockId: selectedMasterBlockId, panchayatId: selectedMasterPanchayatId, gramId });
  }

  function handleMasterWardChange(wardId) {
    setSelectedMasterWardId(wardId);
    updateScopeAndLevels({ stateId: selectedMasterStateId, lokSabhaId: selectedMasterLsId, vidhanSabhaId: selectedMasterVsId, blockId: selectedMasterBlockId, panchayatId: selectedMasterPanchayatId, gramId: selectedMasterGramId, wardId });
  }

  function updateScopeAndLevels(current = {}) {
    const sId = current.stateId !== undefined ? current.stateId : selectedMasterStateId;
    const lsId = current.lokSabhaId !== undefined ? current.lokSabhaId : selectedMasterLsId;
    const vsId = current.vidhanSabhaId !== undefined ? current.vidhanSabhaId : selectedMasterVsId;
    const blkId = current.blockId !== undefined ? current.blockId : selectedMasterBlockId;
    const panchId = current.panchayatId !== undefined ? current.panchayatId : selectedMasterPanchayatId;
    const gId = current.gramId !== undefined ? current.gramId : selectedMasterGramId;
    const wId = current.wardId !== undefined ? current.wardId : selectedMasterWardId;
    const distId = current.districtId !== undefined ? current.districtId : selectedMasterDistrictId;

    let scopeType = 'state';
    let scopeId = sId || '';
    if (wId) {
      scopeType = 'ward';
      scopeId = wId;
    } else if (gId) {
      scopeType = 'gram';
      scopeId = gId;
    } else if (panchId) {
      scopeType = 'panchayat';
      scopeId = panchId;
    } else if (blkId) {
      scopeType = 'block';
      scopeId = blkId;
    } else if (vsId) {
      scopeType = 'vidhan_sabha';
      scopeId = vsId;
    } else if (lsId) {
      scopeType = 'lok_sabha';
      scopeId = lsId;
    } else if (distId) {
      scopeType = 'district';
      scopeId = distId;
    }

    setMasterScope({
      enabled: Boolean(scopeId),
      stateId: sId,
      scopeType,
      scopeId,
      summaryText: computeScopeSummary(),
    });
  }

  async function handleSaveQuickAdd() {
    if (!quickAddName.trim() || !quickAddLevel) return;
    try {
      setSavingQuickAdd(true);
      setError('');
      const payload = {
        name: quickAddName.trim(),
        code: quickAddCode.trim() || undefined,
        levelType: quickAddLevel,
        stateId: selectedMasterStateId || undefined,
        lokSabhaId: selectedMasterLsId || undefined,
        districtId: selectedMasterDistrictId || undefined,
        vidhanSabhaId: selectedMasterVsId || undefined,
        blockId: selectedMasterBlockId || undefined,
        panchayatId: selectedMasterPanchayatId || undefined,
        gramId: selectedMasterGramId || undefined,
      };
      const res = await masterAreasService.createArea(payload);
      const newArea = res?.data || res;
      if (!newArea || !newArea._id) throw new Error('Failed to create area');

      if (quickAddLevel === 'state') {
        setMasterStates(prev => [...prev, newArea]);
        handleMasterStateChange(newArea._id);
      } else if (quickAddLevel === 'lok_sabha') {
        setMasterLokSabhas(prev => [...prev, newArea]);
        handleMasterLokSabhaChange(newArea._id);
      } else if (quickAddLevel === 'district') {
        setMasterDistricts(prev => [...prev, newArea]);
        handleMasterDistrictChange(newArea._id);
      } else if (quickAddLevel === 'vidhan_sabha') {
        setMasterVidhanSabhas(prev => [...prev, newArea]);
        handleMasterVidhanSabhaChange(newArea._id);
      } else if (quickAddLevel === 'block') {
        setMasterBlocks(prev => [...prev, newArea]);
        handleMasterBlockChange(newArea._id);
      } else if (quickAddLevel === 'panchayat') {
        setMasterPanchayats(prev => [...prev, newArea]);
        handleMasterPanchayatChange(newArea._id);
      } else if (quickAddLevel === 'gram') {
        setMasterGrams(prev => [...prev, newArea]);
        handleMasterGramChange(newArea._id);
      } else if (quickAddLevel === 'ward') {
        setMasterWards(prev => [...prev, newArea]);
        handleMasterWardChange(newArea._id);
      }

      setQuickAddLevel(null);
      setQuickAddName('');
      setQuickAddCode('');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to add area.');
    } finally {
      setSavingQuickAdd(false);
    }
  }

  // Compute summary breadcrumb for currently selected scope
  function computeScopeSummary() {
    const parts = [];
    const stateObj = masterStates.find(s => s._id === selectedMasterStateId);
    if (stateObj) parts.push(stateObj.name);
    const lsObj = masterLokSabhas.find(l => l._id === selectedMasterLsId);
    if (lsObj) parts.push(lsObj.name);
    const distObj = masterDistricts.find(d => d._id === selectedMasterDistrictId);
    if (distObj) parts.push(distObj.name);
    const vsObj = masterVidhanSabhas.find(v => v._id === selectedMasterVsId);
    if (vsObj) parts.push(vsObj.name);
    const blkObj = masterBlocks.find(b => b._id === selectedMasterBlockId);
    if (blkObj) parts.push(blkObj.name);
    const gpObj = masterPanchayats.find(p => p._id === selectedMasterPanchayatId);
    if (gpObj) parts.push(gpObj.name);
    const gramObj = masterGrams.find(g => g._id === selectedMasterGramId);
    if (gramObj) parts.push(gramObj.name);
    const wardObj = masterWards.find(w => w._id === selectedMasterWardId);
    if (wardObj) parts.push(wardObj.name);
    return parts.join(' ➔ ') || 'Entire State';
  }

  // Legacy alias for backward compat
  function handleStateChange(stateId) { handleMasterStateChange(stateId); }
  function handleLokSabhaChange(lsId) { handleMasterLokSabhaChange(lsId); }

  function handleApplyMasterDatabase(presetKey) {
    const electionType = presetKey || form.electionType;
    const preset = ELECTION_PRESETS[electionType] || ELECTION_PRESETS.other;
    const requestedHierarchy = (preset.levels || []).map((lvlName, idx) => ({
      levelOrder: idx + 1,
      name: lvlName,
      isRequired: true,
    }));

    let scopeId = '';
    let scopeType = 'state';
    if (selectedMasterWardId) {
      scopeId = selectedMasterWardId;
      scopeType = 'ward';
    } else if (selectedMasterGramId) {
      scopeId = selectedMasterGramId;
      scopeType = 'gram';
    } else if (selectedMasterPanchayatId) {
      scopeId = selectedMasterPanchayatId;
      scopeType = 'panchayat';
    } else if (selectedMasterBlockId) {
      scopeId = selectedMasterBlockId;
      scopeType = 'block';
    } else if (selectedMasterVsId) {
      scopeId = selectedMasterVsId;
      scopeType = 'vidhan_sabha';
    } else if (selectedMasterLsId) {
      scopeId = selectedMasterLsId;
      scopeType = 'lok_sabha';
    } else if (selectedMasterDistrictId) {
      scopeId = selectedMasterDistrictId;
      scopeType = 'district';
    } else if (selectedMasterStateId) {
      scopeId = selectedMasterStateId;
      scopeType = 'state';
    }

    setForm(f => ({
      ...f,
      electionType,
      areaLevels: requestedHierarchy,
    }));

    setMasterScope({
      enabled: Boolean(scopeId),
      stateId: selectedMasterStateId,
      scopeType,
      scopeId,
      summaryText: computeScopeSummary(),
    });
  }

  // Update slug automatically from name if user hasn't typed a custom slug
  function handleNameChange(e) {
    const val = e.target.value;
    setForm(f => {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      return {
        ...f,
        name: val,
        slug: f.slugManual ? f.slug : generatedSlug,
        branding: {
          ...f.branding,
          platformName: f.branding.platformName || `${val} Portal`,
          footerText: f.branding.footerText || `© ${new Date().getFullYear()} ${val}. All rights reserved.`,
        },
      };
    });
  }

  // Handle Election Type Preset Change (updates Area levels automatically)
  function handleElectionTypeChange(e) {
    const type = e.target.value;
    const preset = ELECTION_PRESETS[type] || ELECTION_PRESETS.other;
    const newLevels = preset.levels.map((lvlName, idx) => ({
      levelOrder: idx + 1,
      name: lvlName,
      isRequired: true,
    }));

    setForm(f => ({
      ...f,
      electionType: type,
      areaLevels: newLevels,
    }));
  }

  // Area Level Helpers
  function handleAddAreaLevel() {
    setForm(f => ({
      ...f,
      areaLevels: [
        ...f.areaLevels,
        {
          levelOrder: f.areaLevels.length + 1,
          name: `Level ${f.areaLevels.length + 1}`,
          isRequired: true,
        },
      ],
    }));
  }

  function handleRemoveAreaLevel(index) {
    setForm(f => {
      const updated = f.areaLevels.filter((_, idx) => idx !== index);
      const reindexed = updated.map((item, idx) => ({
        ...item,
        levelOrder: idx + 1,
      }));
      return { ...f, areaLevels: reindexed };
    });
  }

  function handleAreaLevelChange(index, newName) {
    setForm(f => {
      const updated = [...f.areaLevels];
      updated[index] = { ...updated[index], name: newName };
      return { ...f, areaLevels: updated };
    });
  }

  // Logo Upload
  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const localBlob = URL.createObjectURL(file);
    setForm(f => ({
      ...f,
      branding: { ...f.branding, logoUrl: localBlob },
    }));
    try {
      setUploadingLogo(true);
      setError('');
      const path = await tenantsService.uploadLogo(file);
      setForm(f => ({
        ...f,
        branding: { ...f.branding, logoUrl: path || localBlob },
      }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  }

  // Leader Photo Upload
  async function handleLeaderPhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const localBlob = URL.createObjectURL(file);
    setForm(f => ({
      ...f,
      branding: { ...f.branding, leaderPhotoUrl: localBlob },
    }));
    try {
      setUploadingPhoto(true);
      setError('');
      const path = await tenantsService.uploadAsset('branding', file);
      setForm(f => ({
        ...f,
        branding: { ...f.branding, leaderPhotoUrl: path || localBlob },
      }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  }

  // Favicon Upload (SRS Sec 49 & 70)
  async function handleFaviconUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingFavicon(true);
      setError('');
      const path = await tenantsService.uploadAsset('branding', file);
      setForm(f => ({
        ...f,
        branding: { ...f.branding, faviconUrl: path },
      }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Favicon upload failed');
    } finally {
      setUploadingFavicon(false);
    }
  }

  // PWA App Icon Upload (SRS Sec 49 & 70)
  async function handlePwaIconUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPwaIcon(true);
      setError('');
      const path = await tenantsService.uploadAsset('branding', file);
      setForm(f => ({
        ...f,
        branding: { ...f.branding, pwaIconUrl: path },
      }));
    } catch (err) {
      setError(err?.response?.data?.message || 'PWA icon upload failed');
    } finally {
      setUploadingPwaIcon(false);
    }
  }

  // Login / Splash Screen Backdrop Upload (SRS Sec 49 & 70)
  async function handleLoginBgUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLoginBg(true);
      setError('');
      const path = await tenantsService.uploadAsset('branding', file);
      setForm(f => ({
        ...f,
        branding: { ...f.branding, loginBgUrl: path, splashScreenUrl: path },
      }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Login background upload failed');
    } finally {
      setUploadingLoginBg(false);
    }
  }

  // Multi-Slide Splash & Walkthrough Handlers (SRS Sec 49 & 70)
  async function handleSlideMediaUpload(index, file) {
    if (!file) return;
    try {
      setUploadingSlideIndex(index);
      setError('');
      const path = await tenantsService.uploadAsset('branding', file);
      setForm(f => {
        const updated = [...(f.branding.splashScreens || [])];
        if (updated[index]) {
          updated[index] = { ...updated[index], mediaUrl: path };
        }
        return {
          ...f,
          branding: {
            ...f.branding,
            splashScreens: updated,
            ...(index === 0 ? { splashScreenUrl: path } : {}),
          },
        };
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Slide media upload failed');
    } finally {
      setUploadingSlideIndex(null);
    }
  }

  function handleAddSplashSlide() {
    setForm(f => {
      const current = f.branding.splashScreens || [];
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
        branding: {
          ...f.branding,
          splashScreens: [...current, newSlide],
        },
      };
    });
    setActiveSplashSlideIndex((form.branding.splashScreens || []).length);
  }

  function handleRemoveSplashSlide(index) {
    setForm(f => {
      const current = f.branding.splashScreens || [];
      if (current.length <= 1) return f;
      const updated = current.filter((_, idx) => idx !== index).map((s, idx) => ({ ...s, order: idx + 1 }));
      return {
        ...f,
        branding: {
          ...f.branding,
          splashScreens: updated,
        },
      };
    });
    setActiveSplashSlideIndex(prev => Math.max(0, Math.min(prev, (form.branding.splashScreens?.length || 1) - 2)));
  }

  function handleUpdateSplashSlide(index, key, val) {
    setForm(f => {
      const updated = [...(f.branding.splashScreens || [])];
      if (updated[index]) {
        updated[index] = { ...updated[index], [key]: val };
      }
      return {
        ...f,
        branding: {
          ...f.branding,
          splashScreens: updated,
        },
      };
    });
  }

  function handleAutoFillPrivacyPolicy() {
    const candidateName = form.branding.leaderName || form.leaderName || form.name || form.branding.platformName || 'the Campaign';
    const text = generateStandardPrivacyPolicy(candidateName);
    setForm(f => ({
      ...f,
      branding: {
        ...f.branding,
        privacyPolicyContent: text,
      },
    }));
  }

  function handleAutoFillTerms() {
    const candidateName = form.branding.leaderName || form.leaderName || form.name || form.branding.platformName || 'the Campaign';
    const text = generateStandardTerms(candidateName);
    setForm(f => ({
      ...f,
      branding: {
        ...f.branding,
        termsContent: text,
      },
    }));
  }

  // Random Password Generator
  function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
    let pass = 'Pol@';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm(f => ({
      ...f,
      adminUser: { ...f.adminUser, password: pass },
    }));
  }

  // Auto-sync Admin details from Step 1 on navigating to Step 7
  function prepareAdminStep() {
    setForm(f => ({
      ...f,
      adminUser: {
        ...f.adminUser,
        name: f.adminUser.name || f.leaderName || f.contactPerson || `${f.name} Admin`,
        email: f.adminUser.email || f.email || `${f.slug || 'admin'}@campaign.local`,
        password: f.adminUser.password || 'Admin@123',
      },
    }));
  }

  // Step 6: Registration Fields Management Handlers
  function handleToggleFieldRequired(index) {
    setForm(f => {
      const updated = [...f.settings.registrationFields];
      updated[index] = {
        ...updated[index],
        required: !updated[index].required,
      };
      return {
        ...f,
        settings: { ...f.settings, registrationFields: updated },
      };
    });
  }

  function handleRemoveRegistrationField(index) {
    setForm(f => {
      const updated = f.settings.registrationFields.filter((_, idx) => idx !== index);
      return {
        ...f,
        settings: { ...f.settings, registrationFields: updated },
      };
    });
  }

  function handleFieldLabelChange(index, newLabel) {
    setForm(f => {
      const updated = [...f.settings.registrationFields];
      updated[index] = { ...updated[index], label: newLabel };
      return {
        ...f,
        settings: { ...f.settings, registrationFields: updated },
      };
    });
  }

  function handleResetDefaultFields() {
    setForm(f => ({
      ...f,
      settings: {
        ...f.settings,
        registrationFields: DEFAULT_REGISTRATION_FIELDS.map(item => ({ ...item })),
      },
    }));
  }

  function handleAddPresetField(preset) {
    const exists = form.settings.registrationFields.some(fld => fld.key === preset.key);
    if (exists) return;
    setForm(f => ({
      ...f,
      settings: {
        ...f.settings,
        registrationFields: [
          ...f.settings.registrationFields,
          {
            key: preset.key,
            label: preset.label,
            type: preset.type,
            required: preset.required,
            ...(preset.options ? { options: [...preset.options] } : {}),
          },
        ],
      },
    }));
  }

  function handleSaveCustomField() {
    if (!newFieldData.label.trim()) {
      setError('Please provide a field label');
      return;
    }
    const cleanKey = (newFieldData.key.trim() || newFieldData.label.trim())
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^_+|_+$/g, '');

    if (!cleanKey) {
      setError('Invalid field key identifier');
      return;
    }

    const exists = form.settings.registrationFields.some(fld => fld.key === cleanKey);
    if (exists) {
      setError(`Field key "${cleanKey}" already exists. Please choose a unique key.`);
      return;
    }

    const newField = {
      key: cleanKey,
      label: newFieldData.label.trim(),
      type: newFieldData.type,
      required: Boolean(newFieldData.required),
    };

    if (newFieldData.type === 'select' && newFieldData.optionsInput.trim()) {
      newField.options = newFieldData.optionsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }

    setForm(f => ({
      ...f,
      settings: {
        ...f.settings,
        registrationFields: [...f.settings.registrationFields, newField],
      },
    }));

    setNewFieldData({
      label: '',
      key: '',
      type: 'text',
      required: false,
      optionsInput: '',
    });
    setShowAddField(false);
    setError('');
  }

  // Step Validation
  function validateStep(step) {
    setError('');
    if (step === 1) {
      if (!form.name.trim()) { setError('Organization / Client Name is required.'); return false; }
      if (!form.slug.trim()) { setError('Subdomain Slug is required.'); return false; }
    } else if (step === 6) {
      if (!form.settings.registrationFields || form.settings.registrationFields.length === 0) {
        setError('At least one registration field (such as Mobile Number or Full Name) is required for citizen sign-up.');
        return false;
      }
    } else if (step === 7) {
      if (!form.adminUser.name?.trim()) { setError('Admin User Name is required.'); return false; }
      if (!form.adminUser.email?.trim()) { setError('Admin Email is required.'); return false; }
      if (!form.adminUser.password?.trim()) { setError('Admin Password is required.'); return false; }
    }
    return true;
  }

  function handleNext() {
    if (!validateStep(currentStep)) return;
    if (currentStep === 6) {
      prepareAdminStep();
    }
    setCurrentStep(prev => Math.min(prev + 1, 7));
  }

  function handleBack() {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }

  // Final Complete Onboarding Submission
  async function handleSubmitOnboarding() {
    if (!validateStep(7)) return;

    try {
      setSubmitting(true);
      setError('');

      const cleanSlug = form.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');

      const payload = {
        name: form.name.trim(),
        slug: cleanSlug,
        leaderName: form.leaderName.trim() || form.name.trim(),
        contactPerson: form.contactPerson.trim() || undefined,
        mobileNumber: form.mobileNumber.trim() || undefined,
        email: form.email.trim() || undefined,
        gstin: form.gstin?.trim() ? form.gstin.trim().toUpperCase() : undefined,
        billingState: form.billingState?.trim() || undefined,
        billingAddress: form.billingAddress?.trim() || undefined,
        electionType: form.electionType,
        customDomain: form.customDomain.trim() || undefined,
        planId: form.planId || undefined,
        subscriptionStartDate: form.subscriptionStartDate || undefined,
        subscriptionEndDate: form.subscriptionEndDate || undefined,
        branding: {
          ...form.branding,
          platformName: form.branding.platformName.trim() || form.name.trim(),
          leaderName: form.leaderName.trim() || form.name.trim(),
        },
        settings: {
          ...form.settings,
          areaLevels: form.areaLevels.map(l => l.name),
        },
        areaLevels: form.areaLevels,
        adminUser: {
          name: form.adminUser.name.trim(),
          email: form.adminUser.email.trim().toLowerCase(),
          password: form.adminUser.password,
          role: form.adminUser.role || 'leader',
        },
      };

      const result = await tenantsService.onboardFull(payload);

      // Auto-provision Master Area Hierarchy if Master Scope selected
      const createdTenantId = result?._id || result?.tenant?._id;
      if (createdTenantId && masterScope.enabled && masterScope.stateId) {
        try {
          await masterAreasService.provisionTenant(createdTenantId, {
            stateId: masterScope.stateId,
            scopeType: masterScope.scopeType,
            scopeId: masterScope.scopeId || undefined,
          });
        } catch (provErr) {
          console.warn('Master geographic hierarchy auto-provision warning:', provErr);
        }
      }

      setSuccessData({
        result,
        credentials: {
          email: form.adminUser.email.trim().toLowerCase(),
          password: form.adminUser.password,
          role: form.adminUser.role || 'leader',
          slug: cleanSlug,
          domain: form.customDomain.trim() || `${cleanSlug}.madiyayu.com`,
          name: form.name.trim(),
        },
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || 'Tenant onboarding failed. Please check form data and retry.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopyCredentials() {
    if (!successData?.credentials) return;
    const text = `🎉 JanConnect / Political SaaS Client Credentials\n` +
      `-----------------------------------------------\n` +
      `Client: ${successData.credentials.name}\n` +
      `Portal URL: https://${successData.credentials.domain}\n` +
      `Admin Email: ${successData.credentials.email}\n` +
      `Admin Password: ${successData.credentials.password}\n` +
      `Role: ${successData.credentials.role}\n` +
      `-----------------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleCloseAll() {
    setSuccessData(null);
    setCurrentStep(1);
    setError('');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-900 via-[#072F2B] to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">New Client Onboarding Wizard</h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                  SRS Sec 8 & 70
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                7-Step automated provisioning engine (Tenant, Branding, Plan, Areas, Admin).
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseAll}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Stepper Progress Bar */}
        {!successData && (
          <div className="bg-gray-50/80 border-b border-gray-200/80 px-4 sm:px-6 py-3.5 shrink-0 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[620px] max-w-3xl mx-auto">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex flex-col items-center gap-1 group transition-all cursor-pointer ${
                        isCurrent
                          ? 'text-emerald-700 font-bold'
                          : isCompleted
                          ? 'text-emerald-600 font-medium'
                          : 'text-gray-500 hover:text-emerald-600'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-emerald-700 text-white ring-4 ring-emerald-500/20 shadow-md'
                            : 'bg-white border border-gray-300 text-gray-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
                      </div>
                      <span className="text-[11px] uppercase tracking-wider whitespace-nowrap">
                        {step.title}
                      </span>
                    </button>

                    {idx < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 transition-all rounded ${
                          currentStep > step.id ? 'bg-emerald-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Form Validation Warning</p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 1: PROFILE & ELECTION TYPE                              */}
          {/* ============================================================ */}
          {currentStep === 1 && !successData && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" /> Step 1: Client & Campaign Information
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  SRS Sec 8 Step 1: Candidate, election type, and primary contact details.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Client / Party Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikas Manch Party"
                    value={form.name}
                    onChange={handleNameChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Full legal or campaign entity name.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Subdomain (Slug) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-600">
                    <input
                      type="text"
                      required
                      placeholder="vikasmanch"
                      value={form.slug}
                      onChange={e => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        setForm(f => ({ ...f, slug: val, slugManual: true }));
                      }}
                      className="flex-1 px-3.5 py-2.5 text-sm outline-none font-mono font-medium text-emerald-800"
                    />
                    <span className="bg-gray-100 text-gray-500 px-3 py-2.5 text-xs font-mono font-bold flex items-center border-l border-gray-200 select-none">
                      .madiyayu.com
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Unique multi-tenant identifier URL.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Leader / Candidate Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Gandhi / Narendra Kumar"
                    value={form.leaderName}
                    onChange={e => setForm(f => ({ ...f, leaderName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Election Type (SRS Sec 6)
                  </label>
                  <select
                    value={form.electionType}
                    onChange={handleElectionTypeChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-medium cursor-pointer"
                  >
                    {Object.entries(ELECTION_PRESETS).map(([key, item]) => (
                      <option key={key} value={key}>{item.label}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">Configures area hierarchy presets automatically.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Campaign Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Amit Sharma (Office Head)"
                    value={form.contactPerson}
                    onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Contact Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={form.mobileNumber}
                    onChange={e => setForm(f => ({ ...f, mobileNumber: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Official Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. office@campaign.in"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* GST & Commercial Tax Profile (SRS Sec 46.2) */}
              <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-3.5 mt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" /> Commercial Billing & GSTIN Details (Optional)
                  </h4>
                  <span className="text-[10px] text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full font-semibold">
                    SRS Sec 46.2 Tax Invoicing
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Client GSTIN
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="e.g. 27AABCU9603R1ZX"
                      value={form.gstin}
                      onChange={e => setForm(f => ({ ...f, gstin: e.target.value.toUpperCase() }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono uppercase bg-white"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">15-digit alphanumeric Indian GST identifier.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Place of Supply / State
                    </label>
                    <select
                      value={form.billingState}
                      onChange={e => setForm(f => ({ ...f, billingState: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                    >
                      <option value="">-- Select Billing State --</option>
                      {INDIAN_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-gray-400 mt-1">Determines CGST+SGST vs IGST calculation.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Registered Billing Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Campaign office registered address for official tax receipts"
                    value={form.billingAddress}
                    onChange={e => setForm(f => ({ ...f, billingAddress: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: BRANDING & IDENTITY (SRS Sec 8 Step 2, Sec 49 & 70)  */}
          {/* ============================================================ */}
          {currentStep === 2 && !successData && (
            <div className="space-y-6 animate-in fade-in-50 duration-150">
              {/* Step Header */}
              <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-600" /> Step 2: White-Label Branding Setup
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    SRS Sec 8 Step 2, Sec 49 & 70: Tailor custom logos, web/mobile app icons, splash screens, color palette, and compliance legal pages.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLivePreview(!showLivePreview)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors self-start sm:self-auto cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showLivePreview ? 'Hide Live Preview' : 'Show Live Preview'}</span>
                </button>
              </div>

              {/* REAL-TIME LIVE WHITE-LABEL PREVIEW BANNER */}
              {showLivePreview && (
                <div className="p-4 rounded-2xl border border-purple-200/80 bg-gradient-to-br from-purple-50/70 via-slate-50 to-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Real-Time White-Label Simulation
                    </span>
                    <span className="text-[11px] font-mono text-purple-600 font-semibold">
                      Live Preview of Web & Mobile UI
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Simulated Browser Tab */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs flex flex-col">
                      <div className="bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        </div>
                        {/* Browser Tab Pill */}
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-t-md text-[11px] font-semibold text-gray-700 shadow-2xs max-w-[200px] truncate ml-1">
                          {form.branding.faviconUrl ? (
                            <img
                              src={resolveAssetUrl(form.branding.faviconUrl)}
                              alt="Favicon"
                              className="w-3.5 h-3.5 object-contain shrink-0"
                            />
                          ) : (
                            <Globe className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          )}
                          <span className="truncate">{form.branding.platformName || form.name || 'Campaign Portal'}</span>
                        </div>
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-center text-center bg-gray-50/50">
                        <p className="text-[11px] text-gray-400 font-mono">
                          https://{form.slug || 'client'}.madiyayu.com
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          Favicon renders directly in citizen browser tabs and bookmarks.
                        </p>
                      </div>
                    </div>

                    {/* Simulated Mobile Citizen Portal Header */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs flex flex-col">
                      <div
                        className="px-3.5 py-2.5 text-white flex items-center justify-between transition-colors shadow-xs"
                        style={{ backgroundColor: form.branding.primaryColor || '#072F2B' }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {form.branding.logoUrl ? (
                            <img
                              src={resolveAssetUrl(form.branding.logoUrl)}
                              alt="Logo"
                              className="w-7 h-7 object-contain bg-white/10 rounded p-0.5"
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/f3f4f6/6b7280?text=Logo'; }}
                            />
                          ) : (
                            <Building2 className="w-6 h-6 text-white/80 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs truncate leading-tight">
                              {form.branding.platformName || form.name || 'Platform Name'}
                            </h5>
                            <p className="text-[10px] opacity-80 truncate">
                              {form.branding.tagline || 'Campaign Tagline'}
                            </p>
                          </div>
                        </div>

                        {form.branding.leaderPhotoUrl ? (
                          <img
                            src={resolveAssetUrl(form.branding.leaderPhotoUrl)}
                            alt="Leader"
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-white/40 shrink-0"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/f3f4f6/6b7280?text=Leader'; }}
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {(form.branding.leaderName || form.leaderName || 'L').charAt(0)}
                          </div>
                        )}
                      </div>

                      <div
                        className="p-3 flex-1 flex flex-col justify-between relative min-h-[70px]"
                        style={{
                          backgroundImage: form.branding.loginBgUrl ? `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.95)), url(${resolveAssetUrl(form.branding.loginBgUrl)})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-gray-700">Citizen Registration</span>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
                            style={{ backgroundColor: form.branding.secondaryColor || '#f59e0b' }}
                          >
                            Join Now
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-2 font-mono truncate">
                          {form.branding.footerText || `© ${new Date().getFullYear()} ${form.name || 'Campaign'}. All rights reserved.`}
                        </div>
                      </div>
                    </div>

                    {/* Simulated Mobile PWA App Home Screen Icon */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs flex flex-col p-3 items-center justify-center text-center bg-gray-50/40">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-md flex items-center justify-center overflow-hidden mb-1.5 transition-transform hover:scale-105">
                        {form.branding.pwaIconUrl ? (
                          <img
                            src={resolveAssetUrl(form.branding.pwaIconUrl)}
                            alt="PWA App Icon"
                            className="w-full h-full object-cover"
                          />
                        ) : form.branding.logoUrl ? (
                          <img
                            src={resolveAssetUrl(form.branding.logoUrl)}
                            alt="Logo"
                            className="w-full h-full object-contain p-1.5"
                          />
                        ) : (
                          <Smartphone className="w-6 h-6 text-purple-600" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-800 max-w-[150px] truncate">
                        {form.branding.platformName || form.name || 'Mobile App'}
                      </span>
                      <span className="text-[10px] text-purple-700 font-semibold mt-0.5">
                        Installable PWA App Icon
                      </span>
                    </div>

                    {/* Simulated Mobile App Splash & Onboarding Walkthrough Phone */}
                    {(() => {
                      const slides = form.branding.splashScreens && form.branding.splashScreens.length > 0
                        ? form.branding.splashScreens
                        : [{ order: 1, title: 'Welcome', subtitle: 'Connect with leadership', mediaType: 'image', mediaUrl: form.branding.loginBgUrl }];
                      const activeIndex = Math.min(activeSplashSlideIndex, slides.length - 1);
                      const currentSlide = slides[activeIndex] || slides[0];

                      return (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs flex flex-col p-2.5 bg-gray-50/40">
                          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-gray-100">
                            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                              <Film className="w-3 h-3 text-purple-600" /> Walkthrough Preview
                            </span>
                            <span className="text-[9px] font-mono font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                              {activeIndex + 1}/{slides.length} {currentSlide.mediaType === 'video' ? '🎥 Video' : '🖼️ Image'}
                            </span>
                          </div>

                          {/* Mini Phone Mockup */}
                          <div className="w-full h-44 rounded-xl overflow-hidden relative shadow-inner flex flex-col justify-between border border-slate-700 bg-slate-950 text-white">
                            {/* Visual Media Background */}
                            {currentSlide.mediaType === 'video' && currentSlide.mediaUrl ? (
                              <video
                                key={currentSlide.mediaUrl}
                                src={resolveAssetUrl(currentSlide.mediaUrl)}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover opacity-80"
                              />
                            ) : currentSlide.mediaUrl ? (
                              <img
                                key={currentSlide.mediaUrl}
                                src={resolveAssetUrl(currentSlide.mediaUrl)}
                                alt="Slide Visual"
                                className="absolute inset-0 w-full h-full object-cover opacity-80"
                              />
                            ) : (
                              <div
                                className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center"
                                style={{
                                  background: `linear-gradient(135deg, ${form.branding.primaryColor || '#072F2B'} 0%, #020617 100%)`,
                                }}
                              >
                                {form.branding.logoUrl ? (
                                  <img
                                    src={resolveAssetUrl(form.branding.logoUrl)}
                                    alt="Logo"
                                    className="w-8 h-8 object-contain mb-1 drop-shadow"
                                  />
                                ) : (
                                  <Building2 className="w-8 h-8 text-white/40 mb-1" />
                                )}
                              </div>
                            )}

                            {/* Phone Top Notch / Status bar */}
                            <div className="relative z-10 px-2.5 pt-1.5 flex justify-between items-center text-[9px] text-white/80 font-mono select-none drop-shadow">
                              <span>9:41</span>
                              <div className="w-10 h-2 bg-black/40 backdrop-blur rounded-full mx-auto" />
                              <span>5G 84%</span>
                            </div>

                            {/* Slide Overlay and Interactive Dot Controls */}
                            <div className="relative z-10 p-2.5 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent space-y-1">
                              <p className="text-[11px] font-bold text-white line-clamp-1 leading-tight drop-shadow-xs">
                                {currentSlide.title || 'Welcome to App'}
                              </p>
                              <p className="text-[9px] text-gray-300 line-clamp-2 leading-tight">
                                {currentSlide.subtitle || 'Experience direct constituency connect & local progress.'}
                              </p>

                              {/* Interactive Pagination Dots & Advancer */}
                              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                                <div className="flex items-center gap-1">
                                  {slides.map((_, dotIdx) => (
                                    <button
                                      key={dotIdx}
                                      type="button"
                                      onClick={() => setActiveSplashSlideIndex(dotIdx)}
                                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                        dotIdx === activeIndex ? 'w-4 bg-purple-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
                                      }`}
                                      title={`View Slide ${dotIdx + 1}`}
                                    />
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveSplashSlideIndex((activeIndex + 1) % slides.length)}
                                  className="text-[9px] font-bold text-white px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 transition-colors shadow-2xs cursor-pointer"
                                >
                                  {activeIndex === slides.length - 1 ? 'Start' : 'Next ›'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* SECTION 1: CORE PLATFORM IDENTITY */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3.5">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Platform & Leader Identity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Platform / App Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. JanSampark Rahul Gandhi"
                      value={form.branding.platformName}
                      onChange={e => setForm(f => ({
                        ...f,
                        branding: { ...f.branding, platformName: e.target.value },
                      }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Displayed in page headers, SMS & apps.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Leader / Candidate Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Gandhi"
                      value={form.branding.leaderName || form.leaderName}
                      onChange={e => setForm(f => ({
                        ...f,
                        branding: { ...f.branding, leaderName: e.target.value },
                      }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Official candidate or party president.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Campaign Slogan / Tagline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nayi Soch, Vikas Ki Nayi Udaan"
                      value={form.branding.tagline}
                      onChange={e => setForm(f => ({
                        ...f,
                        branding: { ...f.branding, tagline: e.target.value },
                      }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Official election slogan or vision.</p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRIMARY VISUAL ASSETS (LOGO & LEADER PHOTO) */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3.5">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-600" /> Primary Visual Assets
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Party Logo Upload */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center gap-4 shadow-2xs">
                    <div className="w-16 h-16 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      {form.branding.logoUrl ? (
                        <img
                          src={resolveAssetUrl(form.branding.logoUrl)}
                          alt="Logo"
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/100x100/f3f4f6/6b7280?text=Logo';
                          }}
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800">Party / Campaign Logo</p>
                      <p className="text-[11px] text-gray-400 mb-2">Square PNG, SVG or WEBP (Max 10MB)</p>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer shadow-xs transition-colors">
                          {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" /> : <Upload className="w-3.5 h-3.5 text-purple-600" />}
                          <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingLogo}
                            onChange={handleLogoUpload}
                          />
                        </label>
                        {form.branding.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, branding: { ...f.branding, logoUrl: '' } }))}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Remove Logo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Candidate Photo Upload */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center gap-4 shadow-2xs">
                    <div className="w-16 h-16 rounded-full border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      {form.branding.leaderPhotoUrl ? (
                        <img
                          src={resolveAssetUrl(form.branding.leaderPhotoUrl)}
                          alt="Leader"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/100x100/f3f4f6/6b7280?text=Leader';
                          }}
                        />
                      ) : (
                        <UserCheck className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800">Leader / Candidate Portrait</p>
                      <p className="text-[11px] text-gray-400 mb-2">High-resolution portrait photo</p>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer shadow-xs transition-colors">
                          {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" /> : <Upload className="w-3.5 h-3.5 text-purple-600" />}
                          <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingPhoto}
                            onChange={handleLeaderPhotoUpload}
                          />
                        </label>
                        {form.branding.leaderPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, branding: { ...f.branding, leaderPhotoUrl: '' } }))}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: WHITE-LABEL WEB & MOBILE APP ASSETS (SRS Sec 8 Step 2, Sec 49 & 70) */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-purple-600" /> Web & Mobile App Assets (SRS Sec 49 & 70)
                  </h4>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    White-Label Compliant
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 1. Browser Favicon */}
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-white flex flex-col justify-between space-y-3 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                        {form.branding.faviconUrl ? (
                          <img
                            src={resolveAssetUrl(form.branding.faviconUrl)}
                            alt="Favicon"
                            className="w-7 h-7 object-contain"
                          />
                        ) : (
                          <Globe className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-800">Browser Favicon</p>
                        <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                          .ico, .png, .svg (32×32 or 48×48) for browser tab
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                      <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer transition-colors">
                        {uploadingFavicon ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" /> : <Upload className="w-3.5 h-3.5 text-purple-600" />}
                        <span>{uploadingFavicon ? 'Uploading...' : 'Upload Favicon'}</span>
                        <input
                          type="file"
                          accept=".ico,.png,.svg"
                          className="hidden"
                          disabled={uploadingFavicon}
                          onChange={handleFaviconUpload}
                        />
                      </label>
                      {form.branding.faviconUrl && (
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, branding: { ...f.branding, faviconUrl: '' } }))}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Remove Favicon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. PWA Mobile App Icon */}
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-white flex flex-col justify-between space-y-3 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                        {form.branding.pwaIconUrl ? (
                          <img
                            src={resolveAssetUrl(form.branding.pwaIconUrl)}
                            alt="PWA Icon"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Smartphone className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-800">PWA Mobile App Icon</p>
                        <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                          192×192 & 512×512 PNG for mobile home screen
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                      <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer transition-colors">
                        {uploadingPwaIcon ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" /> : <Upload className="w-3.5 h-3.5 text-purple-600" />}
                        <span>{uploadingPwaIcon ? 'Uploading...' : 'Upload App Icon'}</span>
                        <input
                          type="file"
                          accept="image/png,image/webp"
                          className="hidden"
                          disabled={uploadingPwaIcon}
                          onChange={handlePwaIconUpload}
                        />
                      </label>
                      {form.branding.pwaIconUrl && (
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, branding: { ...f.branding, pwaIconUrl: '' } }))}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Remove PWA Icon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3. Login / Splash Screen Backdrop */}
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-white flex flex-col justify-between space-y-3 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                        {form.branding.loginBgUrl ? (
                          <img
                            src={resolveAssetUrl(form.branding.loginBgUrl)}
                            alt="Splash Backdrop"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-800">Login / Splash Backdrop</p>
                        <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                          High-res banner for citizen login & mobile splash screen
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                      <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer transition-colors">
                        {uploadingLoginBg ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" /> : <Upload className="w-3.5 h-3.5 text-purple-600" />}
                        <span>{uploadingLoginBg ? 'Uploading...' : 'Upload Backdrop'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingLoginBg}
                          onChange={handleLoginBgUpload}
                        />
                      </label>
                      {form.branding.loginBgUrl && (
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, branding: { ...f.branding, loginBgUrl: '', splashScreenUrl: '' } }))}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Remove Backdrop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3B: MULTI-SLIDE MOBILE SPLASH & ONBOARDING WALKTHROUGH (SRS Sec 49 & 70) */}
              <div className="p-4 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/40 via-white to-gray-50/50 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-purple-100">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-purple-600" /> Multi-Slide Mobile Splash / Onboarding Walkthrough (3-4 Screens)
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      SRS Sec 49 & 70: Initial launch screens for citizen mobile app. Supports high-resolution images & promo video clips (.mp4, .webm, .mov) up to 50MB via form data.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSplashSlide}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform hover:scale-105 cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Onboarding Slide</span>
                  </button>
                </div>

                {/* Slides List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(form.branding.splashScreens || []).map((slide, sIdx) => {
                    const isUploadingThis = uploadingSlideIndex === sIdx;
                    const isVideo = slide.mediaType === 'video';

                    return (
                      <div
                        key={sIdx}
                        className={`p-3.5 rounded-xl border transition-all ${
                          activeSplashSlideIndex === sIdx
                            ? 'border-purple-500 ring-2 ring-purple-500/20 bg-white shadow-sm'
                            : 'border-gray-200 bg-white/90 hover:border-purple-300'
                        }`}
                        onClick={() => setActiveSplashSlideIndex(sIdx)}
                      >
                        {/* Slide Card Header */}
                        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">
                              Slide {sIdx + 1}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                              isVideo ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {isVideo ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                              <span>{isVideo ? 'Video Clip' : 'Static Image'}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Media Type Toggle */}
                            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-[10px] font-bold">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateSplashSlide(sIdx, 'mediaType', 'image');
                                }}
                                className={`px-2 py-0.5 rounded-md transition-colors ${
                                  !isVideo ? 'bg-white text-purple-700 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                                }`}
                              >
                                Image
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateSplashSlide(sIdx, 'mediaType', 'video');
                                }}
                                className={`px-2 py-0.5 rounded-md transition-colors ${
                                  isVideo ? 'bg-purple-600 text-white shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                                }`}
                              >
                                Video
                              </button>
                            </div>

                            {/* Remove Slide Button */}
                            {(form.branding.splashScreens || []).length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveSplashSlide(sIdx);
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Slide"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title & Subtitle Inputs */}
                        <div className="space-y-2 mb-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                              Slide Title
                            </label>
                            <input
                              type="text"
                              value={slide.title || ''}
                              placeholder="e.g. Welcome to Citizen Connect"
                              onChange={e => handleUpdateSplashSlide(sIdx, 'title', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                              Subtitle / Description
                            </label>
                            <input
                              type="text"
                              value={slide.subtitle || ''}
                              placeholder="e.g. Transparent constituency development tracking..."
                              onChange={e => handleUpdateSplashSlide(sIdx, 'subtitle', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                            />
                          </div>
                        </div>

                        {/* Media Upload & URL Row */}
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-bold text-purple-700 cursor-pointer shadow-2xs transition-colors">
                              {isUploadingThis ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                              ) : isVideo ? (
                                <Video className="w-3.5 h-3.5 text-purple-600" />
                              ) : (
                                <Upload className="w-3.5 h-3.5 text-purple-600" />
                              )}
                              <span>
                                {isUploadingThis
                                  ? 'Uploading File...'
                                  : isVideo
                                  ? 'Upload Video (.mp4, .webm, .mov)'
                                  : 'Upload Image (.png, .jpg, .webp)'}
                              </span>
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
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Clear Media"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Media URL Input fallback */}
                          <div className="flex rounded-lg border border-gray-200 bg-gray-50/50 overflow-hidden focus-within:ring-1 focus-within:ring-purple-500">
                            <input
                              type="text"
                              value={slide.mediaUrl || ''}
                              placeholder={isVideo ? 'Or paste video URL (e.g. /uploads/.../slide.mp4)' : 'Or paste image URL...'}
                              onChange={e => handleUpdateSplashSlide(sIdx, 'mediaUrl', e.target.value)}
                              className="flex-1 px-2 py-1 text-[11px] font-mono outline-none bg-transparent"
                            />
                            {slide.mediaUrl && (
                              <a
                                href={resolveAssetUrl(slide.mediaUrl)}
                                target="_blank"
                                rel="noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="px-2 flex items-center text-gray-400 hover:text-purple-600"
                                title="Open Media"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          {/* Visual Player / Thumbnail */}
                          {slide.mediaUrl && (
                            <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 bg-slate-950">
                              {isVideo ? (
                                <video
                                  src={resolveAssetUrl(slide.mediaUrl)}
                                  controls
                                  playsInline
                                  className="w-full h-28 object-contain bg-black"
                                />
                              ) : (
                                <img
                                  src={resolveAssetUrl(slide.mediaUrl)}
                                  alt={`Slide ${sIdx + 1}`}
                                  className="w-full h-28 object-cover"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: COLOR THEME & PRESETS */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-purple-600" /> Theme Colors & Quick Presets
                  </h4>
                  {/* Quick Color Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Presets:</span>
                    {BRAND_COLOR_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setForm(f => ({
                          ...f,
                          branding: {
                            ...f.branding,
                            primaryColor: p.primary,
                            secondaryColor: p.secondary,
                            accentColor: p.accent,
                          },
                        }))}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700 shadow-2xs transition-transform hover:scale-105 cursor-pointer"
                        title={`${p.name}: ${p.primary}, ${p.secondary}`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.primary }} />
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.secondary }} />
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Primary Color */}
                  <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1.5 shadow-2xs">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Primary Brand Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={form.branding.primaryColor || '#072F2B'}
                        onChange={e => setForm(f => ({
                          ...f,
                          branding: { ...f.branding, primaryColor: e.target.value },
                        }))}
                        className="h-10 w-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={form.branding.primaryColor || '#072F2B'}
                        onChange={e => setForm(f => ({
                          ...f,
                          branding: { ...f.branding, primaryColor: e.target.value },
                        }))}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-800 uppercase focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">Headers, sidebars, main buttons.</p>
                  </div>

                  {/* Secondary Accent Color */}
                  <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1.5 shadow-2xs">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Secondary Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={form.branding.secondaryColor || '#f59e0b'}
                        onChange={e => setForm(f => ({
                          ...f,
                          branding: { ...f.branding, secondaryColor: e.target.value },
                        }))}
                        className="h-10 w-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={form.branding.secondaryColor || '#f59e0b'}
                        onChange={e => setForm(f => ({
                          ...f,
                          branding: { ...f.branding, secondaryColor: e.target.value },
                        }))}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-800 uppercase focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">Badges, highlights, secondary CTAs.</p>
                  </div>

                  {/* Accent / Highlight Color */}
                  <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1.5 shadow-2xs">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Highlight / Ring Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={form.branding.accentColor || '#10b981'}
                        onChange={e => setForm(f => ({
                          ...f,
                          branding: { ...f.branding, accentColor: e.target.value },
                        }))}
                        className="h-10 w-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={form.branding.accentColor || '#10b981'}
                        onChange={e => setForm(f => ({
                          ...f,
                          branding: { ...f.branding, accentColor: e.target.value },
                        }))}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-800 uppercase focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">Focus rings, pills, success badges.</p>
                  </div>
                </div>
              </div>

              {/* SECTION 5: WHITE-LABEL LEGAL & FOOTER COMPLIANCE (SRS Sec 49) */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-600" /> White-Label Legal Compliance & Custom Footer (SRS Sec 49)
                  </h4>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    In-App Legal Content + Hosted URLs
                  </span>
                </div>

                {/* Custom Copyright Notice */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Custom Copyright Notice
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. © ${new Date().getFullYear()} Vikas Manch. All rights reserved.`}
                    value={form.branding.footerText}
                    onChange={e => setForm(f => ({
                      ...f,
                      branding: { ...f.branding, footerText: e.target.value },
                    }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white font-medium"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Displayed in platform footer and bottom legal bar.</p>
                </div>

                {/* Privacy Policy: In-App Content + Generator + URL */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200 space-y-2.5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-purple-600" /> Full In-App Privacy Policy Statement
                      </span>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Rendered natively inside the citizen mobile app & web portal (replaces external redirect).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillPrivacyPolicy}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>1-Click Generate Campaign Privacy Policy</span>
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    placeholder="Enter complete in-app privacy policy text or click '1-Click Generate Campaign Privacy Policy' above..."
                    value={form.branding.privacyPolicyContent || ''}
                    onChange={e => setForm(f => ({
                      ...f,
                      branding: { ...f.branding, privacyPolicyContent: e.target.value },
                    }))}
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs font-mono leading-relaxed text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-gray-50/50"
                  />

                  {/* Secondary Privacy Policy External URL */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      External Privacy Policy URL (Optional Fallback)
                    </label>
                    <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-600">
                      <input
                        type="url"
                        placeholder="https://client.in/privacy"
                        value={form.branding.privacyPolicyUrl}
                        onChange={e => setForm(f => ({
                          ...f,
                          branding: { ...f.branding, privacyPolicyUrl: e.target.value },
                        }))}
                        className="flex-1 px-3 py-2 text-xs outline-none font-mono"
                      />
                      {form.branding.privacyPolicyUrl && (
                        <a
                          href={form.branding.privacyPolicyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 flex items-center text-gray-400 hover:text-purple-600 transition-colors"
                          title="Open External Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions: In-App Content + Generator + URL */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200 space-y-2.5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-purple-600" /> Full In-App Terms & Conditions Statement
                      </span>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Terms of democratic engagement, civic code of conduct, and complaint protocols.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillTerms}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>1-Click Generate Campaign Terms of Service</span>
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    placeholder="Enter complete in-app terms & conditions text or click '1-Click Generate Campaign Terms of Service' above..."
                    value={form.branding.termsContent || ''}
                    onChange={e => setForm(f => ({
                      ...f,
                      branding: { ...f.branding, termsContent: e.target.value },
                    }))}
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs font-mono leading-relaxed text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-gray-50/50"
                  />

                  {/* Secondary Terms URL */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      External Terms & Conditions URL (Optional Fallback)
                    </label>
                    <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-600">
                      <input
                        type="url"
                        placeholder="https://client.in/terms"
                        value={form.branding.termsUrl}
                        onChange={e => setForm(f => ({
                          ...f,
                          branding: { ...f.branding, termsUrl: e.target.value },
                        }))}
                        className="flex-1 px-3 py-2 text-xs outline-none font-mono"
                      />
                      {form.branding.termsUrl && (
                        <a
                          href={form.branding.termsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 flex items-center text-gray-400 hover:text-purple-600 transition-colors"
                          title="Open External Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: DOMAIN CONFIGURATION (SRS Sec 8 Step 3)              */}
          {/* ============================================================ */}
          {currentStep === 3 && !successData && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-sky-600" /> Step 3: Domain & Access Configuration
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  SRS Sec 8 Step 3: Default SaaS subdomain and custom domain DNS routing.
                </p>
              </div>

              {/* Subdomain Card */}
              <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/50 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 shrink-0 mt-0.5">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-sky-900 uppercase tracking-wider">Default Active Subdomain</span>
                  <div className="text-base font-mono font-bold text-sky-700 mt-1">
                    https://{form.slug || 'client'}.madiyayu.com
                  </div>
                  <p className="text-xs text-sky-600 mt-1">
                    Automatically active as soon as the platform is published.
                  </p>
                </div>
              </div>

              {/* Custom Domain Input */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Custom Domain (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. www.rahulkumar.in or vote4rahul.org"
                  value={form.customDomain}
                  onChange={e => {
                    const clean = e.target.value.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim().toLowerCase();
                    setForm(f => ({ ...f, customDomain: clean }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
                />
                <p className="text-xs text-gray-500">
                  Clients can link their own root or subdomain via DNS records.
                </p>

                {/* DNS Instructions preview */}
                {form.customDomain && (
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/80 space-y-2 text-xs">
                    <p className="font-bold text-gray-800">Required DNS CNAME Record for {form.customDomain}:</p>
                    <div className="grid grid-cols-3 gap-2 font-mono bg-white p-2.5 rounded-lg border border-gray-200">
                      <div><span className="text-gray-400">Type:</span> <strong>CNAME</strong></div>
                      <div><span className="text-gray-400">Host:</span> <strong>{form.customDomain.startsWith('www.') ? 'www' : '@'}</strong></div>
                      <div><span className="text-gray-400">Target:</span> <strong>cname.madiyayu.com</strong></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: SUBSCRIPTION PLAN & MODULES (SRS Sec 8 Step 4)       */}
          {/* ============================================================ */}
          {currentStep === 4 && !successData && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-600" /> Step 4: SaaS Subscription & Modules
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    SRS Sec 8 Step 4 & Sec 46: Choose plan package and verify enabled features.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadPlans}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                    title="Refresh plans list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingPlans ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <a
                    href="/plans"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer border border-indigo-200"
                    title="Open Plans Manager in new tab"
                  >
                    <span>Plans Page ↗</span>
                  </a>
                </div>
              </div>

              {loadingPlans ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                  <p className="text-xs text-gray-500">Loading SaaS plans from backend...</p>
                </div>
              ) : plans.length === 0 ? (
                <div className="p-7 text-center border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/40 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto shadow-2xs">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="max-w-lg mx-auto">
                    <h4 className="text-sm font-bold text-gray-900">Abhi tak koi Subscription Plan create nahi kiya gaya hai</h4>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                      SRS Section 46 ke anusaar, <strong>Super Admin</strong> platform ke commercial plans (Name, Price, Citizens limit, Poster limit, aur Modules) <strong>Plans Page (`/plans`)</strong> se create karta hai.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-indigo-100 text-xs text-indigo-900 max-w-lg mx-auto text-left space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-indigo-950">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>SRS PDF Flow ke anusaar 2 vikalp hain:</span>
                    </div>
                    <p className="text-[11px] text-gray-600 pl-5">
                      <strong>Vikalp 1:</strong> Naya real plan create karne ke liye <strong>"Plans Page ↗"</strong> par click karein aur real market price & limits ke sath plan banayein.
                    </p>
                    <p className="text-[11px] text-gray-600 pl-5">
                      <strong>Vikalp 2:</strong> Agar abhi plan select nahi karna hai, toh aap bina plan ke bhi <strong>"Next Step"</strong> ja sakte hain — tenant automatic <strong>14-Day Default Free Trial</strong> par activate ho jayega (SRS Sec 8 Step 4).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    <a
                      href="/plans"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Real Plan in Plans Tab ↗</span>
                    </a>

                    <button
                      type="button"
                      onClick={loadPlans}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl border border-gray-300 transition-colors shadow-2xs cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingPlans ? 'animate-spin' : ''}`} />
                      <span>Refresh Plans List</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {plans.map(plan => {
                    const isSelected = form.planId === plan._id;
                    return (
                      <div
                        key={plan._id}
                        onClick={() => setForm(f => ({ ...f, planId: plan._id }))}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-500/10'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-900 text-sm">{plan.name}</h4>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <div className="text-xl font-black text-indigo-900 mb-1">
                            ₹{plan.price?.toLocaleString()}
                            <span className="text-[11px] font-normal text-gray-500 lowercase"> / {plan.billingCycle || 'year'}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 mb-3">{plan.description || 'Complete political campaign toolkit'}</p>
                        </div>

                        <div className="border-t border-gray-100 pt-2 text-[11px] text-gray-600 space-y-1">
                          <div>👥 Citizens: <strong>{plan.limits?.maxCitizens === -1 ? 'Unlimited' : plan.limits?.maxCitizens?.toLocaleString()}</strong></div>
                          <div>🖼️ Posters: <strong>{plan.limits?.maxPostersPerMonth === -1 ? 'Unlimited' : `${plan.limits?.maxPostersPerMonth}/mo`}</strong></div>
                          <div>⚡ Modules: <strong>{(plan.features || []).length} active</strong></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Validity Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Subscription Start Date
                  </label>
                  <input
                    type="date"
                    value={form.subscriptionStartDate}
                    onChange={e => setForm(f => ({ ...f, subscriptionStartDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Subscription End Date (Renewal)
                  </label>
                  <input
                    type="date"
                    value={form.subscriptionEndDate}
                    onChange={e => setForm(f => ({ ...f, subscriptionEndDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 5: AREA HIERARCHY — Fully Dynamic Cascading Flow         */}
          {/* ============================================================ */}
          {currentStep === 5 && !successData && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              {/* Header */}
              <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-600" /> Step 5: Area Hierarchy & Constituency Scope
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Client Level: {ELECTION_PRESETS[form.electionType]?.label || form.electionType}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Select client election level, then cascade down: State ➔ Lok Sabha ➔ Vidhan Sabha ➔ Block ➔ Gram Panchayat ➔ Ward.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddAreaLevel}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Level
                  </button>
                </div>
              </div>

              {/* ── CLIENT ELECTION LEVEL SELECTOR CARDS ── */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span>🎯 Client / Candidate Level Select Karein</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Client kis level ka election lad rahe hain)</span>
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Active: {ELECTION_PRESETS[form.electionType]?.targetLevelName || form.electionType}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {[
                    { key: 'vidhan_sabha', icon: '🏢', title: 'Vidhan Sabha', sub: 'MLA Candidate', target: 'Vidhan Sabha', desc: 'Block ➔ GP ➔ Ward' },
                    { key: 'lok_sabha', icon: '🏛️', title: 'Lok Sabha', sub: 'MP Candidate', target: 'Lok Sabha', desc: 'VS ➔ Block ➔ GP ➔ Ward' },
                    { key: 'block', icon: '🌾', title: 'Block / Mandal', sub: 'BDC / Pramukh', target: 'Block', desc: 'GP ➔ Ward / Booth' },
                    { key: 'panchayat', icon: '🏡', title: 'Gram Panchayat', sub: 'Pradhan / Sarpanch', target: 'Gram Panchayat', desc: 'Village ➔ Ward' },
                    { key: 'municipal', icon: '🏙️', title: 'Municipal', sub: 'Nagar Nigam / Parshad', target: 'Zone / Ward', desc: 'Zone ➔ Ward ➔ Booth' },
                  ].map(lvl => {
                    const isSelected = form.electionType === lvl.key;
                    return (
                      <button
                        key={lvl.key}
                        type="button"
                        onClick={() => handleApplyMasterDatabase(lvl.key)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/20'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-base">{lvl.icon}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />}
                        </div>
                        <div>
                          <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {lvl.title}
                          </div>
                          <div className={`text-[10px] font-medium mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                            {lvl.sub}
                          </div>
                          <div className={`text-[9px] mt-1 font-mono leading-tight ${isSelected ? 'text-emerald-200' : 'text-gray-400'}`}>
                            {lvl.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Breadcrumb Scope Banner */}
              <div className="p-3 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-indigo-50/80 rounded-xl border border-emerald-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs font-bold text-emerald-900 shrink-0">📍 Active Hierarchy Scope:</span>
                  <span className="text-xs font-semibold text-gray-800 bg-white/90 px-3 py-1 rounded-lg border border-emerald-200 shrink-0 shadow-2xs">
                    {computeScopeSummary()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyMasterDatabase()}
                  disabled={!selectedMasterStateId}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-40 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Sync Portal Levels
                </button>
              </div>

              {/* Loading Indicator */}
              {loadingMasterAreas && (
                <div className="flex items-center gap-2 py-3 text-emerald-600 text-xs font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading Master Database...
                </div>
              )}

              {/* Empty Master DB Banner with 1-click Seed */}
              {!loadingMasterAreas && masterStates.length === 0 && (
                <div className="p-4 text-center bg-amber-50 rounded-xl border border-amber-200">
                  <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                  <p className="text-sm font-bold text-amber-800">Master Database empty hai</p>
                  <p className="text-xs text-amber-600 mt-0.5 mb-3">Master Areas me data nahi mila. Uttar Pradesh ka master data load karein.</p>
                  <button
                    type="button"
                    onClick={handleSeedUp}
                    disabled={seedingUp}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {seedingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    1-Click Seed Uttar Pradesh Master Data
                  </button>
                </div>
              )}

              {/* ── CASCADING 6-LEVEL SELECTORS ── */}
              {!loadingMasterAreas && masterStates.length > 0 && (
                <div className="space-y-3">

                  {/* LEVEL 1: STATE */}
                  <div className="rounded-xl border border-emerald-300 bg-white overflow-hidden shadow-2xs ring-1 ring-emerald-500/10">
                    <div className="flex items-stretch">
                      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 border-r border-emerald-200 w-44 shrink-0">
                        <span className="w-6 h-6 rounded-md bg-emerald-700 text-white text-[10px] font-black flex items-center justify-center shrink-0">L1</span>
                        <div>
                          <div className="text-xs font-bold text-emerald-900 leading-tight">State</div>
                          <div className="text-[10px] text-emerald-600">Rajya</div>
                        </div>
                      </div>
                      <select
                        value={selectedMasterStateId}
                        onChange={e => handleMasterStateChange(e.target.value)}
                        className="flex-1 px-3 py-2.5 text-sm text-gray-800 bg-white border-none outline-none cursor-pointer font-medium"
                      >
                        <option value="">— Select State —</option>
                        {masterStates.map(s => (
                          <option key={s._id} value={s._id}>{s.name} {s.code ? `(${s.code})` : ''}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2 px-3 shrink-0 border-l border-gray-100 bg-gray-50/50">
                        <button
                          type="button"
                          onClick={() => { setQuickAddLevel('state'); setQuickAddName(''); setQuickAddCode(''); }}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                        >
                          + Add State
                        </button>
                        {selectedMasterStateId ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200" />}
                      </div>
                    </div>
                  </div>

                  {/* Quick Add Inline Form for State */}
                  {quickAddLevel === 'state' && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-wrap items-center gap-2 animate-in fade-in">
                      <span className="text-xs font-bold text-emerald-900">Naya State jodein:</span>
                      <input
                        type="text"
                        placeholder="State Name (e.g. Bihar)"
                        value={quickAddName}
                        onChange={e => setQuickAddName(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <input
                        type="text"
                        placeholder="Code (e.g. BR)"
                        value={quickAddCode}
                        onChange={e => setQuickAddCode(e.target.value)}
                        className="w-24 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleSaveQuickAdd}
                        disabled={savingQuickAdd || !quickAddName.trim()}
                        className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 cursor-pointer disabled:opacity-50"
                      >
                        {savingQuickAdd ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save & Select'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickAddLevel(null)}
                        className="px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* LEVEL 2: LOK SABHA — Unlocks when State is selected */}
                  {selectedMasterStateId ? (
                    <>
                      <div className="ml-5 flex items-center text-gray-400 gap-1.5 my-0.5">
                        <div className="w-px h-3.5 bg-emerald-400 ml-3" />
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] text-emerald-700 font-semibold">State ke under Lok Sabha</span>
                        {form.electionType === 'lok_sabha' && (
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            🎯 Client Target Scope
                          </span>
                        )}
                      </div>
                      <div className={`rounded-xl border bg-white overflow-hidden shadow-2xs transition-all ${
                        selectedMasterLsId ? 'border-indigo-300 ring-1 ring-indigo-500/10' : 'border-gray-200'
                      }`}>
                        <div className="flex items-stretch">
                          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-50 border-r border-indigo-200 w-44 shrink-0">
                            <span className="w-6 h-6 rounded-md bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">L2</span>
                            <div>
                              <div className="text-xs font-bold text-indigo-900 leading-tight">Lok Sabha</div>
                              <div className="text-[10px] text-indigo-600">Parliamentary (PC)</div>
                            </div>
                          </div>
                          <select
                            value={selectedMasterLsId}
                            onChange={e => handleMasterLokSabhaChange(e.target.value)}
                            className="flex-1 px-3 py-2.5 text-sm text-gray-800 bg-white border-none outline-none cursor-pointer font-medium"
                          >
                            <option value="">— Select Lok Sabha ({masterLokSabhas.length} available) —</option>
                            {masterLokSabhas.map(ls => (
                              <option key={ls._id} value={ls._id}>{ls.name} {ls.code ? `(${ls.code})` : ''}</option>
                            ))}
                          </select>
                          <div className="flex items-center gap-2 px-3 shrink-0 border-l border-gray-100 bg-gray-50/50">
                            <button
                              type="button"
                              onClick={() => { setQuickAddLevel('lok_sabha'); setQuickAddName(''); setQuickAddCode(''); }}
                              className="px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                            >
                              + Add Lok Sabha
                            </button>
                            {selectedMasterLsId ? <CheckCircle2 className="w-4 h-4 text-indigo-600" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200" />}
                          </div>
                        </div>
                      </div>

                      {/* Quick Add Inline Form for Lok Sabha */}
                      {quickAddLevel === 'lok_sabha' && (
                        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 flex flex-wrap items-center gap-2 animate-in fade-in ml-5">
                          <span className="text-xs font-bold text-indigo-900">Nayi Lok Sabha jodein:</span>
                          <input
                            type="text"
                            placeholder="Lok Sabha Name (e.g. Mirzapur)"
                            value={quickAddName}
                            onChange={e => setQuickAddName(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <input
                            type="text"
                            placeholder="Code (e.g. PC-79)"
                            value={quickAddCode}
                            onChange={e => setQuickAddCode(e.target.value)}
                            className="w-24 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none uppercase"
                          />
                          <button
                            type="button"
                            onClick={handleSaveQuickAdd}
                            disabled={savingQuickAdd || !quickAddName.trim()}
                            className="px-3 py-1.5 bg-indigo-700 text-white rounded-lg text-xs font-bold hover:bg-indigo-800 cursor-pointer disabled:opacity-50"
                          >
                            {savingQuickAdd ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save & Select'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickAddLevel(null)}
                            className="px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center gap-2 text-gray-400 text-xs">
                      <span className="w-5 h-5 rounded-md bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center">L2</span>
                      <span>🔒 Lok Sabha (Level 2) — Pehle State select karein to unlock hoga</span>
                    </div>
                  )}

                  {/* LEVEL 3: VIDHAN SABHA — Unlocks when Lok Sabha is selected */}
                  {selectedMasterLsId ? (
                    <>
                      <div className="ml-5 flex items-center text-gray-400 gap-1.5 my-0.5">
                        <div className="w-px h-3.5 bg-indigo-300 ml-3" />
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-[10px] text-indigo-700 font-semibold">Lok Sabha ke under Vidhan Sabha</span>
                        {form.electionType === 'vidhan_sabha' && (
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            🎯 Client Target Scope (MLA)
                          </span>
                        )}
                      </div>
                      <div className={`rounded-xl border bg-white overflow-hidden shadow-2xs transition-all ${
                        selectedMasterVsId ? 'border-purple-300 ring-1 ring-purple-500/10' : 'border-gray-200'
                      }`}>
                        <div className="flex items-stretch">
                          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-purple-50 border-r border-purple-200 w-44 shrink-0">
                            <span className="w-6 h-6 rounded-md bg-purple-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">L3</span>
                            <div>
                              <div className="text-xs font-bold text-purple-900 leading-tight">Vidhan Sabha</div>
                              <div className="text-[10px] text-purple-600">Assembly (AC)</div>
                            </div>
                          </div>
                          <select
                            value={selectedMasterVsId}
                            onChange={e => handleMasterVidhanSabhaChange(e.target.value)}
                            className="flex-1 px-3 py-2.5 text-sm text-gray-800 bg-white border-none outline-none cursor-pointer font-medium"
                          >
                            <option value="">— Select Vidhan Sabha ({masterVidhanSabhas.length} available) —</option>
                            {masterVidhanSabhas.map(vs => (
                              <option key={vs._id} value={vs._id}>{vs.name} {vs.code ? `(${vs.code})` : ''}</option>
                            ))}
                          </select>
                          <div className="flex items-center gap-2 px-3 shrink-0 border-l border-gray-100 bg-gray-50/50">
                            <button
                              type="button"
                              onClick={() => { setQuickAddLevel('vidhan_sabha'); setQuickAddName(''); setQuickAddCode(''); }}
                              className="px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 rounded-md transition-colors cursor-pointer"
                            >
                              + Add Vidhan Sabha
                            </button>
                            {selectedMasterVsId ? <CheckCircle2 className="w-4 h-4 text-purple-600" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200" />}
                          </div>
                        </div>
                      </div>

                      {/* Quick Add Inline Form for Vidhan Sabha */}
                      {quickAddLevel === 'vidhan_sabha' && (
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex flex-wrap items-center gap-2 animate-in fade-in ml-5">
                          <span className="text-xs font-bold text-purple-900">Nayi Vidhan Sabha jodein:</span>
                          <input
                            type="text"
                            placeholder="Vidhan Sabha Name (e.g. Chunar)"
                            value={quickAddName}
                            onChange={e => setQuickAddName(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/20"
                          />
                          <input
                            type="text"
                            placeholder="Code (e.g. AC-398)"
                            value={quickAddCode}
                            onChange={e => setQuickAddCode(e.target.value)}
                            className="w-24 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none uppercase"
                          />
                          <button
                            type="button"
                            onClick={handleSaveQuickAdd}
                            disabled={savingQuickAdd || !quickAddName.trim()}
                            className="px-3 py-1.5 bg-purple-700 text-white rounded-lg text-xs font-bold hover:bg-purple-800 cursor-pointer disabled:opacity-50"
                          >
                            {savingQuickAdd ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save & Select'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickAddLevel(null)}
                            className="px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center gap-2 text-gray-400 text-xs">
                      <span className="w-5 h-5 rounded-md bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center">L3</span>
                      <span>🔒 Vidhan Sabha (Level 3) — Pehle Lok Sabha select karein to unlock hoga</span>
                    </div>
                  )}

                  {/* LEVEL 4: BLOCK — Unlocks when Vidhan Sabha is selected */}
                  {selectedMasterVsId ? (
                    <>
                      <div className="ml-5 flex items-center text-gray-400 gap-1.5 my-0.5">
                        <div className="w-px h-3.5 bg-purple-300 ml-3" />
                        <ChevronRight className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-[10px] text-purple-700 font-semibold">Vidhan Sabha ke under Block</span>
                        {form.electionType === 'block' && (
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            🎯 Client Target Scope (Block Pramukh)
                          </span>
                        )}
                      </div>
                      <div className={`rounded-xl border bg-white overflow-hidden shadow-2xs transition-all ${
                        selectedMasterBlockId ? 'border-amber-300 ring-1 ring-amber-500/10' : 'border-gray-200'
                      }`}>
                        <div className="flex items-stretch">
                          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 border-r border-amber-200 w-44 shrink-0">
                            <span className="w-6 h-6 rounded-md bg-amber-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">L4</span>
                            <div>
                              <div className="text-xs font-bold text-amber-900 leading-tight">Block</div>
                              <div className="text-[10px] text-amber-600">Vikas Khand / Mandal</div>
                            </div>
                          </div>
                          <select
                            value={selectedMasterBlockId}
                            onChange={e => handleMasterBlockChange(e.target.value)}
                            className="flex-1 px-3 py-2.5 text-sm text-gray-800 bg-white border-none outline-none cursor-pointer font-medium"
                          >
                            <option value="">— Select Block ({masterBlocks.length} available) —</option>
                            {masterBlocks.map(b => (
                              <option key={b._id} value={b._id}>{b.name} {b.code ? `(${b.code})` : ''}</option>
                            ))}
                          </select>
                          <div className="flex items-center gap-2 px-3 shrink-0 border-l border-gray-100 bg-gray-50/50">
                            <button
                              type="button"
                              onClick={() => { setQuickAddLevel('block'); setQuickAddName(''); setQuickAddCode(''); }}
                              className="px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 rounded-md transition-colors cursor-pointer"
                            >
                              + Add Block
                            </button>
                            {selectedMasterBlockId ? <CheckCircle2 className="w-4 h-4 text-amber-600" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200" />}
                          </div>
                        </div>
                      </div>

                      {/* Quick Add Inline Form for Block */}
                      {quickAddLevel === 'block' && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex flex-wrap items-center gap-2 animate-in fade-in ml-5">
                          <span className="text-xs font-bold text-amber-900">Naya Block jodein:</span>
                          <input
                            type="text"
                            placeholder="Block Name (e.g. Mariyahu / Narainpur)"
                            value={quickAddName}
                            onChange={e => setQuickAddName(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20"
                          />
                          <input
                            type="text"
                            placeholder="Code (optional)"
                            value={quickAddCode}
                            onChange={e => setQuickAddCode(e.target.value)}
                            className="w-24 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none uppercase"
                          />
                          <button
                            type="button"
                            onClick={handleSaveQuickAdd}
                            disabled={savingQuickAdd || !quickAddName.trim()}
                            className="px-3 py-1.5 bg-amber-700 text-white rounded-lg text-xs font-bold hover:bg-amber-800 cursor-pointer disabled:opacity-50"
                          >
                            {savingQuickAdd ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save & Select'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickAddLevel(null)}
                            className="px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center gap-2 text-gray-400 text-xs">
                      <span className="w-5 h-5 rounded-md bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center">L4</span>
                      <span>🔒 Block (Level 4) — Pehle Vidhan Sabha select karein to unlock hoga</span>
                    </div>
                  )}

                  {/* LEVEL 5: GRAM PANCHAYAT — Unlocks when Block is selected */}
                  {selectedMasterBlockId ? (
                    <>
                      <div className="ml-5 flex items-center text-gray-400 gap-1.5 my-0.5">
                        <div className="w-px h-3.5 bg-amber-300 ml-3" />
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] text-amber-700 font-semibold">Block ke under Gram Panchayat</span>
                        {form.electionType === 'panchayat' && (
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                            🎯 Client Target Scope (Pradhan)
                          </span>
                        )}
                      </div>
                      <div className={`rounded-xl border bg-white overflow-hidden shadow-2xs transition-all ${
                        selectedMasterPanchayatId ? 'border-teal-300 ring-1 ring-teal-500/10' : 'border-gray-200'
                      }`}>
                        <div className="flex items-stretch">
                          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-teal-50 border-r border-teal-200 w-44 shrink-0">
                            <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">L5</span>
                            <div>
                              <div className="text-xs font-bold text-teal-900 leading-tight">Gram Panchayat</div>
                              <div className="text-[10px] text-teal-600">Village Council</div>
                            </div>
                          </div>
                          {masterPanchayats.length === 0 ? (
                            <div className="flex-1 px-3 py-2.5 text-xs text-gray-400 italic flex items-center justify-between">
                              <span>Panchayats available nahi hain — kripya "+ Add Gram Panchayat" par click karke jodein</span>
                            </div>
                          ) : (
                            <select
                              value={selectedMasterPanchayatId}
                              onChange={e => handleMasterPanchayatChange(e.target.value)}
                              className="flex-1 px-3 py-2.5 text-sm text-gray-800 bg-white border-none outline-none cursor-pointer font-medium"
                            >
                              <option value="">— Select Gram Panchayat ({masterPanchayats.length} available) —</option>
                              {masterPanchayats.map(p => (
                                <option key={p._id} value={p._id}>{p.name} {p.code ? `(${p.code})` : ''}</option>
                              ))}
                            </select>
                          )}
                          <div className="flex items-center gap-2 px-3 shrink-0 border-l border-gray-100 bg-gray-50/50">
                            <button
                              type="button"
                              onClick={() => { setQuickAddLevel('panchayat'); setQuickAddName(''); setQuickAddCode(''); }}
                              className="px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 rounded-md transition-colors cursor-pointer"
                            >
                              + Add Gram Panchayat
                            </button>
                            {selectedMasterPanchayatId ? <CheckCircle2 className="w-4 h-4 text-teal-600" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200" />}
                          </div>
                        </div>
                      </div>

                      {/* Quick Add Inline Form for Gram Panchayat */}
                      {quickAddLevel === 'panchayat' && (
                        <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 flex flex-wrap items-center gap-2 animate-in fade-in ml-5">
                          <span className="text-xs font-bold text-teal-900">Nayi Gram Panchayat jodein:</span>
                          <input
                            type="text"
                            placeholder="Gram Panchayat Name (e.g. Basadhi)"
                            value={quickAddName}
                            onChange={e => setQuickAddName(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20"
                          />
                          <input
                            type="text"
                            placeholder="Code (optional, e.g. GP-BSD)"
                            value={quickAddCode}
                            onChange={e => setQuickAddCode(e.target.value)}
                            className="w-24 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none uppercase"
                          />
                          <button
                            type="button"
                            onClick={handleSaveQuickAdd}
                            disabled={savingQuickAdd || !quickAddName.trim()}
                            className="px-3 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-bold hover:bg-teal-800 cursor-pointer disabled:opacity-50"
                          >
                            {savingQuickAdd ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save & Select'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickAddLevel(null)}
                            className="px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center gap-2 text-gray-400 text-xs">
                      <span className="w-5 h-5 rounded-md bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center">L5</span>
                      <span>🔒 Gram Panchayat (Level 5) — Pehle Block select karein to unlock hoga</span>
                    </div>
                  )}

                  {/* LEVEL 6: WARD / BOOTH — Unlocks when Gram Panchayat is selected */}
                  {selectedMasterPanchayatId ? (
                    <>
                      <div className="ml-5 flex items-center text-gray-400 gap-1.5 my-0.5">
                        <div className="w-px h-3.5 bg-teal-300 ml-3" />
                        <ChevronRight className="w-3.5 h-3.5 text-teal-500" />
                        <span className="text-[10px] text-teal-700 font-semibold">Gram Panchayat ke under Ward / Booth</span>
                      </div>
                      <div className={`rounded-xl border bg-white overflow-hidden shadow-2xs transition-all ${
                        selectedMasterWardId ? 'border-cyan-300 ring-1 ring-cyan-500/10' : 'border-gray-200'
                      }`}>
                        <div className="flex items-stretch">
                          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-cyan-50 border-r border-cyan-200 w-44 shrink-0">
                            <span className="w-6 h-6 rounded-md bg-cyan-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">L6</span>
                            <div>
                              <div className="text-xs font-bold text-cyan-900 leading-tight">Ward / Booth</div>
                              <div className="text-[10px] text-cyan-600">Local Unit</div>
                            </div>
                          </div>
                          {masterWards.length === 0 ? (
                            <div className="flex-1 px-3 py-2.5 text-xs text-gray-400 italic flex items-center justify-between">
                              <span>Wards available nahi hain — kripya "+ Add Ward" par click karke jodein</span>
                            </div>
                          ) : (
                            <select
                              value={selectedMasterWardId}
                              onChange={e => handleMasterWardChange(e.target.value)}
                              className="flex-1 px-3 py-2.5 text-sm text-gray-800 bg-white border-none outline-none cursor-pointer font-medium"
                            >
                              <option value="">— Select Ward ({masterWards.length} available) —</option>
                              {masterWards.map(w => (
                                <option key={w._id} value={w._id}>{w.name} {w.code ? `(${w.code})` : ''}</option>
                              ))}
                            </select>
                          )}
                          <div className="flex items-center gap-2 px-3 shrink-0 border-l border-gray-100 bg-gray-50/50">
                            <button
                              type="button"
                              onClick={() => { setQuickAddLevel('ward'); setQuickAddName(''); setQuickAddCode(''); }}
                              className="px-2.5 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-100 rounded-md transition-colors cursor-pointer"
                            >
                              + Add Ward
                            </button>
                            {selectedMasterWardId ? <CheckCircle2 className="w-4 h-4 text-cyan-600" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200" />}
                          </div>
                        </div>
                      </div>

                      {/* Quick Add Inline Form for Ward */}
                      {quickAddLevel === 'ward' && (
                        <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-200 flex flex-wrap items-center gap-2 animate-in fade-in ml-5">
                          <span className="text-xs font-bold text-cyan-900">Naya Ward / Booth jodein:</span>
                          <input
                            type="text"
                            placeholder="Ward Name (e.g. Ward A / Booth 101)"
                            value={quickAddName}
                            onChange={e => setQuickAddName(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500/20"
                          />
                          <input
                            type="text"
                            placeholder="Code (e.g. W-01)"
                            value={quickAddCode}
                            onChange={e => setQuickAddCode(e.target.value)}
                            className="w-24 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none uppercase"
                          />
                          <button
                            type="button"
                            onClick={handleSaveQuickAdd}
                            disabled={savingQuickAdd || !quickAddName.trim()}
                            className="px-3 py-1.5 bg-cyan-700 text-white rounded-lg text-xs font-bold hover:bg-cyan-800 cursor-pointer disabled:opacity-50"
                          >
                            {savingQuickAdd ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save & Select'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickAddLevel(null)}
                            className="px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center gap-2 text-gray-400 text-xs">
                      <span className="w-5 h-5 rounded-md bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center">L6</span>
                      <span>🔒 Ward / Booth (Level 6) — Pehle Gram Panchayat select karein to unlock hoga</span>
                    </div>
                  )}

                </div>
              )}

              {/* ── CLIENT ACTIVE TENANT LEVELS PREVIEW (Configured for this tenant's app) ── */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                      <span>🏛️ Client Portal Area Levels (App Structure)</span>
                      <span className="text-[10px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {ELECTION_PRESETS[form.electionType]?.label || form.electionType} ke hisab se configured
                      </span>
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Is client ke mobile app aur web portal me volunteer/voter registration inhi levels par hoga.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyMasterDatabase()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors cursor-pointer border border-emerald-200"
                      title="Reset levels to current client preset"
                    >
                      <Sparkles className="w-3 h-3" /> Reset to Preset
                    </button>
                    <button
                      type="button"
                      onClick={handleAddAreaLevel}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Level
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {form.areaLevels.map((lvl, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 bg-white hover:border-emerald-200 transition-colors shadow-2xs"
                    >
                      <span className="w-6 h-6 rounded-md bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={lvl.name}
                        onChange={e => handleAreaLevelChange(idx, e.target.value)}
                        placeholder={`Level ${idx + 1} Name`}
                        className="flex-1 px-3 py-1 text-xs font-medium border border-gray-200 rounded-lg outline-none focus:border-emerald-500"
                      />
                      <label className="flex items-center gap-1.5 text-xs text-gray-600 shrink-0 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={lvl.isRequired !== false}
                          onChange={e => {
                            const updated = [...form.areaLevels];
                            updated[idx] = { ...updated[idx], isRequired: e.target.checked };
                            setForm(f => ({ ...f, areaLevels: updated }));
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                        />
                        <span>Mandatory</span>
                      </label>
                      {form.areaLevels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAreaLevel(idx)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                          title="Remove level"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {masterScope.enabled && (
                  <p className="text-[11px] text-emerald-700 mt-2.5 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Onboarding complete hone par <strong>{masterScope.summaryText}</strong> ke sabhi areas is client ke portal database me auto-provision honge.</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 6: DYNAMIC REGISTRATION FORM (SRS Sec 10 & Sec 8 Step 6)*/}
          {/* ============================================================ */}
          {currentStep === 6 && !successData && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" /> Step 6: Citizen Registration Form
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    SRS Sec 10 & Sec 8 Step 6: Configure public voter onboarding fields. Toggle mandatory, remove, or add custom fields.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={handleResetDefaultFields}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                    title="Restore standard 5 fields"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddField(prev => !prev);
                      setError('');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer ${
                      showAddField
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddField ? 'Close Add Form' : '+ Add Custom Field'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Add Presets Bar */}
              {PRESET_REGISTRATION_FIELDS.some(p => !form.settings.registrationFields.some(f => f.key === p.key)) && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl">
                  <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Quick Add Common Political Fields:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_REGISTRATION_FIELDS.map(preset => {
                      const alreadyAdded = form.settings.registrationFields.some(f => f.key === preset.key);
                      if (alreadyAdded) return null;
                      return (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() => handleAddPresetField(preset)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3 h-3 text-amber-600" />
                          <span>{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add Custom Field Form Drawer */}
              {showAddField && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in-50 duration-150">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-emerald-600" /> Create New Registration Field
                    </h4>
                    <span className="text-[11px] text-emerald-700 font-medium">Dynamic voter attribute</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Field Label <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Voter ID / EPIC Number"
                        value={newFieldData.label}
                        onChange={e => {
                          const val = e.target.value;
                          setNewFieldData(prev => ({
                            ...prev,
                            label: val,
                            key: prev.key || val.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                          }));
                        }}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        System Key / Identifier <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. voter_id"
                        value={newFieldData.key}
                        onChange={e => setNewFieldData(prev => ({ ...prev, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-xs font-mono text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Input Type
                      </label>
                      <select
                        value={newFieldData.type}
                        onChange={e => setNewFieldData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-xs font-medium text-gray-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      >
                        <option value="text">Single-line Text (text)</option>
                        <option value="phone">Phone / Mobile (phone)</option>
                        <option value="number">Numeric (number)</option>
                        <option value="date">Date of Birth / Calendar (date)</option>
                        <option value="select">Dropdown Choice (select)</option>
                        <option value="textarea">Multi-line Text (textarea)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Mandatory / Required?
                      </label>
                      <div className="h-[38px] flex items-center">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newFieldData.required}
                            onChange={e => setNewFieldData(prev => ({ ...prev, required: e.target.checked }))}
                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                          />
                          <span className="text-xs text-gray-700 font-medium">Citizen must fill this to register</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {newFieldData.type === 'select' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Dropdown Options (comma-separated) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Option 1, Option 2, Option 3"
                        value={newFieldData.optionsInput}
                        onChange={e => setNewFieldData(prev => ({ ...prev, optionsInput: e.target.value }))}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-xs text-gray-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-200/60">
                    <button
                      type="button"
                      onClick={() => setShowAddField(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCustomField}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer"
                    >
                      Add to Form
                    </button>
                  </div>
                </div>
              )}

              {/* List of Configured Registration Fields */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                  <span>Configured Fields ({form.settings.registrationFields.length})</span>
                  <span className="italic text-[11px]">Click "Required / Optional" badge to toggle mandatory status</span>
                </div>

                {form.settings.registrationFields.length === 0 ? (
                  <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-xs text-gray-500">No fields configured. Click "Reset Defaults" or "+ Add Custom Field".</p>
                  </div>
                ) : (
                  form.settings.registrationFields.map((field, idx) => {
                    const isMobileAuth = field.key === 'mobile';
                    return (
                      <div
                        key={field.key || idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/70 transition-colors rounded-xl border border-gray-200 gap-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-white border border-gray-200 text-gray-600 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                            #{idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={field.label}
                              onChange={e => handleFieldLabelChange(idx, e.target.value)}
                              className="font-bold text-gray-800 text-xs px-2 py-0.5 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent hover:border-gray-300 focus:border-emerald-500 focus:outline-none w-full max-w-xs transition-colors"
                              title="Click to rename field label"
                            />
                            <div className="flex items-center gap-2 mt-0.5 px-2">
                              <span className="text-[11px] text-gray-500 font-mono">key: {field.key}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-[10px] text-gray-500 uppercase px-1.5 py-0.2 bg-white rounded border border-gray-200 font-medium">
                                {field.type}
                              </span>
                              {field.options && field.options.length > 0 && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-[10px] text-gray-500 truncate max-w-[150px]">
                                    {field.options.join(', ')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {/* Toggle Required / Optional */}
                          <button
                            type="button"
                            onClick={() => handleToggleFieldRequired(idx)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer border ${
                              field.required
                                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                                : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-200 hover:text-gray-800'
                            }`}
                            title="Click to toggle Mandatory vs Optional"
                          >
                            {field.required ? (
                              <>
                                <Check className="w-3 h-3 text-amber-700" />
                                <span>Required</span>
                              </>
                            ) : (
                              <span>Optional</span>
                            )}
                          </button>

                          {/* Delete Field button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveRegistrationField(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title={isMobileAuth ? "Remove field (Note: Mobile is primary login identifier)" : "Remove field from form"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Preview Toggle Box */}
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setPreviewMode(prev => !prev)}
                  className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100/80 flex items-center justify-between text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {previewMode ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                    {previewMode ? 'Hide Citizen Form Preview' : 'Show Citizen Form Preview (How Citizens will see it)'}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {previewMode ? '▲ Collapse' : '▼ Expand'}
                  </span>
                </button>

                {previewMode && (
                  <div className="p-4 bg-slate-50 border-t border-gray-200 space-y-3">
                    <div className="text-[11px] text-gray-500 font-medium pb-2 border-b border-gray-200">
                      Mock representation of public citizen voter sign-up fields:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {form.settings.registrationFields.map((fld, i) => (
                        <div key={i} className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-800">{fld.label}</span>
                            {fld.required ? (
                              <span className="text-[10px] text-amber-700 font-bold">* Mandatory</span>
                            ) : (
                              <span className="text-[10px] text-gray-400">Optional</span>
                            )}
                          </div>
                          {fld.type === 'select' ? (
                            <select disabled className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-gray-500">
                              <option>Select {fld.label}...</option>
                              {fld.options?.map((opt, oi) => <option key={oi}>{opt}</option>)}
                            </select>
                          ) : fld.type === 'textarea' ? (
                            <textarea disabled rows={2} placeholder={`Enter ${fld.label}...`} className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-gray-400 resize-none" />
                          ) : (
                            <input disabled type="text" placeholder={`Enter ${fld.label}...`} className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 7: ADMIN ACCOUNT (SRS Sec 8 Step 7)                     */}
          {/* ============================================================ */}
          {currentStep === 7 && !successData && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" /> Step 7: Leader / Admin Account Setup
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  SRS Sec 8 Step 7: Generate initial administrative login credentials for this tenant.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-start gap-3 text-xs text-emerald-900">
                <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Automated Credential Generation</p>
                  <p className="text-emerald-700 mt-0.5">
                    Yeh account tenant ke Leader Admin Panel ko control karne ke liye create hoga.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Admin Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={form.adminUser.name}
                    onChange={e => setForm(f => ({
                      ...f,
                      adminUser: { ...f.adminUser, name: e.target.value },
                    }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Login Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@campaign.com"
                    value={form.adminUser.email}
                    onChange={e => setForm(f => ({
                      ...f,
                      adminUser: { ...f.adminUser, email: e.target.value },
                    }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Initial Password <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Auto-Generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.adminUser.password}
                      onChange={e => setForm(f => ({
                        ...f,
                        adminUser: { ...f.adminUser, password: e.target.value },
                      }))}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Administrative Role
                  </label>
                  <select
                    value={form.adminUser.role}
                    onChange={e => setForm(f => ({
                      ...f,
                      adminUser: { ...f.adminUser, role: e.target.value },
                    }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-medium"
                  >
                    <option value="leader">Leader / Campaign Owner (Full Tenant Access)</option>
                    <option value="admin">Tenant Admin (Operations Manager)</option>
                  </select>
                </div>
              </div>

              {/* Review Summary Box */}
              <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Onboarding Summary Ready:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                  <div>Client: <strong>{form.name}</strong></div>
                  <div>Slug: <strong className="font-mono">{form.slug}</strong></div>
                  <div>Election: <strong className="capitalize">{form.electionType.replace('_', ' ')}</strong></div>
                  <div>Area Levels: <strong>{form.areaLevels.length} tiers</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SUCCESS SCREEN: CREDENTIALS & CELEBRATION (SRS Sec 70)       */}
          {/* ============================================================ */}
          {successData && (
            <div className="py-6 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-gray-900">Tenant Onboarded Successfully!</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                  Client <strong>{successData.credentials.name}</strong> has been provisioned with dynamic areas, features, active subscription, and admin credentials.
                </p>
              </div>

              {/* Credentials Card */}
              <div className="w-full max-w-lg bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 text-left shadow-xl space-y-3 font-mono text-xs relative">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4" /> Tenant Admin Credentials
                  </span>
                  <button
                    onClick={handleCopyCredentials}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-emerald-400 font-sans text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Credentials'}</span>
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Portal URL:</span>
                    <span className="text-white font-bold">https://{successData.credentials.domain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subdomain:</span>
                    <span className="text-white">{successData.credentials.slug}.madiyayu.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Admin Email:</span>
                    <span className="text-emerald-400 font-bold">{successData.credentials.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Password:</span>
                    <span className="text-amber-400 font-bold">{successData.credentials.password}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role:</span>
                    <span className="text-white capitalize">{successData.credentials.role}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleCloseAll}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-md cursor-pointer"
                >
                  Done & View in Client List
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!successData && (
          <div className="px-6 py-4 border-t border-gray-200/80 bg-gray-50 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1 || submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <div className="text-xs text-gray-500 font-medium">
              Step {currentStep} of {STEPS.length}
            </div>

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitOnboarding}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold transition-all shadow-md disabled:opacity-60 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                <span>Provision & Launch Platform</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
