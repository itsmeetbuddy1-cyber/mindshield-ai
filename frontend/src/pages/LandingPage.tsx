import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Brain, Activity, Heart, Lock, ArrowRight, Eye, Sparkles, User, Mail, Users, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 px-6 md:px-12 py-6 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">MindShield AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/judge" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:block">
            Judge Dashboard
          </Link>
          <Link 
            to="/demo" 
            className="text-sm font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md transition-all border border-white/10"
          >
            Launch Demo
          </Link>
          {isAuthenticated ? (
            <Link 
              to="/dashboard" 
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard ({user?.display_name || user?.username || 'User'})</span>
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        {/* Animated Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
        
        <motion.div 
          className="max-w-5xl mx-auto text-center z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-sm text-cyan-400 font-medium mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Next-Generation Mental Wellness AI</span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8"
          >
            Real-Time AI Support <br/>
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              for Stress & Trauma
            </span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Understand your stress signals, receive immediate coping support, and build healthier recovery patterns with AI-assisted insights.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              to={isAuthenticated ? "/dashboard" : "/login?mode=signup"}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-full font-semibold text-lg shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to={isAuthenticated ? "/dashboard" : "/login?mode=login"}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white rounded-full font-semibold text-lg backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5 text-cyan-400" />
              <span>Sign In</span>
            </Link>
            <a 
              href="#how-it-works"
              className="w-full sm:w-auto px-6 py-4 text-slate-400 hover:text-white font-medium text-base transition-colors flex items-center justify-center"
            >
              Explore How It Works
            </a>
          </motion.div>

          {/* Animated AI Visualization */}
          <motion.div 
            variants={itemVariants}
            className="mt-24 relative flex justify-center items-center h-48"
          >
            <div className="absolute w-32 h-32 rounded-full border border-blue-500/20 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
            <div className="absolute w-48 h-48 rounded-full border border-cyan-500/20 animate-ping opacity-10" style={{ animationDuration: '4s' }} />
            
            <div className="relative z-10 p-6 bg-slate-900/80 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-2xl">
              <Shield className="w-16 h-16 text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            </div>

            {/* Orbiting particles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-cyan-400 rounded-full"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 4 + i * 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  transformOrigin: `${80 + i * 20}px center`,
                  left: '50%',
                  top: '50%',
                  marginTop: '-6px',
                  marginLeft: '-6px'
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Visual Flow Section */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-900/30 border-y border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Support Loop</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Continuous, intelligent care that adapts to your needs.</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-900 via-cyan-900 to-blue-900 -translate-y-1/2 z-0" />
            
            {[
              { icon: User, label: "USER" },
              { icon: Activity, label: "SIGNALS" },
              { icon: Brain, label: "AI" },
              { icon: Eye, label: "INSIGHT" },
              { icon: Heart, label: "SUPPORT" }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative z-10 flex flex-col items-center gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl w-full md:w-auto"
              >
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-blue-400" />
                </div>
                <span className="font-bold tracking-wider text-sm text-slate-300">{step.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              icon: Activity,
              title: "Real-Time Insights",
              desc: "AI monitors your reported signals and interaction patterns to estimate stress levels in real time.",
              color: "text-blue-400"
            },
            {
              icon: Heart,
              title: "Personalized Support",
              desc: "Receive coping exercises and recommendations tailored to your current emotional state.",
              color: "text-rose-400"
            },
            {
              icon: Shield,
              title: "Safety-Aware AI",
              desc: "Built-in safety detection identifies serious distress signals and connects you with appropriate resources.",
              color: "text-emerald-400"
            },
            {
              icon: Lock,
              title: "Privacy First",
              desc: "Your data stays private. No unnecessary collection. Full control over your information.",
              color: "text-purple-400"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 hover:bg-slate-800/50 transition-colors backdrop-blur-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800 mb-6">
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Innovation Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-12">From Detection to Intervention</h2>
          
          <div className="relative p-8 rounded-3xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent opacity-50" />
            
            <div className="relative z-10 flex flex-wrap justify-center gap-4 text-lg font-semibold items-center">
              <span className="text-blue-400">DETECT</span>
              <ArrowRight className="text-slate-600" />
              <span className="text-cyan-400">UNDERSTAND</span>
              <ArrowRight className="text-slate-600" />
              <span className="text-emerald-400">SUPPORT</span>
              <ArrowRight className="text-slate-600" />
              <span className="text-purple-400">RECOVER</span>
              <ArrowRight className="text-slate-600" />
              <span className="text-rose-400">LEARN</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us & Team Section */}
      <section id="contact" className="py-20 px-6 bg-slate-900/60 border-t border-slate-800/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-semibold mb-4">
              <Users className="w-4 h-4" />
              <span>Smart India Hackathon 2026 Initiative</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Contact & Team Details
            </h2>
            <p className="text-slate-400 mt-3 text-base md:text-lg">
              This website was proudly created and engineered by <strong className="text-blue-400">TEAM INSIGHT-X</strong>
            </p>
          </div>

          {/* Team Members Grid */}
          <div className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 text-center">
              Core Engineering Team
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Team Leader */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-500/15 to-cyan-500/10 border-2 border-blue-500/50 backdrop-blur-xl shadow-lg shadow-blue-500/10 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-extrabold uppercase tracking-wider mb-3">
                    👑 TEAM LEADER
                  </div>
                  <h4 className="text-xl font-bold text-white leading-tight">
                    PATEL MEETKUMAR CHIRAGKUMAR
                  </h4>
                  <p className="text-xs text-blue-300 font-medium mt-1">Lead Architect & Full-Stack AI Engineer</p>
                </div>
                <div className="mt-4 pt-3 border-t border-blue-500/20 text-xs text-slate-400 flex items-center justify-between">
                  <span>Team INSIGHT-X</span>
                  <span className="text-cyan-400 font-semibold">Lead</span>
                </div>
              </div>

              {/* Kashvi Pahwa */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-xl hover:border-slate-600 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-sm mb-3">
                    KP
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    KASHVI PAHWA
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Core Developer & Researcher</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Team INSIGHT-X</span>
                  <span className="text-slate-300">Co-Worker</span>
                </div>
              </div>

              {/* Harshit Singh */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-xl hover:border-slate-600 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-sm mb-3">
                    HS
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    HARSHIT SINGH
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Core Developer & Engineer</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Team INSIGHT-X</span>
                  <span className="text-slate-300">Co-Worker</span>
                </div>
              </div>

              {/* Yogendra Singh */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-xl hover:border-slate-600 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-sm mb-3">
                    YS
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    YOGENDRA SINGH
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Core Developer & Systems</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Team INSIGHT-X</span>
                  <span className="text-slate-300">Co-Worker</span>
                </div>
              </div>

              {/* Abhiraj Singh */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-xl hover:border-slate-600 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-sm mb-3">
                    AS
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    ABHIRAJ SINGH
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Core Developer & QA</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Team INSIGHT-X</span>
                  <span className="text-slate-300">Co-Worker</span>
                </div>
              </div>

              {/* Priyank Taunk */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-xl hover:border-slate-600 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-sm mb-3">
                    PT
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    PRIYANK TAUNK
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Core Developer & Integrations</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Team INSIGHT-X</span>
                  <span className="text-slate-300">Co-Worker</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 mb-4 text-blue-400">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Development Organization</h3>
                <p className="text-2xl font-bold text-white">TEAM INSIGHT-X</p>
                <p className="text-slate-400 text-sm mt-2">Next-Gen Multimodal AI Mental Health & Stress Analytics System</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-blue-400 font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Smart India Hackathon 2026</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 mb-4 text-cyan-400">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Contact & Queries</h3>
                <a 
                  href="mailto:itsmeetbuddy1@gmail.com" 
                  className="text-xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors break-all"
                >
                  itsmeetbuddy1@gmail.com
                </a>
                <p className="text-slate-400 text-sm mt-2">Reach out to Team Leader Patel Meetkumar Chiragkumar for queries or evaluations.</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                <span>Response window: &lt; 24 hours</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Disclaimer */}
      <footer className="py-12 px-6 border-t border-slate-900 bg-slate-950">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/50 backdrop-blur-sm text-center">
            <p className="text-sm text-slate-500">
              <strong className="text-slate-400">Disclaimer:</strong> MindShield AI provides wellness support and AI-assisted insights. 
              It does not provide medical diagnosis or replace qualified professional care.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 text-center">
            <p>© 2026 MindShield AI. Developed by <strong className="text-slate-400">TEAM INSIGHT-X</strong> (Led by Patel Meetkumar Chiragkumar).</p>
            <p>Contact: <a href="mailto:itsmeetbuddy1@gmail.com" className="text-blue-400 hover:underline">itsmeetbuddy1@gmail.com</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
