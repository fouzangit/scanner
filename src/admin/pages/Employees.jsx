import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../services/supabase';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', role: 'assistant', shift_type: 'morning', 
    hourly_rate: '', monthly_salary: '', joining_date: new Date().toISOString().split('T')[0],
    allow_multiple_devices: false
  });

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    const { data } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
    if (data) setEmployees(data);
    setLoading(false);
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from('employees').update(formData).eq('id', editingId);
      if (!error) { setShowModal(false); setEditingId(null); fetchEmployees(); }
      else alert(error.message);
    } else {
      const { error } = await supabase.from('employees').insert([formData]);
      if (!error) { setShowModal(false); fetchEmployees(); }
      else alert(error.message);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Delete this employee?')) {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (!error) fetchEmployees();
      else alert(error.message);
    }
  };

  const handleResetDevice = async (id) => {
    if (window.confirm('Reset device lock for this employee?')) {
      const { error } = await supabase.from('employees').update({ device_id: null }).eq('id', id);
      if (!error) { alert('Device lock reset!'); fetchEmployees(); }
      else alert(error.message);
    }
  };

  const openAdd = () => {
    setFormData({ name: '', phone: '', role: 'assistant', shift_type: 'morning', hourly_rate: '', monthly_salary: '', joining_date: new Date().toISOString().split('T')[0], allow_multiple_devices: false });
    setEditingId(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h3 className="text-2xl md:text-3xl font-black">Employees</h3>
          <p className="text-slate-500 mt-1 text-sm hidden sm:block">Manage your clinic staff</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap">
          <span className="text-lg">+</span> <span className="hidden sm:inline">ADD NEW</span> STAFF
        </button>
      </div>

      {/* Mobile Cards view */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse"><div className="h-5 bg-white/5 rounded w-3/4 mb-2" /><div className="h-4 bg-white/5 rounded w-1/2" /></div>
          ))
        ) : employees.map((emp) => (
          <div key={emp.id} className="glass-card p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-white">{emp.name}</p>
                <p className="text-xs text-slate-500">{emp.phone}</p>
              </div>
              <span className={`badge ${emp.role === 'doctor' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-brand-500/10 text-brand-400'}`}>
                {emp.role}
              </span>
            </div>
            <div className="flex gap-4 text-xs text-slate-400">
              <span className="uppercase font-bold">{emp.shift_type} shift</span>
              <span>₹{emp.hourly_rate}/hr</span>
              <span>₹{emp.monthly_salary}/mo</span>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setFormData(emp); setEditingId(emp.id); setShowModal(true); }}
                className="flex-1 py-2 text-xs font-bold border border-white/10 rounded-lg hover:bg-white/5 text-slate-300">
                Edit
              </button>
              <button onClick={() => handleResetDevice(emp.id)}
                className="flex-1 py-2 text-xs font-bold border border-amber-500/20 rounded-lg hover:bg-amber-500/10 text-amber-400">
                Reset Device
              </button>
              <button onClick={() => handleDeleteEmployee(emp.id)}
                className="flex-1 py-2 text-xs font-bold border border-red-500/20 rounded-lg hover:bg-red-500/10 text-red-400">
                Delete
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
              {['Name', 'Role', 'Shift', 'Hourly Rate', 'Monthly', 'Actions'].map(h => (
                <th key={h} className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="6" className="p-10"><div className="h-6 bg-white/5 rounded w-full" /></td>
                </tr>
              ))
            ) : employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-white/5 transition-all">
                <td className="p-6"><p className="font-bold text-white">{emp.name}</p><p className="text-xs text-slate-500">{emp.phone}</p></td>
                <td className="p-6"><span className={`badge ${emp.role === 'doctor' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-brand-500/10 text-brand-400'}`}>{emp.role}</span></td>
                <td className="p-6 text-sm font-medium uppercase tracking-widest text-slate-300">{emp.shift_type}</td>
                <td className="p-6 text-sm font-bold">₹{emp.hourly_rate}</td>
                <td className="p-6 text-sm font-bold">₹{emp.monthly_salary}</td>
                <td className="p-6 flex gap-3">
                  <button onClick={() => { setFormData(emp); setEditingId(emp.id); setShowModal(true); }} className="text-slate-400 hover:text-white text-sm">Edit</button>
                  <button onClick={() => handleResetDevice(emp.id)} className="text-amber-500/60 hover:text-amber-400 text-sm">Reset</button>
                  <button onClick={() => handleDeleteEmployee(emp.id)} className="text-red-500/60 hover:text-red-400 text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
              className="relative glass-card p-6 md:p-10 w-full sm:max-w-2xl bg-slate-900 shadow-glow rounded-b-none sm:rounded-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl md:text-2xl font-black mb-6 md:mb-8">{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
              <form onSubmit={handleSaveEmployee} className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input-field" value={formData.name || ''} required onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input className="input-field" value={formData.phone || ''} required onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="label">Role</label>
                  <select className="input-field" value={formData.role || 'assistant'} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="assistant">Assistant</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>
                <div>
                  <label className="label">Shift</label>
                  <select className="input-field" value={formData.shift_type || 'morning'} onChange={e => setFormData({...formData, shift_type: e.target.value})}>
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                    <option value="both">Both (Full Day)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Hourly Rate (₹)</label>
                  <input type="number" className="input-field" value={formData.hourly_rate || ''} required onChange={e => setFormData({...formData, hourly_rate: e.target.value})} />
                </div>
                <div>
                  <label className="label">Monthly Salary (₹)</label>
                  <input type="number" className="input-field" value={formData.monthly_salary || ''} required onChange={e => setFormData({...formData, monthly_salary: e.target.value})} />
                </div>
                <div className="col-span-1 sm:col-span-2 flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                  <input type="checkbox" id="allow_multiple" className="w-5 h-5 accent-brand-500"
                    checked={formData.allow_multiple_devices || false}
                    onChange={e => setFormData({...formData, allow_multiple_devices: e.target.checked})} />
                  <div>
                    <label htmlFor="allow_multiple" className="font-bold text-white text-sm cursor-pointer">Allow Multiple Devices</label>
                    <p className="text-xs text-slate-500">If unchecked, locked to first device they log in on.</p>
                  </div>
                </div>
                <div className="col-span-1 sm:col-span-2 pt-2 flex gap-4">
                  <button type="submit" className="btn-primary flex-1">{editingId ? 'UPDATE' : 'CREATE'} ACCOUNT</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-xs font-black text-slate-500 uppercase tracking-widest border border-white/5 rounded-xl">CANCEL</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Employees;
