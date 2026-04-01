// achievements.js
// This file defines all available achievements in the app.
// To add more, just append them to this array!
//
// The 'condition' function evaluates against the user's `stats` object.
// stats = { chaptersRead: 0, mangasFinished: 0, collectionsAdded: 0, highestStreak: 0, ... }

export const ACHIEVEMENTS = [
  // --- READING ACHIEVEMENTS ---
  {
    id: 'read_1',
    title: 'First Page',
    description: 'Read your very first chapter.',
    icon: '📖',
    tier: 'Bronze',
    condition: (stats) => stats.chaptersRead >= 1,
  },
  {
    id: 'read_10',
    title: 'Getting Hooked',
    description: 'Read 10 chapters.',
    icon: '📚',
    tier: 'Bronze',
    condition: (stats) => stats.chaptersRead >= 10,
  },
  {
    id: 'read_50',
    title: 'Bookworm',
    description: 'Read 50 chapters.',
    icon: '🐛',
    tier: 'Silver',
    condition: (stats) => stats.chaptersRead >= 50,
  },
  {
    id: 'read_100',
    title: 'Speed Reader',
    description: 'Read 100 chapters.',
    icon: '⚡',
    tier: 'Silver',
    condition: (stats) => stats.chaptersRead >= 100,
  },
  {
    id: 'read_500',
    title: 'Manga Maniac',
    description: 'Read 500 chapters.',
    icon: '🔥',
    tier: 'Gold',
    condition: (stats) => stats.chaptersRead >= 500,
  },
  {
    id: 'read_1000',
    title: 'Librarian-Tier',
    description: 'Read 1,000 chapters.',
    icon: '🏛️',
    tier: 'Diamond',
    condition: (stats) => stats.chaptersRead >= 1000,
  },

  // --- FINISHER ACHIEVEMENTS ---
  {
    id: 'finish_1',
    title: '1 DOWN!',
    description: 'Finish your first manga completely.',
    icon: '🎯',
    tier: 'Bronze',
    condition: (stats) => stats.mangasFinished >= 1,
  },
  {
    id: 'finish_5',
    title: 'Dedicated Finisher',
    description: 'Finish 5 mangas.',
    icon: '🎖️',
    tier: 'Silver',
    condition: (stats) => stats.mangasFinished >= 5,
  },
  {
    id: 'finish_20',
    title: 'Otaku Completionist',
    description: 'Finish 20 mangas.',
    icon: '🏆',
    tier: 'Gold',
    condition: (stats) => stats.mangasFinished >= 20,
  },

  // --- COLLECTOR ACHIEVEMENTS ---
  {
    id: 'collect_1',
    title: 'Starting a Collection',
    description: 'Add your first title to a collection or bookmarks.',
    icon: '🔖',
    tier: 'Bronze',
    condition: (stats) => stats.collectionsAdded >= 1,
  },
  {
    id: 'collect_10',
    title: 'Curator',
    description: 'Add 10 separate titles to your collection.',
    icon: '🖼️',
    tier: 'Bronze',
    condition: (stats) => stats.collectionsAdded >= 10,
  },
  {
    id: 'collect_30',
    title: 'Master Collector I',
    description: 'Add 30 titles to your collection.',
    icon: '📦',
    tier: 'Silver',
    condition: (stats) => stats.collectionsAdded >= 30,
  },
  {
    id: 'collect_60',
    title: 'Master Collector II',
    description: 'Add 60 titles to your collection.',
    icon: '💎',
    tier: 'Gold',
    condition: (stats) => stats.collectionsAdded >= 60,
  },
  {
    id: 'collect_100',
    title: 'Dragon Hoard',
    description: 'Add 100 titles to your collection!',
    icon: '🐉',
    tier: 'Diamond',
    condition: (stats) => stats.collectionsAdded >= 100,
  },

  // --- STREAK ACHIEVEMENTS ---
  {
    id: 'streak_3',
    title: 'Warming Up',
    description: 'Read a chapter for 3 consecutive days.',
    icon: '🏕️',
    tier: 'Bronze',
    condition: (stats) => stats.highestStreak >= 3,
  },
  {
    id: 'streak_5',
    title: 'Consistent Habit',
    description: 'Read manga for 5 days in a row.',
    icon: '🔥',
    tier: 'Bronze',
    condition: (stats) => stats.highestStreak >= 5,
  },
  {
    id: 'streak_10',
    title: 'Unstoppable Momentum',
    description: '10-day reading streak!',
    icon: '🚅',
    tier: 'Silver',
    condition: (stats) => stats.highestStreak >= 10,
  },
  {
    id: 'streak_30',
    title: 'A Whole Month!',
    description: 'Read for 30 consecutive days.',
    icon: '📅',
    tier: 'Gold',
    condition: (stats) => stats.highestStreak >= 30,
  },
  {
    id: 'streak_100',
    title: 'Century Streak',
    description: 'You haven\'t missed a day in 100 days. Go outside!',
    icon: '🌞',
    tier: 'Diamond',
    condition: (stats) => stats.highestStreak >= 100,
  },
];
