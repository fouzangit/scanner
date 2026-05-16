import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';

const QRScanner = ({ onScan, isScanning }) => {
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isScanning) {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
      return;
    }

    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;

    const config = { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };

    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length > 0) {
        let cameraId = devices[0].id;
        const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
        if (backCamera) cameraId = backCamera.id;

        html5QrCode.start(
          cameraId, 
          config, 
          (decodedText) => {
            if (navigator.vibrate) navigator.vibrate(100);
            onScan(decodedText);
          },
          (errorMessage) => {}
        ).catch(err => {
          setError("Failed to start camera.");
          console.error(err);
        });
      } else {
        setError("No cameras found on device.");
      }
    }).catch(err => {
      setError("Camera permission denied.");
      console.error(err);
    });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-3xl border-4 border-white/10 shadow-glow">
      <div id="qr-reader" className="w-full h-[400px] bg-black"></div>
      
      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
        <div className="w-64 h-64 border-2 border-brand-500 rounded-2xl animate-pulse flex items-center justify-center">
          <div className="w-full h-0.5 bg-brand-500 animate-[scan_2s_ease-in-out_infinite] shadow-glow"></div>
        </div>
        <p className="mt-8 text-white/70 font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
          Align QR Code within the frame
        </p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-4 right-4 bg-red-500/90 backdrop-blur-md text-white p-3 rounded-xl text-center text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-120px); }
          50% { transform: translateY(120px); }
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
