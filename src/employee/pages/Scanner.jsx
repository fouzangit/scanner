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
  const [scanType, setScanType] = useState('checkin'); // 'checkin' or 'checkout'
  const [activeScanner, setActiveScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) navigate('/app/login');
    setEmployee(user);
  }, []);

  const getPlaceholderMsg = (type = scanType) => {
    return type === 'checkin' ? 'Align QR to Check In' : 'Align QR to Check Out';
  };

  useEffect(() => {
    if (!statusMsg || statusMsg.startsWith('Align QR')) {
      setStatusMsg(getPlaceholderMsg());
    }
  }, [scanType]);

  const handleScan = async (data) => {
    if (loading || !isScanning) return;
    
    // We expect a specific QR code content or just "CLINIC_PULSE_OFFICE"
    if (data !== 'CLINIC_PULSE_OFFICE') {
      setStatusMsg('Invalid QR Code. Please scan office QR.');
      setTimeout(() => setStatusMsg(getPlaceholderMsg()), 3000);
      return;
    }

    // Immediately stop scanner stream and unmount to prevent race-condition loops
    setIsScanning(false);
    setActiveScanner(false);
    
    setLoading(true);
    setStatusMsg('Validating Location...');

    try {
      const result = await attendanceService.markAttendance(employee, scanType);
      
      if (result.type === 'checkout') {
        setSuccessMsg(`Check-out successful for your ${employee?.shift_type || ''} shift!`);
      } else {
        setSuccessMsg(`Check-in successful for your ${employee?.shift_type || ''} shift!`);
      }
      
      setShowSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setShowError(true);
      setLoading(false);
      setStatusMsg(getPlaceholderMsg());
    }
  };

  if (!employee) return null;

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
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

      {/* Tabs for Check In / Check Out */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5 mb-6 relative">
        <button
          onClick={() => {
            if (!loading) {
              setScanType('checkin');
            }
          }}
          className={`flex-1 py-3 text-xs font-black tracking-widest uppercase transition-all rounded-xl relative z-10 ${
            scanType === 'checkin' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Check In
          {scanType === 'checkin' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-brand-600 rounded-xl -z-10 shadow-glow shadow-brand-600/30"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </button>
        <button
          onClick={() => {
            if (!loading) {
              setScanType('checkout');
            }
          }}
          className={`flex-1 py-3 text-xs font-black tracking-widest uppercase transition-all rounded-xl relative z-10 ${
            scanType === 'checkout' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Check Out
          {scanType === 'checkout' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-amber-600 rounded-xl -z-10 shadow-glow shadow-amber-600/30"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center relative -mx-6">
        <div className="relative z-0">
          {activeScanner ? (
            <div className="relative">
              <QRScanner onScan={handleScan} isScanning={isScanning} />
              <button
                onClick={() => {
                  setActiveScanner(false);
                  setIsScanning(false);
                }}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center z-30 border border-white/10 backdrop-blur-md transition-all text-lg font-black"
                title="Cancel Scan"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto aspect-[3/4] bg-slate-900/30 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-8 backdrop-blur-sm text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none" />
              <div className="w-24 h-24 bg-brand-500/10 text-brand-400 rounded-[32px] border border-brand-500/20 flex items-center justify-center text-4xl mb-8 shadow-glow shadow-brand-500/10 animate-pulse relative z-10">
                📷
              </div>
              <h3 className="text-xl font-black text-white mb-2 relative z-10 uppercase tracking-wider">Ready to Scan</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8 relative z-10">
                Ensure you are at the clinic and tap below to start the camera verification.
              </p>
              <button
                onClick={() => {
                  setActiveScanner(true);
                  setIsScanning(true);
                }}
                className="btn-primary px-10 shadow-glow-brand uppercase tracking-widest text-xs font-black py-4 relative z-10"
              >
                Tap to Scan QR Code
              </button>
            </div>
          )}
          
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

        {activeScanner && (
          <div className="absolute bottom-10 left-0 right-0 text-center z-10 px-10">
            <p className="text-white text-sm font-bold bg-black/60 backdrop-blur-md py-3 px-6 rounded-2xl border border-white/5 inline-block mb-4 shadow-glass">
              {statusMsg}
            </p>
          </div>
        )}
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
          setLoading(false);
          setStatusMsg(getPlaceholderMsg());
        }}
        title="Attendance Marked!"
        message={successMsg}
      />

      <ErrorPopup 
        isOpen={showError} 
        onClose={() => {
          setShowError(false);
          setLoading(false);
          setStatusMsg(getPlaceholderMsg());
        }}
        title="Validation Failed"
        message={errorMsg}
      />
    </div>
  );
};

export default Scanner;
