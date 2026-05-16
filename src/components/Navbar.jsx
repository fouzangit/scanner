import React from 'react';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const getTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.includes('employees')) return 'Employee Management';
    if (path.includes('attendance')) return 'Attendance Logs';
    if (path.includes('payroll')) return 'Payroll System';
    if (path.includes('reports')) return 'Reports & Analytics';
    if (path.includes('settings')) return 'System Settings';
    return 'Admin Panel';
  };

  return (
    <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-slate-950/20 backdrop-blur-md sticky top-0 z-10">
      <h2 className="text-2xl font-bold text-white">{getTitle()}</h2>
      
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <p className="text-sm font-semibold text-white">Administrator</p>
          <p className="text-xs text-slate-500">Super User</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 p-0.5 shadow-glow">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
