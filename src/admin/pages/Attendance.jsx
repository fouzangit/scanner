import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { formatCurrency } from '../../utils/payrollUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateLateMinutes, calculateEarlyLeaveMinutes, calculateDeduction } from '../../utils/calculateLate';

const Attendance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Manual attendance state
  const [showModal, setShowModal] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [manualFormData, setManualFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    shift_type: 'morning',
    check_in_time: '09:00',
    check_out_time: ''
  });

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

  const openManualAdd = async () => {
    try {
      const { data } = await supabase
        .from('employees')
        .select('id, name, role, shift_type, hourly_rate')
        .order('name');
      
      if (data) {
        setEmployeesList(data);
        setManualFormData({
          employee_id: data[0]?.id || '',
          date: new Date().toISOString().split('T')[0],
          shift_type: 'morning',
          check_in_time: '09:00',
          check_out_time: ''
        });
        setShowModal(true);
      }
    } catch (err) {
      alert('Failed to load employees list: ' + err.message);
    }
  };

  const handleSaveManualAttendance = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { employee_id, date, shift_type, check_in_time, check_out_time } = manualFormData;
      if (!employee_id) throw new Error('Please select an employee.');

      const emp = employeesList.find(e => e.id === employee_id);
      if (!emp) throw new Error('Selected employee not found.');
      
      // Calculate Check-In Date/Time
      const [inH, inM] = check_in_time.split(':').map(Number);
      const checkInDate = new Date(date);
      checkInDate.setHours(inH, inM, 0, 0);
      
      // Calculate late minutes and deduction
      const lateMinutes = calculateLateMinutes(checkInDate.toISOString(), emp.role, shift_type);
      const lateDeduction = calculateDeduction(lateMinutes, emp.hourly_rate || 0);
      
      let outDateISO = null;
      let earlyLeaveMinutes = 0;
      let earlyDeduction = 0;
      
      if (check_out_time) {
        const [outH, outM] = check_out_time.split(':').map(Number);
        const checkOutDate = new Date(date);
        checkOutDate.setHours(outH, outM, 0, 0);
        outDateISO = checkOutDate.toISOString();
        
        earlyLeaveMinutes = calculateEarlyLeaveMinutes(outDateISO, emp.role, shift_type);
        earlyDeduction = calculateDeduction(earlyLeaveMinutes, emp.hourly_rate || 0);
      }
      
      const totalDeduction = lateDeduction + earlyDeduction;
      
      // Check if attendance already exists for this employee, date and shift
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('employee_id', employee_id)
        .eq('date', date)
        .eq('shift_type', shift_type)
        .maybeSingle();
        
      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('attendance')
          .update({
            check_in_time: checkInDate.toISOString(),
            check_out_time: outDateISO,
            late_minutes: lateMinutes,
            early_leave_minutes: earlyLeaveMinutes,
            deduction_amount: totalDeduction,
            attendance_status: 'present'
          })
          .eq('id', existing.id);
          
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('attendance')
          .insert([{
            employee_id,
            date,
            check_in_time: checkInDate.toISOString(),
            check_out_time: outDateISO,
            shift_type,
            late_minutes: lateMinutes,
            early_leave_minutes: earlyLeaveMinutes,
            deduction_amount: totalDeduction,
            attendance_status: 'present',
            latitude: 0,
            longitude: 0
          }]);
          
        if (error) throw error;
      }
      
      setShowModal(false);
      fetchLogs();
    } catch (err) {
      alert('Error saving manual attendance: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLog = async (id) => {
    if (window.confirm('Delete this attendance log? This will reset the employee\'s attendance state for this shift.')) {
      const { error } = await supabase.from('attendance').delete().eq('id', id);
      if (!error) {
        fetchLogs();
      } else {
        alert('Failed to delete log: ' + error.message);
      }
    }
  };

  const filtered = logs.filter(log => {
    const matchName = log.employees?.name?.toLowerCase().includes(search.toLowerCase());
    const matchDate = dateFilter ? log.date === dateFilter : true;
    return matchName && matchDate;
  });

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl md:text-3xl font-black">Attendance Logs</h3>
          <p className="text-slate-500 mt-1 text-sm hidden sm:block">Real-time check-in data from office QR scanner</p>
        </div>
        <button onClick={openManualAdd} className="btn-primary flex items-center gap-2">
          <span>⚡</span> MANUAL ATTENDANCE
        </button>
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
            <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{log.shift_type} Shift</span>
              <button
                onClick={() => handleDeleteLog(log.id)}
                className="text-red-500/80 hover:text-red-400 text-[10px] font-black uppercase tracking-widest"
              >
                Delete Log
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              {['Employee', 'Date', 'Check In', 'Check Out', 'Shift', 'Status', 'Deduction', 'Actions'].map(h => (
                <th key={h} className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="8" className="p-8"><div className="h-4 bg-white/5 rounded w-full" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan="8" className="p-20 text-center text-slate-500">No attendance records found.</td></tr>
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
                <td className="p-5">
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="text-red-500/80 hover:text-red-400 text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manual Attendance Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
              className="relative glass-card p-6 md:p-10 w-full sm:max-w-xl bg-slate-900 shadow-glow rounded-b-none sm:rounded-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl md:text-2xl font-black mb-6 md:mb-8">⚡ Add Manual Attendance</h3>
              <form onSubmit={handleSaveManualAttendance} className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="col-span-1 sm:col-span-2">
                  <label className="label">Select Employee</label>
                  <select 
                    className="input-field" 
                    value={manualFormData.employee_id} 
                    onChange={e => setManualFormData({...manualFormData, employee_id: e.target.value})}
                    required
                  >
                    <option value="" disabled>-- Choose Staff Member --</option>
                    {employeesList.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.role.toUpperCase()})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Date</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={manualFormData.date} 
                    onChange={e => setManualFormData({...manualFormData, date: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <label className="label">Shift Type</label>
                  <select 
                    className="input-field" 
                    value={manualFormData.shift_type} 
                    onChange={e => setManualFormData({...manualFormData, shift_type: e.target.value})}
                  >
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>
                <div>
                  <label className="label">Check In Time</label>
                  <input 
                    type="time" 
                    className="input-field" 
                    value={manualFormData.check_in_time} 
                    onChange={e => setManualFormData({...manualFormData, check_in_time: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <label className="label">Check Out Time (Optional)</label>
                  <input 
                    type="time" 
                    className="input-field" 
                    value={manualFormData.check_out_time} 
                    onChange={e => setManualFormData({...manualFormData, check_out_time: e.target.value})}
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 pt-4 flex gap-4">
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    {saving ? 'SAVING...' : 'SAVE ATTENDANCE'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-xs font-black text-slate-500 uppercase tracking-widest border border-white/5 rounded-xl">
                    CANCEL
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attendance;
