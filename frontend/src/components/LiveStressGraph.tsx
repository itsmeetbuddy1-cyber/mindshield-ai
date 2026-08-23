import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export interface StressDataPoint {
  time: string;
  score: number;
  trigger?: string;
}

interface LiveStressGraphProps {
  data: StressDataPoint[];
  currentScore?: number;
  height?: number;
}

const LiveStressGraph: React.FC<LiveStressGraphProps> = ({ data, currentScore, height = 300 }) => {
  const getColor = (score: number) => {
    if (score <= 30) return '#10b981'; // Green (Calm)
    if (score <= 55) return '#06b6d4'; // Cyan (Mild)
    if (score <= 75) return '#f59e0b'; // Amber (Elevated)
    return '#ef4444'; // Red (High)
  };

  const getStatusText = (score: number) => {
    if (score <= 30) return 'Calm';
    if (score <= 55) return 'Mild';
    if (score <= 75) return 'Elevated';
    return 'High';
  };

  const currentColor = currentScore !== undefined ? getColor(currentScore) : '#10b981';
  const currentStatus = currentScore !== undefined ? getStatusText(currentScore) : 'Unknown';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as StressDataPoint;
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">{label}</p>
          <p className="text-lg font-bold" style={{ color: getColor(dataPoint.score) }}>
            Score: {dataPoint.score}
          </p>
          {dataPoint.trigger && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Trigger: {dataPoint.trigger}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Live Stress Indicator</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Real-time fusion metric</p>
        </div>
        {currentScore !== undefined && (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-gray-100 dark:border-slate-700 shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: currentColor }}></span>
              <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: currentColor }}></span>
            </span>
            <div className="flex flex-col items-end">
              <span className="text-xl font-bold leading-none text-slate-800 dark:text-white">{currentScore}</span>
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: currentColor }}>
                {currentStatus}
              </span>
            </div>
          </div>
        )}
      </div>

      <div style={{ height, width: '100%' }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={currentColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} ticks={[0, 30, 55, 75, 100]} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(148, 163, 184, 0.2)', strokeWidth: 2 }} />
            
            <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.3} />
            <ReferenceLine y={55} stroke="#06b6d4" strokeDasharray="3 3" strokeOpacity={0.3} />
            <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.3} />
            
            <Area
              type="monotone"
              dataKey="score"
              stroke={currentColor}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorScore)"
              activeDot={{ r: 6, fill: currentColor, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LiveStressGraph;
