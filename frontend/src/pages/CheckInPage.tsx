import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Heart, Brain, Zap, Moon, Briefcase, Users, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const CheckInPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [score, setScore] = useState(50);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggers = [
    { id: 'work', label: t('checkin.triggers.work', 'Work'), icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20' },
    { id: 'sleep', label: t('checkin.triggers.sleep', 'Sleep'), icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-500/20' },
    { id: 'social', label: t('checkin.triggers.social', 'Social'), icon: Users, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20' },
    { id: 'health', label: t('checkin.triggers.health', 'Health'), icon: Heart, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-500/20' },
    { id: 'stress', label: t('checkin.triggers.stress', 'High Stress'), icon: Zap, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/20' },
    { id: 'mind', label: t('checkin.triggers.mind', 'Overthinking'), icon: Brain, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
  ];

  const toggleTrigger = (id: string) => {
    setSelectedTriggers(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await apiService.createCheckIn({ mood: 'neutral', stressor: selectedTriggers.join(','), stress_level: score });
      toast.success(t('checkin.success', 'Check-in recorded successfully!'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(t('checkin.error', 'Failed to save check-in.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('checkin.title', 'Daily Check-in')}
          </h1>
          <p className="text-gray-500 dark:text-slate-400">
            {t('checkin.subtitle', 'Take a moment to reflect on your current state.')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-slate-400">
          <span className={step === 1 ? 'text-blue-600 dark:text-blue-400' : ''}>Step 1</span>
          <ChevronRight className="w-4 h-4" />
          <span className={step === 2 ? 'text-blue-600 dark:text-blue-400' : ''}>Step 2</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-8 shadow-sm">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('checkin.step1.title', 'How are you feeling right now?')}
                </h2>
                <div className="text-6xl font-black text-blue-600 dark:text-blue-400 my-8">
                  {score}
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-slate-400">
                  <span>{t('checkin.scale.calm', 'Calm & Relaxed')} (0)</span>
                  <span>{t('checkin.scale.stressed', 'Highly Stressed')} (100)</span>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                {t('checkin.continue', 'Continue')} <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('checkin.step2.title', "What's contributing to this?")}
                </h2>
                <p className="text-gray-500 dark:text-slate-400">
                  {t('checkin.step2.subtitle', 'Select any triggers that apply to you right now.')}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {triggers.map(trigger => {
                  const isSelected = selectedTriggers.includes(trigger.id);
                  return (
                    <button
                      key={trigger.id}
                      onClick={() => toggleTrigger(trigger.id)}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' 
                          : 'border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/50 hover:border-blue-200 dark:hover:border-blue-500/30'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${trigger.bg}`}>
                        <trigger.icon className={`w-6 h-6 ${trigger.color}`} />
                      </div>
                      <span className={`font-medium text-sm ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-slate-300'}`}>
                        {trigger.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-500 absolute top-3 right-3" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
                >
                  {t('checkin.back', 'Back')}
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? t('checkin.saving', 'Saving...') : t('checkin.finish', 'Finish Check-in')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CheckInPage;
