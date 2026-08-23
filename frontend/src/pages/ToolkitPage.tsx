import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Wind, Activity, Eye, Target, BookOpen, Clock, Zap } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const ToolkitPage: React.FC = () => {
  const navigate = useNavigate();

  const exercises = [
    {
      id: 'box',
      title: 'Box Breathing',
      description: 'Equal-length breathing to activate calm',
      duration: '4 min',
      icon: <Wind className="w-6 h-6 text-shield-500" />,
      path: '/breathing/box'
    },
    {
      id: 'relaxation',
      title: '4-6 Breathing',
      description: 'Extended exhale for deep relaxation',
      duration: '5 min',
      icon: <Activity className="w-6 h-6 text-shield-500" />,
      path: '/breathing/relaxation'
    },
    {
      id: 'grounding',
      title: '5-4-3-2-1 Grounding',
      description: 'Sensory grounding for present-moment awareness',
      duration: '5 min',
      icon: <Eye className="w-6 h-6 text-shield-500" />,
      path: '/breathing/grounding'
    },
    {
      id: 'focus',
      title: 'Focus Reset',
      description: 'Clear mental clutter and regain focus',
      duration: '3 min',
      icon: <Target className="w-6 h-6 text-shield-500" />,
      path: '/breathing/focus'
    },
    {
      id: 'journal',
      title: 'Journaling',
      description: 'Express your thoughts freely',
      duration: '10 min',
      icon: <BookOpen className="w-6 h-6 text-shield-500" />,
      path: '/journal'
    },
    {
      id: 'pause',
      title: 'Mindful Pause',
      description: 'A quick moment of intentional stillness',
      duration: '2 min',
      icon: <Clock className="w-6 h-6 text-shield-500" />,
      path: '/breathing/pause'
    },
    {
      id: 'pmr',
      title: 'Progressive Muscle Relaxation',
      description: 'Systematic tension release',
      duration: '8 min',
      icon: <Zap className="w-6 h-6 text-shield-500" />,
      path: '/breathing/pmr'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-shield-500/20 flex items-center justify-center">
            <Heart className="w-6 h-6 text-shield-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Coping Toolkit</h1>
            <p className="text-white/60 mt-1">Discover exercises to help you manage stress and regain focus.</p>
          </div>
        </header>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {exercises.map((exercise) => (
            <motion.div 
              key={exercise.id}
              variants={item}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col hover:bg-white/10 transition-colors duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  {exercise.icon}
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-white/10 rounded-full text-white/80">
                  {exercise.duration}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{exercise.title}</h3>
              <p className="text-white/60 text-sm flex-grow mb-6">{exercise.description}</p>
              
              <button 
                onClick={() => navigate(exercise.path)}
                className="w-full py-3 bg-shield-500/20 hover:bg-shield-500/30 text-shield-500 font-medium rounded-xl transition-colors duration-300"
              >
                Start
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ToolkitPage;
