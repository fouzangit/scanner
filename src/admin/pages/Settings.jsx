import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '../../services/supabase';

const Settings = () => {
  const [settings, setSettings] = useState({
    office_latitude: 0,
    office_longitude: 0,
    allowed_radius: 100
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*').single();
    if (data) setSettings(data);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('settings').update(settings).eq('id', 1); // Assuming ID 1 for global settings
    if (error) alert(error.message);
    setSaving(false);
  };

  return (
    <div className="max-w-4xl space-y-6 md:space-y-10">
      <div>
        <h3 className="text-2xl md:text-3xl font-black">System Settings</h3>
        <p className="text-slate-500 mt-1 text-sm hidden sm:block">Configure geofencing and office parameters</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 md:space-y-8">
        {/* Geofencing Config */}
        <div className="glass-card p-5 md:p-10 space-y-6 md:space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-600/20 text-brand-400 rounded-2xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0">
              📍
            </div>
            <div>
              <h4 className="text-base md:text-xl font-bold">Office Geofencing</h4>
              <p className="text-xs text-slate-500 uppercase font-black tracking-widest mt-1">GPS Validation required for attendance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
            <div>
              <label className="label">Office Latitude</label>
              <input 
                type="number" step="any" className="input-field" 
                value={settings.office_latitude} 
                onChange={e => setSettings({...settings, office_latitude: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="label">Office Longitude</label>
              <input 
                type="number" step="any" className="input-field" 
                value={settings.office_longitude} 
                onChange={e => setSettings({...settings, office_longitude: parseFloat(e.target.value)})}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Allowed Radius (Meters)</label>
              <input 
                type="number" className="input-field" 
                value={settings.allowed_radius} 
                onChange={e => setSettings({...settings, allowed_radius: parseInt(e.target.value)})}
              />
              <p className="text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-widest">Recommended: 100-200 meters</p>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="glass-card p-10">
           <div className="flex justify-between items-start">
             <div>
               <h4 className="text-xl font-bold mb-2">Office QR Code</h4>
               <p className="text-slate-500 text-sm mb-10 max-w-md">
                 Print this code and place it at the office entrance. Employees scan this using the PWA to check in.
               </p>
             </div>
             <div className="p-6 bg-white rounded-3xl shadow-glow shadow-white/10">
                <QRCodeCanvas 
                  value="CLINIC_PULSE_OFFICE" 
                  size={120} 
                  level="H"
                />
             </div>
           </div>
           <Link 
             to="/admin/qr" 
             className="btn-primary w-full mt-6 bg-slate-800 hover:bg-slate-700 shadow-none flex items-center justify-center text-xs font-black uppercase tracking-widest"
           >
             OPEN FULLSCREEN / PRINT
           </Link>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="btn-primary w-full py-5 text-lg shadow-glow-brand"
        >
          {saving ? 'SAVING...' : 'SAVE CONFIGURATION'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
