import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { formatCurrency } from '../../utils/payrollUtils';

const Attendance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, employees(name, role)')
      .order('date', { ascending: false })
      .order('check_in_time', { ascending: false });
    
    if (data) setLogs(data);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-black">Attendance Logs</h3>
        <p className="text-slate-500 mt-1">Real-time check-in data from office QR scanner</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex gap-4">
          <input type="date" className="bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-brand-500" />
          <input type="text" placeholder="Search staff..." className="bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-brand-500 flex-1" />
          <button className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/5 uppercase tracking-widest">Filter</button>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Employee</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Check In</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Shift</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Deduction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="6" className="p-10"><div className="h-4 bg-white/5 rounded w-full"></div></td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr><td colSpan="6" className="p-20 text-center text-slate-500">No attendance records found.</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/5 transition-all">
                <td className="p-6">
                  <p className="font-bold text-white">{log.employees?.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{log.employees?.role}</p>
                </td>
                <td className="p-6 text-sm text-slate-300">{log.date}</td>
                <td className="p-6 text-sm font-bold text-white">
                  {new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">{log.shift_type}</td>
                <td className="p-6">
                  {log.late_minutes > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shadow-glow shadow-amber-500/40"></span>
                      <span className="text-xs font-bold text-amber-500 uppercase">{log.late_minutes}m Late</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 shadow-glow shadow-green-500/40"></span>
                      <span className="text-xs font-bold text-green-500 uppercase">On Time</span>
                    </div>
                  )}
                </td>
                <td className="p-6">
                  {log.deduction_amount > 0 ? (
                    <span className="text-sm font-black text-red-500">-{formatCurrency(log.deduction_amount)}</span>
                  ) : (
                    <span className="text-sm font-bold text-slate-600">--</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
