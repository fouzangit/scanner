import React, { useState, useEffect } from 'react';
import { payrollService } from '../../services/payrollService';
import PayrollCard from '../../components/PayrollCard';

const Payroll = () => {
  const [payrollList, setPayrollList] = useState([]);
  const [loading, setLoading] = useState(false);
  const today = new Date();
  const startStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  const endStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [dateRange, setDateRange] = useState({
    start: startStr,
    end: endStr
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await payrollService.generatePayroll(dateRange.start, dateRange.end);
      setPayrollList(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-3xl font-black">Payroll Generator</h3>
          <p className="text-slate-500 mt-1">Automatic salary calculation with late deductions</p>
        </div>
        <div className="flex gap-4 p-2 glass-card border-white/5">
          <div className="px-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Start Date</label>
            <input 
              type="date" 
              className="bg-transparent text-sm font-bold outline-none border-none p-0 text-white" 
              value={dateRange.start}
              onChange={e => setDateRange({...dateRange, start: e.target.value})}
            />
          </div>
          <div className="w-[1px] bg-white/10 my-2"></div>
          <div className="px-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">End Date</label>
            <input 
              type="date" 
              className="bg-transparent text-sm font-bold outline-none border-none p-0 text-white" 
              value={dateRange.end}
              onChange={e => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary ml-4 px-8"
          >
            {loading ? 'GENERATING...' : 'GENERATE'}
          </button>
        </div>
      </div>

      {payrollList.length === 0 ? (
        <div className="py-40 flex flex-col items-center justify-center glass-card border-dashed border-white/10 opacity-50">
          <span className="text-6xl mb-6">📂</span>
          <p className="text-xl font-bold">Select date range to generate payroll</p>
          <p className="text-sm text-slate-500 mt-2">The system will automatically calculate hours and deductions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-8 animate-fade-in">
          {payrollList.map((payroll) => (
            <PayrollCard key={payroll.employee_id} payroll={payroll} />
          ))}
        </div>
      )}

      {payrollList.length > 0 && (
        <div className="flex justify-center pt-10">
          <button className="px-10 py-4 glass-card border-brand-500/20 text-brand-400 font-black uppercase tracking-[0.2em] text-xs hover:bg-brand-500/10 transition-all shadow-glow shadow-brand-500/10">
            EXPORT ALL PAYROLL (PDF)
          </button>
        </div>
      )}
    </div>
  );
};

export default Payroll;
