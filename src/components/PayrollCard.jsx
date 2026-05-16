import React from 'react';
import { formatCurrency } from '../utils/payrollUtils';

const PayrollCard = ({ payroll }) => {
  return (
    <div className="glass-card p-6 border-l-4 border-brand-500 hover:translate-x-1 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-lg font-bold text-white">{payroll.employee_name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20">
              {payroll.role}
            </span>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
              • {payroll.shift_type} Shift
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Final Salary</p>
          <p className="text-2xl font-black text-white">{formatCurrency(payroll.finalSalary)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Working Days</p>
          <p className="text-lg font-bold">{payroll.totalWorkingDays}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Late Mins</p>
          <p className="text-lg font-bold text-amber-500">{payroll.totalLateMinutes}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Deductions</p>
          <p className="text-lg font-bold text-red-500">-{formatCurrency(payroll.totalDeductions)}</p>
        </div>
      </div>
      
      <div className="mt-6 flex gap-3">
        <button className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold transition-all border border-white/5">
          VIEW DETAILS
        </button>
        <button className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold transition-all border border-white/5">
          DOWNLOAD PDF
        </button>
      </div>
    </div>
  );
};

export default PayrollCard;
