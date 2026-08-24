import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Settings, Shield, Bell, Camera, Mic, LogOut, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('profile.title', 'Profile & Settings')}</h1>
        <p className="text-gray-500 dark:text-slate-400">{t('profile.subtitle', 'Manage your account and privacy preferences.')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Account Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm text-center">
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-slate-800 shadow-lg">
               <User className="w-12 h-12 text-blue-600 dark:text-blue-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.display_name || user?.username || 'Guest User'}</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm">{user?.email || 'Not logged in'}</p>
            
            <button 
              onClick={() => {
                logout();
                toast.success('Signed out successfully');
                navigate('/');
              }}
              className="mt-6 w-full py-2.5 px-4 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> {t('profile.logout', 'Sign Out')}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
             <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" /> Data Privacy
             </h3>
             <ul className="space-y-3 text-sm text-gray-600 dark:text-slate-400">
               <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5"/> Fully encrypted at rest</li>
               <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5"/> Biometrics processed on-device</li>
               <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5"/> No audio/video recording stored</li>
             </ul>
          </div>
        </div>

        {/* Right Column: Settings & Sensors */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-gray-400" /> {t('profile.sensors.title', 'Sensor Permissions')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              MindShield uses your camera and microphone exclusively for real-time stress analysis. Toggle access below.
            </p>
            
            <div className="space-y-4">
              {/* Camera Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${cameraEnabled ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-slate-500'}`}>
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Camera Access</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Facial micro-expression tracking</p>
                  </div>
                </div>
                <button 
                  onClick={() => setCameraEnabled(!cameraEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${cameraEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${cameraEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Mic Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${micEnabled ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-slate-500'}`}>
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Microphone Access</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Voice prosody & tone analysis</p>
                  </div>
                </div>
                <button 
                  onClick={() => setMicEnabled(!micEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${micEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${micEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-gray-400" /> Notifications
            </h3>
            <div className="space-y-4 text-sm font-medium text-gray-700 dark:text-slate-300">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                Daily Check-in Reminders
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                High Stress Intervention Alerts
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                Weekly Progress Reports
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
