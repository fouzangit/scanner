import React from 'react';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const getTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.includes('employees')) return 'Employees';
    if (path.includes('attendance')) return 'Attendance';
    if (path.includes('payroll')) return 'Payroll';
    if (path.includes('reports')) return 'Reports';
    if (path.includes('settings')) return 'Settings';
    return 'Admin Panel';
  };

  return (
    <header className="h-16 md:h-20 border-b border-white/5 flex items-center justify-between pl-16 pr-4 md:px-10 bg-slate-950/20 backdrop-blur-md sticky top-0 z-10">
      <h2 className="text-lg md:text-2xl font-bold text-white">{getTitle()}</h2>
      
      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden sm:flex flex-col items-end">
          <p className="text-sm font-semibold text-white">Administrator</p>
          <p className="text-xs text-slate-500">Super User</p>
        </div>
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 p-0.5 shadow-glow flex-shrink-0">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
