import { useAchievementStore } from '../store/achievementStore';
import { ACHIEVEMENTS } from '../data/achievements';
import { Trophy, Lock, Medal, Flame, Calendar, BookOpen, Layers } from 'lucide-react';
import { SectionHeader } from '../components/ui/shared';

// Grouping logic based on ID prefix
const getCategory = (id) => {
  if (id.startsWith('read_')) return 'Avid Reader';
  if (id.startsWith('finish_')) return 'Completionist';
  if (id.startsWith('collect_')) return 'Curator';
  if (id.startsWith('streak_')) return 'Dedication';
  return 'Other';
};

const getCategoryIcon = (cat) => {
  switch (cat) {
    case 'Avid Reader': return <BookOpen size={16} className="text-blue-400" />;
    case 'Completionist': return <Medal size={16} className="text-yellow-400" />;
    case 'Curator': return <Layers size={16} className="text-purple-400" />;
    case 'Dedication': return <Flame size={16} className="text-orange-400" />;
    default: return <Trophy size={16} />;
  }
};

const getTierColor = (tier) => {
  switch (tier?.toLowerCase()) {
    case 'bronze': return 'border-amber-700/30 bg-amber-900/10 text-amber-500';
    case 'silver': return 'border-zinc-400/30 bg-zinc-400/10 text-zinc-300';
    case 'gold': return 'border-yellow-400/30 bg-yellow-400/10 text-yellow-400';
    case 'diamond': return 'border-cyan-400/40 bg-cyan-400/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]';
    default: return 'border-ink-700 bg-ink-800 text-ink-300';
  }
};

export default function AchievementsPage() {
  const { stats, unlockedAchievements } = useAchievementStore();

  const grouped = ACHIEVEMENTS.reduce((acc, ach) => {
    const cat = getCategory(ach.id);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ach);
    return acc;
  }, {});

  const totalUnlocked = unlockedAchievements.length;
  const progressPercent = Math.round((totalUnlocked / ACHIEVEMENTS.length) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-slide-up">
      <SectionHeader 
        title="Achievements" 
        subtitle="Track your progress and unlock rewards." 
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Unlocked" value={`${totalUnlocked} / ${ACHIEVEMENTS.length}`} icon={<Trophy size={18} className="text-accent" />} />
        <StatCard label="Highest Streak" value={`${stats.highestStreak} Days`} icon={<Flame size={18} className="text-orange-500" />} />
        <StatCard label="Chapters Read" value={stats.chaptersRead} icon={<BookOpen size={18} className="text-blue-500" />} />
        <StatCard label="Manga Finished" value={stats.mangasFinished} icon={<Medal size={18} className="text-yellow-500" />} />
      </div>

      <div className="w-full bg-ink-200 dark:bg-ink-800 rounded-full h-2.5 mb-10 shadow-inner overflow-hidden">
        <div 
          className="bg-accent h-2.5 rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Categories */}
      <div className="space-y-12">
        {Object.entries(grouped).map(([category, achs]) => {
          const catUnlocked = achs.filter(a => unlockedAchievements.includes(a.id)).length;
          
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-4 border-b border-ink-200 dark:border-ink-800 pb-2">
                <h3 className="text-lg font-display font-semibold flex items-center gap-2 text-ink-900 dark:text-ink-100">
                  {getCategoryIcon(category)}
                  {category}
                </h3>
                <span className="text-xs font-mono text-ink-500 font-medium">
                  {catUnlocked} / {achs.length}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achs.map((ach) => {
                  const isUnlocked = unlockedAchievements.includes(ach.id);
                  return <AchievementCard key={ach.id} achievement={ach} isUnlocked={isUnlocked} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-ink-50 dark:bg-ink-900/50 border border-ink-200 dark:border-ink-800 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
      <div className="mb-2 bg-ink-100 dark:bg-ink-800 p-2 rounded-full">
        {icon}
      </div>
      <p className="text-2xl font-display font-bold text-ink-900 dark:text-ink-50">{value}</p>
      <p className="text-xs font-mono text-ink-500 mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function AchievementCard({ achievement, isUnlocked }) {
  const { title, description, icon, tier } = achievement;
  
  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 flex items-start gap-4
      ${isUnlocked 
        ? `${getTierColor(tier)} hover:-translate-y-1` 
        : 'border-ink-200 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-900/20 opacity-60 grayscale hover:grayscale-0'
      }`}>
      
      {/* Icon Badge */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 shadow-inner
        ${isUnlocked ? 'bg-black/20' : 'bg-ink-200 dark:bg-ink-800'}`}>
        {isUnlocked ? icon : <Lock size={18} className="text-ink-400" />}
      </div>
      
      {/* Details */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h4 className={`font-display font-bold text-sm ${isUnlocked ? '' : 'text-ink-500'}`}>
            {title}
          </h4>
          {isUnlocked && (
            <span className="text-[9px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-black/20 opacity-80">
              {tier}
            </span>
          )}
        </div>
        <p className={`text-xs leading-snug font-body ${isUnlocked ? 'opacity-80' : 'text-ink-400'}`}>
          {description}
        </p>
      </div>
    </div>
  );
}
