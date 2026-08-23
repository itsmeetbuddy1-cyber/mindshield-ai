import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    feeling: '',
    affecting: '',
    supportType: ''
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleComplete();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate('/');
  };

  const handleComplete = async () => {
    toast.success("Check-in complete. Redirecting...");
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 }
  };

  const pageTransition = { type: "tween", ease: "anticipate", duration: 0.4 };

  const steps = [
    {
      title: "How are you feeling today?",
      options: [
        { label: 'Calm', emoji: '😌', value: 'calm' },
        { label: 'Okay', emoji: '🙂', value: 'okay' },
        { label: 'Neutral', emoji: '😐', value: 'neutral' },
        { label: 'Stressed', emoji: '😰', value: 'stressed' },
        { label: 'Overwhelmed', emoji: '😩', value: 'overwhelmed' }
      ],
      field: 'feeling' as const
    },
    {
      title: "What is affecting you most?",
      options: [
        { label: 'Academic Pressure', value: 'academic' },
        { label: 'Workload', value: 'workload' },
        { label: 'Relationships', value: 'relationships' },
        { label: 'Family', value: 'family' },
        { label: 'Sleep', value: 'sleep' },
        { label: 'Financial Concerns', value: 'financial' },
        { label: 'Other', value: 'other' }
      ],
      field: 'affecting' as const
    },
    {
      title: "What kind of support would you prefer?",
      options: [
        { label: 'Quick Calm', value: 'quick_calm', desc: 'Breathing exercises and immediate relief' },
        { label: 'Talk It Out', value: 'talk', desc: 'Chat with the AI assistant' },
        { label: 'Understand My Patterns', value: 'patterns', desc: 'View insights and analytics' },
        { label: 'Build a Routine', value: 'routine', desc: 'Long-term wellness planning' }
      ],
      field: 'supportType' as const
    }
  ];

  const currentStepData = steps[step - 1];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-blue-500/30">
      <div className="w-full max-w-2xl relative">
        
        {/* Progress Header */}
        <div className="mb-12">
          <div className="flex justify-center gap-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'w-12 bg-blue-500' : 
                  i < step ? 'w-8 bg-blue-500/50' : 'w-8 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 md:p-12 shadow-2xl min-h-[400px] flex flex-col relative overflow-hidden">
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
              <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                {currentStepData.title}
              </h2>

              <div className={`grid gap-4 ${step === 1 ? 'grid-cols-2 md:grid-cols-3' : step === 2 ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
                {currentStepData.options.map((opt) => {
                  const isSelected = formData[currentStepData.field] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setFormData({ ...formData, [currentStepData.field]: opt.value })}
                      className={`relative p-4 rounded-2xl border text-left transition-all duration-200 overflow-hidden group
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                          : 'border-slate-700 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800'
                        }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-blue-400">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                      
                      <div className="flex flex-col h-full justify-center">
                        {step === 1 && 'emoji' in opt && (
                          <span className="text-4xl mb-2 block">{opt.emoji}</span>
                        )}
                        <span className={`font-medium ${step === 1 ? 'text-lg' : 'text-base'}`}>
                          {opt.label}
                        </span>
                        {'desc' in opt && (
                          <span className="text-sm text-slate-400 mt-2 block">
                            {opt.desc}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-12 flex justify-between items-center pt-6 border-t border-slate-800">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleNext}
                className="text-slate-500 hover:text-slate-300 transition-colors text-sm font-medium px-4"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                disabled={!formData[currentStepData.field] && step < 3}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all
                  ${formData[currentStepData.field] || step === 3
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
              >
                {step === 3 ? 'Complete' : 'Next'}
                {step < 3 && <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
