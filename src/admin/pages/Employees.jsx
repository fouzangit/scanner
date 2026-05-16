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

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
    if (data) setEmployees(data);
    setLoading(false);
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from('employees').update(formData).eq('id', editingId);
      if (!error) {
        setShowModal(false);
        setEditingId(null);
        fetchEmployees();
      } else {
        alert(error.message);
      }
    } else {
      const { error } = await supabase.from('employees').insert([formData]);
      if (!error) {
        setShowModal(false);
        fetchEmployees();
      } else {
        alert(error.message);
      }
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (!error) {
        fetchEmployees();
      } else {
        alert(error.message);
      }
    }
  };

  const handleResetDevice = async (id) => {
    if (window.confirm("Are you sure you want to reset the device lock for this employee? They will need to log in again on their device.")) {
      const { error } = await supabase.from('employees').update({ device_id: null }).eq('id', id);
      if (!error) {
        alert("Device lock reset successfully!");
        fetchEmployees();
      } else {
        alert(error.message);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black">Employees</h3>
          <p className="text-slate-500 mt-1">Manage your clinic staff and their roles</p>
        </div>
        <button 
          onClick={() => {
            setFormData({
              name: '', phone: '', role: 'assistant', shift_type: 'morning', 
              hourly_rate: '', monthly_salary: '', joining_date: new Date().toISOString().split('T')[0], allow_multiple_devices: false
            });
            setEditingId(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-xl">+</span> ADD NEW STAFF
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Name</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Shift</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Hourly Rate</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Monthly</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="6" className="p-10"><div className="h-6 bg-white/5 rounded w-full"></div></td>
                </tr>
              ))
            ) : employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-white/5 transition-all">
                <td className="p-6">
                  <p className="font-bold text-white">{emp.name}</p>
                  <p className="text-xs text-slate-500">{emp.phone}</p>
                </td>
                <td className="p-6">
                  <span className={`badge ${emp.role === 'doctor' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-brand-500/10 text-brand-400'}`}>
                    {emp.role}
                  </span>
                </td>
                <td className="p-6 text-sm font-medium uppercase tracking-widest text-slate-300">{emp.shift_type}</td>
                <td className="p-6 text-sm font-bold">₹{emp.hourly_rate}</td>
                <td className="p-6 text-sm font-bold">₹{emp.monthly_salary}</td>
                <td className="p-6">
                  <button 
                    onClick={() => {
                      setFormData(emp);
                      setEditingId(emp.id);
                      setShowModal(true);
                    }}
                    className="text-slate-500 hover:text-white mr-4"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleResetDevice(emp.id)}
                    className="text-amber-500/50 hover:text-amber-500 mr-4"
                    title="Unlock so they can login on a new device"
                  >
                    Reset Device
                  </button>
                  <button 
                    onClick={() => handleDeleteEmployee(emp.id)}
                    className="text-red-500/50 hover:text-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass-card p-10 w-full max-w-2xl bg-slate-900 shadow-glow"
            >
              <h3 className="text-2xl font-black mb-8">{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
              <form onSubmit={handleSaveEmployee} className="grid grid-cols-2 gap-6">
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
                <div className="col-span-2 flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10 mt-2">
                  <input 
                    type="checkbox" 
                    id="allow_multiple" 
                    className="w-5 h-5 rounded border-white/20 bg-black/50 accent-brand-500"
                    checked={formData.allow_multiple_devices || false}
                    onChange={e => setFormData({...formData, allow_multiple_devices: e.target.checked})} 
                  />
                  <div>
                    <label htmlFor="allow_multiple" className="font-bold text-white text-sm cursor-pointer">Allow Multiple Devices</label>
                    <p className="text-xs text-slate-500">If unchecked, they will be permanently locked to the first device they log into.</p>
                  </div>
                </div>
                <div className="col-span-2 pt-4 flex gap-4">
                  <button type="submit" className="btn-primary flex-1">{editingId ? 'UPDATE ACCOUNT' : 'CREATE ACCOUNT'}</button>
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
