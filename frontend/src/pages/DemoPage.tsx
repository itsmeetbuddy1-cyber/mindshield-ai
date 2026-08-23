import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, RotateCcw, Wind, Shield, ArrowRight, Heart, Activity } from 'lucide-react';
import type { DemoState } from '../types';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const STAGES = [
  { id: 1, name: 'Baseline', desc: 'User starts calm', stress: 32, category: 'calm' },
  { id: 2, name: 'Trigger', desc: 'Stressful interaction detected', stress: 47, category: 'mild' },
  { id: 3, name: 'Escalation', desc: 'Distress indicators increasing', stress: 63, category: 'elevated' },
  { id: 4, name: 'Intervention', desc: 'High stress detected', stress: 78, category: 'high' },
  { id: 5, name: 'Recovery', desc: 'Recovery phase', stress: 53, category: 'elevated' },
];

const DemoPage: React.FC = () => {
  const [stage, setStage] = useState(1);
  const [stress, setStress] = useState(STAGES[0].stress);
  const [isRecovering, setIsRecovering] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const currentStageInfo = STAGES[stage - 1];

  const getStressColor = (score: number) => {
    if (score <= 25) return '#22c55e'; // green
    if (score <= 50) return '#eab308'; // yellow
    if (score <= 75) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const nextStage = () => {
    if (stage < 5) {
      setStage(stage + 1);
      setStress(STAGES[stage].stress);
      if (stage + 1 === 5) {
        handleRecovery();
      }
    }
  };

  const resetDemo = () => {
    setStage(1);
    setStress(STAGES[0].stress);
    setIsRecovering(false);
    setShowConfetti(false);
  };

  const handleRecovery = () => {
    setIsRecovering(true);
    let currentStress = 78;
    const targets = [69, 61, 53];
    let step = 0;
    
    const interval = setInterval(() => {
      if (step < targets.length) {
        setStress(targets[step]);
        step++;
      } else {
        clearInterval(interval);
        setIsRecovering(false);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }, 1500);
  };

  const stressColor = getStressColor(stress);
  const circleCircumference = 2 * Math.PI * 120;
  const strokeDashoffset = circleCircumference - (stress / 100) * circleCircumference;

  return (
    <div className="max-w-5xl mx-auto space-y-8 relative">
      {/* Confetti particles for recovery */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#00a3ff', '#22c55e', '#a855f7'][Math.floor(Math.random() * 3)],
                top: '50%',
                left: '50%',
              }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: (Math.random() - 0.5) * 800,
                y: (Math.random() - 0.5) * 800 + (Math.random() * 200),
                opacity: 0,
              }}
              transition={{ duration: 2 + Math.random() * 2, ease: "easeOut" }}
            />
          ))}
        </div>
      )}

      <header className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-purple-400" />
            SIH Live Demo Mode
          </h1>
          <p className="text-white/60 mt-1">Interactive demonstration of stress detection and intervention</p>
        </div>
        <div className="flex gap-3">
          <button onClick={resetDemo} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button 
            onClick={nextStage} 
            disabled={stage === 5 || isRecovering}
            className="flex items-center gap-2 bg-gradient-to-r from-[#00a3ff] to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Stage
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Progress timeline */}
      <div className="flex justify-between items-center px-4 relative">
        <div className="absolute left-8 right-8 top-1/2 h-1 bg-white/10 -z-10 -translate-y-1/2">
          <motion.div 
            className="h-full bg-gradient-to-r from-green-500 via-orange-500 to-blue-500" 
            initial={{ width: 0 }}
            animate={{ width: `${((stage - 1) / 4) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        {STAGES.map((s, idx) => (
          <div key={s.id} className="flex flex-col items-center gap-2">
            <motion.div 
              animate={{ 
                scale: stage === s.id ? 1.2 : 1,
                backgroundColor: stage >= s.id ? getStressColor(s.stress) : '#1f2937',
                borderColor: stage === s.id ? '#fff' : 'transparent'
              }}
              className="w-8 h-8 rounded-full border-2 text-white flex items-center justify-center font-bold text-xs shadow-lg"
            >
              {s.id}
            </motion.div>
            <span className={`text-xs font-medium ${stage === s.id ? 'text-white' : 'text-white/40'}`}>{s.name}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gauge Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col items-center shadow-2xl backdrop-blur-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Stage {stage}: {currentStageInfo.name}</h2>
              <p className="text-white/70">{currentStageInfo.desc}</p>
            </motion.div>
          </AnimatePresence>

          <div className="relative flex items-center justify-center w-72 h-72">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="144" cy="144" r="120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="24" strokeLinecap="round" />
              <motion.circle
                cx="144" cy="144" r="120" fill="none"
                stroke={stressColor} strokeWidth="24" strokeLinecap="round"
                initial={{ strokeDasharray: circleCircumference, strokeDashoffset: circleCircumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                key={stress}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-7xl font-bold text-white tracking-tighter"
              >
                {Math.round(stress)}
              </motion.span>
              <span className="text-white/40 font-medium">Index</span>
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
             <span className="px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm border" style={{ color: stressColor, borderColor: `${stressColor}50`, backgroundColor: `${stressColor}10` }}>
              {currentStageInfo.category}
            </span>
            {stage === 5 && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm border border-blue-500/50 bg-blue-500/10 text-blue-400"
              >
                RECOVERY DETECTED
              </motion.span>
            )}
          </div>
        </div>

        {/* Dynamic Content Panel */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {stage >= 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-red-500/20 p-3 rounded-xl">
                    <Shield className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Intervention Triggered</h3>
                    <p className="text-red-200/70">High stress pattern detected continuously</p>
                  </div>
                </div>
                
                <div className="bg-black/20 p-5 rounded-2xl mb-6 border border-white/5">
                  <p className="text-white italic">"I'm noticing signs that you may be feeling overwhelmed. Let's slow things down for a moment."</p>
                </div>
                
                <button 
                  onClick={nextStage}
                  disabled={stage === 5}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold tracking-wide transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Wind className="w-5 h-5" />
                  START 60-SECOND RESET
                </button>
              </motion.div>
            )}

            {stage === 5 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-3xl p-8 backdrop-blur-xl mt-6"
              >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-400" />
                  Intervention Results
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl text-center">
                    <div className="text-white/50 text-sm mb-1">Peak Stress</div>
                    <div className="text-3xl font-bold text-red-400">78</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl text-center">
                    <div className="text-white/50 text-sm mb-1">Post-Recovery</div>
                    <div className="text-3xl font-bold text-green-400">53</div>
                  </div>
                </div>
                <div className="mt-4 text-center text-green-300 bg-green-500/10 py-2 rounded-lg text-sm font-medium border border-green-500/20">
                  Stress decreased by 32%
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
