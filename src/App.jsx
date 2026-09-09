import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Plans from './pages/Plans';
import Subscriptions from './pages/Subscriptions';
import FeatureManagement from './pages/FeatureManagement';
import WhiteLabel from './pages/WhiteLabel';
import Domains from './pages/Domains';
import Staff from './pages/Staff';
import Analytics from './pages/Analytics';
import Integrations from './pages/Integrations';
import Usage from './pages/Usage';
import Notifications from './pages/Notifications';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/features" element={<FeatureManagement />} />
          <Route path="/white-label" element={<WhiteLabel />} />
          <Route path="/domains" element={<Domains />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/usage" element={<Usage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
