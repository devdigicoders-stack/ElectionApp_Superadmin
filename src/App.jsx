import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
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

// Protected Route — bina token ke andar nahi jaane deta
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
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
          <Route path="/clients" element={<Clients />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/domains" element={<Domains />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/usage" element={<Usage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Koi bhi unknown route → login pe */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
