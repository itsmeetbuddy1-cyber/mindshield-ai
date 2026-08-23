import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw, Activity, Mic, Camera, Brain, Shield, Wind, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const DEMO_STAGES = [
  {
    id: 1,
    name: 'Stage 1: Baseline',
    score: 32,
    color: 'text-green-500',
    bg: 'bg-green-500',
    description: 'User is calm. Baseline metrics established.',
    xai: [
      { source: 'Voice', status: 'Normal pitch & tempo', icon: Mic },
      { source: 'Camera', status: 'Neutral micro-expressions', icon: Camera },
      { source: 'Context', status: 'No stress keywords', icon: Brain },
    ]
  },
  {
    id: 2,
    name: 'Stage 2: Mild Stress',
    score: 47,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500',
    description: 'Academic trigger detected (upcoming exam).',
    xai: [
      { source: 'Voice', status: 'Slightly elevated tempo', icon: Mic },
      { source: 'Camera', status: 'Occasional frowning', icon: Camera },
      { source: 'Context', status: 'Keywords: "exam", "worried"', icon: Brain },
    ]
  },
  {
    id: 3,
    name: 'Stage 3: Elevated Stress',
    score: 63,
    color: 'text-orange-500',
    bg: 'bg-orange-500',
    description: 'Multimodal signals confirming rising anxiety.',
    xai: [
      { source: 'Voice', status: 'High pitch variations detected', icon: Mic },
      { source: 'Camera', status: 'Increased blink rate, tense jaw', icon: Camera },
      { source: 'Context', status: 'Negative sentiment increasing', icon: Brain },
    ]
  },
  {
    id: 4,
    name: 'Stage 4: High Stress & Intervention',
    score: 78,
    color: 'text-red-500',
    bg: 'bg-red-500',
    description: 'Threshold crossed. Shield AI autonomous intervention triggered.',
    xai: [
      { source: 'Voice', status: 'Strained voice patterns (92% conf)', icon: Mic },
      { source: 'Camera', status: 'Sustained distress expressions', icon: Camera },
      { source: 'System', status: 'Intervention module activated', icon: Shield },
    ],
    intervention: true
  },
  {
    id: 5,
    name: 'Stage 5: Recovery',
    score: 53,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500',
    description: 'Post-intervention recovery. Gradual parasympathetic activation.',
    xai: [
      { source: 'System', status: 'Breathing exercise completed', icon: Wind },
      { source: 'Camera', status: 'Facial muscles relaxing', icon: Camera },
      { source: 'Biometrics', status: 'Estimated HR normalizing', icon: Activity },
    ],
    recovery: true
  }
];

const DemoPage: React.FC = () => {
  const { t } = useTranslation();
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liveScore, setLiveScore] = useState(DEMO_STAGES[0].score);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStage((prev) => {
          if (prev >= DEMO_STAGES.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 5000); // 5 seconds per stage
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    // Smooth score transition
    setLiveScore(DEMO_STAGES[currentStage].score);
    if (DEMO_STAGES[currentStage].recovery) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#8B5CF6']
      });
    }
  }, [currentStage]);

  const stage = DEMO_STAGES[currentStage];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SIH 2026 Live Demo</h1>
          <p className="text-gray-500 dark:text-slate-400">Offline Presentation Mode</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setIsPlaying(false); setCurrentStage(0); }}
            className="p-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl text-gray-700 dark:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all ${
              isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isPlaying ? (
              <><Pause className="w-5 h-5" /> Pause Auto-Play</>
            ) : (
              <><Play className="w-5 h-5" /> Start Presentation</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Telemetry & Stages */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
             
             {/* Live Score Gauge */}
             <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-100 dark:text-slate-800" />
                  <motion.circle 
                    cx="50" cy="50" r="45" 
                    fill="none" stroke="currentColor" strokeWidth="6" 
                    strokeDasharray="283"
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 - (liveScore / 100) * 283 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={stage.color}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <motion.span 
                    key={liveScore}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-6xl font-black ${stage.color}`}
                  >
                    {liveScore}
                  </motion.span>
                  <span className="text-sm font-bold text-gray-500 dark:text-slate-400 mt-2 tracking-widest uppercase">Stress Level</span>
                </div>
             </div>

             <div className="text-center w-full max-w-md">
               <motion.h2 
                 key={stage.name}
                 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                 className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
               >
                 {stage.name}
               </motion.h2>
               <motion.p 
                 key={stage.description}
                 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                 className="text-gray-600 dark:text-slate-400"
               >
                 {stage.description}
               </motion.p>
             </div>
          </div>

          {/* Timeline Indicators */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm relative">
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
            <motion.div 
               className="absolute top-1/2 left-8 h-1 bg-blue-500 -translate-y-1/2 z-0 transition-all duration-500" 
               style={{ width: `calc(${(currentStage / (DEMO_STAGES.length - 1)) * 100}% - 2rem)` }}
            />
            
            {DEMO_STAGES.map((s, i) => (
              <button 
                key={i}
                onClick={() => setCurrentStage(i)}
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                  i <= currentStage 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-gray-400'
                } ${i === currentStage ? 'ring-4 ring-blue-500/30 scale-125' : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Explainable AI & Interventions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">
              <Brain className="w-6 h-6 text-purple-500" />
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Explainable AI (XAI)</h3>
            </div>

            <div className="flex-1 space-y-4">
              <AnimatePresence mode="popLayout">
                {stage.xai.map((item, i) => (
                  <motion.div
                    key={`${currentStage}-${i}`}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800"
                  >
                    <div className="mt-1">
                      <item.icon className={`w-5 h-5 ${
                        item.source === 'Voice' ? 'text-blue-500' :
                        item.source === 'Camera' ? 'text-emerald-500' :
                        'text-purple-500'
                      }`} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{item.source}</div>
                      <div className="text-sm text-gray-600 dark:text-slate-400">{item.status}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {stage.intervention && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl flex flex-col gap-3"
              >
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
                  <Shield className="w-5 h-5" /> Autonomous Intervention
                </div>
                <p className="text-sm text-red-800 dark:text-red-200">
                  Critical threshold (75) breached. Launching mandatory calming protocol (4-7-8 Breathing).
                </p>
                <button className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                  <Wind className="w-4 h-4" /> Start Protocol
                </button>
              </motion.div>
            )}

            {stage.recovery && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl flex flex-col gap-3"
              >
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-5 h-5" /> Intervention Successful
                </div>
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  Stress levels reduced by 32%. User returned to functional baseline.
                </p>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
