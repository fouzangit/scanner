import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QRScanner from '../../components/QRScanner';
import SuccessPopup from '../../components/SuccessPopup';
import ErrorPopup from '../../components/ErrorPopup';
import { attendanceService } from '../../services/attendanceService';
import { authService } from '../../services/authService';

const Scanner = () => {
  const [employee, setEmployee] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('Align QR to mark attendance');
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) navigate('/app/login');
    setEmployee(user);
  }, []);

  const handleScan = async (data) => {
    if (loading || !isScanning) return;
    
    // We expect a specific QR code content or just "CLINIC_PULSE_OFFICE"
    if (data !== 'CLINIC_PULSE_OFFICE') {
      setStatusMsg('Invalid QR Code. Please scan office QR.');
      setTimeout(() => setStatusMsg('Align QR to mark attendance'), 3000);
      return;
    }

    setLoading(true);
    setIsScanning(false);
    setStatusMsg('Validating Location...');

    try {
      const result = await attendanceService.markAttendance(employee);
      
      if (result.type === 'checkout') {
        setSuccessMsg(`Check-out successful for your ${employee.shift_type} shift!`);
      } else {
        setSuccessMsg(`Check-in successful for your ${employee.shift_type} shift!`);
      }
      
      setShowSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setShowError(true);
      setIsScanning(true);
      setLoading(false);
      setStatusMsg('Align QR to mark attendance');
    }
  };

  if (!employee) return null;

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-white">Hello, {employee?.name ? employee.name.split(' ')[0] : 'Employee'}</h2>
          <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">
            {employee?.role || ''} • {employee?.shift_type || ''} Shift
          </p>
        </div>
        <Link to="/app/history" className="w-12 h-12 glass-card flex items-center justify-center text-xl">
          🕒
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center relative -mx-6">
        <div className="relative z-0">
          <QRScanner onScan={handleScan} isScanning={isScanning} />
          
          <AnimatePresence>
            {loading && !showSuccess && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center z-20"
              >
                <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-6 shadow-glow"></div>
                <p className="text-xl font-black text-white tracking-widest animate-pulse uppercase">VALIDATING...</p>
                <p className="text-slate-500 text-sm mt-2">{statusMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-10 left-0 right-0 text-center z-10 px-10">
          <p className="text-white font-bold bg-black/40 backdrop-blur-md py-3 px-6 rounded-2xl border border-white/5 inline-block mb-4 shadow-glass">
            {statusMsg}
          </p>
          {!isScanning && !loading && (
            <button 
              onClick={() => setIsScanning(true)}
              className="btn-primary w-full shadow-glow-brand"
            >
              RESUME SCANNER
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 p-6 glass-card bg-brand-600/10 border-brand-500/20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center text-xl">
            📍
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Office Location</p>
            <p className="text-sm font-bold text-white">Clinic Headquarters, Downtown</p>
          </div>
        </div>
      </div>

      <SuccessPopup 
        isOpen={showSuccess} 
        onClose={() => {
          setShowSuccess(false);
          setIsScanning(true);
          setLoading(false);
          setStatusMsg('Align QR to mark attendance');
        }}
        title="Attendance Marked!"
        message={successMsg}
      />

      <ErrorPopup 
        isOpen={showError} 
        onClose={() => {
          setShowError(false);
          setIsScanning(true);
          setLoading(false);
          setStatusMsg('Align QR to mark attendance');
        }}
        title="Validation Failed"
        message={errorMsg}
      />
    </div>
  );
};

export default Scanner;
