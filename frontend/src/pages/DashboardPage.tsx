import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Activity, Brain, Heart, Wind, Shield, Calendar, Mic, Camera, ChevronRight, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import CameraAnalyzer from '../components/CameraAnalyzer';
import VoiceAnalyzer from '../components/VoiceAnalyzer';
import SignalDashboard from '../components/SignalDashboard';
import ExplainableResults from '../components/ExplainableResults';
import DeveloperDebugPanel from '../components/DeveloperDebugPanel';
import { computeMultimodalStress, MultimodalResult } from '../services/multimodalScoring';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [showXai, setShowXai] = useState(false);
  
  // Multimodal State (0-4 scale for self-report: 0->0, 1->25, 2->50, 3->75, 4->100)
  const [selfReportAnswer, setSelfReportAnswer] = useState(2);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraMetrics, setCameraMetrics] = useState<any>({ score: 0, motion: 0, subComponents: null });
  
  const [micActive, setMicActive] = useState(false);
  const [micMetrics, setMicMetrics] = useState<any>({ score: 0, volume: 0, subComponents: null });

  // Simulated wearable physiological telemetry (optional demo toggle)
  const [physioData, setPhysioData] = useState<{ hrDeviation: number | null; hrvDeviation: number | null; breathingDeviation: number | null }>({
    hrDeviation: null,
    hrvDeviation: null,
    breathingDeviation: null,
  });

  const [multimodalResult, setMultimodalResult] = useState<MultimodalResult>(() => {
    return computeMultimodalStress({
      selfReportVal: 2,
      selfReportScale: '0-4',
    });
  });

  const [history, setHistory] = useState<number[]>([35, 38, 40, 42, 45, 48, 44, 42, 40, 42, 43, 45]);

  // Recalculate using unified Multimodal Scoring Engine
  useEffect(() => {
    const res = computeMultimodalStress({
      voiceScore: micActive && micMetrics.score > 0 ? micMetrics.score : null,
      behaviorScore: cameraActive && cameraMetrics.score > 0 ? cameraMetrics.score : null,
      physiologicalScore: physioData.hrDeviation !== null ? Math.round((0.4 * (physioData.hrDeviation ?? 0)) + (0.4 * (physioData.hrvDeviation ?? 0)) + (0.2 * (physioData.breathingDeviation ?? 0))) : null,
      selfReportVal: selfReportAnswer,
      selfReportScale: '0-4',
      voiceInputs: micActive ? micMetrics.subComponents : null,
      behaviorInputs: cameraActive ? cameraMetrics.subComponents : null,
    });

    setMultimodalResult(res);

    if (res.finalStressScore !== null) {
      setHistory(prev => [...prev.slice(1), Math.round(res.finalStressScore!)]);
    }
  }, [selfReportAnswer, cameraMetrics, micMetrics, cameraActive, micActive, physioData]);

  const handleSimulateHigh = () => {
    setSelfReportAnswer(4);
    setMicActive(true);
    setMicMetrics({ score: 85, volume: 80, subComponents: { speakingRate: 85, pause: 80, pitch: 90, loudness: 85 } });
    setCameraActive(true);
    setCameraMetrics({ score: 88, motion: 75, subComponents: { blink: 85, facialTension: 90, movement: 88, posture: 85 } });
    setPhysioData({ hrDeviation: 80, hrvDeviation: 85, breathingDeviation: 75 });
  };

  const handleSimulateCalm = () => {
    setSelfReportAnswer(0);
    setMicActive(true);
    setMicMetrics({ score: 18, volume: 15, subComponents: { speakingRate: 15, pause: 20, pitch: 18, loudness: 20 } });
    setCameraActive(true);
    setCameraMetrics({ score: 20, motion: 10, subComponents: { blink: 15, facialTension: 20, movement: 15, posture: 20 } });
    setPhysioData({ hrDeviation: 10, hrvDeviation: 15, breathingDeviation: 10 });
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
          
          {/* Signal Dashboard with 4-Tier Modalities */}
          <SignalDashboard 
              cameraStatus={cameraActive ? 'Active' : 'Off'}
              cameraSignal={cameraMetrics.motion}
              micStatus={micActive ? 'Active' : 'Off'}
              micSignal={micMetrics.volume}
              voiceScore={multimodalResult.voiceScore}
              behaviorScore={multimodalResult.behaviorScore}
              physiologicalScore={multimodalResult.physiologicalScore}
              selfReportScore={multimodalResult.selfReportScore}
              selfReportVal={selfReportAnswer}
              interactionCadence={45}
          />

          {/* Live Telemetry Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="text-blue-500" />
                  {t('dashboard.telemetry.title', 'Live Multimodal Telemetry')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  AI-based wellness estimation across Voice (30%), Behavior (20%), Physio (30%), Self-Report (20%)
                </p>
              </div>
              <button 
                onClick={() => setShowXai(!showXai)}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Info className="w-4 h-4" />
                {showXai ? 'Hide Breakdown' : t('dashboard.telemetry.why', 'Why this score?')}
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-slate-800" />
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" stroke="currentColor" strokeWidth="8" 
                    strokeDasharray={`${(multimodalResult.finalStressScore ?? 0) * 2.83} 283`}
                    className={`${(multimodalResult.finalStressScore ?? 0) > 74 ? 'text-red-500' : (multimodalResult.finalStressScore ?? 0) > 49 ? 'text-amber-500' : (multimodalResult.finalStressScore ?? 0) > 24 ? 'text-cyan-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`} 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {multimodalResult.finalStressScore !== null ? Math.round(multimodalResult.finalStressScore) : '--'}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {multimodalResult.interpretation}
                  </span>
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
                      className={`flex-1 ${val > 74 ? 'bg-red-500/80' : val > 49 ? 'bg-amber-500/80' : val > 24 ? 'bg-cyan-500/80' : 'bg-emerald-500/80'} rounded-t-sm`}
                    />
                  ))}
                </div>
                
                {/* Interactive Slider right on telemetry card (0-4 scale) */}
                <div className="bg-gray-50 dark:bg-slate-950 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Self-Report Rating: <strong>{selfReportAnswer} / 4</strong> ({selfReportAnswer === 0 ? 'Calm (0/100)' : selfReportAnswer === 1 ? 'Mild (25/100)' : selfReportAnswer === 2 ? 'Moderate (50/100)' : selfReportAnswer === 3 ? 'Stressed (75/100)' : 'Overwhelmed (100/100)'})</span>
                    </div>
                    <input 
                        type="range" min="0" max="4" step="1" value={selfReportAnswer} 
                        onChange={(e) => setSelfReportAnswer(parseInt(e.target.value))}
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
                  <ExplainableResults 
                    fusedScore={multimodalResult.finalStressScore ?? 0}
                    category={multimodalResult.category}
                    interpretation={multimodalResult.interpretation}
                    signalContributions={multimodalResult.contributions}
                    recommendedAction={multimodalResult.recommendedAction}
                  />
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
                      setCameraMetrics({ 
                        score, 
                        motion: metrics.motionEnergy, 
                        subComponents: {
                          blink: metrics.blink,
                          facialTension: metrics.facialTension,
                          movement: metrics.movement,
                          posture: metrics.posture
                        } 
                      });
                  }}
              />
              <VoiceAnalyzer 
                  isStreamActive={micActive}
                  onVoiceAnalysisComplete={(score, features) => {
                      setMicActive(true);
                      setMicMetrics({ 
                        score, 
                        volume: features.volume, 
                        subComponents: {
                          speakingRate: features.speakingRate,
                          pause: features.pause,
                          pitch: features.pitch,
                          loudness: features.loudness
                        } 
                      });
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
          selfReport={selfReportAnswer * 25}
          voiceActivity={micMetrics.volume}
          cameraMotion={cameraMetrics.motion}
          weights={{ text: 30, self: 20, voice: 30, camera: 20, interaction: 0 }}
          finalScore={multimodalResult.finalStressScore ?? 45}
          confidence={Math.round(multimodalResult.confidence * 100)}
          onSimulateHigh={handleSimulateHigh}
          onSimulateCalm={handleSimulateCalm}
          onToggleCamera={() => setCameraActive(false)}
          onToggleMic={() => setMicActive(false)}
      />
    </div>
  );
};

export default DashboardPage;
