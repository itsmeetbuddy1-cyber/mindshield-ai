import React from 'react';

interface SignalContribution {
  signal: string;
  label: string;
  score: number | null;
  weight: number;
  contribution: number;
  available: boolean;
}

interface ExplainableResultsProps {
  fusedScore: number;
  category: 'calm' | 'mild' | 'elevated' | 'high';
  signalContributions: SignalContribution[];
  explanations: string[];
  linguisticMarkers?: string[];
}

const ExplainableResults: React.FC<ExplainableResultsProps> = ({
  fusedScore,
  category,
  signalContributions,
  explanations,
  linguisticMarkers
}) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'calm': return 'text-green-600 dark:text-green-400';
      case 'mild': return 'text-cyan-600 dark:text-cyan-400';
      case 'elevated': return 'text-amber-600 dark:text-amber-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-600';
    }
  };

  const getBarColor = (cat: string) => {
    switch (cat) {
      case 'calm': return 'bg-green-500';
      case 'mild': return 'bg-cyan-500';
      case 'elevated': return 'bg-amber-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
        <span className="text-xl">🔍</span>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Why this result?</h3>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Current AI Assessment</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-white">{fusedScore}</span>
            <span className={`text-sm font-bold uppercase tracking-wider ${getCategoryColor(category)}`}>
              {category}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Multimodal Fusion Breakdown</p>
        
        {signalContributions.map((sig, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                {sig.label}
                {!sig.available && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">N/A</span>}
              </span>
              <span className="font-medium text-slate-600 dark:text-slate-400">
                {sig.available ? `${sig.contribution.toFixed(1)} pts` : '-'}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${sig.available ? getBarColor(category) : 'bg-slate-300 dark:bg-slate-700'}`} 
                style={{ width: sig.available ? `${(sig.contribution / fusedScore) * 100}%` : '0%' }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Weight: {sig.weight * 100}%</span>
              {sig.available && <span>Raw Score: {sig.score}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Key Observations</p>
        <ul className="space-y-2">
          {explanations.map((exp, i) => (
            <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              {exp}
            </li>
          ))}
        </ul>

        {linguisticMarkers && linguisticMarkers.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 mb-2">Detected Linguistic Markers:</p>
            <div className="flex flex-wrap gap-2">
              {linguisticMarkers.map((marker, i) => (
                <span key={i} className="text-[10px] px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                  {marker}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <span className="inline-block px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700">
          ⚠️ This is a wellness indicator, not a diagnostic medical device.
        </span>
      </div>
    </div>
  );
};

export default ExplainableResults;
