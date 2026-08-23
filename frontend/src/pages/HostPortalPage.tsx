import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, KeyRound, Shield, CheckCircle, AlertTriangle, 
  Cpu, Database, RefreshCw, Play, Trash2, ArrowRight, 
  Sparkles, ExternalLink, Activity, Users, LogOut 
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const HostPortalPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mindshield_host_auth') === 'true';
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await apiService.getHostStats();
      setStats(res.data);
    } catch {
      toast.error('Failed to load host stats');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error('Please enter host password');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.hostLogin(password);
      if (res.data?.authenticated) {
        setIsAuthenticated(true);
        localStorage.setItem('mindshield_host_auth', 'true');
        toast.success('Host access granted! Welcome Meet & Team INSIGHT-X');
        fetchStats();
      }
    } catch {
      toast.error('Invalid password! Access restricted to Host only.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('mindshield_host_auth');
    setPassword('');
    toast.success('Logged out from Host Room');
  };

  const handleTriggerStage = async (stageNum: number) => {
    try {
      await apiService.triggerHostStage(stageNum);
      toast.success(`Stage ${stageNum} triggered!`);
      fetchStats();
    } catch {
      toast.error('Failed to trigger stage');
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Clear all user data, stress telemetry, and session logs?')) {
      try {
        await apiService.deleteUserData();
        toast.success('Database reset successfully');
        fetchStats();
      } catch {
        toast.error('Failed to reset data');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6 md:p-10 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-shield-500/20 flex items-center justify-center border border-shield-500/30">
              <Shield className="w-6 h-6 text-shield-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold">Host Control Room</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                  Team INSIGHT-X
                </span>
              </div>
              <p className="text-white/50 text-sm mt-0.5">Admin orchestration & live hackathon control portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 transition-colors"
            >
              Public App View
            </Link>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-medium text-red-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit Host Mode</span>
              </button>
            )}
          </div>
        </header>

        {/* Unauthenticated State */}
        {!isAuthenticated ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-shield-500/20 flex items-center justify-center border border-shield-500/30 mx-auto text-shield-400">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold">Host Authentication</h2>
              <p className="text-white/50 text-xs leading-relaxed">
                Enter your private host password to access administrative controls, telemetry override, and demo triggers.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Host Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="password"
                    placeholder="Enter password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-shield-500/60 focus:ring-1 focus:ring-shield-500/40 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-shield-500 to-cyan-500 hover:from-shield-400 hover:to-cyan-400 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-shield-500/20 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Unlock Host Portal'}
              </button>
            </form>

            <div className="pt-4 border-t border-white/5 text-center">
              <p className="text-[11px] text-white/40">
                Normal users & judges can freely explore without a password via the{' '}
                <Link to="/" className="text-shield-400 hover:underline">
                  Public Portal
                </Link>
                .
              </p>
            </div>
          </motion.div>
        ) : (
          /* Authenticated Host Dashboard */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Check-Ins Stored', value: stats?.total_checkins ?? 0, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Coping Sessions', value: stats?.total_coping_sessions ?? 0, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Safety Events', value: stats?.total_safety_events ?? 0, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Conversations', value: stats?.total_conversations ?? 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              ].map((m, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60 font-medium">{m.label}</span>
                    <div className={`p-2 rounded-lg ${m.bg} ${m.color}`}>
                      <m.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Stage Override Control Card */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Play className="w-5 h-5 text-shield-400" />
                    <span>SIH Demo Stage Override</span>
                  </h2>
                  <p className="text-xs text-white/50 mt-1">Force-set the application stress telemetry to any demonstration phase instantly</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchStats}
                    disabled={refreshing}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
                    title="Refresh Telemetry"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-shield-400' : ''}`} />
                  </button>
                  <button
                    onClick={() => navigate('/demo')}
                    className="px-4 py-2 rounded-xl bg-shield-500 hover:bg-shield-400 text-white text-xs font-semibold transition-colors shadow-md shadow-shield-500/20 flex items-center gap-1.5"
                  >
                    <span>Open Live Demo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[
                  { num: 1, title: 'Stage 1: Calm', stress: 32, badge: 'Baseline' },
                  { num: 2, title: 'Stage 2: Mild', stress: 47, badge: 'Trigger' },
                  { num: 3, title: 'Stage 3: Elevated', stress: 63, badge: 'Escalation' },
                  { num: 4, title: 'Stage 4: High', stress: 78, badge: 'Intervention' },
                  { num: 5, title: 'Stage 5: Recovered', stress: 53, badge: 'Recovery' },
                ].map((st) => (
                  <button
                    key={st.num}
                    onClick={() => handleTriggerStage(st.num)}
                    className={`p-4 rounded-2xl border text-left transition-all hover:scale-105 active:scale-95 flex flex-col justify-between space-y-3 ${
                      stats?.current_demo_stage === st.num 
                        ? 'bg-shield-500/20 border-shield-500 ring-2 ring-shield-500/30' 
                        : 'bg-black/30 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-shield-400">{st.badge}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/10">{st.stress} / 100</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{st.title}</p>
                      <p className="text-[11px] text-white/40 mt-0.5">Click to activate</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions & System Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Host Quick Links */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>Key Presentation Links</span>
                </h3>
                <div className="space-y-2.5">
                  <Link
                    to="/judge"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-semibold group-hover:text-cyan-400 transition-colors">SIH Judge Dashboard</p>
                      <p className="text-xs text-white/50">Innovation pipeline, architecture diagrams & problem statements</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/dashboard"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-semibold group-hover:text-shield-400 transition-colors">Main Telemetry Dashboard</p>
                      <p className="text-xs text-white/50">Live animated stress index and real-time sensor simulator</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/assistant"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-semibold group-hover:text-purple-400 transition-colors">Shield AI Assistant</p>
                      <p className="text-xs text-white/50">Safety-aware conversational support & emergency triggers</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* System & Reset Controls */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Database className="w-5 h-5 text-amber-400" />
                    <span>Host Environment & Storage</span>
                  </h3>
                  <div className="space-y-3 mt-4 text-xs text-white/70">
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span>Host Team:</span>
                      <strong className="text-white">INSIGHT-X</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span>Lead Contact:</span>
                      <strong className="text-cyan-400">itsmeetbuddy1@gmail.com</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span>AI Engine Mode:</span>
                      <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 font-semibold uppercase text-[10px]">
                        {stats?.ai_mode || 'MOCK AI (Reliable)'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span>System Status:</span>
                      <span className="text-emerald-400 font-medium">● Operational</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={handleResetData}
                    className="w-full py-3 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Reset All Demonstration Data</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default HostPortalPage;
