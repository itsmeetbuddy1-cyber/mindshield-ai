import React, { useState } from 'react';

interface SensorPermissionsProps {
  onRevokeAll?: () => void;
}

const SensorPermissions: React.FC<SensorPermissionsProps> = ({ onRevokeAll }) => {
  const [sensors, setSensors] = useState({
    camera: { enabled: false, description: "Facial tension estimation & rapid movement tracking." },
    microphone: { enabled: false, description: "Speech jitter, pauses, and prosody analysis." },
    keyboard: { enabled: true, description: "Typing dynamics (speed, backspaces) & interaction intensity." }
  });

  const toggleSensor = (key: keyof typeof sensors) => {
    setSensors(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled }
    }));
  };

  const handleRevokeAll = () => {
    setSensors(prev => {
      const newSensors = { ...prev };
      (Object.keys(newSensors) as Array<keyof typeof sensors>).forEach(key => {
        newSensors[key].enabled = false;
      });
      return newSensors;
    });
    if (onRevokeAll) onRevokeAll();
  };

  return (
    <div className="glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            🛡️ Privacy & Sensors
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage local processing permissions</p>
        </div>
        <button 
          onClick={handleRevokeAll}
          className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium px-3 py-1.5 border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Revoke All
        </button>
      </div>

      <div className="space-y-4">
        {(Object.keys(sensors) as Array<keyof typeof sensors>).map(key => {
          const sensor = sensors[key];
          const getIcon = (k: string) => k === 'camera' ? '📷' : k === 'microphone' ? '🎙️' : '⌨️';
          
          return (
            <div key={key} className="flex items-start justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getIcon(key)}</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">{key} Access</span>
                  {sensor.enabled ? (
                    <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full font-medium">Active</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400 rounded-full font-medium">Inactive</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {sensor.description}
                </p>
              </div>
              
              <div className="pt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={sensor.enabled} onChange={() => toggleSensor(key)} />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg flex gap-3 text-sm border border-blue-100 dark:border-blue-900/30">
        <span className="text-blue-500">ℹ️</span>
        <p className="text-slate-600 dark:text-slate-300 text-xs">
          <strong>Why we need this:</strong> MindShield AI uses these sensors to pick up subtle physical cues of distress that you might not type out. All analysis happens securely in your browser.
        </p>
      </div>
    </div>
  );
};

export default SensorPermissions;
