import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Play, Info, Cpu, Network, Lock, Zap } from 'lucide-react';

const JudgeDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header section */}
      <header className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm text-center space-y-4">
         <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-500/30">
           <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
         </div>
         <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">MindShield AI</h1>
         <p className="text-xl text-gray-500 dark:text-slate-400 font-medium">SIH 2026 Evaluation Portal</p>
         
         <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-full text-sm font-semibold text-gray-700 dark:text-slate-300">
           Team: <span className="text-blue-600 dark:text-blue-400">INSIGHT-X</span> • itsmeetbuddy1@gmail.com
         </div>
      </header>

      {/* Quick Action Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/demo" className="group p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Launch Live Demo</h2>
            <p className="text-blue-200 text-sm">Experience the 5-stage multimodal stress test</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-white ml-1" />
          </div>
        </Link>
        <Link to="/sih-explain" className="group p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Architecture & Innovation</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm">Deep dive into our core technologies</p>
          </div>
          <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors">
            <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </Link>
      </div>

      {/* Innovation Summary */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white pl-2">Key Innovations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: 'Multimodal Fusion Engine', 
              icon: Network, 
              color: 'text-purple-500', 
              bg: 'bg-purple-100 dark:bg-purple-500/20',
              desc: 'Combines camera (micro-expressions), voice (prosody), and text (sentiment) for 94% accurate real-time stress detection.'
            },
            { 
              title: 'Explainable AI (XAI)', 
              icon: Cpu, 
              color: 'text-blue-500', 
              bg: 'bg-blue-100 dark:bg-blue-500/20',
              desc: 'No black boxes. The system explains exactly which signals (e.g., elevated pitch, keywords) contributed to the current stress score.'
            },
            { 
              title: 'Autonomous Intervention', 
              icon: Zap, 
              color: 'text-emerald-500', 
              bg: 'bg-emerald-100 dark:bg-emerald-500/20',
              desc: 'Proactively detects rising anxiety thresholds and triggers micro-interventions (breathing, reframing) before meltdowns occur.'
            },
            { 
              title: 'Privacy-First Edge AI', 
              icon: Lock, 
              color: 'text-amber-500', 
              bg: 'bg-amber-100 dark:bg-amber-500/20',
              desc: 'Biometrics are processed securely. High-frequency localized inference ensures sensitive data never leaves the device unprotected.'
            },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${item.bg}`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JudgeDashboardPage;
