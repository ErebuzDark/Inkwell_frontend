import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

      // Bookmarks
      bookmarks: [],
      addBookmark: (manga) =>
        set((state) => ({
          bookmarks: state.bookmarks.some((b) => b.id === manga.id)
            ? state.bookmarks
            : [...state.bookmarks, manga],
        })),
      removeBookmark: (id) =>
        set((state) => ({ bookmarks: state.bookmarks.filter((b) => b.id !== id) })),
      isBookmarked: (id) => get().bookmarks.some((b) => b.id === id),

      // Reading history
      readingHistory: {},
      setLastRead: (mangaId, chapterId) =>
        set((state) => ({
          readingHistory: { ...state.readingHistory, [mangaId]: chapterId },
        })),

      // Browse persistence
      browseFilters: { q: '', filters: {} },
      setBrowseFilters: (q, filters) => set({ browseFilters: { q, filters } }),
      clearBrowseFilters: () => set({ browseFilters: { q: '', filters: {} } }),
    }),
    {
      name: 'inkwell-store',
      partialState: (state) => ({
        theme: state.theme,
        bookmarks: state.bookmarks,
        readingHistory: state.readingHistory,
        browseFilters: state.browseFilters,
      }),
    }
  )
);
