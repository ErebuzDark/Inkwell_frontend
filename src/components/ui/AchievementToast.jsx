import { useEffect, useState } from 'react';
import { useAchievementStore } from '../../store/achievementStore';
import { ACHIEVEMENTS } from '../../data/achievements';
import { Trophy, X } from 'lucide-react';

export default function AchievementToast() {
  const newlyUnlocked = useAchievementStore((s) => s.newlyUnlocked);
  const clearNewlyUnlocked = useAchievementStore((s) => s.clearNewlyUnlocked);
  
  const [currentToast, setCurrentToast] = useState(null);
  const [queue, setQueue] = useState([]);

  // When new achievements are unlocked, add them to our local queue
  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      const newItems = newlyUnlocked
        .map(id => ACHIEVEMENTS.find(a => a.id === id))
        .filter(Boolean);
        
      setQueue(prev => [...prev, ...newItems]);
      clearNewlyUnlocked();
    }
  }, [newlyUnlocked, clearNewlyUnlocked]);

  // Process the queue one by one
  useEffect(() => {
    if (!currentToast && queue.length > 0) {
      setCurrentToast(queue[0]);
      setQueue(prev => prev.slice(1));
      
      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        setCurrentToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentToast, queue]);

  if (!currentToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
      <div className="bg-ink-900 border border-accent/30 shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-xl p-4 min-w-[300px] flex items-start gap-4 relative overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent pointer-events-none" />
        
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-ink-800 border border-accent/20 flex items-center justify-center text-2xl shrink-0 shadow-inner">
          {currentToast.icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 pr-6">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Trophy size={12} className="text-accent" />
            <span className="text-[10px] font-mono text-accent uppercase tracking-wider font-bold">
              Achievement Unlocked!
            </span>
          </div>
          <h4 className="font-display font-bold text-ink-100 text-sm">
            {currentToast.title}
          </h4>
          <p className="text-xs text-ink-400 mt-1 font-body leading-tight">
            {currentToast.description}
          </p>
        </div>

        {/* Close Button */}
        <button 
          onClick={() => setCurrentToast(null)}
          className="absolute top-3 right-3 text-ink-500 hover:text-ink-200 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
