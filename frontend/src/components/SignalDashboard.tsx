import React from 'react';

interface SignalDashboardProps {
  cameraStatus: string;
  cameraSignal: number;
  micStatus: string;
  micSignal: number;
  voiceScore?: number | null;
  behaviorScore?: number | null;
  physiologicalScore?: number | null;
  selfReportScore?: number | null;
  textStatus?: string;
  textSentiment?: string;
  selfReportVal: number;
  interactionCadence: number;
}

const SignalDashboard: React.FC<SignalDashboardProps> = ({
  cameraStatus,
  cameraSignal,
  micStatus,
  micSignal,
  voiceScore,
  behaviorScore,
  physiologicalScore,
  selfReportScore,
  selfReportVal,
  interactionCadence,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            📊 Multimodal Signal Modalities (4-Tier Architecture)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Normalized 0–100 biometrics & self-reports with dynamic re-weighting
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800">
          LIVE FUSION
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        {/* Modality 1: Voice (30% Weight) */}
        <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-slate-800/80">
          <div className="flex justify-between items-center mb-1">
            <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
              🎙️ Voice Cues
            </span>
            <span className={`text-xs font-bold ${micStatus === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`}>
              {micStatus === 'Active' ? `${voiceScore ?? Math.round(micSignal)}/100` : 'OFF'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-800 mb-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-150"
              style={{ width: `${Math.min(100, voiceScore ?? micSignal)}%` }}
            ></div>
          </div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 flex justify-between">
            <span>Weight: 30%</span>
            <span>Rate • Pause • Pitch • Loud</span>
          </div>
        </div>

        {/* Modality 2: Behavior (20% Weight) */}
        <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-slate-800/80">
          <div className="flex justify-between items-center mb-1">
            <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
              📷 Behavior / Cam
            </span>
            <span className={`text-xs font-bold ${cameraStatus === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`}>
              {cameraStatus === 'Active' ? `${behaviorScore ?? Math.round(cameraSignal)}/100` : 'OFF'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-800 mb-1.5">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, behaviorScore ?? cameraSignal)}%` }}
            ></div>
          </div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 flex justify-between">
            <span>Weight: 20%</span>
            <span>Blink • Tension • Motion • Posture</span>
          </div>
        </div>

        {/* Modality 3: Physiological (30% Weight) */}
        <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-slate-800/80">
          <div className="flex justify-between items-center mb-1">
            <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
              💓 Physiological
            </span>
            <span className="text-xs font-bold text-slate-400">
              {physiologicalScore !== null && physiologicalScore !== undefined ? `${physiologicalScore}/100` : 'N/A'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-800 mb-1.5">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${physiologicalScore ?? 0}%` }}
            ></div>
          </div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 flex justify-between">
            <span>Weight: 30%</span>
            <span>HR • HRV • Respiration</span>
          </div>
        </div>

        {/* Modality 4: Self-Report (20% Weight) */}
        <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-slate-800/80">
          <div className="flex justify-between items-center mb-1">
            <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
              📝 Self-Report
            </span>
            <span className="text-xs font-bold text-purple-500">
              {selfReportScore ?? selfReportVal * 25}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-800 mb-1.5">
            <div
              className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, selfReportScore ?? selfReportVal * 25)}%` }}
            ></div>
          </div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 flex justify-between">
            <span>Weight: 20%</span>
            <span>Ans: {selfReportVal}/4 (Score: {selfReportVal * 25})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalDashboard;
