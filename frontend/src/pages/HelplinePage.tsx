import React from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneCall, ShieldAlert, HeartHandshake, Globe, ExternalLink, LifeBuoy, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HelplinePage: React.FC = () => {
  const helplines = [
    {
      name: 'Tele-MANAS (Govt. of India)',
      number: '14416',
      altNumber: '1800-891-4416',
      description: 'National Tele Mental Health Programme of India. 24x7, free, multi-lingual mental health care and crisis counseling.',
      languages: 'Hindi, English & 20+ Regional Languages',
      badge: '24/7 Toll-Free Official',
      color: 'from-blue-600 to-cyan-600',
      isPrimary: true
    },
    {
      name: 'KIRAN Mental Health Helpline',
      number: '1800-599-0019',
      altNumber: '',
      description: 'Ministry of Social Justice & Empowerment helpline providing 24/7 first-line emotional support and psychological crisis resolution.',
      languages: 'Hindi, English, Gujarati, Marathi, Tamil, etc.',
      badge: '24/7 Govt. Helpline',
      color: 'from-emerald-600 to-teal-600',
      isPrimary: true
    },
    {
      name: 'Vandrevala Foundation',
      number: '9999 666 555',
      altNumber: '+91 9999 666 555',
      description: 'Free, confidential mental health support and suicide prevention counseling by qualified clinical psychologists.',
      languages: 'Hindi, English & Major Indian Languages',
      badge: '24/7 Free Counseling',
      color: 'from-purple-600 to-indigo-600',
      isPrimary: false
    },
    {
      name: 'NIMHANS Psychosocial Support',
      number: '080-46110007',
      altNumber: '',
      description: 'National Institute of Mental Health and Neuro-Sciences crisis helpline offering expert psychological assistance.',
      languages: 'English, Hindi, Kannada, Telugu, etc.',
      badge: 'Premier Medical Institute',
      color: 'from-amber-600 to-orange-600',
      isPrimary: false
    },
    {
      name: 'AASRA Crisis Support',
      number: '+91 9820466726',
      altNumber: '',
      description: '24/7 suicide prevention and acute crisis intervention helpline.',
      languages: 'Hindi, English',
      badge: '24/7 Crisis Hotline',
      color: 'from-rose-600 to-pink-600',
      isPrimary: false
    },
    {
      name: 'National Emergency Services',
      number: '112',
      altNumber: '',
      description: 'Unified national emergency number for immediate medical, police, or ambulance rescue.',
      languages: 'All Languages',
      badge: 'Immediate Emergency',
      color: 'from-red-600 to-rose-700',
      isPrimary: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6 pb-24">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl bg-gradient-to-r from-rose-500/20 via-shield-500/15 to-transparent border border-rose-500/30 backdrop-blur-xl">
          <div className="flex items-start space-x-4">
            <div className="p-3.5 bg-rose-500/20 rounded-2xl border border-rose-500/40 text-rose-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full border border-rose-500/30">
                  Emergency Support
                </span>
                <span className="text-xs text-white/50 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 24/7 Immediate Help
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white mt-2">Verified Crisis Helplines</h1>
              <p className="text-white/70 text-sm mt-1 max-w-xl">
                If you or someone you know is feeling overwhelmed, hopeless, or in distress, free and confidential support is available right now.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <a
              href="tel:14416"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-600/30 transition-all text-sm"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" /> Call Tele-MANAS (14416)
            </a>
            <Link
              to="/breathing/grounding"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-2xl transition-all text-xs border border-white/10"
            >
              <HeartHandshake className="w-4 h-4 text-cyan-400" /> Start Calming Grounding
            </Link>
          </div>
        </header>

        {/* Helplines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {helplines.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-white/20 transition-all space-y-5"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/5">
                    {item.badge}
                  </span>
                  <span className="text-xs text-cyan-400 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> India National
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white">{item.name}</h3>
                <p className="text-sm text-white/60 mt-1">{item.description}</p>
                
                <div className="mt-3 text-xs text-white/40">
                  <span className="font-medium text-white/60">Languages:</span> {item.languages}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <div>
                  <div className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                    {item.number}
                  </div>
                  {item.altNumber && (
                    <div className="text-xs text-white/40">or {item.altNumber}</div>
                  )}
                </div>

                <a
                  href={`tel:${item.number.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-shield-500 to-cyan-500 hover:from-shield-600 hover:to-cyan-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-shield-500/20"
                >
                  <Phone className="w-4 h-4" /> Tap to Call
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center text-xs text-white/50 space-y-1">
          <p className="font-semibold text-white/70">Medical Disclaimer & Compliance</p>
          <p>
            MindShield AI provides AI-assisted wellness estimations and coping techniques. It does not provide medical diagnosis, psychiatric evaluation, or replace qualified professional healthcare. In case of acute medical emergencies, please reach out to emergency services (112) or official national helplines immediately.
          </p>
        </div>

      </div>
    </div>
  );
};

export default HelplinePage;
