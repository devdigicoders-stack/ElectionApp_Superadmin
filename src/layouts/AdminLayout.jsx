import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import NotificationBellDropdown from '../components/NotificationBellDropdown';
import { requestNotificationPermissionAndGetToken } from '../config/firebase';
import { notificationsService } from '../services/notifications.service';
import { 
  LayoutDashboard, Users, CreditCard, Layers, Palette, 
  UserCircle, BarChart3, Plug, ScrollText, Settings, 
  Search, Bell, MessageSquare, ChevronDown, Globe, 
  UsersRound, PieChart, Receipt, Sun, HelpCircle, Menu, LogOut, Landmark, MapPin,
  FileSpreadsheet
} from 'lucide-react';

const LogoIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
    <Landmark className="w-5 h-5 text-white" />
  </div>
);

export const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Tenants / Clients', path: '/clients', icon: Users, permission: 'tenants:read' },
  { name: 'Master Areas', path: '/master-areas', icon: MapPin, permission: 'tenants:read' },
  { name: 'Subscription Plans', path: '/plans', icon: CreditCard, permission: 'plans:read' },
  { name: 'Subscriptions', path: '/subscriptions', icon: Receipt, permission: 'subscriptions:read' },
  { name: 'Domains', path: '/domains', icon: Globe, permission: 'tenants:domain' },
  { name: 'Admin & Staff', path: '/staff', icon: UserCircle, role: 'super_admin' },
  { name: 'Usage Management', path: '/usage', icon: BarChart3, permission: 'usage:read' },
  { name: 'Data Exports', path: '/exports', icon: FileSpreadsheet, permission: 'exports:read' },
  { name: 'Notifications', path: '/notifications', icon: Bell, permission: 'system:health' },
  { name: 'Audit Logs', path: '/audit-logs', icon: ScrollText, permission: 'audit_logs:read' },
  { name: 'System Settings', path: '/settings', icon: Settings, role: 'super_admin' },
  { name: 'My Profile', path: '/profile', icon: UserCircle },
];

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  sales_manager: 'Sales Manager',
  support_executive: 'Support Executive',
  technical_support: 'Technical Support',
  finance_manager: 'Finance Manager',
};

export const DEFAULT_ROLE_PERMISSIONS = {
  super_admin: ['*'],
  sales_manager: [
    'tenants:read',
    'tenants:create',
    'plans:read',
    'subscriptions:read',
    'usage:read',
  ],
  support_executive: [
    'tenants:read',
    'tenants:impersonate',
    'audit_logs:read',
    'complaints:read',
  ],
  technical_support: [
    'tenants:read',
    'tenants:impersonate',
    'tenants:domain',
    'audit_logs:read',
    'system:health',
  ],
  finance_manager: [
    'subscriptions:read',
    'subscriptions:manage',
    'invoices:read',
    'revenue:read',
    'plans:read',
  ],
};

export function getEffectivePermissions(admin) {
  if (!admin) return [];
  if (Array.isArray(admin.permissions) && admin.permissions.length > 0) {
    return admin.permissions;
  }
  return DEFAULT_ROLE_PERMISSIONS[admin.role] || [];
}

export function hasPermission(item, admin) {
  if (!admin) return false;
  const perms = getEffectivePermissions(admin);

  // Super admin role has full access to everything
  if (admin.role === 'super_admin' || perms.includes('*')) return true;

  // If item specifically requires super_admin role (e.g. Staff Management)
  if (item.role && item.role === 'super_admin') {
    return false;
  }

  // If item requires a specific permission
  if (item.permission) {
    return perms.includes(item.permission);
  }

  // General items without restriction (Dashboard, Profile)
  return true;
}

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const location = useLocation();
  const navigate = useNavigate();

  // ── AUTO FCM TOKEN REGISTRATION ON LOGIN ───────────────────────────────────
  // On every Super Admin login / layout mount:
  //  • Permission granted  → silently refresh token & save to backend
  //  • Permission default  → request browser permission then save
  //  • Permission denied   → skip silently
  useEffect(() => {
    const autoRegisterFcmToken = async () => {
      try {
        if (typeof window === 'undefined' || !('Notification' in window)) return;
        if (Notification.permission === 'denied') return;

        const res = await requestNotificationPermissionAndGetToken();
        if (res?.success && res?.token) {
          // Ensure token is always fresh in backend
          await notificationsService.registerFcmToken(res.token).catch(() => {});
        }
      } catch {
        // Silent fail — don't disrupt Super Admin UI
      }
    };
    autoRegisterFcmToken();
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Handle window resize dynamically
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const admin = (() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  })();
  const allowedNavItems = navItems.filter(item => hasPermission(item, admin));
  const roleName = ROLE_LABELS[admin.role] || admin.role || 'Staff';

  const currentNav = allowedNavItems.find(item => location.pathname.includes(item.path)) || navItems.find(item => location.pathname.includes(item.path));
  const pageTitle = currentNav ? currentNav.name : 'Dashboard';

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Dark Teal Theme */}
      <aside className={`fixed lg:static inset-y-0 left-0 bg-[#072F2B] text-gray-300 flex flex-col transition-all duration-300 z-50 shrink-0 border-r border-[#072F2B]/10 ${isSidebarOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0 lg:w-[80px]'}`}>
        <div className={`h-[76px] flex items-center border-b border-white/5 shrink-0 ${isSidebarOpen ? 'px-6 gap-3' : 'justify-center'}`}>
          <LogoIcon />
          {isSidebarOpen && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-xl font-bold tracking-wide text-white leading-tight">Political</span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">{roleName}</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="space-y-1.5 px-3">
            {allowedNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                title={!isSidebarOpen ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-lg transition-all duration-200 text-[14px] font-medium group ${
                    isSidebarOpen ? 'gap-3.5 px-3.5 py-2.5' : 'justify-center py-3'
                  } ${
                    isActive 
                      ? 'bg-[#0B4640] text-emerald-400 shadow-sm border border-emerald-500/20' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-emerald-400' : 'text-gray-400 group-hover:text-gray-300'}`} />
                    {isSidebarOpen && <span className="whitespace-nowrap">{item.name}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logged-in Staff Info */}
        <div className={`py-3 px-4 border-t border-white/5 flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/30">
            {admin.name ? admin.name[0].toUpperCase() : 'A'}
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="text-[13px] font-semibold text-white truncate">{admin.name || 'Admin User'}</span>
              <span className="text-[10px] text-emerald-400 font-medium truncate uppercase tracking-wider">{roleName}</span>
            </div>
          )}
        </div>

        {/* Logout */}
        <div 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('admin');
            navigate('/', { replace: true });
          }}
          className={`py-3.5 border-t border-white/5 shrink-0 flex items-center cursor-pointer hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors group ${isSidebarOpen ? 'px-6 gap-3' : 'justify-center'}`}
        >
          <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-red-500/10 flex items-center justify-center shrink-0 transition-colors">
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
          </div>
          {isSidebarOpen && (
            <div className="whitespace-nowrap overflow-hidden">
              <p className="text-[13px] font-semibold">Logout</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0 shadow-2xs">
          
          {/* Page Title & Sidebar Toggle */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer" 
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">{pageTitle}</h2>
          </div>

          {/* Right Icons & Profile */}
          <div className="flex items-center gap-3 sm:gap-6">
            
            {/* Fully Dynamic Notification Bell with Dropdown Center */}
            <NotificationBellDropdown />

            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 hover:bg-gray-50 p-1.5 rounded-full transition-colors sm:pr-3 cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-sm border border-emerald-200 shrink-0">
                {admin.name ? admin.name[0].toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-sm font-bold text-gray-800 leading-none">{admin.name || 'Admin User'}</span>
                <span className="text-[11px] font-semibold text-emerald-600 mt-1 leading-none">{roleName}</span>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content - Expanded width with optimized padding */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-3 sm:p-4 lg:p-5">
          <div className="w-full bg-transparent min-h-[calc(100vh-110px)] flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
