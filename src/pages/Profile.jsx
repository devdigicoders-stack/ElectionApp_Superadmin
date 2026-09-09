import React, { useState } from 'react';
import { User, Shield, Key, Mail, Phone, Camera, Save, Lock } from 'lucide-react';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('personal');

  // Dummy Profile Data
  const [profileData, setProfileData] = useState({
    name: 'Super Admin',
    email: 'admin@politicalplatform.com',
    phone: '+91 9876543210',
    role: 'Super Administrator',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 sm:p-8 w-full min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-600" /> My Profile
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account settings and change your password.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Profile Summary */}
        <div className="w-full lg:w-1/3 xl:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 flex flex-col items-center border-b border-gray-100 bg-gray-50/50">
              <div className="relative mb-4 group cursor-pointer">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-black shadow-inner overflow-hidden">
                  SA
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                <Shield className="w-4 h-4" /> {profileData.role}
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" /> {profileData.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" /> {profileData.phone}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area (Tabs & Forms) */}
        <div className="w-full lg:w-2/3 xl:w-3/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 hide-scrollbar overflow-x-auto">
              <button 
                onClick={() => setActiveTab('personal')}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'personal' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                <User className="w-4 h-4" /> Personal Information
              </button>
              <button 
                onClick={() => setActiveTab('password')}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'password' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                <Key className="w-4 h-4" /> Change Password
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 sm:p-8">
              
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="max-w-2xl animate-in fade-in duration-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Profile Details</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                        <input 
                          type="text" 
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                        <input 
                          type="text" 
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assigned Role</label>
                      <input 
                        type="text" 
                        disabled
                        value={profileData.role}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm font-semibold cursor-not-allowed" 
                      />
                      <p className="text-xs text-gray-400 mt-1.5">Role modifications require higher administrative privileges.</p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                      <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors shadow-sm">
                        <Save className="w-4 h-4" /> Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <div className="max-w-xl animate-in fade-in duration-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Update Password</h3>
                  <p className="text-sm text-gray-500 mb-6">Ensure your account is using a long, random password to stay secure.</p>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
                      <input 
                        type="password" 
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                      <input 
                        type="password" 
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Create new password"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                      <input 
                        type="password" 
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm" 
                      />
                    </div>

                    {/* Password Rules */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
                      <p className="text-xs font-bold text-gray-700 mb-2">Password Requirements:</p>
                      <ul className="text-xs text-gray-500 space-y-1.5 list-disc pl-4">
                        <li>Minimum 8 characters long</li>
                        <li>At least one uppercase character</li>
                        <li>At least one number or special character</li>
                      </ul>
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                      <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors shadow-sm">
                        <Lock className="w-4 h-4" /> Update Password
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
