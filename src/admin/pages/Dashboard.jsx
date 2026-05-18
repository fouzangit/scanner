import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { attendanceService } from '../../services/attendanceService';
import { formatCurrency } from '../../utils/payrollUtils';

const Dashboard = () => {
  const [stats, setStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    deductions: 0,
    history: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await attendanceService.getDailyStats();
      const lateCount = data.filter(r => r.late_minutes > 0).length;
      const totalDeductions = data.reduce((acc, r) => acc + (r.deduction_amount || 0), 0);
      
      setStats({
        present: data.length,
        late: lateCount,
        absent: 0,
        deductions: totalDeductions,
        history: data
      });
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = [
    { name: 'Mon', present: 12, late: 2 },
    { name: 'Tue', present: 15, late: 4 },
    { name: 'Wed', present: 10, late: 1 },
    { name: 'Thu', present: 14, late: 3 },
    { name: 'Fri', present: 16, late: 2 },
    { name: 'Sat', present: 8, late: 0 },
  ];

  return (
    <div className="space-y-6 md:space-y-10">
      {/* Stats Grid - 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {[
          { label: 'Present Today', value: stats.present, color: 'text-green-400', icon: '✅' },
          { label: 'Late Entries', value: stats.late, color: 'text-amber-400', icon: '🕒' },
          { label: 'Absent', value: stats.absent, color: 'text-red-400', icon: '❌' },
          { label: 'Deductions', value: formatCurrency(stats.deductions), color: 'text-white', icon: '💰' },
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-4 md:p-6"
          >
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <span className="text-xl md:text-2xl">{item.icon}</span>
              <span className="text-[9px] md:text-[10px] uppercase font-black text-slate-500 tracking-widest hidden sm:block">Live</span>
            </div>
            <p className="text-slate-400 text-xs md:text-sm font-medium">{item.label}</p>
            <p className={`text-xl md:text-3xl font-black mt-1 ${item.color}`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart + Activity - stack on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        {/* Main Chart */}
        <div className="md:col-span-2 glass-card p-4 md:p-8">
          <div className="flex justify-between items-center mb-4 md:mb-8">
            <h3 className="text-base md:text-xl font-bold">Attendance Trends</h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-bold outline-none">
              <option>LAST 7 DAYS</option>
              <option>LAST 30 DAYS</option>
            </select>
          </div>
          <div className="h-[200px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={25} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="present" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-4 md:p-8">
          <h3 className="text-base md:text-xl font-bold mb-4 md:mb-8">Recent Activity</h3>
          <div className="space-y-4 md:space-y-6">
            {stats.history.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No activity yet today</p>
            ) : (
              stats.history.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center gap-3 md:gap-4">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.late_minutes > 0 ? 'bg-amber-500' : 'bg-green-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{log.employees?.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                      {new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.shift_type}
                    </p>
                  </div>
                  {log.late_minutes > 0 && (
                    <span className="text-[10px] font-black text-red-500 flex-shrink-0">-{formatCurrency(log.deduction_amount)}</span>
                  )}
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-6 md:mt-8 py-3 text-xs font-black text-brand-400 border border-brand-500/20 rounded-xl hover:bg-brand-500/10 transition-all uppercase tracking-widest">
            View All Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
