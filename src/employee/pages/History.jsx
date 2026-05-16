import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { attendanceService } from '../../services/attendanceService';
import { authService } from '../../services/authService';
import { formatCurrency } from '../../utils/payrollUtils';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setEmployee(user);
    if (user) {
      loadHistory(user.id);
    }
  }, []);

  const loadHistory = async (id) => {
    try {
      const data = await attendanceService.getEmployeeHistory(id);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/app" className="w-10 h-10 glass-card flex items-center justify-center text-xl">
          ←
        </Link>
        <h2 className="text-2xl font-black text-white">Attendance History</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="glass-card p-4">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Present Days</p>
          <p className="text-2xl font-black">{history.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Late</p>
          <p className="text-2xl font-black text-amber-500">
            {history.reduce((acc, curr) => acc + (curr.late_minutes || 0), 0)}m
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-10">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-2xl"></div>
          ))
        ) : history.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500">No records found yet.</p>
          </div>
        ) : (
          history.map((record, idx) => (
            <motion.div 
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-5 flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-bold text-white">
                  {new Date(record.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">
                  {record.shift_type} Shift • {new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="text-right">
                {record.late_minutes > 0 ? (
                  <>
                    <p className="text-sm font-bold text-red-500">-{formatCurrency(record.deduction_amount)}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{record.late_minutes}m Late</p>
                  </>
                ) : (
                  <span className="badge bg-green-500/10 text-green-500 border border-green-500/20">On Time</span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-white/5">
        <button 
          onClick={() => {
            authService.logout();
            window.location.href = '/app/login';
          }}
          className="w-full py-4 text-red-500 font-bold uppercase tracking-widest text-xs hover:bg-red-500/10 rounded-xl transition-all"
        >
          Sign Out of Device
        </button>
      </div>
    </div>
  );
};

export default History;
