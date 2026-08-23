import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Activity, Brain, Heart, Wind, Shield, Calendar, Mic, Camera, ChevronRight, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import CameraAnalyzer from '../components/CameraAnalyzer';
import VoiceAnalyzer from '../components/VoiceAnalyzer';
import SignalDashboard from '../components/SignalDashboard';
import DeveloperDebugPanel from '../components/DeveloperDebugPanel';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [showXai, setShowXai] = useState(false);
  
  // Multimodal State
  const [liveStress, setLiveStress] = useState(42);
  const [selfReport, setSelfReport] = useState(5);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraMetrics, setCameraMetrics] = useState({ score: 0, motion: 0 });
  
  const [micActive, setMicActive] = useState(false);
  const [micMetrics, setMicMetrics] = useState({ score: 0, volume: 0 });

  const [history, setHistory] = useState<number[]>([40, 42, 45, 50, 48, 45, 42, 40, 41, 42, 43, 42]);

  // Recalculate combined stress
  useEffect(() => {
     let textStress = 35; // base
     let selfStress = selfReport * 10;
     let voiceStress = micActive && micMetrics.score > 0 ? micMetrics.score : 35;
     let camStress = cameraActive && cameraMetrics.score > 0 ? cameraMetrics.score : 35;

     let weights = { text: 0.3, self: 0.25, voice: 0.15, camera: 0.1, interaction: 0.2 };
     let combined = (textStress * weights.text) + (selfStress * weights.self) + (voiceStress * weights.voice) + (camStress * weights.camera) + (40 * weights.interaction);
     
     setLiveStress(Math.round(combined));
     
     setHistory(prev => {
         const next = [...prev.slice(1), Math.round(combined)];
         return next;
     });
  }, [selfReport, cameraMetrics, micMetrics, cameraActive, micActive]);

  const handleSimulateHigh = () => {
      setSelfReport(9);
      setMicMetrics({ score: 85, volume: 80 });
      setCameraMetrics({ score: 90, motion: 70 });
  };

  const handleSimulateCalm = () => {
      setSelfReport(2);
      setMicMetrics({ score: 20, volume: 10 });
      setCameraMetrics({ score: 25, motion: 5 });
  };

  const stats = [
    { title: t('dashboard.stats.sessions', 'Sessions'), value: '12', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: t('dashboard.stats.avg_stress', 'Avg Stress'), value: '45%', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: t('dashboard.stats.checkins', 'Check-ins'), value: '8', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
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
        <div className="flex gap-3">
            <button 
                onClick={() => navigate('/voice')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
            >
                🎙️ Talk to Shield AI (Voice Mode)
            </button>
            <Link 
            to="/checkin" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
            >
            <Heart className="w-4 h-4" />
            {t('dashboard.quick_checkin', 'Quick Check-in')}
            </Link>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Live Telemetry & Quick Analyzers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Signal Dashboard */}
          <SignalDashboard 
              cameraStatus={cameraActive ? 'Active' : 'Off'}
              cameraSignal={cameraMetrics.motion}
              micStatus={micActive ? 'Active' : 'Off'}
              micSignal={micMetrics.volume}
              textStatus="Ready"
              textSentiment="Neutral"
              selfReportVal={selfReport}
              interactionCadence={45}
          />

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

            <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-slate-800" />
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" stroke="currentColor" strokeWidth="8" 
                    strokeDasharray={`${liveStress * 2.83} 283`}
                    className={`${liveStress > 70 ? 'text-red-500' : liveStress > 40 ? 'text-yellow-500' : 'text-blue-500'} transition-all duration-1000 ease-out`} 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{liveStress}</span>
                  <span className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Score</span>
                </div>
              </div>
              
              <div className="flex-1 w-full flex flex-col gap-4">
                {/* LiveStressGraph */}
                <div className="h-24 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-slate-800 flex items-end px-2 pb-2 gap-1 relative">
                  <div className="absolute top-2 left-3 text-xs text-gray-400 font-medium">Timeline (last 60s)</div>
                  {history.map((val, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${val}%` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className={`flex-1 ${val > 70 ? 'bg-red-500/80' : val > 40 ? 'bg-yellow-500/80' : 'bg-blue-500/80'} rounded-t-sm`}
                    />
                  ))}
                </div>
                
                {/* Interactive Slider right on telemetry card */}
                <div className="bg-gray-50 dark:bg-slate-950 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Self-Report Stress: {selfReport}</span>
                    </div>
                    <input 
                        type="range" min="1" max="10" value={selfReport} 
                        onChange={(e) => setSelfReport(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" 
                    />
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
                      <div className="font-medium text-gray-900 dark:text-white">Score: {Math.round(micMetrics.score)}</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 mb-1">
                        <Camera className="w-4 h-4 text-emerald-500" /> Facial Micro-expr
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">Score: {Math.round(cameraMetrics.score)}</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 mb-1">
                        <Brain className="w-4 h-4 text-blue-500" /> Self-Report
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">Value: {selfReport}/10</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Analyzers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CameraAnalyzer 
                  isStreamActive={cameraActive}
                  onCameraAnalysisComplete={(score, metrics) => {
                      setCameraActive(true);
                      setCameraMetrics({ score, motion: metrics.motionEnergy });
                  }}
              />
              <VoiceAnalyzer 
                  isStreamActive={micActive}
                  onVoiceAnalysisComplete={(score, features) => {
                      setMicActive(true);
                      setMicMetrics({ score, volume: features.voiceActivity });
                  }}
              />
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

      <DeveloperDebugPanel 
          textStress={35}
          selfReport={selfReport * 10}
          voiceActivity={micMetrics.volume}
          cameraMotion={cameraMetrics.motion}
          weights={{ text: 30, self: 25, voice: 15, camera: 10, interaction: 20 }}
          finalScore={liveStress}
          confidence={85}
          onSimulateHigh={handleSimulateHigh}
          onSimulateCalm={handleSimulateCalm}
          onToggleCamera={() => setCameraActive(false)}
          onToggleMic={() => setMicActive(false)}
      />
    </div>
  );
};

export default DashboardPage;
