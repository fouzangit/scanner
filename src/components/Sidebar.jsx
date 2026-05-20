import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CreditCard, 
  FileText, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { path: '/admin/employees', icon: <Users size={20} />, label: 'Employees' },
  { path: '/admin/attendance', icon: <Clock size={20} />, label: 'Attendance' },
  { path: '/admin/payroll', icon: <CreditCard size={20} />, label: 'Payroll' },
  { path: '/admin/reports', icon: <FileText size={20} />, label: 'Reports' },
  { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
];

const SidebarContent = ({ onClose }) => (
  <>
    <div className="flex items-center justify-between mb-10 px-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
          <span className="text-xl font-bold">C</span>
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Radent Clinic
        </h1>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 md:hidden">
          <X size={20} />
        </button>
      )}
    </div>

    <nav className="flex-1 space-y-2">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/admin'}
          onClick={onClose}
          className={({ isActive }) => 
            `nav-link ${isActive ? 'nav-link-active' : ''}`
          }
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>

    <div className="pt-6 border-t border-white/5">
      <button 
        onClick={() => {
          sessionStorage.removeItem('clinic_admin_token');
          window.location.href = '/';
        }}
        className="nav-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  </>
);

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 h-screen bg-slate-900/50 backdrop-blur-2xl border-r border-white/5 flex-col p-6 sticky top-0 flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Hamburger Button - rendered inside Navbar via prop, but we expose a global button here */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 bg-slate-800 border border-white/10 rounded-xl flex items-center justify-center text-white shadow-lg"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-72 bg-slate-900 border-r border-white/10 flex flex-col p-6 z-50 md:hidden"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
