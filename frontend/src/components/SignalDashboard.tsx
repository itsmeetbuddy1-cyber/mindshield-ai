import React from 'react';

interface SignalDashboardProps {
  cameraStatus: string;
  cameraSignal: number;
  micStatus: string;
  micSignal: number;
  textStatus: string;
  textSentiment: string;
  selfReportVal: number;
  interactionCadence: number;
}

const SignalDashboard: React.FC<SignalDashboardProps> = ({
    cameraStatus, cameraSignal, micStatus, micSignal, textStatus, textSentiment, selfReportVal, interactionCadence
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    📊 Live Sensor Status
                </h3>
                <span className="text-xs text-gray-500">Updated just now</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl">
                    <div className="flex justify-between mb-1">
                        <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">📷 Camera</span>
                        <span className={`text-xs ${cameraStatus === 'Active' ? 'text-green-500' : 'text-gray-500'}`}>{cameraStatus}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mb-1">
                        <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${cameraSignal}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-400">Signal: {Math.round(cameraSignal)}</div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl">
                    <div className="flex justify-between mb-1">
                        <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">🎙️ Microphone</span>
                        <span className={`text-xs ${micStatus === 'Active' ? 'text-green-500' : 'text-gray-500'}`}>{micStatus}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mb-1">
                        <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-75" style={{ width: `${micSignal}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-400">Vol: {Math.round(micSignal)}</div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl">
                    <div className="flex justify-between mb-1">
                        <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">💬 Text Analysis</span>
                        <span className="text-xs text-blue-500">{textStatus}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Latest: <span className="font-semibold">{textSentiment}</span></div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl flex flex-col justify-between">
                     <div className="flex justify-between mb-1">
                        <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">📝 Self-Report</span>
                        <span className="text-xs text-purple-500">{selfReportVal}/10</span>
                    </div>
                    <div className="flex justify-between mb-1 mt-2">
                        <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">⌨️ Interaction</span>
                        <span className="text-xs text-orange-500">{interactionCadence} CPM</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignalDashboard;
