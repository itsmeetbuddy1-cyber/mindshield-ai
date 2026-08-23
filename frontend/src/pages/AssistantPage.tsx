import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Shield, AlertCircle, Heart, User, PhoneCall, ExternalLink } from 'lucide-react';
import type { Message } from '../types';
import { apiService } from '../services/api';

const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi there. I'm Shield AI, your supportive companion. I'm here to listen and help you navigate stress. How are you feeling today?",
      role: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisHelp, setShowCrisisHelp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    try {
      const response = await apiService.analyzeMessage({ message: text });
      const data = response.data;
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I hear you and I'm here with you.",
        role: 'assistant',
        timestamp: new Date(),
        safety_level: data.safety_level,
        suggested_actions: data.suggested_actions,
      };

      setMessages(prev => [...prev, aiMessage]);

      if (data.safety_level === 'HIGH') {
        setShowCrisisHelp(true);
      }
    } catch {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm listening and here to support you. Let's take a calm breath together.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    "Help Me Calm Down",
    "I'm Overwhelmed",
    "Guide My Breathing",
    "Talk With Me",
    "Show My Stress"
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <header className="p-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-shield-500/20 rounded-2xl flex items-center justify-center border border-shield-500/30">
            <Shield className="w-6 h-6 text-shield-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Shield AI Assistant</h2>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isTyping ? 'bg-amber-400' : 'bg-green-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isTyping ? 'bg-amber-500' : 'bg-green-500'}`}></span>
              </span>
              {isTyping ? 'Analyzing signals & formulating empathetic response...' : 'Active • Real-time emotional support'}
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-xs text-white/70">
          <span>Non-Diagnostic Wellness System</span>
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
                
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-white/10' : 'bg-shield-500/20 border border-shield-500/30'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white/70" /> : <Shield className="w-4 h-4 text-shield-400" />}
                </div>

                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-shield-500 text-white rounded-tr-sm shadow-lg shadow-shield-500/20' 
                    : 'bg-white/10 text-white/90 rounded-tl-sm border border-white/5 shadow-md'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-[10px] text-white/40 block mt-2 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Safety Alert Banner */}
              {msg.safety_level === 'HIGH' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 ml-12 bg-red-500/15 border border-red-500/30 p-4 rounded-2xl max-w-[85%] space-y-3"
                >
                  <div className="flex items-center gap-2 text-red-300 font-semibold">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span>Safety Support Notice</span>
                  </div>
                  <p className="text-sm text-red-200/90 leading-relaxed">
                    It sounds like you may be going through something very serious right now. You don't have to handle this alone. Please connect with trusted support or a crisis counselor.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a 
                      href="tel:988" 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call 988 Suicide & Crisis Lifeline</span>
                    </a>
                    <a 
                      href="sms:741741" 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <span>Crisis Text Line: Text HOME to 741741</span>
                    </a>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-shield-500/20 flex items-center justify-center flex-shrink-0 border border-shield-500/30">
                <Shield className="w-4 h-4 text-shield-400" />
              </div>
              <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm border border-white/5 flex gap-1.5 items-center">
                <motion.div className="w-2 h-2 bg-shield-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                <motion.div className="w-2 h-2 bg-shield-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                <motion.div className="w-2 h-2 bg-shield-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/20 border-t border-white/10">
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
          {quickActions.map(action => (
            <button
              key={action}
              onClick={() => handleSend(action)}
              className="whitespace-nowrap px-4 py-2 rounded-xl bg-white/5 hover:bg-shield-500/20 hover:border-shield-500/30 border border-white/10 text-white/80 text-xs font-medium transition-all"
            >
              {action}
            </button>
          ))}
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share what's on your mind with Shield AI..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-4 pr-14 text-white placeholder-white/40 focus:outline-none focus:border-shield-500/50 focus:ring-1 focus:ring-shield-500/30 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2.5 bg-gradient-to-r from-shield-500 to-shield-600 hover:from-shield-400 hover:to-shield-500 rounded-xl text-white disabled:opacity-30 transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssistantPage;
