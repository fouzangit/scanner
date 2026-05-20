import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';

const Login = () => {
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' or 'admin'
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    // If opening page, check if already logged in to redirect appropriately
    if (sessionStorage.getItem('clinic_admin_token') === 'true') {
      navigate('/admin');
    } else if (localStorage.getItem('clinic_employee')) {
      navigate('/app');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (activeTab === 'staff') {
      try {
        await authService.login(phone);
        navigate('/app');
      } catch (err) {
        setError(err.message || 'Invalid phone number. Please contact admin.');
      } finally {
        setLoading(false);
      }
    } else {
      setTimeout(() => { // small delay for nice animation feel
        if (password === 'radent@2026!') {
          sessionStorage.setItem('clinic_admin_token', 'true');
          navigate('/admin');
        } else {
          setError('Invalid Admin Password');
        }
        setLoading(false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 bg-mesh overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-24 h-24 bg-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-glow shadow-brand-600/40 transform -rotate-6">
          <span className="text-4xl font-black text-white">RC</span>
        </div>
        
        <h1 className="text-4xl font-black text-white mb-2">Radent Clinic</h1>
        <p className="text-slate-400 mb-10">Smart Attendance System</p>

        <form onSubmit={handleLogin} className="space-y-6 text-left">
          <div className="glass-card p-8 bg-white/5 border-white/10">
            {/* Tab Switcher */}
            <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
              <button 
                type="button"
                onClick={() => { setActiveTab('staff'); setError(''); }}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === 'staff' 
                    ? 'bg-brand-600 text-white shadow-glow shadow-brand-600/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Staff
              </button>
              <button 
                type="button"
                onClick={() => { setActiveTab('admin'); setError(''); }}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === 'admin' 
                    ? 'bg-slate-800 text-white border border-white/10' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Admin
              </button>
            </div>

            {activeTab === 'staff' ? (
              <div>
                <label className="label">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="e.g. 9876543210"
                  className="input-field mb-4"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div>
                <label className="label">Admin Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="input-field mb-4"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
            
            {error && <p className="text-red-400 text-sm mb-4 text-center font-bold">{error}</p>}
            
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-4 text-sm font-black rounded-xl transition-all ${
                activeTab === 'admin' 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border border-white/10' 
                  : 'btn-primary'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>{activeTab === 'staff' ? 'SIGN IN' : 'ACCESS DASHBOARD'} <span>→</span></>
              )}
            </button>
          </div>
        </form>

        <p className="mt-12 text-slate-500 text-sm">
          Protected by Enterprise Security
        </p>
      </motion.div>
      
      {/* Decorative Blur Blobs */}
      <div className="fixed -top-24 -left-24 w-64 h-64 bg-brand-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
};

export default Login;
