import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, Layers, Palette, 
  UserCircle, BarChart3, Plug, ScrollText, Settings, 
  Search, Bell, MessageSquare, ChevronDown, Globe, 
  UsersRound, PieChart, Receipt, Sun, HelpCircle, Menu, LogOut, Landmark
} from 'lucide-react';

const LogoIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
    <Landmark className="w-5 h-5 text-white" />
  </div>
);

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Tenants / Clients', path: '/clients', icon: Users },
  { name: 'Subscription Plans', path: '/plans', icon: CreditCard },
  { name: 'Subscriptions', path: '/subscriptions', icon: Receipt },
  { name: 'Feature Management', path: '/features', icon: Layers },
  { name: 'White-Label / Branding', path: '/white-label', icon: Palette },
  { name: 'Domains', path: '/domains', icon: Globe },
  { name: 'Admin & Staff', path: '/staff', icon: UserCircle },
  { name: 'Usage Management', path: '/usage', icon: BarChart3 },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Audit Logs', path: '/audit-logs', icon: ScrollText },
  { name: 'My Profile', path: '/profile', icon: UserCircle },
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const location = useLocation();
  const navigate = useNavigate();

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

  const currentNav = navItems.find(item => location.pathname.includes(item.path));
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
              <span className="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">Admin</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="space-y-1.5 px-3">
            {navItems.map((item) => (
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



        {/* Logout */}
        <div 
          onClick={() => navigate('/', { replace: true })}
          className={`py-4 border-t border-red-500/20 shrink-0 flex items-center cursor-pointer hover:bg-red-500/20 text-red-400 transition-colors group ${isSidebarOpen ? 'px-6 gap-3' : 'justify-center'}`}
        >
          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 transition-colors">
            <LogOut className="w-4 h-4 text-red-400" />
          </div>
          {isSidebarOpen && (
            <div className="whitespace-nowrap overflow-hidden">
              <p className="text-[13px] font-bold text-red-400">Logout</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-[76px] bg-white border-b border-gray-100 flex items-center justify-between px-8 z-10 shrink-0 shadow-sm">
          
          {/* Page Title & Sidebar Toggle */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors" 
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">{pageTitle}</h2>
          </div>

          {/* Right Icons & Profile */}
          <div className="flex items-center gap-3 sm:gap-6">
            
            <button 
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[9px] text-white flex items-center justify-center font-bold">3</span>
            </button>

            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded-full transition-colors sm:pr-3"
            >
              <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shadow-sm border border-gray-100" />
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-bold text-gray-800 leading-none">Super Admin</span>
                <span className="text-[11px] font-semibold text-gray-500 mt-1 leading-none">Administrator</span>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-6">
          <div className="bg-transparent rounded-xl min-h-[calc(100vh-128px)] flex flex-col overflow-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
