import React, { useState, useEffect } from 'react';
import {
  Settings, MessageSquare, Smartphone, HardDrive, CreditCard,
  Image, Wrench, Shield, CheckCircle2, AlertCircle, Eye, EyeOff,
  RefreshCw, Save, Zap, HelpCircle, Lock, Server, Cloud, Globe,
  ToggleLeft, ToggleRight, Sparkles, Loader2
} from 'lucide-react';
import settingsService from '../services/settings.service';

const TABS = [
  { id: 'sms', label: 'SMS Gateway', icon: MessageSquare, badge: 'DLT / OTP' },
  { id: 'whatsapp', label: 'WhatsApp API', icon: Smartphone, badge: 'Meta Cloud' },
  { id: 'storage', label: 'Cloud Storage', icon: HardDrive, badge: 'S3 / R2' },
  { id: 'payment', label: 'Payment Gateway', icon: CreditCard, badge: 'Razorpay' },
  { id: 'aiPoster', label: 'AI BG Removal', icon: Image, badge: 'Poster Gen' },
  { id: 'general', label: 'Platform & Maintenance', icon: Wrench, badge: 'Core Ops' },
];

export default function PlatformSettings() {
  const [activeTab, setActiveTab] = useState('sms');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingCategory, setSavingCategory] = useState(null);
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [showSecrets, setShowSecrets] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editable forms state per category
  const [formSms, setFormSms] = useState({ provider: 'msg91', apiKey: '', senderId: '', entityId: '', enabled: false, isTestMode: true });
  const [formWhatsApp, setFormWhatsApp] = useState({ provider: 'meta_cloud', accessToken: '', phoneNumberId: '', businessAccountId: '', webhookSecret: '', enabled: false });
  const [formStorage, setFormStorage] = useState({ provider: 'local', bucket: '', region: 'ap-south-1', accessKeyId: '', secretAccessKey: '', cdnUrl: '', endpoint: '', enabled: true });
  const [formPayment, setFormPayment] = useState({ provider: 'razorpay', keyId: '', keySecret: '', webhookSecret: '', currency: 'INR', isLiveMode: false, enabled: false });
  const [formAiPoster, setFormAiPoster] = useState({ provider: 'remove_bg', apiKey: '', enabled: false });
  const [formGeneral, setFormGeneral] = useState({ platformName: '', supportEmail: '', supportPhone: '', maintenanceMode: false, maintenanceMessage: '', defaultTrialDays: 14 });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await settingsService.getSettings();
      setSettings(data);

      if (data?.sms) setFormSms(data.sms);
      if (data?.whatsapp) setFormWhatsApp(data.whatsapp);
      if (data?.storage) setFormStorage(data.storage);
      if (data?.payment) setFormPayment(data.payment);
      if (data?.aiPoster) setFormAiPoster(data.aiPoster);
      if (data?.general) setFormGeneral(data.general);
    } catch (err) {
      console.error('Failed to load system settings:', err);
      setErrorMsg('Settings load nahi ho saki. Please refresh karein.');
    } finally {
      setLoading(false);
    }
  }

  function toggleSecretVisibility(fieldKey) {
    setShowSecrets(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  }

  async function handleSave(category, formData) {
    try {
      setSavingCategory(category);
      setErrorMsg('');
      setSuccessMsg('');
      setTestResult(null);

      const updated = await settingsService.updateCategory(category, formData);
      setSettings(updated);
      setSuccessMsg(`${category.toUpperCase()} settings safaltapoorvak update ho gayi hain.`);

      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      console.error('Save error:', err);
      setErrorMsg(err?.response?.data?.message || 'Settings update karte waqt error aaya.');
    } finally {
      setSavingCategory(null);
    }
  }

  async function handleTest(provider, credentials) {
    try {
      setTestingProvider(provider);
      setTestResult(null);
      const res = await settingsService.testConnection(provider, credentials);
      setTestResult({
        provider,
        success: res.success,
        message: res.message,
      });
    } catch (err) {
      setTestResult({
        provider,
        success: false,
        message: err?.response?.data?.message || 'Connection test failed.',
      });
    } finally {
      setTestingProvider(null);
    }
  }

  return (
    <div className="space-y-6 pb-12 font-sans text-gray-800">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#072F2B] to-[#0B4640] flex items-center justify-center text-white shadow-md shadow-emerald-950/20">
              <Settings className="w-5 h-5" />
            </div>
            System & Third-Party Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            SRS Section 2.1 & 73: Configure centralized third-party integrations, credentials, and platform maintenance mode.
          </p>
        </div>

        <button
          onClick={loadSettings}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Reload
        </button>
      </div>

      {/* ── Feedback Alerts ── */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2.5 animate-in fade-in-50 duration-200 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-center gap-2.5 animate-in fade-in-50 duration-200 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Connection Test Result Banner ── */}
      {testResult && (
        <div
          className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in-50 duration-200 shadow-xs ${
            testResult.success
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* ── Tabs Navigation ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/90">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setTestResult(null);
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all cursor-pointer text-center ${
                isActive
                  ? 'bg-white text-[#072F2B] shadow-sm font-bold border border-gray-200/80'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white/60 font-semibold'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1.5 ${isActive ? 'text-[#072F2B]' : 'text-gray-400'}`} />
              <span className="text-xs tracking-tight">{tab.label}</span>
              <span className="text-[9px] font-mono text-gray-400 uppercase mt-0.5">{tab.badge}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENTS ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-200">
          <Loader2 className="w-8 h-8 animate-spin text-[#072F2B] mb-2" />
          <p className="text-xs font-semibold text-gray-500">Loading settings...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          {/* ─────────────────────────────────────────────────────────────
              TAB 1: SMS GATEWAY SETTINGS
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'sms' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave('sms', formSms);
              }}
              className="space-y-6"
            >
              <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    SMS Gateway Configuration (SRS Sec 32 & 73)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Used for Citizen OTP Login, Dynamic Registration Verification, and Broadcast announcements.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                    <span>Active Gateway:</span>
                    <input
                      type="checkbox"
                      checked={formSms.enabled}
                      onChange={(e) => setFormSms({ ...formSms, enabled: e.target.checked })}
                      className="w-4 h-4 text-[#072F2B] rounded border-gray-300 focus:ring-emerald-600 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">SMS Provider</label>
                  <select
                    value={formSms.provider}
                    onChange={(e) => setFormSms({ ...formSms, provider: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  >
                    <option value="msg91">MSG91 (DLT Approved — Recommended)</option>
                    <option value="fast2sms">Fast2SMS (Quick OTP)</option>
                    <option value="twilio">Twilio SMS Gateway</option>
                    <option value="custom">Custom HTTP Webhook / Aggregator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">DLT Sender ID (6 Characters Header)</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. JANSMP"
                    value={formSms.senderId || ''}
                    onChange={(e) => setFormSms({ ...formSms, senderId: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Telecom DLT approved 6-character header ID.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Principal Entity ID (PE ID)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1701159876543210987"
                    value={formSms.entityId || ''}
                    onChange={(e) => setFormSms({ ...formSms, entityId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">API Key / Auth Token</label>
                    {formSms.hasApiKey && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        ✓ Configured
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showSecrets.smsApiKey ? 'text' : 'password'}
                      placeholder={formSms.hasApiKey ? '••••••••••••••••' : 'Enter gateway API key...'}
                      value={formSms.apiKey || ''}
                      onChange={(e) => setFormSms({ ...formSms, apiKey: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecretVisibility('smsApiKey')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showSecrets.smsApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleTest('sms', formSms)}
                  disabled={testingProvider === 'sms'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                >
                  {testingProvider === 'sms' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-500" />}
                  Test SMS Gateway Ping
                </button>

                <button
                  type="submit"
                  disabled={savingCategory === 'sms'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#072F2B] hover:bg-[#0B4640] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {savingCategory === 'sms' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save SMS Settings
                </button>
              </div>
            </form>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: WHATSAPP BUSINESS API SETTINGS
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'whatsapp' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave('whatsapp', formWhatsApp);
              }}
              className="space-y-6"
            >
              <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    WhatsApp Business API Settings (SRS Sec 32 & 73)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Meta Cloud API or Gupshup integration for automated WhatsApp citizen communication & poster sharing.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <span>Enable WhatsApp:</span>
                  <input
                    type="checkbox"
                    checked={formWhatsApp.enabled}
                    onChange={(e) => setFormWhatsApp({ ...formWhatsApp, enabled: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-600 cursor-pointer"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp Provider</label>
                  <select
                    value={formWhatsApp.provider}
                    onChange={(e) => setFormWhatsApp({ ...formWhatsApp, provider: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  >
                    <option value="meta_cloud">Meta Cloud API (Official Direct)</option>
                    <option value="gupshup">Gupshup Enterprise</option>
                    <option value="aisensy">AiSensy WhatsApp BSP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 109876543210987"
                    value={formWhatsApp.phoneNumberId || ''}
                    onChange={(e) => setFormWhatsApp({ ...formWhatsApp, phoneNumberId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp Business Account ID (WABA)</label>
                  <input
                    type="text"
                    placeholder="e.g. 298765432109876"
                    value={formWhatsApp.businessAccountId || ''}
                    onChange={(e) => setFormWhatsApp({ ...formWhatsApp, businessAccountId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">Permanent System Access Token</label>
                    {formWhatsApp.hasAccessToken && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        ✓ Configured
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showSecrets.waToken ? 'text' : 'password'}
                      placeholder={formWhatsApp.hasAccessToken ? '••••••••••••••••' : 'EAAG... Meta Permanent Token'}
                      value={formWhatsApp.accessToken || ''}
                      onChange={(e) => setFormWhatsApp({ ...formWhatsApp, accessToken: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecretVisibility('waToken')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showSecrets.waToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleTest('whatsapp', formWhatsApp)}
                  disabled={testingProvider === 'whatsapp'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                >
                  {testingProvider === 'whatsapp' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-emerald-600" />}
                  Verify Meta API Credentials
                </button>

                <button
                  type="submit"
                  disabled={savingCategory === 'whatsapp'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#072F2B] hover:bg-[#0B4640] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {savingCategory === 'whatsapp' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save WhatsApp Settings
                </button>
              </div>
            </form>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3: CLOUD STORAGE SETTINGS
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'storage' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave('storage', formStorage);
              }}
              className="space-y-6"
            >
              <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-sky-600" />
                    Cloud Object Storage & CDN (SRS Sec 56 & 73)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Storage architecture for leader photos, gallery media, generated posters, and complaint resolution proofs.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Storage Provider</label>
                  <select
                    value={formStorage.provider}
                    onChange={(e) => setFormStorage({ ...formStorage, provider: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  >
                    <option value="local">Local Server Disk Storage (Current Active)</option>
                    <option value="aws_s3">Amazon Web Services (AWS S3)</option>
                    <option value="cloudflare_r2">Cloudflare R2 (Zero Egress Fees)</option>
                    <option value="minio">Self-Hosted MinIO Object Storage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">S3 Bucket Name</label>
                  <input
                    type="text"
                    placeholder="e.g. madiyayu-saas-production"
                    value={formStorage.bucket || ''}
                    onChange={(e) => setFormStorage({ ...formStorage, bucket: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">AWS Region</label>
                  <input
                    type="text"
                    placeholder="e.g. ap-south-1"
                    value={formStorage.region || 'ap-south-1'}
                    onChange={(e) => setFormStorage({ ...formStorage, region: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Public CDN / Media Domain URL</label>
                  <input
                    type="text"
                    placeholder="e.g. https://cdn.madiyayu.com"
                    value={formStorage.cdnUrl || ''}
                    onChange={(e) => setFormStorage({ ...formStorage, cdnUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Access Key ID</label>
                  <input
                    type="text"
                    placeholder="AKIA..."
                    value={formStorage.accessKeyId || ''}
                    onChange={(e) => setFormStorage({ ...formStorage, accessKeyId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">Secret Access Key</label>
                    {formStorage.hasSecretKey && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        ✓ Configured
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showSecrets.storageSecret ? 'text' : 'password'}
                      placeholder={formStorage.hasSecretKey ? '••••••••••••••••' : 'Enter secret key...'}
                      value={formStorage.secretAccessKey || ''}
                      onChange={(e) => setFormStorage({ ...formStorage, secretAccessKey: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecretVisibility('storageSecret')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showSecrets.storageSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleTest('storage', formStorage)}
                  disabled={testingProvider === 'storage'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                >
                  {testingProvider === 'storage' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-sky-600" />}
                  Test Storage Bucket Connectivity
                </button>

                <button
                  type="submit"
                  disabled={savingCategory === 'storage'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#072F2B] hover:bg-[#0B4640] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {savingCategory === 'storage' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Storage Settings
                </button>
              </div>
            </form>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 4: PAYMENT GATEWAY (RAZORPAY)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'payment' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave('payment', formPayment);
              }}
              className="space-y-6"
            >
              <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Payment Gateway (Razorpay) (SRS Sec 21 & 73)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Powers automatic SaaS subscription checkout, renewals, and leader campaign contribution collection.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                    <span>Live Mode:</span>
                    <input
                      type="checkbox"
                      checked={formPayment.isLiveMode}
                      onChange={(e) => setFormPayment({ ...formPayment, isLiveMode: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-600 cursor-pointer"
                    />
                  </label>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${formPayment.isLiveMode ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {formPayment.isLiveMode ? 'LIVE' : 'TEST MODE'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Payment Provider</label>
                  <select
                    value={formPayment.provider}
                    onChange={(e) => setFormPayment({ ...formPayment, provider: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  >
                    <option value="razorpay">Razorpay (India UPI / Cards / NetBanking)</option>
                    <option value="cashfree">Cashfree Payments</option>
                    <option value="stripe">Stripe Payments</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Razorpay Key ID</label>
                  <input
                    type="text"
                    placeholder="rzp_live_... or rzp_test_..."
                    value={formPayment.keyId || ''}
                    onChange={(e) => setFormPayment({ ...formPayment, keyId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">Razorpay Key Secret</label>
                    {formPayment.hasKeySecret && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        ✓ Configured
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showSecrets.paySecret ? 'text' : 'password'}
                      placeholder={formPayment.hasKeySecret ? '••••••••••••••••' : 'Enter key secret...'}
                      value={formPayment.keySecret || ''}
                      onChange={(e) => setFormPayment({ ...formPayment, keySecret: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecretVisibility('paySecret')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showSecrets.paySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Webhook Secret (Optional)</label>
                  <input
                    type="text"
                    placeholder="Webhook signature secret..."
                    value={formPayment.webhookSecret || ''}
                    onChange={(e) => setFormPayment({ ...formPayment, webhookSecret: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleTest('payment', formPayment)}
                  disabled={testingProvider === 'payment'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                >
                  {testingProvider === 'payment' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-blue-600" />}
                  Verify Razorpay API Keys
                </button>

                <button
                  type="submit"
                  disabled={savingCategory === 'payment'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#072F2B] hover:bg-[#0B4640] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {savingCategory === 'payment' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Payment Settings
                </button>
              </div>
            </form>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 5: AI BACKGROUND REMOVAL (POSTER GENERATOR)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'aiPoster' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave('aiPoster', formAiPoster);
              }}
              className="space-y-6"
            >
              <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Image className="w-5 h-5 text-purple-600" />
                    AI Background Removal API (SRS Sec 29 & 73)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Automatically isolates candidate portrait photos from background for high-quality festival posters & banners.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <span>Enable AI Removal:</span>
                  <input
                    type="checkbox"
                    checked={formAiPoster.enabled}
                    onChange={(e) => setFormAiPoster({ ...formAiPoster, enabled: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-600 cursor-pointer"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">AI Provider</label>
                  <select
                    value={formAiPoster.provider}
                    onChange={(e) => setFormAiPoster({ ...formAiPoster, provider: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  >
                    <option value="remove_bg">Remove.bg (Industry Standard API)</option>
                    <option value="clipdrop">Clipdrop by Stability.ai</option>
                    <option value="photoroom">PhotoRoom API</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">API Key</label>
                    {formAiPoster.hasApiKey && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        ✓ Configured
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showSecrets.aiApiKey ? 'text' : 'password'}
                      placeholder={formAiPoster.hasApiKey ? '••••••••••••••••' : 'Enter API Key...'}
                      value={formAiPoster.apiKey || ''}
                      onChange={(e) => setFormAiPoster({ ...formAiPoster, apiKey: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecretVisibility('aiApiKey')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showSecrets.aiApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleTest('aiPoster', formAiPoster)}
                  disabled={testingProvider === 'aiPoster'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                >
                  {testingProvider === 'aiPoster' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-purple-600" />}
                  Test Background Removal API
                </button>

                <button
                  type="submit"
                  disabled={savingCategory === 'aiPoster'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#072F2B] hover:bg-[#0B4640] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {savingCategory === 'aiPoster' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save AI Poster Settings
                </button>
              </div>
            </form>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 6: GENERAL PLATFORM & MAINTENANCE MODE
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'general' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave('general', formGeneral);
              }}
              className="space-y-6"
            >
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-600" />
                  Platform Operations & Maintenance Mode
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure SaaS brand meta information and toggle site-wide maintenance alert banner.
                </p>
              </div>

              {/* Maintenance Mode Alert Box */}
              <div className={`p-4 rounded-2xl border transition-all ${formGeneral.maintenanceMode ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-gray-200'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formGeneral.maintenanceMode ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Platform Maintenance Mode</h4>
                      <p className="text-xs text-gray-500">
                        {formGeneral.maintenanceMode
                          ? 'Site is currently in maintenance mode. Non-admin users will see the alert banner.'
                          : 'Normal platform operation. All public portals and leader admins are live.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFormGeneral({ ...formGeneral, maintenanceMode: !formGeneral.maintenanceMode })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      formGeneral.maintenanceMode
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {formGeneral.maintenanceMode ? 'Turn OFF Maintenance' : 'Turn ON Maintenance'}
                  </button>
                </div>

                {formGeneral.maintenanceMode && (
                  <div className="mt-4 pt-3 border-t border-red-200">
                    <label className="block text-xs font-bold text-red-900 mb-1">Maintenance Banner Message</label>
                    <input
                      type="text"
                      value={formGeneral.maintenanceMessage || ''}
                      onChange={(e) => setFormGeneral({ ...formGeneral, maintenanceMessage: e.target.value })}
                      placeholder="Enter banner text displayed to users..."
                      className="w-full px-3.5 py-2 bg-white border border-red-300 rounded-xl text-xs text-red-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">SaaS Platform Name</label>
                  <input
                    type="text"
                    value={formGeneral.platformName || ''}
                    onChange={(e) => setFormGeneral({ ...formGeneral, platformName: e.target.value })}
                    placeholder="e.g. JanConnect / JanSampark"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Default Free Trial Duration (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={formGeneral.defaultTrialDays || 14}
                    onChange={(e) => setFormGeneral({ ...formGeneral, defaultTrialDays: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Central Support Email</label>
                  <input
                    type="email"
                    value={formGeneral.supportEmail || ''}
                    onChange={(e) => setFormGeneral({ ...formGeneral, supportEmail: e.target.value })}
                    placeholder="support@domain.com"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Central Support Phone / Helpline</label>
                  <input
                    type="text"
                    value={formGeneral.supportPhone || ''}
                    onChange={(e) => setFormGeneral({ ...formGeneral, supportPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#072F2B]/20"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingCategory === 'general'}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#072F2B] hover:bg-[#0B4640] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {savingCategory === 'general' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save General Settings
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
