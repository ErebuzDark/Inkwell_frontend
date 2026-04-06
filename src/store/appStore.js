import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const BOOKMARK_STATUSES = [
  { value: 'reading', label: 'Reading', color: 'text-emerald-500' },
  { value: 'plan_to_read', label: 'Plan to Read', color: 'text-blue-500' },
  { value: 'completed', label: 'Completed', color: 'text-violet-500' },
  { value: 'on_hold', label: 'On Hold', color: 'text-amber-500' },
  { value: 'dropped', label: 'Dropped', color: 'text-red-500' },
];

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'light',
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: next });
        document.documentElement.classList.toggle('dark', next === 'dark');
      },
      initTheme: () => {
        const theme = get().theme;
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      // Onboarding Tour
      hasSeenTour: false,
      setHasSeenTour: (value) => set({ hasSeenTour: value }),

      // Bookmarks
      bookmarks: [],
      bookmarkStatuses: {}, // { [mangaId]: 'reading' | 'plan_to_read' | 'completed' | 'on_hold' | 'dropped' }
      addBookmark: (manga) =>
        set((state) => ({
          bookmarks: state.bookmarks.some((b) => b.id === manga.id)
            ? state.bookmarks
            : [...state.bookmarks, manga],
          bookmarkStatuses: {
            ...state.bookmarkStatuses,
            [manga.id]: state.bookmarkStatuses[manga.id] || 'reading',
          },
        })),
      removeBookmark: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.bookmarkStatuses;
          return {
            bookmarks: state.bookmarks.filter((b) => b.id !== id),
            bookmarkStatuses: rest,
          };
        }),
      isBookmarked: (id) => get().bookmarks.some((b) => b.id === id),
      setBookmarkStatus: (mangaId, status) =>
        set((state) => ({
          bookmarkStatuses: { ...state.bookmarkStatuses, [mangaId]: status },
        })),
      getBookmarkStatus: (mangaId) => get().bookmarkStatuses[mangaId] || 'reading',

      // Reading history — last read chapter per manga
      readingHistory: {},
      setLastRead: (mangaId, chapterId) =>
        set((state) => ({
          readingHistory: { ...state.readingHistory, [mangaId]: chapterId },
        })),

      // Chapter read tracking — set of read chapter IDs per manga
      chaptersRead: {}, // { [mangaId]: [chapterId, ...] }
      markChapterRead: (mangaId, chapterId) =>
        set((state) => {
          const existing = state.chaptersRead[mangaId] || [];
          if (existing.includes(chapterId)) return state;
          return {
            chaptersRead: {
              ...state.chaptersRead,
              [mangaId]: [...existing, chapterId],
            },
          };
        }),
      isChapterRead: (mangaId, chapterId) =>
        (get().chaptersRead[mangaId] || []).includes(chapterId),
      getChaptersReadCount: (mangaId) =>
        (get().chaptersRead[mangaId] || []).length,

      // Search history
      searchHistory: [],
      addSearchHistory: (q) =>
        set((state) => {
          const trimmed = q.trim();
          if (!trimmed) return state;
          const filtered = state.searchHistory.filter((s) => s !== trimmed);
          return { searchHistory: [trimmed, ...filtered].slice(0, 10) };
        }),
      clearSearchHistory: () => set({ searchHistory: [] }),
      removeSearchHistoryItem: (q) =>
        set((state) => ({
          searchHistory: state.searchHistory.filter((s) => s !== q),
        })),

      // Reading stats
      stats: {
        totalChaptersRead: 0,
        readDates: [],  // [timestamp, ...]
        genreBreakdown: {}, // { [genre]: count }
      },
      trackChapterRead: (genres = []) =>
        set((state) => {
          const now = Date.now();
          const genreBreakdown = { ...state.stats.genreBreakdown };
          genres.forEach((g) => {
            genreBreakdown[g] = (genreBreakdown[g] || 0) + 1;
          });
          return {
            stats: {
              totalChaptersRead: state.stats.totalChaptersRead + 1,
              readDates: [...state.stats.readDates, now].slice(-500), // keep last 500 entries
              genreBreakdown,
            },
          };
        }),

      // Browse persistence
      browseFilters: { q: '', filters: {} },
      setBrowseFilters: (q, filters) => set({ browseFilters: { q, filters } }),
      clearBrowseFilters: () => set({ browseFilters: { q: '', filters: {} } }),

      // Reader settings persistence
      readerSettings: {
        mode: 'scroll',
        fitMode: 'width',
        rtl: false,
        readerTheme: 'dark',
        autoScrollSpeed: 0, // 0 = off
      },
      setReaderSettings: (settings) =>
        set((state) => ({
          readerSettings: { ...state.readerSettings, ...settings },
        })),

      // Collections
      collections: {}, // { [name]: { name, manga: MangaItem[], createdAt } }
      createCollection: (name) =>
        set((state) => ({
          collections: {
            ...state.collections,
            [name]: { name, manga: [], createdAt: Date.now() },
          },
        })),
      deleteCollection: (name) =>
        set((state) => {
          const { [name]: _, ...rest } = state.collections;
          return { collections: rest };
        }),
      addToCollection: (name, manga) =>
        set((state) => {
          const col = state.collections[name];
          if (!col || col.manga.some((m) => m.id === manga.id)) return state;
          return {
            collections: {
              ...state.collections,
              [name]: { ...col, manga: [...col.manga, manga] },
            },
          };
        }),
      removeFromCollection: (name, mangaId) =>
        set((state) => {
          const col = state.collections[name];
          if (!col) return state;
          return {
            collections: {
              ...state.collections,
              [name]: { ...col, manga: col.manga.filter((m) => m.id !== mangaId) },
            },
          };
        }),
      
      // Global Home/Browse Mode (Manga/Anime)
      homeMode: 'manga', // 'manga' | 'anime'
      setHomeMode: (mode) => set({ homeMode: mode }),
    }),
    {
      name: 'inkwell-store',
      partialize: (state) => ({
        theme: state.theme,
        hasSeenTour: state.hasSeenTour,
        bookmarks: state.bookmarks,
        bookmarkStatuses: state.bookmarkStatuses,
        readingHistory: state.readingHistory,
        chaptersRead: state.chaptersRead,
        searchHistory: state.searchHistory,
        stats: state.stats,
        browseFilters: state.browseFilters,
        readerSettings: state.readerSettings,
        collections: state.collections,
        homeMode: state.homeMode,
      }),
    }
  )
);
