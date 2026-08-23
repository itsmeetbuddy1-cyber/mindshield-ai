import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Activity, Brain, Heart, Wind, Shield, Calendar, Mic, Camera, ChevronRight, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showXai, setShowXai] = useState(false);
  const [liveStress] = useState(42);

  const stats = [
    { title: t('dashboard.stats.sessions', 'Sessions'), value: '12', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: t('dashboard.stats.avg_stress', 'Avg Stress'), value: '45%', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: t('dashboard.stats.checkins', 'Check-ins'), value: '8', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.greeting', 'Welcome back')}, {user?.display_name || user?.username || t('dashboard.guest', 'Guest')}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            {t('dashboard.subtitle', "Here's a quick overview of your well-being today.")}
          </p>
        </div>
        <Link 
          to="/checkin" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Heart className="w-4 h-4" />
          {t('dashboard.quick_checkin', 'Quick Check-in')}
        </Link>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Live Telemetry & Quick Analyzers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Telemetry Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="text-blue-500" />
                  {t('dashboard.telemetry.title', 'Live Telemetry')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Real-time fusion of biometrics & context</p>
              </div>
              <button 
                onClick={() => setShowXai(!showXai)}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Info className="w-4 h-4" />
                {t('dashboard.telemetry.why', 'Why this score?')}
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-slate-800" />
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" stroke="currentColor" strokeWidth="8" 
                    strokeDasharray={`${liveStress * 2.83} 283`}
                    className="text-blue-500 transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{liveStress}</span>
                  <span className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Score</span>
                </div>
              </div>
              
              <div className="flex-1 w-full">
                {/* Mock LiveStressGraph */}
                <div className="h-32 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-slate-800 flex items-end px-2 pb-2 gap-1 relative">
                  <div className="absolute top-2 left-3 text-xs text-gray-400 font-medium">Timeline (last 60s)</div>
                  {[40, 42, 45, 50, 48, 45, 42, 40, 41, 42, 43, 42].map((val, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${val}%` }}
                      transition={{ delay: i * 0.1 }}
                      className="flex-1 bg-blue-500/80 rounded-t-sm"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Explainable AI Drawer */}
            <AnimatePresence>
              {showXai && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-6 pt-6 border-t border-gray-200 dark:border-slate-800"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Explainable AI (XAI) Breakdown</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 mb-1">
                        <Mic className="w-4 h-4 text-purple-500" /> Voice Prosody
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">Normal pitch & speed (+0)</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 mb-1">
                        <Camera className="w-4 h-4 text-emerald-500" /> Facial Micro-expr
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">Neutral baseline (+10)</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 mb-1">
                        <Brain className="w-4 h-4 text-blue-500" /> Context/Text
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">Recent keywords: 'busy' (+32)</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Multimodal Quick Analyzers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-md transition-all text-left group">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Voice Analyzer</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Speak to check stress levels</p>
              </div>
            </button>
            <button className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:shadow-md transition-all text-left group">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Camera Analyzer</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Facial micro-expression check</p>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Summary</h3>
            <div className="space-y-4">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">{stat.title}</div>
                    <div className="font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Action */}
          <Link to="/breathing/4-7-8" className="block bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-start mb-8">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Wind className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-white/70" />
            </div>
            <h3 className="text-xl font-bold mb-1">4-7-8 Breathing</h3>
            <p className="text-blue-100 text-sm">Recommended based on your recent check-in. Helps reduce anxiety.</p>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
