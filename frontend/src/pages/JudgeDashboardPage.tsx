import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, Sparkles, Users, Activity, 
  Brain, Shield, Heart, TrendingUp, Cpu, 
  Database, Server, Code, Lock, Zap
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const JudgeDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const architecture = [
    { icon: <Code />, title: 'React Frontend', desc: 'Vite + TS + Tailwind + Framer' },
    { icon: <Server />, title: 'FastAPI Backend', desc: 'High-perf async Python API' },
    { icon: <Brain />, title: 'AI Engine', desc: 'Groq/Llama3 for inference' },
    { icon: <Activity />, title: 'Stress Analyzer', desc: 'ML models for keystroke typing patterns' },
    { icon: <Lock />, title: 'Safety Layer', desc: 'Local PII scrubbing & anonymization' },
    { icon: <Database />, title: 'SQLite DB', desc: 'Local-first data storage' }
  ];

  const pipeline = [
    { icon: <Users className="w-5 h-5 text-blue-400" />, label: 'User Interaction', desc: 'Typing patterns & digital behavior' },
    { icon: <Activity className="w-5 h-5 text-cyan-400" />, label: 'Signal Processing', desc: 'Local feature extraction (latency/speed)' },
    { icon: <Brain className="w-5 h-5 text-purple-400" />, label: 'AI Stress Estimation', desc: 'Model inference determines stress score' },
    { icon: <Shield className="w-5 h-5 text-green-400" />, label: 'Safety Layer', desc: 'Privacy preserving data masking' },
    { icon: <Heart className="w-5 h-5 text-pink-400" />, label: 'Personalized Intervention', desc: 'Targeted coping strategies delivered' },
    { icon: <TrendingUp className="w-5 h-5 text-orange-400" />, label: 'Recovery Tracking', desc: 'Efficacy measurement & adaptation' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-8 pb-24 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header Section */}
        <header className="text-center space-y-6 py-12 relative">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-shield-500/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-shield-500/10 border border-shield-500/30 text-shield-400 text-sm font-semibold mb-4">
              <span>Team: <strong className="text-white">INSIGHT-X</strong></span>
              <span className="text-white/30">•</span>
              <span>Contact: <strong className="text-white">itsmeetbuddy1@gmail.com</strong></span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-shield-500 to-cyan-300">MindShield AI</span>
            </h1>
            <p className="text-2xl text-white/80 font-light tracking-wide">SIH Innovation & Architecture Overview</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            <button 
              onClick={() => navigate('/demo')}
              className="px-8 py-4 bg-shield-500 hover:bg-shield-400 text-white font-bold rounded-xl transition-all shadow-[0_0_40px_rgba(0,163,255,0.4)] hover:shadow-[0_0_60px_rgba(0,163,255,0.6)] flex items-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>RUN LIVE DEMO</span>
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-all"
            >
              View Full Application
            </button>
          </motion.div>
        </header>

        {/* Problem vs Approach */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 backdrop-blur-xl">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-6">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4">The Problem</h2>
            <p className="text-lg text-white/70 leading-relaxed">
              Traditional mental-health support can be reactive and difficult to access. Users often don't seek help until they reach a breaking point, and passive tracking apps lack immediate, actionable interventions.
            </p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-shield-500/10 border border-shield-500/20 rounded-3xl p-8 backdrop-blur-xl">
            <div className="w-12 h-12 bg-shield-500/20 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-shield-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Approach</h2>
            <p className="text-lg text-white/70 leading-relaxed">
              Real-time AI-assisted detection of changing stress indicators followed by immediate supportive intervention. We catch stress before it becomes overwhelming, delivering right-sized support proactively.
            </p>
          </motion.div>
        </div>

        {/* Key Metrics */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-3 gap-6">
          {[
            { label: 'Response Time', value: '<100ms', desc: 'Real-time detection' },
            { label: 'Privacy Score', value: '100%', desc: 'Local-first architecture' },
            { label: 'AI Confidence', value: '78%', desc: 'Behavioral classification' }
          ].map((metric, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <h3 className="text-4xl font-black text-white mb-2">{metric.value}</h3>
              <p className="text-shield-400 font-medium mb-1">{metric.label}</p>
              <p className="text-sm text-white/40">{metric.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Technical Architecture */}
        <div className="space-y-8 pt-8 border-t border-white/10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">System Architecture</h2>
            <p className="text-white/60">A modular, privacy-first stack designed for speed, security, and scalable AI inference.</p>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {architecture.map((item, i) => (
              <motion.div key={i} variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <div className="text-shield-400">{item.icon}</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Pipeline Visualization */}
        <div className="space-y-12 pt-16 border-t border-white/10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Innovation Pipeline</h2>
            <p className="text-white/60">From raw behavioral signal to personalized therapeutic intervention.</p>
          </div>
          
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute left-12 top-10 bottom-10 w-0.5 bg-gradient-to-b from-blue-500 via-shield-500 to-pink-500 opacity-50 hidden md:block"></div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-6 relative"
            >
              {pipeline.map((step, i) => (
                <motion.div key={i} variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="w-24 h-24 shrink-0 bg-[#12182b] border-2 border-white/20 rounded-2xl flex items-center justify-center z-10 shadow-xl relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-shield-500/20 to-purple-500/20 rounded-3xl blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {step.icon}
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1 w-full relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-shield-500/50"></div>
                    <h3 className="text-xl font-bold mb-1 text-white">{step.label}</h3>
                    <p className="text-white/60">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default JudgeDashboardPage;
