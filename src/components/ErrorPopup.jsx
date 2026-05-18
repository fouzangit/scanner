import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ErrorPopup = ({ isOpen, onClose, title, message }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative glass-card p-8 w-full max-w-sm text-center shadow-glow shadow-red-500/10 border-red-500/20"
          >
            <div className="w-20 h-20 bg-red-500/15 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow shadow-red-500/10">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">{title || 'Oops!'}</h3>
            <p className="text-slate-400 mb-8 text-sm leading-relaxed whitespace-pre-line">{message}</p>
            
            <button
              onClick={onClose}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ErrorPopup;
