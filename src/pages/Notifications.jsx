import React, { useState } from 'react';
import { Bell, Search, CheckCircle, Info, AlertTriangle, Send, Users, MapPin, XCircle, Clock } from 'lucide-react';

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('Inbox');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'alert', title: 'System Maintenance', message: 'Servers will be down for maintenance tonight at 2 AM.', time: '2 hours ago', read: false },
    { id: 2, type: 'info', title: 'New Tenant Registered', message: 'Tenant "Amit Sharma" has successfully onboarded.', time: '5 hours ago', read: false },
    { id: 3, type: 'success', title: 'Payment Received', message: 'Subscription renewed for tenant Ravi Kumar.', time: '1 day ago', read: true },
    { id: 4, type: 'alert', title: 'Domain Verification Failed', message: 'Domain validation for anitadesai.org failed.', time: '1 day ago', read: true },
  ]);

  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', role: 'All', area: 'All' });

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;
    
    // Simulating adding to sent box or just resetting for now
    alert('Broadcast Notification Sent to Target Audience!');
    setBroadcastForm({ title: '', message: '', role: 'All', area: 'All' });
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type) => {
    switch(type) {
      case 'alert': return <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-600" /></div>;
      case 'success': return <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>;
      default: return <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><Info className="w-5 h-5 text-blue-600" /></div>;
    }
  };

  return (
    <div className="p-4 sm:p-8 w-full min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600" /> Notification Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage system alerts and broadcast messages to tenants.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[600px]">
        
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 hide-scrollbar shrink-0 bg-gray-50/50">
          <button 
            onClick={() => setActiveTab('Inbox')}
            className={`px-8 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'Inbox' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <Bell className="w-4 h-4" /> System Inbox 
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('Broadcast')}
            className={`px-8 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'Broadcast' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <Send className="w-4 h-4" /> Send Broadcast
          </button>
        </div>

        {/* INBOX TAB */}
        {activeTab === 'Inbox' && (
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
              <div className="relative w-full max-w-md">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search notifications..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>
              <button onClick={markAllAsRead} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-4 py-2 rounded-lg whitespace-nowrap">
                Mark all as read
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4">
              <div className="w-full max-w-7xl mx-auto space-y-3">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map(note => (
                    <div key={note.id} className={`flex items-start gap-4 p-4 rounded-xl border bg-white hover:shadow-sm transition-all cursor-pointer ${note.read ? 'border-gray-100' : 'border-indigo-100 shadow-sm shadow-indigo-500/5'}`}>
                      {getIcon(note.type)}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className={`text-sm font-bold ${note.read ? 'text-gray-700' : 'text-gray-900'}`}>{note.title}</h4>
                          <span className="text-xs font-semibold text-gray-400 whitespace-nowrap flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {note.time}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 leading-relaxed ${note.read ? 'text-gray-500 font-medium' : 'text-gray-700 font-semibold'}`}>
                          {note.message}
                        </p>
                      </div>
                      {!note.read && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full shrink-0 mt-2"></div>}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No notifications found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BROADCAST TAB */}
        {activeTab === 'Broadcast' && (
          <div className="flex-1 p-6 sm:p-10 bg-white">
            <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-200">
              
              <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 mb-8 flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-indigo-900">Broadcast Messaging</h3>
                  <p className="text-sm text-indigo-700 mt-1 font-medium leading-relaxed">
                    Send platform-wide alerts to your tenants or specific roles. These messages will appear instantly on their dashboards or mobile devices.
                  </p>
                </div>
              </div>

              <form onSubmit={handleBroadcast} className="space-y-6">
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Notification Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. New Feature Update: Custom Domains"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({...broadcastForm, title: e.target.value})}
                    className="w-full h-12 px-4 border border-gray-200 rounded-lg bg-white outline-none text-sm font-semibold text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message Body</label>
                  <textarea 
                    required
                    rows="5"
                    placeholder="Write your broadcast message here..."
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({...broadcastForm, message: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-lg bg-white outline-none text-sm font-medium text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                      <Users className="w-4 h-4 text-gray-500" /> Target Role
                    </label>
                    <select 
                      value={broadcastForm.role}
                      onChange={(e) => setBroadcastForm({...broadcastForm, role: e.target.value})}
                      className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white outline-none text-sm font-semibold text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="All">All Tenants & Users</option>
                      <option value="Tenants">Only Tenants (Leaders)</option>
                      <option value="Staff">Only Super Admin Staff</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 text-gray-500" /> Target Area
                    </label>
                    <select 
                      value={broadcastForm.area}
                      onChange={(e) => setBroadcastForm({...broadcastForm, area: e.target.value})}
                      className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white outline-none text-sm font-semibold text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="All">All Geographic Areas</option>
                      <option value="North">North Region</option>
                      <option value="South">South Region</option>
                      <option value="East">East Region</option>
                      <option value="West">West Region</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button 
                    type="submit"
                    className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[15px] rounded-lg shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Send Broadcast Now
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
