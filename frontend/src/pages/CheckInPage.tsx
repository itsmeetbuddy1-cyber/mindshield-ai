import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

export const CheckInPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [feeling, setFeeling] = useState<string>('');
  const [affecting, setAffecting] = useState<string[]>([]);

  const feelings = [
    { id: 'calm', emoji: '😌', label: 'Calm', color: 'hover:bg-green-500/20' },
    { id: 'okay', emoji: '🙂', label: 'Okay', color: 'hover:bg-blue-500/20' },
    { id: 'neutral', emoji: '😐', label: 'Neutral', color: 'hover:bg-gray-500/20' },
    { id: 'stressed', emoji: '😰', label: 'Stressed', color: 'hover:bg-orange-500/20' },
    { id: 'overwhelmed', emoji: '😩', label: 'Overwhelmed', color: 'hover:bg-red-500/20' }
  ];

  const factors = [
    'Academic Pressure', 'Workload', 'Relationships', 
    'Family', 'Sleep', 'Financial Concerns', 'Other'
  ];

  const handleFeelingSelect = (id: string) => {
    setFeeling(id);
    setTimeout(() => setStep(2), 300);
  };

  const toggleFactor = (factor: string) => {
    if (affecting.includes(factor)) {
      setAffecting(affecting.filter(f => f !== factor));
    } else {
      setAffecting([...affecting, factor]);
    }
  };

  const handleSubmit = async () => {
    try {
      const stressLevelMap: Record<string, number> = {
        calm: 2,
        okay: 4,
        neutral: 5,
        stressed: 7,
        overwhelmed: 9,
      };
      await apiService.createCheckIn({
        mood: feeling || 'neutral',
        stressor: affecting.length > 0 ? affecting.join(', ') : 'None specified',
        stress_level: stressLevelMap[feeling] || 5,
      });
      toast.success('Check-in saved successfully');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to save check-in');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6 pb-24 flex items-center justify-center">
      <div className="max-w-xl w-full">
        
        <header className="flex flex-col items-center justify-center space-y-4 mb-12 text-center">
          <div className="w-16 h-16 rounded-full bg-shield-500/20 flex items-center justify-center">
            <ClipboardCheck className="w-8 h-8 text-shield-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Daily Check-In</h1>
            <p className="text-white/60 mt-2">Take a moment to reflect on how you're feeling.</p>
          </div>
        </header>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full"
              >
                <h2 className="text-xl font-medium mb-6 text-center">How are you feeling right now?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {feelings.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleFeelingSelect(f.id)}
                      className={`p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center space-y-3 transition-all duration-300 ${f.color} ${feeling === f.id ? 'ring-2 ring-shield-500 bg-shield-500/10' : ''}`}
                    >
                      <span className="text-4xl">{f.emoji}</span>
                      <span className="font-medium">{f.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <button onClick={() => navigate('/dashboard')} className="text-white/40 hover:text-white transition-colors">
                    Skip for now
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full"
              >
                <h2 className="text-xl font-medium mb-6 text-center">What is affecting you most?</h2>
                <div className="flex flex-wrap gap-3 justify-center mb-8">
                  {factors.map((factor) => (
                    <button
                      key={factor}
                      onClick={() => toggleFactor(factor)}
                      className={`px-4 py-2 rounded-full border transition-all duration-300 ${
                        affecting.includes(factor) 
                          ? 'bg-shield-500 text-white border-shield-500' 
                          : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {factor}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-12">
                  <button 
                    onClick={() => setStep(1)}
                    className="px-6 py-2 rounded-xl text-white/60 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-shield-500 hover:bg-shield-400 text-white font-medium rounded-xl transition-colors shadow-lg shadow-shield-500/25"
                  >
                    Complete Check-In
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;
