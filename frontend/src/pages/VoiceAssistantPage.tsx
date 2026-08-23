import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Globe, Activity, Heart, ArrowRight, Play, Settings, Shield } from 'lucide-react';
import VoiceOrb from '../components/VoiceOrb';
import { voiceAgentEngine } from '../services/voice/VoiceAgentEngine';
import { VoiceState, VoiceTelemetry, SpeechRate } from '../services/voice/types';

const demoDialogues = [
  {
    title: 'Academic Stress (Hindi)',
    user: 'Mujhe kal ke exam ki bahut tension ho rahi hai, lagta hai fail ho jaunga.',
    lang: 'hi-IN',
    ai: 'Mujhe samajh aa raha hai ki aap exam ko lekar kafi pareshan hain. Yeh ek aam baat hai. Chaliye pehle ek gehri saans lete hain. Aapne apni taraf se puri taiyari ki hai. Kya hum milkar ek chhota revision plan bana sakte hain?'
  },
  {
    title: 'Exam Panic (English)',
    user: 'I am totally blanking out, I cannot remember anything I studied!',
    lang: 'en-IN',
    ai: 'It is completely normal to feel overwhelmed right now. Your brain is in a stress response. Let us pause and try a quick grounding exercise. Name three things you can see around you right now.'
  },
  {
    title: 'Family Concern (Gujarati)',
    user: 'મારું ભણવાનું અને ઘરનું કામ બેલેન્સ નથી થતું, મને બહુ ચિંતા થાય છે.',
    lang: 'gu-IN',
    ai: 'હું સમજી શકું છું કે ઘર અને ભણતર બંનેનું સંતુલન જાળવવું કેટલું મુશ્કેલ હોઈ શકે છે. આ સમયે તમને થાક લાગવો સ્વાભાવિક છે. શું આપણે એક સમયપત્રક બનાવી શકીએ જેથી તમને થોડો આરામ મળી શકે?'
  }
];

export default function VoiceAssistantPage() {
  const [telemetry, setTelemetry] = useState<VoiceTelemetry | null>(null);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [showDevDrawer, setShowDevDrawer] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [stressLevel, setStressLevel] = useState(45);

  useEffect(() => {
    const cleanup1 = voiceAgentEngine.onTelemetry((t) => {
      setTelemetry(t);
      if (t.audioLevel > 20) {
        setStressLevel(prev => Math.min(95, Math.max(20, prev + (t.audioLevel > 60 ? 1 : -0.5))));
      }
    });
    const cleanup2 = voiceAgentEngine.onTranscript((text) => {
      setTranscript(text);
    });

    return () => {
      cleanup1();
      cleanup2();
      voiceAgentEngine.stopSession();
    };
  }, []);

  const handleStartStop = () => {
    if (telemetry?.state === 'LISTENING' || telemetry?.state === 'USER_SPEAKING' || telemetry?.state === 'AI_SPEAKING' || telemetry?.state === 'PROCESSING') {
      voiceAgentEngine.stopSession();
    } else {
      setTranscript('');
      setAiResponse('');
      voiceAgentEngine.startSession();
    }
  };

  const handleInterrupt = () => {
    if (telemetry?.state === 'AI_SPEAKING') {
      voiceAgentEngine.executeCommand('STOP' as any);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLang(lang);
    if (lang === 'hi-IN') voiceAgentEngine.executeCommand('LANG_HINDI' as any);
    else if (lang === 'gu-IN') voiceAgentEngine.executeCommand('LANG_GUJARATI' as any);
    else voiceAgentEngine.executeCommand('LANG_ENGLISH' as any);
  };

  const handleRateChange = (rate: SpeechRate) => {
    if (rate === 'slow') voiceAgentEngine.executeCommand('SPEAK_SLOWER' as any);
    else if (rate === 'fast') voiceAgentEngine.executeCommand('SPEAK_FASTER' as any);
    else voiceAgentEngine.executeCommand('SPEAK_NORMAL' as any);
  };

  const runDemo = (demo: typeof demoDialogues[0]) => {
    voiceAgentEngine.stopSession();
    setTranscript(demo.user);
    setAiResponse('');
    setStressLevel(65);

    setTimeout(() => {
      setAiResponse(demo.ai);
      voiceAgentEngine.executeCommand(demo.lang === 'hi-IN' ? 'LANG_HINDI' as any : demo.lang === 'gu-IN' ? 'LANG_GUJARATI' as any : 'LANG_ENGLISH' as any);
    }, 800);
  };

  const getOrbState = () => {
    switch (telemetry?.state) {
      case 'LISTENING': return 'listening';
      case 'USER_SPEAKING': return 'listening';
      case 'PROCESSING': return 'thinking';
      case 'AI_SPEAKING': return 'speaking';
      case 'ERROR': return 'error';
      default: return 'ready';
    }
  };

  const getStatusText = () => {
    switch (telemetry?.state) {
      case 'LISTENING': return "🎙️ Shield AI is listening... Speak naturally";
      case 'USER_SPEAKING': return "🗣️ Listening to you...";
      case 'PROCESSING': return "⏳ Processing conversation...";
      case 'AI_SPEAKING': return "🔊 Shield AI is speaking... (Tap or speak to interrupt)";
      case 'INTERRUPTED': return "⚡ Interrupted. Listening to you...";
      case 'ERROR': return "⚠️ Reconnecting microphone...";
      default: return "🎙️ Tap to start continuous Alexa-like conversation";
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white rounded-2xl overflow-hidden relative border border-slate-800">
      {/* Header */}
      <header className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Shield AI Voice Agent
            </h1>
            <p className="text-xs text-slate-400">Continuous Conversational Companion</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowDevDrawer(!showDevDrawer)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full text-xs font-mono text-slate-300 transition-colors border border-slate-700"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>🛠️ Dev Telemetry</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-full text-xs border border-slate-700">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <select 
              className="bg-transparent border-none outline-none text-slate-200 cursor-pointer text-xs"
              value={selectedLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <option value="en-IN">English (India)</option>
              <option value="hi-IN">हिन्दी (Hindi)</option>
              <option value="gu-IN">ગુજરાતી (Gujarati)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Active VAD
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Stress Telemetry Badge */}
        <div className="absolute top-6 right-6 bg-slate-900/90 backdrop-blur border border-slate-800 p-3 rounded-2xl flex flex-col items-center gap-1.5 w-32 shadow-xl">
          <Activity className={`w-5 h-5 ${stressLevel > 65 ? 'text-red-400' : stressLevel > 45 ? 'text-amber-400' : 'text-emerald-400'}`} />
          <div className="text-[11px] text-slate-400 font-medium">Vocal Stress</div>
          <div className="text-xl font-bold">{Math.round(stressLevel)}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${stressLevel > 65 ? 'bg-red-400' : stressLevel > 45 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${stressLevel}%` }}
            />
          </div>
        </div>

        {/* Central Reactive Voice Orb */}
        <div className="mb-8">
          <VoiceOrb state={getOrbState() as any} audioLevel={telemetry?.audioLevel || 0} />
        </div>

        {/* Status Text & Dynamic Transcription */}
        <div className="w-full max-w-2xl text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <p className="text-base text-slate-300 font-medium">
              {getStatusText()}
            </p>
            {telemetry && telemetry.turnCount > 0 && (
              <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Turn #{telemetry.turnCount}
              </span>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {transcript && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-2xl inline-block max-w-[85%] backdrop-blur-md shadow-lg"
              >
                <div className="text-xs text-blue-400 font-medium mb-1 flex items-center justify-center gap-1">
                  <span>🗣️ You said:</span>
                </div>
                <p className="text-blue-100 text-lg font-medium">{transcript}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {aiResponse && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-700 p-5 rounded-2xl inline-block max-w-[90%] shadow-xl text-left"
              >
                <div className="text-xs text-cyan-400 font-medium mb-1.5 flex items-center gap-1">
                  <span>🤖 Shield AI Response:</span>
                </div>
                <p className="text-slate-100 text-base leading-relaxed">{aiResponse}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Control Deck */}
      <div className="p-5 pb-6 flex flex-col items-center gap-4 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800">
        <div className="flex items-center justify-center gap-5">
          {/* Main Action Button */}
          <button
            onClick={handleStartStop}
            className={`p-6 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center ${
              (telemetry?.state === 'LISTENING' || telemetry?.state === 'USER_SPEAKING' || telemetry?.state === 'AI_SPEAKING' || telemetry?.state === 'PROCESSING')
                ? 'bg-red-500 shadow-red-500/40 hover:bg-red-600' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-cyan-500/30 hover:opacity-90'
            }`}
          >
            {(telemetry?.state === 'LISTENING' || telemetry?.state === 'USER_SPEAKING' || telemetry?.state === 'AI_SPEAKING' || telemetry?.state === 'PROCESSING') ? (
              <Square className="w-8 h-8 text-white fill-current" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>

          {/* Barge-in Stop Speaking Button */}
          {telemetry?.state === 'AI_SPEAKING' && (
            <button
              onClick={handleInterrupt}
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all shadow-lg animate-bounce"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>⏹️ Interrupt AI</span>
            </button>
          )}
        </div>

        {/* Quick Voice Command Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Voice Commands:</span>
          <button 
            onClick={() => handleRateChange('slow')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-300 transition-colors"
          >
            🐢 "Speak Slower"
          </button>
          <button 
            onClick={() => handleRateChange('normal')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-300 transition-colors"
          >
            🎯 "Normal Speed"
          </button>
          <button 
            onClick={() => handleLanguageChange('hi-IN')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-300 transition-colors"
          >
            🇮🇳 "Hindi Mein Bolo"
          </button>
          <button 
            onClick={() => handleLanguageChange('gu-IN')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-300 transition-colors"
          >
            🇮🇳 "Gujarati Ma Vaat Karo"
          </button>
          <button 
            onClick={() => handleInterrupt()}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-amber-400 transition-colors"
          >
            🛑 "Stop"
          </button>
        </div>

        {/* Offline SIH Demo Scenarios */}
        <div className="w-full max-w-3xl border-t border-slate-800/80 pt-3 flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-2">
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">SIH Presentation Dialogue Simulation</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {demoDialogues.map((demo, idx) => (
              <button
                key={idx}
                onClick={() => runDemo(demo)}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors flex items-center gap-1.5"
              >
                <span>{demo.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Developer Telemetry Drawer */}
      <AnimatePresence>
        {showDevDrawer && telemetry && (
          <motion.div
            initial={{ opacity: 0, x: 320 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 320 }}
            className="absolute top-0 right-0 h-full w-84 bg-slate-900/95 border-l border-slate-700 shadow-2xl p-5 z-50 backdrop-blur-2xl overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Voice Agent Engine Telemetry</h3>
              </div>
              <button onClick={() => setShowDevDrawer(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">State Machine</div>
                <div className="flex justify-between"><span className="text-slate-400">Current State:</span> <span className="text-emerald-400 font-bold">{telemetry.state}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Mode:</span> <span>{telemetry.mode}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Turn Sequence:</span> <span className="text-cyan-400 font-bold">{telemetry.turnCount}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Session Duration:</span> <span>{telemetry.sessionDuration}s</span></div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Audio & VAD Pipeline</div>
                <div className="flex justify-between"><span className="text-slate-400">VAD Speech Active:</span> <span className={telemetry.vadActive ? "text-emerald-400 font-bold" : "text-slate-500"}>{telemetry.vadActive ? "DETECTED" : "SILENT"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Audio Level (RMS):</span> <span>{telemetry.audioLevel}/100</span></div>
                <div className="flex justify-between"><span className="text-slate-400">STT Engine:</span> <span>{telemetry.sttEngine}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">TTS Engine:</span> <span>{telemetry.ttsEngine}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Language:</span> <span>{telemetry.language}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Speech Rate:</span> <span>{telemetry.rate}</span></div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Health & Resilience</div>
                <div className="flex justify-between"><span className="text-slate-400">Recovery Count:</span> <span className="text-amber-400">{telemetry.recoveryCount}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Last Command:</span> <span>{telemetry.lastCommand || 'none'}</span></div>
                {telemetry.lastError && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
                    {telemetry.lastError}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
