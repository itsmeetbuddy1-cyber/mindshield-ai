import React from 'react';

export interface ExplainableSignalContribution {
  signal?: string;
  modality?: string;
  label: string;
  score: number | null;
  weight?: number;
  baseWeight?: number;
  effectiveWeight?: number;
  contribution?: number;
  contributionPoints?: number;
  available: boolean;
  subComponents?: Record<string, number | null>;
}

interface ExplainableResultsProps {
  fusedScore: number;
  category: 'calm' | 'mild' | 'moderate' | 'elevated' | 'high' | 'insufficient_data';
  interpretation?: string;
  signalContributions: ExplainableSignalContribution[];
  explanations?: string[];
  linguisticMarkers?: string[];
  recommendedAction?: string;
}

const ExplainableResults: React.FC<ExplainableResultsProps> = ({
  fusedScore,
  category,
  interpretation,
  signalContributions,
  explanations = [],
  linguisticMarkers,
  recommendedAction,
}) => {
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'calm':
      case 'low':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'mild':
        return 'text-cyan-600 dark:text-cyan-400';
      case 'moderate':
      case 'elevated':
        return 'text-amber-600 dark:text-amber-400';
      case 'high':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getBarColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'calm':
      case 'low':
        return 'bg-emerald-500';
      case 'mild':
        return 'bg-cyan-500';
      case 'moderate':
      case 'elevated':
        return 'bg-amber-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  const displayInterpretation = interpretation || (
    fusedScore <= 24 ? 'Low' : fusedScore <= 49 ? 'Mild' : fusedScore <= 74 ? 'Moderate' : 'High'
  );

  return (
    <div className="glass-card bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔍</span>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Multimodal Fusion & Scoring Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Mathematical transparency & signal explainability</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 font-mono">
          Scale: 0–100
        </span>
      </div>

      <div className="mb-6 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Estimated Stress Level</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-black text-slate-800 dark:text-white">{Math.round(fusedScore)}</span>
            <span className={`text-base font-bold uppercase tracking-wider ${getCategoryColor(category)}`}>
              {displayInterpretation} ({category})
            </span>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500 dark:text-slate-400">
          <div>0–24: Low • 25–49: Mild</div>
          <div>50–74: Moderate • 75–100: High</div>
        </div>
      </div>

      {/* 4 Modality Breakdown */}
      <div className="space-y-4 mb-6">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Active Modalities & Effective Weights
        </p>

        {signalContributions.map((sig, idx) => {
          const rawScore = sig.score;
          const points = sig.contributionPoints ?? sig.contribution ?? 0;
          const effWeight = sig.effectiveWeight ?? (sig.weight ? sig.weight * 100 : 0);
          const baseWeight = sig.baseWeight ?? (sig.weight ? sig.weight * 100 : 0);

          return (
            <div key={idx} className="p-3 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                  {sig.label}
                  {!sig.available ? (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                      Unavailable (Renormalized)
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                      Active
                    </span>
                  )}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {sig.available ? `${points.toFixed(1)} pts` : '-'}
                </span>
              </div>

              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${sig.available ? getBarColor(category) : 'bg-slate-300 dark:bg-slate-700'}`}
                  style={{ width: sig.available && fusedScore > 0 ? `${Math.min(100, (points / fusedScore) * 100)}%` : '0%' }}
                ></div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <span>Base: {baseWeight}% → Effective: {effWeight.toFixed(1)}%</span>
                {sig.available && <span>Modality Score: {rawScore !== null ? Math.round(rawScore) : '-'}/100</span>}
              </div>

              {/* Sub-components if available */}
              {sig.subComponents && Object.keys(sig.subComponents).length > 0 && (
                <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap gap-2 text-[10px] text-slate-500">
                  {Object.entries(sig.subComponents).map(([subK, subV]) => (
                    <span key={subK} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 rounded">
                      {subK}: {subV !== null ? Math.round(subV) : 'N/A'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {recommendedAction && (
        <div className="mb-6 p-4 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200/50 dark:border-blue-900/50">
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">
            🌱 Actionable Coping Recommendation
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{recommendedAction}</p>
        </div>
      )}

      {explanations.length > 0 && (
        <div className="space-y-2 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Key Observations</p>
          <ul className="space-y-1.5">
            {explanations.map((exp, i) => (
              <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                {exp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Safety Notice & Medical Disclaimer */}
      <div className="text-center pt-2">
        <span className="inline-block px-4 py-2 bg-amber-50 dark:bg-amber-950/30 text-[11px] text-amber-800 dark:text-amber-300 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
          🛡️ <strong>Notice:</strong> This is an AI-based wellness estimation for stress awareness, <strong>NOT a medical diagnosis</strong>. If you are experiencing severe distress, please consult a qualified healthcare professional.
        </span>
      </div>
    </div>
  );
};

export default ExplainableResults;
