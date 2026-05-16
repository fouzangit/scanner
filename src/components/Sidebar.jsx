import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CreditCard, 
  FileText, 
  Settings,
  LogOut
} from 'lucide-react'; // Using Lucide for modern icons (needs install or I'll use placeholders)
import { motion } from 'framer-motion';

// For now, I'll use simple emoji/text since I didn't add lucide to package.json yet
// I will use SVG paths for better look if possible, but emojis are safer for a quick build

const menuItems = [
  { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { path: '/admin/employees', icon: <Users size={20} />, label: 'Employees' },
  { path: '/admin/attendance', icon: <Clock size={20} />, label: 'Attendance' },
  { path: '/admin/payroll', icon: <CreditCard size={20} />, label: 'Payroll' },
  { path: '/admin/reports', icon: <FileText size={20} />, label: 'Reports' },
  { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
];

const Sidebar = () => {
  return (
    <div className="w-72 h-screen bg-slate-900/50 backdrop-blur-2xl border-r border-white/5 flex flex-col p-6 sticky top-0">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow">
          <span className="text-xl font-bold">C</span>
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          ClinicPulse
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 border-t border-white/5">
        <button 
          onClick={() => {
            localStorage.removeItem('clinic_admin_token');
            window.location.href = '/admin/login';
          }}
          className="nav-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
