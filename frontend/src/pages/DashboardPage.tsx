import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Play, Activity, MessageSquare, Wind, BarChart2, HeartPulse, RefreshCw } from 'lucide-react';
import type { DashboardData } from '../types';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Dynamic real-time signal monitor state
  const [realTimeSignals, setRealTimeSignals] = useState({
    stressIndex: 52,
    sentiment: 48,
    interactionIntensity: 50,
    responsePattern: 75,
    selfReported: 45
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiService.getDashboard();
        const result = res.data;
        setData(result);
        
        const currentStress = typeof result.current_stress === 'number' 
          ? result.current_stress 
          : (typeof (result.current_stress as any)?.stress_score === 'number' ? (result.current_stress as any).stress_score : 52);
        
        setRealTimeSignals({
          stressIndex: currentStress,
          sentiment: Math.max(0, 100 - currentStress),
          interactionIntensity: 50,
          responsePattern: 75,
          selfReported: currentStress > 50 ? currentStress - 10 : currentStress + 10
        });
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Periodic signal updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeSignals(prev => ({
        stressIndex: Math.max(10, Math.min(95, prev.stressIndex + (Math.random() * 6 - 3))),
        sentiment: Math.max(10, Math.min(90, prev.sentiment + (Math.random() * 6 - 3))),
        interactionIntensity: Math.max(20, Math.min(90, prev.interactionIntensity + (Math.random() * 10 - 5))),
        responsePattern: Math.max(30, Math.min(90, prev.responsePattern + (Math.random() * 4 - 2))),
        selfReported: prev.selfReported
      }));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getStressColor = (score: number) => {
    if (score <= 25) return '#22c55e'; // green (calm)
    if (score <= 50) return '#eab308'; // yellow (mild)
    if (score <= 75) return '#f97316'; // orange (elevated)
    return '#ef4444'; // red (high)
  };
  
  const getStressCategory = (score: number) => {
    if (score <= 25) return 'Calm';
    if (score <= 50) return 'Mild';
    if (score <= 75) return 'Elevated';
    return 'High';
  };

  const rawStress = (data as any)?.current_stress;
  const stressScore: number = typeof rawStress === 'number' 
    ? rawStress 
    : (typeof rawStress?.stress_score === 'number' ? rawStress.stress_score : 58);

  const stressColor = getStressColor(stressScore);
  const stressCategory = getStressCategory(stressScore);
  const circleCircumference = 2 * Math.PI * 80;
  const strokeDashoffset = circleCircumference - (stressScore / 100) * circleCircumference;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-white">
        <RefreshCw className="h-8 w-8 animate-spin text-[#00a3ff]" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6 pb-16"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {getGreeting()}. <span className="text-[#00a3ff]">Good to see you.</span>
          </h1>
          <p className="text-white/60 mt-2">
            Your stress indicators appear <span className="font-semibold text-white capitalize">{stressCategory}</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/demo')}
            className="flex items-center gap-2 bg-gradient-to-r from-shield-500 to-cyan-500 hover:from-shield-400 hover:to-cyan-400 text-white px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg shadow-shield-500/25 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Launch Live Demo
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Stress Gauge */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00a3ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <h2 className="text-lg font-medium text-white/80 mb-6 w-full text-left">Stress Index</h2>
          
          <div className="relative flex items-center justify-center w-56 h-56">
            {/* Background track */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="80"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Animated fill */}
              <motion.circle
                cx="112"
                cy="112"
                r="80"
                fill="none"
                stroke={stressColor}
                strokeWidth="16"
                strokeLinecap="round"
                initial={{ strokeDasharray: circleCircumference, strokeDashoffset: circleCircumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="text-5xl font-extrabold">{Math.round(stressScore)}</span>
              <span className="text-sm text-white/50">/ 100</span>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col items-center">
            <span className="px-4 py-1.5 rounded-full text-sm font-semibold capitalize bg-white/10 border" style={{ color: stressColor, borderColor: `${stressColor}40` }}>
              {stressCategory}
            </span>
          </div>
        </div>

        {/* Real-time Signals */}
        <div className="md:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00a3ff]" />
              Real-Time Signal Monitor
            </h2>
            <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              <motion.div 
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="w-2.5 h-2.5 rounded-full bg-red-500"
              />
              <span className="text-xs font-bold tracking-wider text-red-400">LIVE</span>
            </div>
          </div>
          
          <div className="space-y-5 flex-1 justify-center flex flex-col">
            {[
              { label: 'Stress Index', value: realTimeSignals.stressIndex, color: '#ef4444' },
              { label: 'Sentiment Indicator', value: realTimeSignals.sentiment, color: '#22c55e' },
              { label: 'Interaction Intensity', value: realTimeSignals.interactionIntensity, color: '#f97316' },
              { label: 'Response Pattern', value: realTimeSignals.responsePattern, color: '#eab308' },
              { label: 'Self-Reported Stress', value: realTimeSignals.selfReported, color: '#00a3ff' }
            ].map((signal, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white/70">{signal.label}</span>
                  <span className="text-white font-medium">{Math.round(signal.value)} / 100</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full rounded-full"
                    style={{ backgroundColor: signal.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${signal.value}%` }}
                    transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[
          { title: 'Check In', icon: HeartPulse, color: 'text-rose-400', bg: 'bg-rose-400/10', link: '/checkin' },
          { title: 'Talk to Shield AI', icon: MessageSquare, color: 'text-[#00a3ff]', bg: 'bg-[#00a3ff]/10', link: '/assistant' },
          { title: 'Breathing Exercise', icon: Wind, color: 'text-teal-400', bg: 'bg-teal-400/10', link: '/breathing/box' },
          { title: 'View Insights', icon: BarChart2, color: 'text-purple-400', bg: 'bg-purple-400/10', link: '/insights' }
        ].map((action, idx) => (
          <Link 
            key={idx}
            to={action.link}
            className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <div className={`p-3 rounded-xl ${action.bg} group-hover:scale-110 transition-transform`}>
              <action.icon className={`w-6 h-6 ${action.color}`} />
            </div>
            <span className="text-sm font-medium text-white/90">{action.title}</span>
          </Link>
        ))}
      </div>

    </motion.div>
  );
};

export default DashboardPage;
