import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Globe, Activity, Heart, ArrowRight, Play, Settings } from 'lucide-react';
import VoiceOrb from '../components/VoiceOrb';
import voiceController, { VoiceState, DebugTelemetry } from '../services/voiceController';

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
    lang: 'en-US',
    ai: 'It\'s completely normal to feel overwhelmed right now. Your brain is in a stress response. Let\'s pause and try a quick grounding exercise. Name three things you can see around you right now.'
  },
  {
    title: 'Family Concern (Gujarati)',
    user: 'મારું ભણવાનું અને ઘરનું કામ બેલેન્સ નથી થતું, મને બહુ ચિંતા થાય છે.',
    lang: 'gu-IN',
    ai: 'હું સમજી શકું છું કે ઘર અને ભણતર બંનેનું સંતુલન જાળવવું કેટલું મુશ્કેલ હોઈ શકે છે. આ સમયે તમને થાક લાગવો સ્વાભાવિક છે. શું આપણે એક સમયપત્રક બનાવી શકીએ જેથી તમને થોડો આરામ મળી શકે?'
  }
];

const VoiceAssistantPage = () => {
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [selectedLang, setSelectedLang] = useState('auto');
  const [stressLevel, setStressLevel] = useState(45);
  const [showSummary, setShowSummary] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [telemetry, setTelemetry] = useState<DebugTelemetry | null>(null);

  useEffect(() => {
    voiceController.onStateChange = (state) => setVoiceState(state);
    voiceController.onTranscript = (text) => setTranscript(text);
    voiceController.onResponse = (text) => setAiResponse(text);
    voiceController.onVolume = (vol) => setVolumeLevel(vol);
    voiceController.onDebug = (tele) => setTelemetry(tele);

    return () => {
      voiceController.stop();
    };
  }, []);

  const handleStartStop = () => {
    if (voiceState === 'LISTENING' || voiceState === 'SPEAKING' || voiceState === 'THINKING') {
      voiceController.stop();
    } else {
      setTranscript('');
      setAiResponse('');
      voiceController.start(selectedLang);
    }
  };

  const handleInterrupt = () => {
    voiceController.interrupt();
  };

  const runDemo = (demo: typeof demoDialogues[0]) => {
    if (voiceState !== 'IDLE' && voiceState !== 'STOPPED') {
        voiceController.stop();
    }
    setTranscript(demo.user);
    setAiResponse('');
    setStressLevel(65);
    
    setTimeout(() => {
        setAiResponse(demo.ai);
        voiceController.selectedLang = demo.lang;
        voiceController.speak(demo.ai);
    }, 1000);
  };

  const getOrbState = () => {
    switch (voiceState) {
      case 'LISTENING': return 'listening';
      case 'THINKING': return 'thinking';
      case 'SPEAKING': return 'speaking';
      case 'ERROR': return 'error';
      default: return 'ready';
    }
  };

  const getStatusText = () => {
    switch (voiceState) {
      case 'LISTENING': return "🎙️ I'm listening... Speak naturally";
      case 'THINKING': return "⏳ Thinking...";
      case 'SPEAKING': return "🔊 Shield AI is speaking... (Tap or speak to interrupt)";
      case 'ERROR': return "⚠️ Reconnecting microphone...";
      default: return "🎙️ Tap the button to start continuous conversation";
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white rounded-2xl overflow-hidden relative">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Talk to Shield AI
        </h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full text-sm hover:bg-slate-700 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">🛠️ Dev Telemetry</span>
          </button>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full text-sm">
            <Globe className="w-4 h-4 text-cyan-400" />
            <select 
              className="bg-transparent border-none outline-none text-slate-200 cursor-pointer"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
            >
              <option value="auto">Auto-Detect</option>
              <option value="en-US">English</option>
              <option value="hi-IN">हिन्दी (Hindi)</option>
              <option value="gu-IN">ગુજરાતી (Gujarati)</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-sm font-medium border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Real-Time Indicator
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Stress Telemetry */}
        <div className="absolute top-6 right-6 bg-slate-800/80 backdrop-blur border border-slate-700 p-4 rounded-xl flex flex-col items-center gap-2 w-32 shadow-xl">
          <Activity className={`w-6 h-6 ${stressLevel > 60 ? 'text-red-400' : stressLevel > 40 ? 'text-amber-400' : 'text-emerald-400'}`} />
          <div className="text-xs text-slate-400 font-medium">Vocal Stress</div>
          <div className="text-2xl font-bold">{Math.round(stressLevel)}%</div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${stressLevel > 60 ? 'bg-red-400' : stressLevel > 40 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${stressLevel}%` }}
            />
          </div>
        </div>

        {/* Voice Orb */}
        <div className="mb-12">
          <VoiceOrb state={getOrbState() as any} audioLevel={volumeLevel} />
        </div>

        {/* Status & Transcripts */}
        <div className="w-full max-w-2xl text-center space-y-6">
          <p className="text-lg text-slate-400 font-medium h-6">
            {getStatusText()}
          </p>

          <AnimatePresence mode="popLayout">
            {transcript && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl inline-block max-w-[80%] relative"
              >
                <p className="text-blue-100 text-lg">{transcript}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {aiResponse && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 border border-slate-700 p-4 rounded-2xl inline-block max-w-[90%] shadow-lg relative"
              >
                {telemetry && telemetry.turnCount > 0 && (
                  <div className="absolute -top-3 -right-3 bg-cyan-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    Turn #{telemetry.turnCount}
                  </div>
                )}
                <p className="text-slate-100 text-xl leading-relaxed">{aiResponse}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Controls */}
      <div className="p-6 pb-8 flex flex-col items-center gap-6 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handleStartStop}
            className={`p-6 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
              (voiceState === 'LISTENING' || voiceState === 'SPEAKING' || voiceState === 'THINKING')
                ? 'bg-red-500 shadow-red-500/50 hover:bg-red-400' 
                : 'bg-cyan-600 shadow-cyan-500/50 hover:bg-cyan-500'
            }`}
          >
            {(voiceState === 'LISTENING' || voiceState === 'SPEAKING' || voiceState === 'THINKING') ? (
              <Square className="w-10 h-10 text-white fill-current" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>

          {voiceState === 'SPEAKING' && (
             <button
                onClick={handleInterrupt}
                className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors"
             >
                <Square className="w-4 h-4 fill-current" />
                ⏹️ Stop Speaking
             </button>
          )}
        </div>

        <div className="flex items-center gap-4 mt-2">
            <button
               onClick={() => setShowSummary(true)}
               className="text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors"
            >
               View Session Summary
            </button>
        </div>

        {/* Demo Scenarios */}
        <div className="w-full max-w-3xl border-t border-slate-800 pt-6 mt-2">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Play className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Interactive Voice Demo (Offline)</h3>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {demoDialogues.map((demo, idx) => (
              <button
                key={idx}
                onClick={() => runDemo(demo)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <span>{demo.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Developer Debug Panel */}
      <AnimatePresence>
        {showDebug && telemetry && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-24 right-6 w-80 bg-slate-900/95 border border-slate-700 shadow-2xl p-4 rounded-xl z-50 backdrop-blur-xl"
          >
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-cyan-400">Developer Debug Panel</h3>
              <button onClick={() => setShowDebug(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="flex justify-between"><span className="text-slate-500">State Machine:</span> <span className="text-emerald-400">{telemetry.state}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Current Turn:</span> <span>{telemetry.turnCount}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Language:</span> <span>{telemetry.language}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">STT Engine Active:</span> <span>{telemetry.recognitionActive ? 'TRUE' : 'FALSE'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">TTS Engine Active:</span> <span>{telemetry.ttsActive ? 'TRUE' : 'FALSE'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Audio Context:</span> <span>ACTIVE</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Recovery Count:</span> <span>{telemetry.recoveryAttempts}</span></div>
              {telemetry.lastError && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded">
                  Last Error: {telemetry.lastError}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-Session Summary Drawer */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 shadow-2xl p-6 rounded-t-3xl z-50"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold mb-1">Session Summary</h3>
                <p className="text-slate-400 text-sm">Based on your recent conversation</p>
              </div>
              <button onClick={() => setShowSummary(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800 p-4 rounded-xl">
                <div className="text-sm text-slate-400 mb-1">Detected Topic</div>
                <div className="font-semibold text-blue-400">Academic Stress</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl">
                <div className="text-sm text-slate-400 mb-1">Total Turns</div>
                <div className="font-semibold text-cyan-400">{telemetry?.turnCount || 0}</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl">
                <div className="text-sm text-slate-400 mb-1">Stress Level</div>
                <div className="font-semibold text-amber-400">{Math.round(stressLevel)}%</div>
              </div>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors">
              <Heart className="w-5 h-5" />
              Start 60s Breathing Reset
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceAssistantPage;
