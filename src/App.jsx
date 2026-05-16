import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layouts
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Admin Pages
import AdminDashboard from './admin/pages/Dashboard';
import Employees from './admin/pages/Employees';
import Attendance from './admin/pages/Attendance';
import Payroll from './admin/pages/Payroll';
import Reports from './admin/pages/Reports';
import Settings from './admin/pages/Settings';
import OfficeQR from './admin/pages/OfficeQR';

// Employee Pages
import Login from './employee/pages/Login';
import Scanner from './employee/pages/Scanner';
import History from './employee/pages/History';

// Auth Guard for Employee App
const EmployeeGuard = ({ children }) => {
  const user = localStorage.getItem('clinic_employee');
  if (!user) return <Navigate to="/app/login" />;
  return children;
};

// Admin Guard
const AdminGuard = ({ children }) => {
  const isAdmin = localStorage.getItem('clinic_admin_token') === 'true';
  // For production, this should be real auth. For demo, we allow it or redirect.
  // if (!isAdmin) return <Navigate to="/admin/login" />;
  return children;
};

const AdminLayout = ({ children }) => (
  <div className="flex min-h-screen bg-slate-950 bg-mesh">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <Navbar />
      <main className="p-10 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Employee App Routes (PWA Focus) */}
        <Route path="/app/login" element={<Login />} />
        <Route path="/app" element={
          <EmployeeGuard>
            <Scanner />
          </EmployeeGuard>
        } />
        <Route path="/app/history" element={
          <EmployeeGuard>
            <History />
          </EmployeeGuard>
        } />

        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={
          <AdminGuard>
            <AdminLayout><AdminDashboard /></AdminLayout>
          </AdminGuard>
        } />
        <Route path="/admin/employees" element={
          <AdminGuard>
            <AdminLayout><Employees /></AdminLayout>
          </AdminGuard>
        } />
        <Route path="/admin/attendance" element={
          <AdminGuard>
            <AdminLayout><Attendance /></AdminLayout>
          </AdminGuard>
        } />
        <Route path="/admin/payroll" element={
          <AdminGuard>
            <AdminLayout><Payroll /></AdminLayout>
          </AdminGuard>
        } />
        <Route path="/admin/reports" element={
          <AdminGuard>
            <AdminLayout><Reports /></AdminLayout>
          </AdminGuard>
        } />
        <Route path="/admin/qr" element={<OfficeQR />} />
        <Route path="/admin/settings" element={
          <AdminGuard>
            <AdminLayout><Settings /></AdminLayout>
          </AdminGuard>
        } />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/app" />} />
      </Routes>
    </Router>
  );
}

export default App;
