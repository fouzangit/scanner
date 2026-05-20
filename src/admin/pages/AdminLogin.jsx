import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (localStorage.getItem('clinic_admin_token') === 'true') {
      navigate('/admin');
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple admin password for this MVP (can be moved to Supabase later)
    if (password === 'admin123') {
      localStorage.setItem('clinic_admin_token', 'true');
      navigate('/admin');
    } else {
      setError('Invalid Admin Password');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 bg-mesh overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center z-10"
      >
        <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow border border-white/10 transform rotate-3">
          <span className="text-3xl font-black text-white">⚙️</span>
        </div>
        
        <h1 className="text-3xl font-black text-white mb-2">Clinic Admin</h1>
        <p className="text-slate-500 mb-10 text-sm">Secure Management Portal</p>

        <form onSubmit={handleLogin} className="space-y-6 text-left">
          <div className="glass-card p-8 bg-slate-900/80 border-white/10">
            <label className="label">Admin Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="input-field mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            {error && <p className="text-red-400 text-sm mb-4 text-center font-bold">{error}</p>}
            
            <button 
              type="submit" 
              className="btn-primary w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 shadow-none text-white border border-white/10"
            >
              ACCESS DASHBOARD <span>→</span>
            </button>
          </div>
        </form>
      </motion.div>
      
      {/* Decorative Blur Blobs */}
      <div className="fixed -top-32 -right-32 w-96 h-96 bg-slate-800/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-slate-900/60 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
};

export default AdminLogin;
