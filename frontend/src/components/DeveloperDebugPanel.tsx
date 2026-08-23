import React, { useState } from 'react';

interface DeveloperDebugPanelProps {
    textStress: number;
    selfReport: number;
    voiceActivity: number;
    cameraMotion: number;
    weights: { text: number, self: number, voice: number, camera: number, interaction: number };
    finalScore: number;
    confidence: number;
    onSimulateHigh: () => void;
    onSimulateCalm: () => void;
    onToggleCamera: () => void;
    onToggleMic: () => void;
}

const DeveloperDebugPanel: React.FC<DeveloperDebugPanelProps> = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isOpen ? (
                <div className="bg-black/90 text-green-400 font-mono text-xs p-4 rounded-xl shadow-2xl border border-green-500/30 w-80 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-3 border-b border-green-500/30 pb-2">
                        <h4 className="font-bold text-green-300">INSIGHT-X DEBUG TELEMETRY</h4>
                        <button onClick={() => setIsOpen(false)} className="text-red-400 hover:text-red-300">Close [X]</button>
                    </div>
                    
                    <div className="space-y-1 mb-4">
                        <div className="flex justify-between"><span>Text Stress:</span> <span>{props.textStress.toFixed(1)} / 100</span></div>
                        <div className="flex justify-between"><span>Self Report:</span> <span>{props.selfReport.toFixed(1)} / 100</span></div>
                        <div className="flex justify-between"><span>Voice Activity:</span> <span>{props.voiceActivity.toFixed(1)} / 100</span></div>
                        <div className="flex justify-between"><span>Camera Motion:</span> <span>{props.cameraMotion.toFixed(1)} / 100</span></div>
                        
                        <div className="mt-2 pt-2 border-t border-green-500/20 text-gray-400">Normalized Weights:</div>
                        <div>T:{props.weights.text}% S:{props.weights.self}% V:{props.weights.voice}% C:{props.weights.camera}% I:{props.weights.interaction}%</div>
                        
                        <div className="mt-2 pt-2 border-t border-green-500/20">
                             <div className="flex justify-between font-bold text-yellow-300 text-sm"><span>FINAL SCORE:</span> <span>{Math.round(props.finalScore)} / 100</span></div>
                             <div className="flex justify-between text-blue-300 mt-1"><span>Confidence:</span> <span>{props.confidence}%</span></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <button onClick={props.onSimulateHigh} className="bg-red-900/50 hover:bg-red-800/50 text-red-200 p-1.5 rounded border border-red-700/50">Sim High Stress</button>
                        <button onClick={props.onSimulateCalm} className="bg-green-900/50 hover:bg-green-800/50 text-green-200 p-1.5 rounded border border-green-700/50">Sim Calm</button>
                        <button onClick={props.onToggleCamera} className="bg-gray-800 hover:bg-gray-700 p-1.5 rounded border border-gray-600">Toggle Cam Off</button>
                        <button onClick={props.onToggleMic} className="bg-gray-800 hover:bg-gray-700 p-1.5 rounded border border-gray-600">Toggle Mic Off</button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-black/80 hover:bg-black text-green-400 font-mono text-xs px-3 py-1.5 rounded-full border border-green-500/50 shadow-lg flex items-center gap-2"
                >
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Debug Panel
                </button>
            )}
        </div>
    );
};

export default DeveloperDebugPanel;
