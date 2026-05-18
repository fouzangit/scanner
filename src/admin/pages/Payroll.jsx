import React, { useState } from 'react';
import { payrollService } from '../../services/payrollService';
import PayrollCard from '../../components/PayrollCard';

const Payroll = () => {
  const [payrollList, setPayrollList] = useState([]);
  const [loading, setLoading] = useState(false);
  const today = new Date();
  const startStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  const endStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [dateRange, setDateRange] = useState({ start: startStr, end: endStr });

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
    <div className="space-y-6 md:space-y-10">
      <div>
        <h3 className="text-2xl md:text-3xl font-black">Payroll Generator</h3>
        <p className="text-slate-500 mt-1 text-sm hidden sm:block">Automatic salary calculation with late deductions</p>
      </div>

      {/* Date Range Picker - stacks on mobile */}
      <div className="glass-card p-4 md:p-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
        <div className="flex-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Start Date</label>
          <input
            type="date"
            className="input-field"
            value={dateRange.start}
            onChange={e => setDateRange({...dateRange, start: e.target.value})}
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">End Date</label>
          <input
            type="date"
            className="input-field"
            value={dateRange.end}
            onChange={e => setDateRange({...dateRange, end: e.target.value})}
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary px-8 whitespace-nowrap"
        >
          {loading ? 'GENERATING...' : '⚡ GENERATE PAYROLL'}
        </button>
      </div>

      {payrollList.length === 0 ? (
        <div className="py-20 md:py-40 flex flex-col items-center justify-center glass-card border-dashed border-white/10 opacity-50">
          <span className="text-5xl md:text-6xl mb-4 md:mb-6">📂</span>
          <p className="text-base md:text-xl font-bold text-center px-4">Select date range to generate payroll</p>
          <p className="text-sm text-slate-500 mt-2 text-center px-4">The system will automatically calculate hours and deductions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {payrollList.map((payroll) => (
            <PayrollCard key={payroll.employee_id} payroll={payroll} />
          ))}
        </div>
      )}

      {payrollList.length > 0 && (
        <div className="flex justify-center pt-4 md:pt-10">
          <button
            onClick={() => window.print()}
            className="px-8 md:px-10 py-4 glass-card border-brand-500/20 text-brand-400 font-black uppercase tracking-[0.2em] text-xs hover:bg-brand-500/10 transition-all"
          >
            🖨️ PRINT / EXPORT PAYROLL
          </button>
        </div>
      )}
    </div>
  );
};

export default Payroll;
