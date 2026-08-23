import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

type Phase = 'INHALE' | 'HOLD' | 'EXHALE' | 'PREPARE' | 'DONE';

export const BreathingPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  
  const [phase, setPhase] = useState<Phase>('PREPARE');
  const [timeLeft, setTimeLeft] = useState(3);
  const [cycle, setCycle] = useState(1);
  const totalCycles = 4;
  const [isDone, setIsDone] = useState(false);
  
  // Settings based on type (default 4-4-6)
  const settings = {
    inhaleTime: 4,
    holdTime: type === 'box' ? 4 : 4,
    exhaleTime: type === 'box' ? 4 : 6,
    cycles: totalCycles
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (phase === 'PREPARE') {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      } else {
        setPhase('INHALE');
        setTimeLeft(settings.inhaleTime);
      }
    } else if (phase === 'INHALE') {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      } else {
        setPhase('HOLD');
        setTimeLeft(settings.holdTime);
      }
    } else if (phase === 'HOLD') {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      } else {
        setPhase('EXHALE');
        setTimeLeft(settings.exhaleTime);
      }
    } else if (phase === 'EXHALE') {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      } else {
        if (cycle < settings.cycles) {
          setCycle(c => c + 1);
          setPhase('INHALE');
          setTimeLeft(settings.inhaleTime);
        } else {
          setPhase('DONE');
          setIsDone(true);
        }
      }
    }

    return () => clearTimeout(timer);
  }, [phase, timeLeft, cycle, settings]);

  const handleFinish = async (_feeling: string) => {
    try {
      await apiService.createCopingSession({
        exercise_type: type || 'relaxation',
        duration_seconds: settings.cycles * (settings.inhaleTime + settings.holdTime + settings.exhaleTime),
        stress_before: 8,
        stress_after: 4,
        completed: true
      });
      toast.success('Session saved');
      navigate('/toolkit');
    } catch {
      toast.error('Failed to save session');
      navigate('/toolkit');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-shield-500/10 via-[#0a0e1a] to-[#0a0e1a]"></div>
      
      <header className="p-6 relative z-10 flex justify-end">
        <button 
          onClick={() => navigate('/toolkit')}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-white/60 hover:text-white" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-6">
        <AnimatePresence mode="wait">
          {!isDone ? (
            <motion.div 
              key="exercise"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <h2 className="text-2xl font-semibold mb-12 text-white/80">
                {phase === 'PREPARE' ? 'Get Ready' : `Cycle ${cycle} of ${settings.cycles}`}
              </h2>
              
              <div className="relative w-64 h-64 flex items-center justify-center mb-16">
                <motion.div
                  className="absolute rounded-full bg-shield-500/20 border-2 border-shield-500/50 flex items-center justify-center"
                  initial={{ scale: 1 }}
                  animate={{
                    scale: phase === 'INHALE' ? 1.5 : phase === 'EXHALE' ? 1 : phase === 'HOLD' ? 1.5 : 1,
                    boxShadow: phase === 'INHALE' ? '0 0 60px rgba(0, 163, 255, 0.4)' : 
                               phase === 'HOLD' ? '0 0 80px rgba(0, 163, 255, 0.6)' : 
                               '0 0 20px rgba(0, 163, 255, 0.2)'
                  }}
                  transition={{
                    duration: phase === 'INHALE' ? settings.inhaleTime : 
                              phase === 'EXHALE' ? settings.exhaleTime : 
                              phase === 'PREPARE' ? 0.5 : 0.5,
                    ease: "easeInOut"
                  }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <div className="text-4xl font-bold tracking-widest text-white">
                    {phase === 'PREPARE' ? timeLeft : timeLeft}
                  </div>
                </motion.div>
                
                {/* SVG Progress Ring could be added here */}
              </div>

              <div className="h-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={phase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-3xl font-bold tracking-[0.2em] text-shield-500"
                  >
                    {phase !== 'PREPARE' && phase}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="completion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full text-center"
            >
              <h2 className="text-3xl font-bold mb-4">Nice work.</h2>
              <p className="text-white/60 mb-8">Take a moment to notice how you feel.</p>
              
              <div className="flex justify-between items-center mb-8 bg-white/5 rounded-xl p-4">
                <div className="text-center">
                  <p className="text-sm text-white/40 mb-1">Before</p>
                  <p className="text-2xl font-bold text-red-400">8/10</p>
                </div>
                <div className="h-px bg-white/10 w-16"></div>
                <div className="text-center">
                  <p className="text-sm text-white/40 mb-1">After</p>
                  <p className="text-2xl font-bold text-green-400">4/10</p>
                </div>
              </div>
              
              <p className="font-medium mb-4">How do you feel now?</p>
              <div className="grid grid-cols-2 gap-3">
                {['Much Better', 'Better', 'Same', 'Worse'].map((feel) => (
                  <button
                    key={feel}
                    onClick={() => handleFinish(feel)}
                    className="p-3 bg-white/5 hover:bg-shield-500/20 hover:text-shield-500 rounded-xl transition-colors border border-white/5"
                  >
                    {feel}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default BreathingPage;
