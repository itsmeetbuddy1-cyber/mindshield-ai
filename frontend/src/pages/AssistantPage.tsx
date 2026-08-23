import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Send, Shield, AlertCircle, User, PhoneCall, Mic, Activity } from 'lucide-react';
import type { Message } from '../types';
import apiService from '../services/api';

const AssistantPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: t('assistant.greeting', "Hi there. I'm Shield AI, your supportive companion. I'm here to listen and help you navigate stress. How are you feeling today?"),
      role: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisHelp, setShowCrisisHelp] = useState(false);
  const [liveStress, setLiveStress] = useState(45);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Real-time conversation memory support session ID
  const sessionId = useRef(`session_${Date.now()}`);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate updating live stress slightly based on input length
    setLiveStress(prev => Math.min(100, Math.max(0, prev + (Math.random() * 10 - 5))));

    try {
      const response = await apiService.analyzeMessage({ 
        message: text,
        session_id: sessionId.current,
        language: i18n.language
      });
      const data = response.data;
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || t('assistant.default_reply', "I hear you and I'm here with you."),
        role: 'assistant',
        timestamp: new Date(),
        safety_level: data.safety_level,
        suggested_actions: data.suggested_actions,
      };

      setMessages(prev => [...prev, aiMessage]);
      setLiveStress(prev => Math.max(20, prev - 5)); // Simulate stress relief on reply

      if (data.safety_level === 'HIGH') {
        setShowCrisisHelp(true);
      }
    } catch {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: t('assistant.fallback', "I'm listening and here to support you. Let's take a calm breath together."),
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    t('assistant.triggers.academic', "Academic Stress"),
    t('assistant.triggers.sleep', "Sleep Issues"),
    t('assistant.triggers.relationship', "Relationship"),
    t('assistant.triggers.financial', "Financial"),
    t('assistant.triggers.work', "Work Overload"),
    t('assistant.triggers.family', "Family Drama")
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg transition-colors duration-300">
      {/* Header */}
      <header className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-200 dark:border-blue-500/30">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shield AI</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isTyping ? 'bg-amber-400' : 'bg-green-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isTyping ? 'bg-amber-500' : 'bg-green-500'}`}></span>
              </span>
              {isTyping ? t('assistant.typing', 'Analyzing & thinking...') : t('assistant.active', 'Active • Real-time support')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Live Stress Gauge Widget */}
          <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Live Stress: {liveStress.toFixed(0)}</span>
            </div>
            <div className="w-24 h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
               <div 
                 className={`h-full transition-all duration-500 ${liveStress < 40 ? 'bg-green-500' : liveStress < 70 ? 'bg-amber-500' : 'bg-red-500'}`} 
                 style={{ width: `${liveStress}%` }} 
               />
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 dark:bg-white/10' : 'bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-blue-600 dark:text-white/70" /> : <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </div>

                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm shadow-md' 
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-tl-sm border border-gray-200 dark:border-slate-700 shadow-sm'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-[10px] block mt-2 ${msg.role === 'user' ? 'text-blue-200 text-right' : 'text-gray-500 dark:text-slate-400 text-right'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Safety Alert Banner */}
              {msg.safety_level === 'HIGH' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 ml-12 bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 p-4 rounded-2xl max-w-[85%] space-y-3"
                >
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-semibold">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span>{t('assistant.safety_notice', 'Safety Support Notice')}</span>
                  </div>
                  <p className="text-sm text-red-800 dark:text-red-200/90 leading-relaxed">
                    {t('assistant.crisis_text', 'It sounds like you may be going through something very serious. Please connect with trusted support.')}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a 
                      href="tel:988" 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 border border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{t('assistant.call_988', 'Call 988')}</span>
                    </a>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-500/30">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-sm border border-gray-200 dark:border-slate-700 flex gap-1.5 items-center">
                <motion.div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                <motion.div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                <motion.div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800">
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
          {quickActions.map(action => (
            <button
              key={action}
              onClick={() => handleSend(action)}
              className="whitespace-nowrap px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-500/20 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-xs font-medium transition-all"
            >
              {action}
            </button>
          ))}
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center gap-2">
          <button type="button" className="p-3.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-2xl text-gray-600 dark:text-slate-400 transition-colors">
            <Mic className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('assistant.placeholder', "Share what's on your mind...")}
            className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl py-3.5 px-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-800 rounded-2xl text-white transition-all shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssistantPage;
