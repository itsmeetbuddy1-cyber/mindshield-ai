import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Check, Eye, Hand, Volume2, Sparkles, Heart, Zap, Clock, ShieldCheck, Target, Wind, Activity } from 'lucide-react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

type BreathPhase = 'PREPARE' | 'INHALE' | 'HOLD_IN' | 'EXHALE' | 'HOLD_OUT' | 'DONE';

export const BreathingPage: React.FC = () => {
  const { type = 'relaxation' } = useParams<{ type: string }>();
  const navigate = useNavigate();

  // Mode identification
  const isBox = type === 'box';
  const is478 = type === 'relaxation' || type === '478';
  const isGrounding = type === 'grounding';
  const isPmr = type === 'pmr';
  const isFocus = type === 'focus';
  const isPause = type === 'pause';

  // -------------------------------------------------------------
  // 1. BREATHING ENGINE (BOX, 4-7-8, PAUSE)
  // -------------------------------------------------------------
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('PREPARE');
  const [breathTimer, setBreathTimer] = useState(3);
  const [cycle, setCycle] = useState(1);
  const totalCycles = isPause ? 1 : 4;
  const [isCompleted, setIsCompleted] = useState(false);

  const breathTiming = isBox
    ? { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 }
    : is478
    ? { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 }
    : { inhale: 4, holdIn: 2, exhale: 4, holdOut: 0 }; // pause/gentle

  useEffect(() => {
    if (isGrounding || isPmr || isFocus || isCompleted) return;

    const timer = setInterval(() => {
      setBreathTimer(prev => {
        if (prev > 1) return prev - 1;

        // Phase transitions
        if (breathPhase === 'PREPARE') {
          setBreathPhase('INHALE');
          return breathTiming.inhale;
        } else if (breathPhase === 'INHALE') {
          if (breathTiming.holdIn > 0) {
            setBreathPhase('HOLD_IN');
            return breathTiming.holdIn;
          } else {
            setBreathPhase('EXHALE');
            return breathTiming.exhale;
          }
        } else if (breathPhase === 'HOLD_IN') {
          setBreathPhase('EXHALE');
          return breathTiming.exhale;
        } else if (breathPhase === 'EXHALE') {
          if (breathTiming.holdOut > 0) {
            setBreathPhase('HOLD_OUT');
            return breathTiming.holdOut;
          } else {
            if (cycle < totalCycles) {
              setCycle(c => c + 1);
              setBreathPhase('INHALE');
              return breathTiming.inhale;
            } else {
              setBreathPhase('DONE');
              setIsCompleted(true);
              return 0;
            }
          }
        } else if (breathPhase === 'HOLD_OUT') {
          if (cycle < totalCycles) {
            setCycle(c => c + 1);
            setBreathPhase('INHALE');
            return breathTiming.inhale;
          } else {
            setBreathPhase('DONE');
            setIsCompleted(true);
            return 0;
          }
        }
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [breathPhase, cycle, isCompleted, isGrounding, isPmr, isFocus, breathTiming, totalCycles]);

  // -------------------------------------------------------------
  // 2. 5-4-3-2-1 GROUNDING ENGINE
  // -------------------------------------------------------------
  const [groundingStep, setGroundingStep] = useState(0);
  const groundingPrompts = [
    { count: 5, icon: <Eye className="w-8 h-8 text-cyan-400" />, sense: 'SEE', prompt: 'Look around and notice 5 distinct objects in your room.', examples: ['A window', 'A clock', 'A pen', 'Laptop keys', 'A shadow'] },
    { count: 4, icon: <Hand className="w-8 h-8 text-blue-400" />, sense: 'TOUCH / FEEL', prompt: 'Notice 4 physical textures or sensations.', examples: ['Feet flat on the floor', 'Fabric of your clothes', 'Smooth desk surface', 'Cool air on skin'] },
    { count: 3, icon: <Volume2 className="w-8 h-8 text-emerald-400" />, sense: 'HEAR', prompt: 'Listen carefully for 3 subtle sounds.', examples: ['Ceiling fan hum', 'Distant traffic', 'Your own gentle breathing'] },
    { count: 2, icon: <Sparkles className="w-8 h-8 text-amber-400" />, sense: 'SMELL', prompt: 'Notice 2 scents or take a fresh deep sniff.', examples: ['Fresh air', 'Coffee / Tea', 'Your hand soap'] },
    { count: 1, icon: <Heart className="w-8 h-8 text-pink-400" />, sense: 'TASTE / AFFIRMATION', prompt: 'Focus on 1 taste or repeat one positive grounding affirmation.', examples: ['"I am safe and grounded right now."'] }
  ];

  const handleNextGrounding = () => {
    if (groundingStep < groundingPrompts.length - 1) {
      setGroundingStep(s => s + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // -------------------------------------------------------------
  // 3. PROGRESSIVE MUSCLE RELAXATION (PMR) ENGINE
  // -------------------------------------------------------------
  const [pmrZoneIndex, setPmrZoneIndex] = useState(0);
  const [pmrSubPhase, setPmrSubPhase] = useState<'TENSE' | 'RELEASE'>('TENSE');
  const [pmrSeconds, setPmrSeconds] = useState(5);

  const pmrZones = [
    { name: 'Feet & Toes', desc: 'Curl your toes downward tightly into the floor.' },
    { name: 'Calves & Thighs', desc: 'Tighten your calf and thigh muscles, squeezing them firm.' },
    { name: 'Abdomen & Core', desc: 'Pull your stomach inward firmly as if bracing.' },
    { name: 'Hands & Arms', desc: 'Make tight fists with both hands and tense your biceps.' },
    { name: 'Shoulders & Neck', desc: 'Shrug your shoulders up toward your ears and hold.' },
    { name: 'Face & Jaw', desc: 'Scrunch your face, close eyes tight, and clench jaw gently.' }
  ];

  useEffect(() => {
    if (!isPmr || isCompleted) return;

    const timer = setInterval(() => {
      setPmrSeconds(prev => {
        if (prev > 1) return prev - 1;

        if (pmrSubPhase === 'TENSE') {
          setPmrSubPhase('RELEASE');
          return 8; // 8 seconds release
        } else {
          if (pmrZoneIndex < pmrZones.length - 1) {
            setPmrZoneIndex(z => z + 1);
            setPmrSubPhase('TENSE');
            return 5; // 5 seconds tense
          } else {
            setIsCompleted(true);
            return 0;
          }
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPmr, isCompleted, pmrSubPhase, pmrZoneIndex, pmrZones.length]);

  // -------------------------------------------------------------
  // 4. FOCUS RESET / 60S MINDFUL PAUSE ENGINE
  // -------------------------------------------------------------
  const [focusTask, setFocusTask] = useState('');
  const [focusSeconds, setFocusSeconds] = useState(isFocus ? 180 : 60);

  useEffect(() => {
    if ((!isFocus && !isPause) || isCompleted) return;

    const timer = setInterval(() => {
      setFocusSeconds(prev => {
        if (prev > 1) return prev - 1;
        setIsCompleted(true);
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFocus, isPause, isCompleted]);

  // -------------------------------------------------------------
  // SAVE COPING SESSION
  // -------------------------------------------------------------
  const handleFinish = async (_feeling: string) => {
    try {
      await apiService.createCopingSession({
        exercise_type: type,
        duration_seconds: isGrounding ? 120 : isPmr ? 180 : isFocus ? 180 : 120,
        stress_before: 7,
        stress_after: 3,
        completed: true
      });
      toast.success('Session saved to recovery history!');
      navigate('/toolkit');
    } catch {
      toast.success('Session completed successfully!');
      navigate('/toolkit');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-shield-500/10 via-[#0a0e1a] to-[#0a0e1a]"></div>

      {/* Header */}
      <header className="p-6 relative z-10 flex justify-between items-center max-w-5xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-shield-500/20 rounded-xl border border-shield-500/30 text-shield-400">
            {isBox ? <Wind className="w-5 h-5" /> :
             isGrounding ? <Eye className="w-5 h-5" /> :
             isPmr ? <Zap className="w-5 h-5" /> :
             isFocus ? <Target className="w-5 h-5" /> :
             isPause ? <Clock className="w-5 h-5" /> :
             <Activity className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="text-lg font-bold text-white capitalize">
              {isBox ? 'Box Breathing (4-4-4-4)' :
               is478 ? '4-7-8 Deep Relaxation' :
               isGrounding ? '5-4-3-2-1 Sensory Grounding' :
               isPmr ? 'Progressive Muscle Relaxation' :
               isFocus ? 'Focus Mental Reset' :
               isPause ? '60-Second Mindful Pause' : 'Coping Exercise'}
            </h1>
            <p className="text-xs text-white/50">Guided somatic and nervous system regulation</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/toolkit')}
          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 text-white/70 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div
              key="active-exercise"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col items-center"
            >
              {/* ======================================================= */}
              {/* 1. BOX BREATHING / 4-7-8 / MINDFUL PAUSE UI             */}
              {/* ======================================================= */}
              {(isBox || is478 || isPause) && (
                <div className="flex flex-col items-center text-center">
                  <span className="text-sm font-medium text-shield-400 bg-shield-500/10 px-4 py-1.5 rounded-full border border-shield-500/20 mb-8">
                    {breathPhase === 'PREPARE' ? 'Preparing nervous system...' : `Cycle ${cycle} of ${totalCycles}`}
                  </span>

                  {/* Pulsing Visual Guide */}
                  <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                    <motion.div
                      className={`absolute rounded-3xl flex items-center justify-center ${
                        isBox ? 'rounded-2xl border-2 border-shield-400/80 bg-shield-500/15' : 'rounded-full border-2 border-cyan-400/80 bg-cyan-500/15'
                      }`}
                      animate={{
                        scale: breathPhase === 'INHALE' ? 1.45 : breathPhase === 'EXHALE' ? 0.95 : breathPhase === 'HOLD_IN' ? 1.45 : 0.95,
                        boxShadow: breathPhase === 'INHALE' ? '0 0 70px rgba(0, 163, 255, 0.5)' :
                                   breathPhase === 'HOLD_IN' ? '0 0 90px rgba(6, 182, 212, 0.6)' :
                                   breathPhase === 'HOLD_OUT' ? '0 0 40px rgba(99, 102, 241, 0.4)' :
                                   '0 0 25px rgba(0, 163, 255, 0.2)'
                      }}
                      transition={{
                        duration: breathPhase === 'INHALE' ? breathTiming.inhale :
                                  breathPhase === 'EXHALE' ? breathTiming.exhale :
                                  breathPhase === 'HOLD_IN' ? breathTiming.holdIn :
                                  breathPhase === 'HOLD_OUT' ? breathTiming.holdOut : 0.5,
                        ease: 'easeInOut'
                      }}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <div className="text-5xl font-black tracking-widest text-white drop-shadow-md">
                        {breathTimer}
                      </div>
                    </motion.div>
                  </div>

                  {/* Phase Label */}
                  <div className="h-14">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={breathPhase}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-shield-400 to-cyan-300"
                      >
                        {breathPhase === 'PREPARE' && 'GET READY'}
                        {breathPhase === 'INHALE' && 'INHALE SLOWLY'}
                        {breathPhase === 'HOLD_IN' && 'HOLD GENTLY'}
                        {breathPhase === 'EXHALE' && 'RELEASE SMOOTHLY'}
                        {breathPhase === 'HOLD_OUT' && 'HOLD LUNGS EMPTY'}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <p className="text-sm text-white/50 mt-2">
                    {breathPhase === 'INHALE' ? 'Expand diaphragm through your nose' :
                     breathPhase === 'HOLD_IN' ? 'Keep chest relaxed and still' :
                     breathPhase === 'EXHALE' ? 'Slowly exhale through your mouth' :
                     'Notice the calm stillness before the next breath'}
                  </p>
                </div>
              )}

              {/* ======================================================= */}
              {/* 2. 5-4-3-2-1 SENSORY GROUNDING UI                       */}
              {/* ======================================================= */}
              {isGrounding && (
                <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                      Step {groundingStep + 1} of 5
                    </span>
                    <span className="text-xs text-white/40">Sensory Anchoring</span>
                  </div>

                  <div className="flex justify-center my-4">
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 shadow-lg shadow-cyan-500/10">
                      {groundingPrompts[groundingStep].icon}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {groundingPrompts[groundingStep].count} Things You Can {groundingPrompts[groundingStep].sense}
                    </h2>
                    <p className="text-white/70 text-sm max-w-md mx-auto">
                      {groundingPrompts[groundingStep].prompt}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 text-left border border-white/5 space-y-2">
                    <p className="text-xs text-white/40 uppercase font-semibold">Suggested Examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {groundingPrompts[groundingStep].examples.map((ex, i) => (
                        <span key={i} className="text-xs bg-white/10 text-white/90 px-3 py-1.5 rounded-lg">
                          • {ex}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleNextGrounding}
                    className="w-full py-4 bg-gradient-to-r from-shield-500 to-cyan-500 hover:from-shield-600 hover:to-cyan-600 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-shield-500/20"
                  >
                    {groundingStep === groundingPrompts.length - 1 ? 'Complete Grounding' : 'I Noticed These → Next Step'}
                  </button>
                </div>
              )}

              {/* ======================================================= */}
              {/* 3. PROGRESSIVE MUSCLE RELAXATION (PMR) UI               */}
              {/* ======================================================= */}
              {isPmr && (
                <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      Zone {pmrZoneIndex + 1} of {pmrZones.length}
                    </span>
                    <span className="text-xs text-white/40">Tension Release</span>
                  </div>

                  <div className="my-6">
                    <h2 className="text-3xl font-extrabold text-white mb-2">
                      {pmrZones[pmrZoneIndex].name}
                    </h2>
                    <p className="text-white/70 text-sm max-w-md mx-auto">
                      {pmrZones[pmrZoneIndex].desc}
                    </p>
                  </div>

                  <div className={`p-8 rounded-3xl border-2 transition-all ${
                    pmrSubPhase === 'TENSE'
                      ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20'
                      : 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                  }`}>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1 text-white/60">
                      {pmrSubPhase === 'TENSE' ? '⚡ TENSE & HOLD FIRM' : '🌿 RELEASE & RELAX FULLY'}
                    </p>
                    <div className="text-6xl font-black text-white my-2">
                      {pmrSeconds}s
                    </div>
                    <p className="text-xs text-white/50">
                      {pmrSubPhase === 'TENSE' ? 'Keep steady tension, do not hold your breath' : 'Feel the warmth and blood flow release'}
                    </p>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* 4. FOCUS MENTAL RESET UI                                 */}
              {/* ======================================================= */}
              {isFocus && (
                <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-widest text-shield-400 bg-shield-500/10 px-3 py-1 rounded-full border border-shield-500/20">
                      3-Minute Clarity Reset
                    </span>
                    <span className="text-xs text-white/40">Pomodoro Intent</span>
                  </div>

                  <div className="my-4">
                    <div className="text-6xl font-black text-shield-400 mb-2">
                      {Math.floor(focusSeconds / 60)}:{String(focusSeconds % 60).padStart(2, '0')}
                    </div>
                    <p className="text-white/60 text-xs">Take 3 minutes to clear mental clutter before your study sprint.</p>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 text-left border border-white/5 space-y-2">
                    <label className="text-xs text-white/50 block font-medium">What is your ONE single focus target after this reset?</label>
                    <input
                      type="text"
                      value={focusTask}
                      onChange={(e) => setFocusTask(e.target.value)}
                      placeholder="e.g., Solve 5 math questions / Read chapter 3"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-shield-400"
                    />
                  </div>

                  <button
                    onClick={() => setIsCompleted(true)}
                    className="w-full py-3.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-all"
                  >
                    I Feel Ready → Complete Early
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            /* ======================================================= */
            /* 5. SESSION COMPLETION & RECOVERY ASSESSMENT             */
            /* ======================================================= */
            <motion.div
              key="completion-screen"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-3xl font-extrabold text-white mb-2">Great Work!</h2>
                <p className="text-white/60 text-sm">Your nervous system has experienced active down-regulation.</p>
              </div>

              {/* Before & After Indicator */}
              <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="text-center">
                  <p className="text-xs text-white/40 mb-1 font-semibold uppercase">Before Reset</p>
                  <p className="text-2xl font-black text-rose-400">7.5 / 10</p>
                </div>
                <div className="h-px bg-white/15 flex-1 mx-4"></div>
                <div className="text-center">
                  <p className="text-xs text-white/40 mb-1 font-semibold uppercase">Estimated Now</p>
                  <p className="text-2xl font-black text-emerald-400">3.2 / 10</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-white/80 mb-3">How do you feel in your body right now?</p>
                <div className="grid grid-cols-2 gap-3">
                  {['Much Calmer 😌', 'Better 🙂', 'About Same 😐', 'Still Tense 😣'].map((feel) => (
                    <button
                      key={feel}
                      onClick={() => handleFinish(feel)}
                      className="p-3.5 bg-white/5 hover:bg-shield-500/25 hover:border-shield-500/40 rounded-xl transition-all border border-white/5 text-sm font-medium text-white/90"
                    >
                      {feel}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default BreathingPage;
