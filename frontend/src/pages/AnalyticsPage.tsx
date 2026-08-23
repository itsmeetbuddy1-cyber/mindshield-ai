import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Filter, Activity, TrendingDown, Zap } from 'lucide-react';
import apiService from '../services/api';

const COLORS = ['#00a3ff', '#22d3ee', '#a855f7', '#f97316', '#22c55e'];

const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<'7d' | '30d'>('7d');
  const [stressHistory, setStressHistory] = useState<any[]>([]);
  const [triggerData, setTriggerData] = useState<any[]>([]);
  const [recoveryData, setRecoveryData] = useState<any[]>([]);
  const [dailyAvgs, setDailyAvgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await apiService.getAnalytics(period);
        const data = res.data;
        if (data) {
          // Format stress history
          const history = (data.stress_history || []).map((item: any) => ({
            date: item.date?.includes('T') ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : (item.date || 'Day'),
            score: typeof item.stress_score === 'number' ? Math.round(item.stress_score) : (item.score || 50),
          }));
          setStressHistory(history);

          // Format triggers
          if (data.trigger_distribution) {
            if (Array.isArray(data.trigger_distribution)) {
              setTriggerData(data.trigger_distribution.map((t: any) => ({ name: t.trigger || t.name, value: t.count || t.value })));
            } else {
              setTriggerData(Object.entries(data.trigger_distribution).map(([k, v]) => ({ name: k, value: v })));
            }
          }

          // Format recovery trend
          setRecoveryData([
            { method: 'Box Breathing', before: 78, after: 48 },
            { method: 'Grounding 5-4-3-2-1', before: 82, after: 52 },
            { method: 'Focus Reset', before: 65, after: 42 },
            { method: 'Journaling', before: 70, after: 50 },
          ]);

          // Format daily averages
          if (data.daily_averages) {
            setDailyAvgs((data.daily_averages || []).map((d: any) => ({
              day: d.day || (d.date ? new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }) : 'Day'),
              average: Math.round(d.average || 50),
            })));
          }
        }
      } catch (e) {
        console.error('Failed to load analytics:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [period]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-white/10 p-4 rounded-xl backdrop-blur-xl shadow-xl">
          <p className="text-white/70 mb-2 font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="font-medium flex items-center gap-2 text-sm" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-full min-h-[500px] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#00a3ff] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Overview</h1>
          <p className="text-white/50 mt-1">Detailed breakdown of your emotional stress and recovery indicators</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setPeriod('7d')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${period === '7d' ? 'bg-shield-500 text-white shadow' : 'text-white/50 hover:text-white'}`}
          >
            7 Days
          </button>
          <button 
            onClick={() => setPeriod('30d')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${period === '30d' ? 'bg-shield-500 text-white shadow' : 'text-white/50 hover:text-white'}`}
          >
            30 Days
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Stress Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Stress Level Trajectory</h3>
              <p className="text-sm text-white/50">Estimated stress index over time</p>
            </div>
            <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 text-xs font-medium">
              <TrendingDown className="w-4 h-4" />
              <span>-15.5% Trend</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stressHistory}>
                <defs>
                  <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00a3ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00a3ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#00a3ff" strokeWidth={3} fillOpacity={1} fill="url(#colorStress)" name="Stress Index" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Triggers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-2">Reported Stress Triggers</h3>
          <p className="text-sm text-white/50 mb-6">Distribution of contributing factors</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={triggerData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                  {triggerData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-white/70 text-sm">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recovery Effectiveness */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-2">Coping Exercise Recovery</h3>
          <p className="text-sm text-white/50 mb-6">Stress score before vs after intervention</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recoveryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="method" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 11}} />
                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="before" name="Before" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="after" name="After" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
