import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { formatCurrency } from '../../utils/payrollUtils';

const Attendance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('attendance')
      .select('*, employees(name, role)')
      .order('date', { ascending: false })
      .order('check_in_time', { ascending: false });
    if (data) setLogs(data);
    setLoading(false);
  };

  const filtered = logs.filter(log => {
    const matchName = log.employees?.name?.toLowerCase().includes(search.toLowerCase());
    const matchDate = dateFilter ? log.date === dateFilter : true;
    return matchName && matchDate;
  });

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h3 className="text-2xl md:text-3xl font-black">Attendance Logs</h3>
        <p className="text-slate-500 mt-1 text-sm hidden sm:block">Real-time check-in data from office QR scanner</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 text-white"
        />
        <input
          type="text"
          placeholder="Search staff name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 flex-1 text-white placeholder-slate-500"
        />
        <button
          onClick={() => { setSearch(''); setDateFilter(''); }}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/5 uppercase tracking-widest"
        >
          Clear
        </button>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-1/2 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/3" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="glass-card p-10 text-center text-slate-500">No records found.</div>
        ) : filtered.map((log) => (
          <div key={log.id} className="glass-card p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-white">{log.employees?.name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{log.employees?.role}</p>
              </div>
              <div className="text-right">
                {log.late_minutes > 0 ? (
                  <span className="text-xs font-black text-amber-400">{log.late_minutes}m Late</span>
                ) : (
                  <span className="text-xs font-black text-green-400">On Time</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
              <span>📅 {log.date}</span>
              <span>🕐 In: {log.check_in_time ? new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</span>
              {log.check_out_time && (
                <span>🕓 Out: {new Date(log.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              )}
              <span className="uppercase font-bold">{log.shift_type}</span>
              {log.deduction_amount > 0 && (
                <span className="text-red-400 font-black">-{formatCurrency(log.deduction_amount)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              {['Employee', 'Date', 'Check In', 'Check Out', 'Shift', 'Status', 'Deduction'].map(h => (
                <th key={h} className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="7" className="p-8"><div className="h-4 bg-white/5 rounded w-full" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan="7" className="p-20 text-center text-slate-500">No attendance records found.</td></tr>
            ) : filtered.map((log) => (
              <tr key={log.id} className="hover:bg-white/5 transition-all">
                <td className="p-5">
                  <p className="font-bold text-white">{log.employees?.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{log.employees?.role}</p>
                </td>
                <td className="p-5 text-sm text-slate-300">{log.date}</td>
                <td className="p-5 text-sm font-bold text-white">
                  {log.check_in_time ? new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                </td>
                <td className="p-5 text-sm font-bold text-slate-300">
                  {log.check_out_time ? new Date(log.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-slate-600">--</span>}
                </td>
                <td className="p-5 text-xs font-bold uppercase tracking-widest text-slate-400">{log.shift_type}</td>
                <td className="p-5">
                  {log.late_minutes > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold text-amber-400">{log.late_minutes}m Late</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs font-bold text-green-400">On Time</span>
                    </div>
                  )}
                </td>
                <td className="p-5">
                  {log.deduction_amount > 0 ? (
                    <span className="text-sm font-black text-red-400">-{formatCurrency(log.deduction_amount)}</span>
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
