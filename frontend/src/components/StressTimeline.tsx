import React from 'react';

export type TimelineEventType = 'checkin' | 'ai_chat' | 'breathing' | 'alert';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: string;
  title: string;
  description: string;
  scoreDelta?: number;
  tags?: string[];
}

interface StressTimelineProps {
  events: TimelineEvent[];
}

const StressTimeline: React.FC<StressTimelineProps> = ({ events }) => {
  const getEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case 'checkin': return '📝';
      case 'ai_chat': return '🤖';
      case 'breathing': return '🫁';
      case 'alert': return '⚠️';
      default: return '📌';
    }
  };

  const getEventColor = (type: TimelineEventType) => {
    switch (type) {
      case 'checkin': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ai_chat': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'breathing': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'alert': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Intervention Timeline</h3>
      
      <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-6 pb-4">
        {events.length === 0 ? (
          <p className="text-sm text-slate-500 pl-6">No events recorded today.</p>
        ) : (
          events.map((event, idx) => (
            <div key={event.id} className="relative pl-6">
              <div className={`absolute -left-3.5 top-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-sm ring-4 ring-white dark:ring-slate-900 ${getEventColor(event.type)}`}>
                {getEventIcon(event.type)}
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">{event.title}</h4>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{event.description}</p>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-2">
                    {event.tags?.map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {event.scoreDelta !== undefined && (
                    <div className={`text-xs font-bold px-2 py-1 rounded ${event.scoreDelta < 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {event.scoreDelta > 0 ? '+' : ''}{event.scoreDelta} pts
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StressTimeline;
