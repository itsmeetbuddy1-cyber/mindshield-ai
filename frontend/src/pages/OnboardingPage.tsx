import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/api';

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    feeling: 'okay',
    affecting: 'academic',
    supportType: 'quick_calm'
  });

  const stressMap: Record<string, number> = {
    calm: 20,
    okay: 35,
    neutral: 50,
    stressed: 75,
    overwhelmed: 90
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      // Record initial check-in in the database
      const stressLevel = stressMap[formData.feeling] || 50;
      await apiService.createCheckIn({
        mood: formData.feeling,
        stressor: formData.affecting,
        stress_level: stressLevel
      });
      toast.success("Welcome aboard! Your initial wellness check-in is saved.");
    } catch (e) {
      console.warn("Check-in save warning (proceeding to dashboard):", e);
    } finally {
      setSubmitting(false);
      navigate('/dashboard');
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 40, scale: 0.98 },
    in: { opacity: 1, x: 0, scale: 1 },
    out: { opacity: 0, x: -40, scale: 0.98 }
  };

  const pageTransition = { type: "spring", damping: 25, stiffness: 200 };

  const steps = [
    {
      stepNumber: 1,
      title: "How are you feeling today?",
      subtitle: "Select the option that best matches your current emotional baseline.",
      options: [
        { label: 'Calm', emoji: '😌', value: 'calm', desc: 'Feeling relaxed and peaceful' },
        { label: 'Okay', emoji: '🙂', value: 'okay', desc: 'Doing fine, balance is good' },
        { label: 'Neutral', emoji: '😐', value: 'neutral', desc: 'Neither good nor bad' },
        { label: 'Stressed', emoji: '😰', value: 'stressed', desc: 'Under pressure, feeling tense' },
        { label: 'Overwhelmed', emoji: '😩', value: 'overwhelmed', desc: 'Need immediate relief and reset' }
      ],
      field: 'feeling' as const
    },
    {
      stepNumber: 2,
      title: "What is affecting you most?",
      subtitle: "Pinpoint the primary area creating tension or emotional load.",
      options: [
        { label: 'Academic Pressure', emoji: '📚', value: 'academic', desc: 'Exams, assignments, syllabus' },
        { label: 'Workload & Deadlines', emoji: '💼', value: 'workload', desc: 'Job pressure, long hours' },
        { label: 'Relationships & Friends', emoji: '💬', value: 'relationships', desc: 'Misunderstandings, distance' },
        { label: 'Family Expectations', emoji: '🏡', value: 'family', desc: 'Parents expectations, home stress' },
        { label: 'Sleep & Night Restlessness', emoji: '🌙', value: 'sleep', desc: 'Insomnia, racing thoughts' },
        { label: 'Financial Concerns', emoji: '💰', value: 'financial', desc: 'Bills, expenses, future security' },
        { label: 'Other / General Overwhelm', emoji: '⚡', value: 'other', desc: 'Unclear multiple factors' }
      ],
      field: 'affecting' as const
    },
    {
      stepNumber: 3,
      title: "What kind of support would you prefer?",
      subtitle: "Shield AI will tailor its real-time interventions to your choice.",
      options: [
        { label: 'Quick Calm & Reset', emoji: '🧘', value: 'quick_calm', desc: 'Guided breathing and immediate sensory grounding' },
        { label: 'Talk It Out with Shield AI', emoji: '🤖', value: 'talk', desc: 'Empathetic conversational chat & listening' },
        { label: 'Understand My Patterns', emoji: '📊', value: 'patterns', desc: 'Multimodal analytics, triggers & metrics' },
        { label: 'Build a Daily Recovery Routine', emoji: '🌱', value: 'routine', desc: 'Long-term healthy habit tracking' }
      ],
      field: 'supportType' as const
    }
  ];

  const currentStepData = steps[step - 1];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden selection:bg-blue-500/30">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Brand Header */}
      <div className="flex items-center gap-3 mb-8 z-10">
        <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
          <Shield className="w-6 h-6 text-blue-400" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          MindShield AI
        </span>
      </div>

      <div className="w-full max-w-3xl relative z-10">
        {/* Step Progress Tracker */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-3">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  i === step ? 'w-14 bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 
                  i < step ? 'w-8 bg-blue-500/60' : 'w-8 bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Step {step} of 3
          </span>
        </div>

        {/* Interactive Step Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 md:p-10 shadow-2xl shadow-black/50 flex flex-col relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-4xl font-extrabold mb-3 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  {currentStepData.title}
                </h2>
                <p className="text-sm md:text-base text-slate-400 max-w-md mx-auto">
                  {currentStepData.subtitle}
                </p>
              </div>

              {/* Options Grid */}
              <div className={`grid gap-3.5 ${
                step === 1 
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5' 
                  : step === 2 
                  ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' 
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}>
                {currentStepData.options.map((opt) => {
                  const isSelected = formData[currentStepData.field] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, [currentStepData.field]: opt.value })}
                      className={`relative p-4 rounded-2xl border text-left transition-all duration-200 group flex flex-col justify-between
                        ${isSelected 
                          ? 'border-blue-500 bg-gradient-to-b from-blue-500/15 to-cyan-500/10 shadow-[0_0_25px_rgba(59,130,246,0.25)] scale-[1.02]' 
                          : 'border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800/80'
                        }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                      
                      <div>
                        {opt.emoji && (
                          <span className={`block mb-2 ${step === 1 ? 'text-4xl text-center' : 'text-2xl'}`}>
                            {opt.emoji}
                          </span>
                        )}
                        <span className={`font-semibold block ${step === 1 ? 'text-center text-sm md:text-base text-white' : 'text-base text-white'}`}>
                          {opt.label}
                        </span>
                      </div>

                      {opt.desc && step !== 1 && (
                        <span className="text-xs text-slate-400 mt-2 block leading-relaxed">
                          {opt.desc}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="mt-10 flex justify-between items-center pt-6 border-t border-slate-800/80">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              {step === 1 ? 'Skip to Dashboard' : 'Back'}
            </button>
            
            <div className="flex items-center gap-3">
              {step < 3 && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-slate-500 hover:text-slate-300 transition-colors text-xs font-medium px-3 py-2"
                >
                  Skip
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={submitting}
                className="flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Saving...</span>
                ) : step === 3 ? (
                  <>
                    <span>Enter Dashboard</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
