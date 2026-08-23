import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import apiService from '../services/api';

const InsightsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading insights
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return <div className="h-full flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#00a3ff] border-t-transparent rounded-full" /></div>;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-[#00a3ff]/20 rounded-2xl border border-[#00a3ff]/30">
          <Brain className="w-8 h-8 text-[#00a3ff]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">AI Insights</h1>
          <p className="text-white/60 mt-1">Personalized observations based on your recent activity</p>
        </div>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Today's Pattern */}
        <motion.div variants={item} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden group hover:bg-white/10 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-3 mb-4 text-[#00a3ff]">
            <TrendingUp className="w-6 h-6" />
            <h2 className="text-xl font-bold">Today's Pattern</h2>
          </div>
          <p className="text-white/80 leading-relaxed relative z-10">
            Based on your interactions, your stress levels appear to peak around <strong className="text-white">2:00 PM</strong>. This might be correlated with post-lunch work demands. Taking a 5-minute preemptive break at 1:45 PM may help stabilize your afternoon index.
          </p>
        </motion.div>

        {/* Weekly Trend */}
        <motion.div variants={item} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden group hover:bg-white/10 transition-colors">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown className="w-24 h-24 text-green-500" />
          </div>
          <div className="flex items-center gap-3 mb-4 text-green-400">
            <TrendingDown className="w-6 h-6" />
            <h2 className="text-xl font-bold">Weekly Overview</h2>
          </div>
          <p className="text-white/80 leading-relaxed relative z-10">
            Great progress! Your overall baseline stress has <strong className="text-green-400">decreased by 12%</strong> compared to last week. The breathing exercises you utilized on Tuesday and Thursday appear to have had a lasting positive effect on your recovery rate.
          </p>
        </motion.div>

        {/* Triggers */}
        <motion.div variants={item} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden group hover:bg-white/10 transition-colors">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle className="w-24 h-24 text-amber-500" />
          </div>
          <div className="flex items-center gap-3 mb-4 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Possible Triggers</h2>
          </div>
          <p className="text-white/80 leading-relaxed mb-4 relative z-10">
            Shield AI has noticed elevated physiological signals during the following contexts:
          </p>
          <ul className="space-y-3 relative z-10">
            <li className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-white/90">Long uninterrupted screen time (&gt;2 hours)</span>
            </li>
            <li className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-white/90">Rapid context switching between tasks</span>
            </li>
          </ul>
        </motion.div>

        {/* What Works */}
        <motion.div variants={item} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden group hover:bg-white/10 transition-colors">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle className="w-24 h-24 text-purple-500" />
          </div>
          <div className="flex items-center gap-3 mb-4 text-purple-400">
            <CheckCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Effective Strategies</h2>
          </div>
          <p className="text-white/80 leading-relaxed mb-4 relative z-10">
            When you experience sudden stress spikes, these methods have proven most effective for your recovery:
          </p>
          <div className="space-y-4 relative z-10">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/80">Guided Breathing (4-7-8)</span>
                <span className="text-green-400">Highly Effective</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/80">Venting / Chat with Shield AI</span>
                <span className="text-green-400">Effective</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default InsightsPage;
