import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (localStorage.getItem('clinic_employee')) {
      navigate('/app');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(phone);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Invalid phone number. Please contact admin.');
    } finally {
      setLoading(false);
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
          <span className="text-4xl font-black text-white">CP</span>
        </div>
        
        <h1 className="text-4xl font-black text-white mb-2">ClinicPulse</h1>
        <p className="text-slate-400 mb-12">Smart Attendance System</p>

        <form onSubmit={handleLogin} className="space-y-6 text-left">
          <div className="glass-card p-8 bg-white/5 border-white/10">
            <label className="label">Phone Number</label>
            <input 
              type="tel" 
              placeholder="e.g. 9876543210"
              className="input-field mb-4"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            
            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
            
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>SIGN IN <span>→</span></>
              )}
            </button>
          </div>
        </form>

        <p className="mt-12 text-slate-500 text-sm">
          Protected by Enterprise Security
        </p>

        <Link to="/admin" className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-brand-400 transition-all block">
          ⚙️ Admin Portal
        </Link>
      </motion.div>
      
      {/* Decorative Blur Blobs */}
      <div className="fixed -top-24 -left-24 w-64 h-64 bg-brand-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
};

export default Login;
