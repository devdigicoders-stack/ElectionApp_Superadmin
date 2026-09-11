import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Key, Mail, Phone, Save, Lock, Loader2, 
  CheckCircle2, AlertCircle, Sparkles, Calendar, BadgeCheck 
} from 'lucide-react';
import staffService from '../services/staff.service';
import { ROLE_LABELS } from '../layouts/AdminLayout';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Stored Admin ID
  const [adminId, setAdminId] = useState('');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    permissions: [],
    createdAt: null,
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setErrorMsg('');

      // 1. Get stored admin info from localStorage
      let localAdmin = {};
      try {
        localAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
      } catch {
        localAdmin = {};
      }

      const id = localAdmin.id || localAdmin._id;
      if (!id) {
        // Fallback to local storage values if ID not found
        setProfileData({
          name: localAdmin.name || 'Admin',
          email: localAdmin.email || '',
          phone: localAdmin.phone || '',
          role: localAdmin.role || 'super_admin',
          permissions: localAdmin.permissions || [],
          createdAt: null,
        });
        setLoading(false);
        return;
      }

      setAdminId(id);

      // 2. Real Backend API Call: GET /super-admin/staff/:id
      const res = await staffService.getOne(id);
      const data = res?.data || res;

      setProfileData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || 'super_admin',
        permissions: data.permissions || [],
        createdAt: data.createdAt || null,
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      setErrorMsg('Profile data load nahi hua. Local session data dikhaya ja raha hai.');
    } finally {
      setLoading(false);
    }
  }

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // ─────────────────────────────────────────────────────────
  // 2. Profile EDIT API: PATCH /super-admin/staff/:id
  // ─────────────────────────────────────────────────────────
  async function handleSaveProfile(e) {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!profileData.name.trim()) {
      setErrorMsg('Full Name cannot be empty');
      return;
    }

    try {
      setSavingProfile(true);

      // Call PATCH /super-admin/staff/:id
      const updatePayload = {
        name: profileData.name.trim(),
        phone: profileData.phone.trim(),
      };

      await staffService.update(adminId, updatePayload);

      // Update LocalStorage so top bar and sidebar update instantly
      try {
        const local = JSON.parse(localStorage.getItem('admin') || '{}');
        localStorage.setItem(
          'admin',
          JSON.stringify({ ...local, name: profileData.name.trim(), phone: profileData.phone.trim() })
        );
      } catch (err) {
        console.error('LocalStorage update error:', err);
      }

      setSuccessMsg('Profile details successfully update ho gayi hain!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Profile update failed. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 3. Password Reset API: PATCH /super-admin/staff/:id/reset-password
  // ─────────────────────────────────────────────────────────
  async function handleSavePassword(e) {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!passwordData.newPassword) {
      setErrorMsg('Please enter a new password');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMsg('Password kam se kam 6 characters ka hona chahiye');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMsg('New Password aur Confirm Password match nahi ho rahe hain');
      return;
    }

    try {
      setSavingPassword(true);

      // Call PATCH /super-admin/staff/:id/reset-password
      await staffService.resetPassword(adminId, passwordData.newPassword);

      setSuccessMsg('Password successfully update ho gaya hai!');
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Password update failed. Please try again.');
    } finally {
      setSavingPassword(false);
    }
  }

  const roleTitle = ROLE_LABELS[profileData.role] || profileData.role || 'Staff Member';

  // Initials for avatar
  const initials = profileData.name
    ? profileData.name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'SA';

  return (
    <div className="w-full font-sans space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#072F2B] flex items-center justify-center text-emerald-400 shadow-sm">
            <User className="w-5 h-5" />
          </div>
          My Profile
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal platform account details and security credentials.
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm font-semibold shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-sm font-semibold shadow-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-500">Profile data load ho raha hai...</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar Profile Summary Card */}
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              <div className="p-6 flex flex-col items-center border-b border-gray-100 bg-gradient-to-b from-gray-50/80 to-white">
                <div className="relative mb-4 group">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#072F2B] to-[#0B4640] rounded-2xl flex items-center justify-center text-emerald-400 text-3xl font-black shadow-md border-2 border-emerald-500/20 tracking-wider">
                    {initials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                    <BadgeCheck className="w-4 h-4 text-white" />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 text-center tracking-tight">
                  {profileData.name || 'User'}
                </h2>

                <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60 shadow-xs">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" /> {roleTitle}
                </div>
              </div>

              <div className="p-5 space-y-4 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Email</p>
                    <p className="font-medium text-gray-800 truncate">{profileData.email || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Phone</p>
                    <p className="font-medium text-gray-800">{profileData.phone || 'Not provided'}</p>
                  </div>
                </div>

                {profileData.createdAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Joined On</p>
                      <p className="font-medium text-gray-800 text-xs">
                        {new Date(profileData.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Granted Permissions count badge */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                  <span>Assigned Permissions</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {profileData.role === 'super_admin' || profileData.permissions?.includes('*')
                      ? 'Full Access (*)'
                      : `${profileData.permissions?.length || 0} active`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area (Tabs & Forms) */}
          <div className="w-full lg:w-2/3 xl:w-3/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 hide-scrollbar overflow-x-auto bg-gray-50/50">
                <button
                  onClick={() => {
                    setActiveTab('personal');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                    activeTab === 'personal'
                      ? 'border-emerald-600 text-emerald-800 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'
                  }`}
                >
                  <User className="w-4 h-4 text-emerald-600" /> Personal Information
                </button>
                <button
                  onClick={() => {
                    setActiveTab('password');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                    activeTab === 'password'
                      ? 'border-emerald-600 text-emerald-800 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'
                  }`}
                >
                  <Key className="w-4 h-4 text-emerald-600" /> Change Password
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 sm:p-8">
                {/* Personal Info Tab */}
                {activeTab === 'personal' && (
                  <form onSubmit={handleSaveProfile} className="max-w-2xl animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Profile Details</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Update your display name and contact phone number.
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        Live API Sync
                      </span>
                    </div>

                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleProfileChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium transition-all"
                            placeholder="Aapka Poora Naam"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium transition-all"
                            placeholder="e.g. 7068767516"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          disabled
                          value={profileData.email}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm font-semibold cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1.5">
                          Account email security verification ke liye fixed hoti hai.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Assigned Role
                        </label>
                        <input
                          type="text"
                          disabled
                          value={roleTitle}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm font-semibold cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1.5">
                          Role modifications require root Super Administrator authorization.
                        </p>
                      </div>

                      <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="flex items-center gap-2 bg-[#072F2B] hover:bg-[#0B4640] text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {savingProfile ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 text-emerald-400" />
                          )}
                          {savingProfile ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Change Password Tab */}
                {activeTab === 'password' && (
                  <form onSubmit={handleSavePassword} className="max-w-xl animate-in fade-in duration-200">
                    <div className="mb-6 pb-3 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Update Security Password</h3>
                      <p className="text-xs text-gray-500">
                        Naya password set karein taaki aapka platform access secure rahe.
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          New Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          placeholder="Naya password daalo (min 6 characters)"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          placeholder="Naya password dobara daalo"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                        />
                      </div>

                      {/* Password Rules */}
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 mt-4">
                        <p className="text-xs font-bold text-emerald-900 mb-2">Password Guidelines:</p>
                        <ul className="text-xs text-emerald-700 space-y-1.5 list-disc pl-4">
                          <li>Minimum 6 characters ka password hona zaroori hai.</li>
                          <li>Strong security ke liye letters, numbers aur symbols ka mix use karein.</li>
                        </ul>
                      </div>

                      <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                        <button
                          type="submit"
                          disabled={savingPassword}
                          className="flex items-center gap-2 bg-[#072F2B] hover:bg-[#0B4640] text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {savingPassword ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Lock className="w-4 h-4 text-emerald-400" />
                          )}
                          {savingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

