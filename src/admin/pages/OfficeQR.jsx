import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const OfficeQR = () => {
  // The secret string that the employee app looks for
  const qrValue = 'CLINIC_PULSE_OFFICE';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10 bg-mesh overflow-hidden relative">
      <Link to="/admin" className="absolute top-10 left-10 text-slate-500 hover:text-white transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
        <span>←</span> Back to Dashboard
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="mb-10">
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">OFFICE SCANNER</h1>
          <p className="text-slate-400 font-medium">Scan this code using the ClinicPulse PWA to mark your attendance</p>
        </div>

        <div className="relative p-12 bg-white rounded-[40px] shadow-glow shadow-white/10 group">
          {/* Animated corner borders */}
          <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-brand-500 rounded-tl-xl"></div>
          <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-brand-500 rounded-tr-xl"></div>
          <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-brand-500 rounded-bl-xl"></div>
          <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-brand-500 rounded-br-xl"></div>

          <QRCodeCanvas 
            value={qrValue} 
            size={300}
            level="H"
            includeMargin={false}
            imageSettings={{
              src: "/favicon.svg",
              x: undefined,
              y: undefined,
              height: 40,
              width: 40,
              excavate: true,
            }}
          />
        </div>

        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-glow shadow-green-500"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Scanner Active</span>
          </div>
          <button 
            onClick={() => window.print()}
            className="text-[10px] font-black text-brand-400 hover:text-brand-300 uppercase tracking-widest transition-all"
          >
            Download / Print
          </button>
        </div>
      </motion.div>

      {/* Decorative Blur Blobs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
};

export default OfficeQR;
