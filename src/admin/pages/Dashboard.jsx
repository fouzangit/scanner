import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
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
      const totalDeductions = data.reduce((acc, r) => acc + r.deduction_amount, 0);
      
      setStats({
        present: data.length,
        late: lateCount,
        absent: 5, // Placeholder - would calculate from total employees - present
        deductions: totalDeductions,
        history: data // Simplified for demo
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
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Present Today', value: stats.present, color: 'text-green-500', icon: '✅' },
          { label: 'Late Entries', value: stats.late, color: 'text-amber-500', icon: '🕒' },
          { label: 'Absent', value: stats.absent, color: 'text-red-500', icon: '❌' },
          { label: 'Deductions Today', value: formatCurrency(stats.deductions), color: 'text-white', icon: '💰' },
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Live Updates</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">{item.label}</p>
            <p className={`text-3xl font-black mt-1 ${item.color}`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="col-span-2 glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Attendance Trends</h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs font-bold outline-none">
              <option>LAST 7 DAYS</option>
              <option>LAST 30 DAYS</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
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
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold mb-8">Recent Activity</h3>
          <div className="space-y-6">
            {stats.history.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No activity yet today</p>
            ) : (
              stats.history.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${log.late_minutes > 0 ? 'bg-amber-500 shadow-glow shadow-amber-500/50' : 'bg-green-500'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{log.employees?.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                      {new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.shift_type}
                    </p>
                  </div>
                  {log.late_minutes > 0 && (
                    <span className="text-[10px] font-black text-red-500">-{formatCurrency(log.deduction_amount)}</span>
                  )}
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-8 py-3 text-xs font-black text-brand-400 border border-brand-500/20 rounded-xl hover:bg-brand-500/10 transition-all uppercase tracking-widest">
            View All Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
