import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { secureStorage } from '../utils/secureStorage';
import { ACHIEVEMENTS } from '../data/achievements';

const INITIAL_STATS = {
  chaptersRead: 0,
  mangasFinished: 0,
  collectionsAdded: 0,
  highestStreak: 0,
  currentStreak: 0,
  lastActiveDate: null,
};

export const useAchievementStore = create(
  persist(
    (set, get) => ({
      stats: INITIAL_STATS,
      unlockedAchievements: [], // Array of IDs
      newlyUnlocked: [], // Temporary queue for toast notifications

      // Action to clear newly unlocked after they are shown in toasts
      clearNewlyUnlocked: () => set({ newlyUnlocked: [] }),

      // Core stat updater that automatically evaluates achievements after changing stats
      incrementStat: (statKey, amount = 1) => {
        set((state) => {
          const newStats = {
            ...state.stats,
            [statKey]: (state.stats[statKey] || 0) + amount,
          };
          return { stats: newStats };
        });
        get().evaluateAchievements();
      },

      // Logic to check streaks (should be called once per app load or chapter read)
      recordActivity: () => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        set((state) => {
          const { lastActiveDate, currentStreak, highestStreak } = state.stats;
          
          if (lastActiveDate === today) {
            // Already active today, do nothing
            return state;
          }

          let newCurrentStreak = 1;

          if (lastActiveDate) {
            const lastDate = new Date(lastActiveDate);
            const todayDate = new Date(today);
            const diffTime = Math.abs(todayDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              // Consecutive day
              newCurrentStreak = currentStreak + 1;
            }
          }

          const newHighestStreak = Math.max(highestStreak, newCurrentStreak);

          const newStats = {
            ...state.stats,
            lastActiveDate: today,
            currentStreak: newCurrentStreak,
            highestStreak: newHighestStreak,
          };

          return { stats: newStats };
        });
        
        get().evaluateAchievements();
      },

      // Evaluates current stats against all achievements
      evaluateAchievements: () => {
        const { stats, unlockedAchievements } = get();
        
        const justUnlocked = [];

        ACHIEVEMENTS.forEach((achievement) => {
          if (!unlockedAchievements.includes(achievement.id)) {
            // Check if condition is met
            if (achievement.condition(stats)) {
              justUnlocked.push(achievement.id);
            }
          }
        });

        if (justUnlocked.length > 0) {
          set((state) => ({
            unlockedAchievements: [...state.unlockedAchievements, ...justUnlocked],
            newlyUnlocked: [...state.newlyUnlocked, ...justUnlocked],
          }));
        }
      },
      
      resetAchievements: () => set({ stats: INITIAL_STATS, unlockedAchievements: [], newlyUnlocked: [] })
    }),
    {
      name: 'inkwell-achievements-secure', // Key in localStorage
      storage: secureStorage, // Use our encrypted wrapper
    }
  )
);
