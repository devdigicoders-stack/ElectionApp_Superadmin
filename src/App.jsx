import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Login from './pages/Login';
import AdminLayout, { getEffectivePermissions } from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Plans from './pages/Plans';
import Subscriptions from './pages/Subscriptions';
import Domains from './pages/Domains';
import Staff from './pages/Staff';
import Usage from './pages/Usage';
import Notifications from './pages/Notifications';
import AuditLogs from './pages/AuditLogs';
import Profile from './pages/Profile';
import MasterAreas from './pages/MasterAreas';
import Exports from './pages/Exports';
import PlatformSettings from './pages/Settings';

// Protected Route — bina token ke andar nahi jaane deta
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Access Denied screen when staff lacks specific permission
function AccessDenied({ reason }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mb-4 shadow-lg shadow-amber-500/10">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
      <p className="text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
        {reason || 'Aapke account ke paas is page ko access karne ki permission nahi hai. Please Super Admin se permissions assign karwayein.'}
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#072F2B] text-white text-sm font-semibold hover:bg-[#0B4640] transition-colors shadow-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard Pe Wapas Jayein
      </button>
    </div>
  );
}

// Permission & Role Check Route
function PermissionRoute({ children, permission, requiredRole }) {
  const admin = (() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  })();

  const perms = getEffectivePermissions(admin);

  // Super admin role ya wildcard permission sab access kar sakta hai
  if (admin.role === 'super_admin' || perms.includes('*')) {
    return children;
  }

  // Specific role required (e.g. Staff management ke liye super_admin)
  if (requiredRole && admin.role !== requiredRole) {
    return <AccessDenied reason={`Is section ke liye "${requiredRole.replace('_', ' ')}" role hona anivarya hai.`} />;
  }

  // Specific permission string required
  if (permission && !perms.includes(permission)) {
    return <AccessDenied reason={`Aapke account ke paas "${permission}" permission nahi hai.`} />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<PermissionRoute permission="tenants:read"><Clients /></PermissionRoute>} />
          <Route path="/master-areas" element={<PermissionRoute permission="tenants:read"><MasterAreas /></PermissionRoute>} />
          <Route path="/plans" element={<PermissionRoute permission="plans:read"><Plans /></PermissionRoute>} />
          <Route path="/subscriptions" element={<PermissionRoute permission="subscriptions:read"><Subscriptions /></PermissionRoute>} />
          <Route path="/domains" element={<PermissionRoute permission="tenants:domain"><Domains /></PermissionRoute>} />
          <Route path="/staff" element={<PermissionRoute requiredRole="super_admin"><Staff /></PermissionRoute>} />
          <Route path="/usage" element={<PermissionRoute permission="usage:read"><Usage /></PermissionRoute>} />
          <Route path="/notifications" element={<PermissionRoute permission="system:health"><Notifications /></PermissionRoute>} />
          <Route path="/audit-logs" element={<PermissionRoute permission="audit_logs:read"><AuditLogs /></PermissionRoute>} />
          <Route path="/exports" element={<PermissionRoute permission="exports:read"><Exports /></PermissionRoute>} />
          <Route path="/settings" element={<PermissionRoute requiredRole="super_admin"><PlatformSettings /></PermissionRoute>} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Koi bhi unknown route → login pe */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
