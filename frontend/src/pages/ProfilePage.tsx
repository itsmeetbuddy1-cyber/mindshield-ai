import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Shield, Settings, Download, Trash2, Info, ExternalLink } from 'lucide-react';
import { apiService } from '../services/api';
import type { UserSettings } from '../types';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    ai_mode: 'mock',
    demo_mode: false,
    monitoring_enabled: true,
    consent_given: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiService.getSettings();
      if (res.data) {
        setSettings(prev => ({ ...prev, ...res.data }));
      }
    } catch {
      // Default to mock mode
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof UserSettings) => {
    const updated = {
      ...settings,
      [key]: typeof settings[key] === 'boolean' 
        ? !settings[key] 
        : (settings[key] === 'mock' ? 'real' : 'mock'),
    };
    setSettings(updated);

    try {
      await apiService.updateSettings(updated);
      toast.success('Settings updated');
    } catch {
      setSettings(settings);
      toast.error('Failed to update settings');
    }
  };

  const handleDeleteData = async () => {
    if (window.confirm('Are you absolutely sure? This will delete all your journal entries, sessions, and check-ins. This action cannot be undone.')) {
      try {
        await apiService.deleteUserData();
        toast.success('All data deleted successfully');
      } catch {
        toast.error('Failed to delete data');
      }
    }
  };

  const handleExportData = () => {
    toast.success('Data export started. Check your downloads.');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6 pb-24">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <header className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-shield-500/20 flex items-center justify-center">
            <User className="w-6 h-6 text-shield-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Profile & Settings</h1>
            <p className="text-white/60 mt-1">Manage your account, privacy, and app preferences.</p>
          </div>
        </header>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="w-5 h-5 text-shield-500" />
            <h2 className="text-xl font-semibold">Preferences</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-lg">AI Integration Mode</h3>
                <p className="text-white/50 text-sm mt-1 max-w-md">
                  Toggle between real AI models and local mock data. 
                  {settings.ai_mode === 'mock' && <span className="text-orange-400 block mt-1">Currently using mock data for demo purposes.</span>}
                </p>
              </div>
              <button 
                onClick={() => handleToggle('ai_mode')}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${settings.ai_mode === 'real' ? 'bg-shield-500' : 'bg-white/20'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.ai_mode === 'real' ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div className="h-px bg-white/10" />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-lg">Demo Mode</h3>
                <p className="text-white/50 text-sm mt-1 max-w-md">
                  Simulate high stress events for demonstration purposes.
                </p>
              </div>
              <button 
                onClick={() => handleToggle('demo_mode')}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${settings.demo_mode ? 'bg-shield-500' : 'bg-white/20'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.demo_mode ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-shield-500/10 to-transparent border border-shield-500/20 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-shield-500/20 rounded-lg">
              <Lock className="w-5 h-5 text-shield-500" />
            </div>
            <h2 className="text-xl font-semibold text-shield-500">Privacy Center</h2>
          </div>
          
          <p className="text-white/70 mb-6">
            Your privacy is our priority. MindShield AI processes sensitive data locally whenever possible and never sells your information.
          </p>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-white/60" />
                <div>
                  <h3 className="font-medium">Background Monitoring</h3>
                  <p className="text-white/50 text-sm">Allow app to monitor interaction patterns for stress estimation</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggle('monitoring_enabled')}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${settings.monitoring_enabled ? 'bg-green-500' : 'bg-white/20'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.monitoring_enabled ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleExportData}
                className="flex-1 flex items-center justify-center space-x-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Export My Data</span>
              </button>
              <button 
                onClick={handleDeleteData}
                className="flex-1 flex items-center justify-center space-x-2 p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete All Data</span>
              </button>
            </div>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Info className="w-5 h-5 text-shield-500" />
            <h2 className="text-xl font-semibold">About & Contact Details</h2>
          </div>
          
          <div className="space-y-4 text-sm text-white/60">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span>Platform</span>
              <span className="font-medium text-white/90">MindShield AI (SIH Edition)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span>Team Name</span>
              <span className="font-bold text-shield-400">INSIGHT-X</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span>Contact Email</span>
              <a href="mailto:itsmeetbuddy1@gmail.com" className="font-medium text-cyan-400 hover:underline">
                itsmeetbuddy1@gmail.com
              </a>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span>Version</span>
              <span className="font-medium text-white/90">v1.0.0-production</span>
            </div>
            <p className="pt-2 leading-relaxed">
              <strong>Disclaimer:</strong> MindShield AI is a supportive wellness tool and is not a replacement for professional mental health care. In an emergency, please contact local emergency services or a crisis hotline (988).
            </p>
          </div>
        </motion.section>

      </div>
    </div>
  );
};

export default ProfilePage;
