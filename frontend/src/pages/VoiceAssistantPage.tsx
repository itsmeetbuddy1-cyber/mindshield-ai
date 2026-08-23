import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Square, Globe, Activity, Heart, ArrowRight, Play } from 'lucide-react';
import VoiceOrb from '../components/VoiceOrb';
import { voiceService } from '../services/voiceService';

type VoiceState = 'ready' | 'listening' | 'thinking' | 'speaking' | 'error';

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
  const [voiceState, setVoiceState] = useState<VoiceState>('ready');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLang, setSelectedLang] = useState('auto');
  const [stressLevel, setStressLevel] = useState(45);
  const [showSummary, setShowSummary] = useState(false);
  
  const recognitionRef = useRef<{ start: () => void, stop: () => void, isSupported: boolean } | null>(null);
  const speechRef = useRef<{ speak: () => void, stop: () => void } | null>(null);

  // Simulated audio volume for UI
  useEffect(() => {
    if (voiceState === 'listening' || voiceState === 'speaking') {
      const interval = setInterval(() => {
        setVolumeLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setVolumeLevel(0);
    }
  }, [voiceState]);

  const handleStartListening = () => {
    setVoiceState('listening');
    setTranscript('');
    setAiResponse('');
    
    recognitionRef.current = voiceService.speechToText({
      language: selectedLang === 'auto' ? undefined : selectedLang,
      onResult: (text, isFinal) => {
        setTranscript(text);
        if (isFinal) {
          handleStopListening(text);
        }
      },
      onError: (err) => {
        console.error('Speech recognition error:', err);
        setVoiceState('error');
        setTimeout(() => setVoiceState('ready'), 3000);
      }
    });

    if (recognitionRef.current.isSupported) {
      recognitionRef.current.start();
    } else {
      // Fallback if not supported
      setTranscript('(Speech recognition not supported in this browser)');
      setTimeout(() => setVoiceState('ready'), 3000);
    }
  };

  const handleStopListening = (finalText: string = transcript) => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (!finalText) {
      setVoiceState('ready');
      return;
    }
    
    setVoiceState('thinking');
    
    // Simulate AI delay and response
    setTimeout(() => {
      const lang = selectedLang === 'auto' ? voiceService.detectLanguage(finalText) : selectedLang.split('-')[0];
      
      let response = "I hear you. Let's work through this together.";
      let speechLang = 'en-US';

      if (lang === 'hi') {
        response = "Main samajhta hoon. Chaliye is baare mein baat karte hain.";
        speechLang = 'hi-IN';
      } else if (lang === 'gu') {
        response = "હું સમજું છું. ચાલો આપણે આ વિશે વાત કરીએ.";
        speechLang = 'gu-IN';
      }

      setAiResponse(response);
      setVoiceState('speaking');
      
      // Update simulated stress level
      setStressLevel(prev => Math.max(20, prev + (Math.random() * 20 - 5)));

      if (!isMuted) {
        speechRef.current = voiceService.textToSpeech(response, speechLang, () => {
          setVoiceState('ready');
          setShowSummary(true);
        });
        speechRef.current.speak();
      } else {
        setTimeout(() => {
          setVoiceState('ready');
          setShowSummary(true);
        }, 3000);
      }
    }, 1500);
  };

  const stopAiSpeaking = () => {
    if (speechRef.current) {
      speechRef.current.stop();
    }
    setVoiceState('ready');
    setShowSummary(true);
  };

  const runDemo = (demo: typeof demoDialogues[0]) => {
    setVoiceState('listening');
    setTranscript(demo.user);
    setTimeout(() => {
      setVoiceState('thinking');
      setTimeout(() => {
        setAiResponse(demo.ai);
        setVoiceState('speaking');
        setStressLevel(65); // High stress for demo
        if (!isMuted) {
          speechRef.current = voiceService.textToSpeech(demo.ai, demo.lang, () => {
            setVoiceState('ready');
            setShowSummary(true);
          });
          speechRef.current.speak();
        } else {
          setTimeout(() => {
            setVoiceState('ready');
            setShowSummary(true);
          }, 4000);
        }
      }, 1500);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white rounded-2xl overflow-hidden relative">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Talk to Shield AI
        </h1>
        <div className="flex items-center gap-4">
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
            Real-Time Mode
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
          <VoiceOrb state={voiceState} audioLevel={volumeLevel} />
        </div>

        {/* Status & Transcripts */}
        <div className="w-full max-w-2xl text-center space-y-6">
          <p className="text-lg text-slate-400 font-medium h-6">
            {voiceState === 'ready' && "Tap the microphone to speak"}
            {voiceState === 'listening' && "I'm listening..."}
            {voiceState === 'thinking' && "Analyzing..."}
            {voiceState === 'speaking' && "Shield AI is speaking..."}
          </p>

          <AnimatePresence mode="popLayout">
            {transcript && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl inline-block max-w-[80%]"
              >
                <p className="text-blue-100 text-lg">{transcript}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {aiResponse && (voiceState === 'speaking' || voiceState === 'ready') && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 border border-slate-700 p-4 rounded-2xl inline-block max-w-[90%] shadow-lg"
              >
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
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {voiceState !== 'speaking' ? (
            <button
              onClick={voiceState === 'listening' ? () => handleStopListening() : handleStartListening}
              className={`p-6 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
                voiceState === 'listening' 
                  ? 'bg-red-500 shadow-red-500/50' 
                  : 'bg-blue-600 shadow-blue-500/50 hover:bg-blue-500'
              }`}
            >
              {voiceState === 'listening' ? (
                <Square className="w-10 h-10 text-white fill-current" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </button>
          ) : (
            <button
              onClick={stopAiSpeaking}
              className="p-6 rounded-full shadow-2xl bg-amber-500 shadow-amber-500/50 hover:bg-amber-400 transition-all transform hover:scale-105 active:scale-95"
            >
              <Square className="w-10 h-10 text-white fill-current" />
            </button>
          )}

          <div className="w-14" /> {/* Spacer to balance mute button */}
        </div>

        {/* Demo Scenarios */}
        <div className="w-full max-w-3xl border-t border-slate-800 pt-6">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Play className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Launch Voice Demo (SIH Presentation)</h3>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {demoDialogues.map((demo, idx) => (
              <button
                key={idx}
                onClick={() => runDemo(demo)}
                disabled={voiceState !== 'ready'}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>{demo.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

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
                <div className="text-sm text-slate-400 mb-1">Language</div>
                <div className="font-semibold text-cyan-400">Multilingual</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl">
                <div className="text-sm text-slate-400 mb-1">Stress Level</div>
                <div className="font-semibold text-amber-400">Elevated</div>
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
