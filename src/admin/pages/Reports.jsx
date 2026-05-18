import React from 'react';
import { motion } from 'framer-motion';

const Reports = () => {
  return (
    <div className="space-y-6 md:space-y-10">
      <div>
        <h3 className="text-2xl md:text-3xl font-black">Monthly Reports</h3>
        <p className="text-slate-500 mt-1 text-sm hidden sm:block">Download and analyze long-term performance data</p>
      </div>

      {/* Report Cards - 1 col mobile, 3 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        {[
          { title: 'Attendance Summary', desc: 'Overview of present/late counts for all staff.', color: 'border-blue-500', icon: '📊' },
          { title: 'Deduction Analysis', desc: 'Breakdown of salary cuts across departments.', color: 'border-red-500', icon: '💸' },
          { title: 'Staff Performance', desc: 'Ranking employees by punctuality and hours.', color: 'border-green-500', icon: '🏆' },
        ].map((report, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass-card p-6 md:p-8 border-t-4 ${report.color}`}
          >
            <span className="text-3xl mb-4 block">{report.icon}</span>
            <h4 className="text-base md:text-xl font-bold mb-2">{report.title}</h4>
            <p className="text-slate-500 text-sm mb-6 md:mb-8">{report.desc}</p>
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest border border-white/5 transition-all">
                Preview
              </button>
              <button className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl text-xs font-black uppercase tracking-widest shadow-glow shadow-brand-600/20 transition-all">
                Download
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Exports */}
      <div className="glass-card p-5 md:p-10">
        <h4 className="text-base md:text-xl font-black mb-6 md:mb-10 uppercase tracking-widest">Recent Exports</h4>
        <div className="space-y-2 md:space-y-4">
          {[
            { name: 'Payroll_May_2026.pdf', date: '15 May 2026', size: '2.4 MB' },
            { name: 'Attendance_Q2_Summary.csv', date: '12 May 2026', size: '1.1 MB' },
            { name: 'Late_Report_April.pdf', date: '01 May 2026', size: '840 KB' },
          ].map((file, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 md:p-4 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <span className="text-xl md:text-2xl flex-shrink-0">📄</span>
                <div className="min-w-0">
                  <p className="font-bold text-sm md:text-base truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{file.date} • {file.size}</p>
                </div>
              </div>
              <button className="text-brand-400 font-bold text-xs uppercase hover:underline flex-shrink-0 ml-2">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
