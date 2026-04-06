import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Clock, Trash2, BookOpen, Tv } from 'lucide-react';
import { useSearch as useMangaSearch, useMangaList, useGenres } from '../hooks/usemanga.js';
import { useAnimeSearch, useAnimeList, useAnimeGenres } from '../hooks/useAnime.js';
import MangaGrid from '../components/ui/MangaGrid.jsx';
import AnimeGrid from '../components/ui/AnimeGrid.jsx';
import FilterBar from '../components/ui/FilterBar.jsx';
import { PageSpinner, ErrorState, EmptyState } from '../components/ui/shared.jsx';
import { useAppStore } from '../store/appStore.js';

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    browseFilters, 
    setBrowseFilters, 
    searchHistory, 
    addSearchHistory, 
    removeSearchHistoryItem, 
    clearSearchHistory,
    homeMode: mode,
    setHomeMode: setMode
  } = useAppStore();

  const [query, setQuery] = useState(browseFilters.q || searchParams.get('q') || '');
  const [debouncedQ, setDebouncedQ] = useState(query);
  const [filters, setFilters] = useState(browseFilters.filters || {});
  const [showHistory, setShowHistory] = useState(false);
  const searchRef = useRef(null);

  const { data: mangaGenres = [] } = useGenres();
  const { data: animeGenres = [] } = useAnimeGenres();
  const genres = mode === 'manga' ? mangaGenres : animeGenres;

  // Close search history on click outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync with store (only if manga, or handle both)
  useEffect(() => {
    if (mode === 'manga') {
      setBrowseFilters(debouncedQ, filters);
    }
  }, [debouncedQ, filters, setBrowseFilters, mode]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(query);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  // Sync URL param
  useEffect(() => {
    const q = searchParams.get('q');
    const type = searchParams.get('type');
    if (q !== null && q !== query) {
      setQuery(q);
      setDebouncedQ(q);
    }
    if (type && type !== mode) {
      setMode(type);
    }
  }, [searchParams]);

  // Update URL when search or mode changes
  useEffect(() => {
    const params = { type: mode };
    if (debouncedQ) params.q = debouncedQ;
    setSearchParams(params, { replace: true });
  }, [debouncedQ, mode, setSearchParams]);

  // Manga Data
  const {
    data: mangaSearchData,
    isLoading: mangaSearchLoading,
    error: mangaSearchError,
    fetchNextPage: fetchNextMangaSearch,
    hasNextPage: hasNextMangaSearch,
    isFetchingNextPage: isFetchingNextMangaSearch,
  } = useMangaSearch(debouncedQ, filters);

  const {
    data: mangaListData,
    isLoading: mangaListLoading,
    error: mangaListError,
    fetchNextPage: fetchNextMangaList,
    hasNextPage: hasNextMangaList,
    isFetchingNextPage: isFetchingNextMangaList,
  } = useMangaList();

  // Anime Data
  const {
    data: animeSearchData,
    isLoading: animeSearchLoading,
    error: animeSearchError,
    fetchNextPage: fetchNextAnimeSearch,
    hasNextPage: hasNextAnimeSearch,
    isFetchingNextPage: isFetchingNextAnimeSearch,
  } = useAnimeSearch(debouncedQ);

  const {
    data: animeListData,
    isLoading: animeListLoading,
    error: animeListError,
    fetchNextPage: fetchNextAnimeList,
    hasNextPage: hasNextAnimeList,
    isFetchingNextPage: isFetchingNextAnimeList,
  } = useAnimeList({ 
    type: filters.type, 
    genre: filters.genres?.[0] 
  });

  const hasSearchOrFilters = debouncedQ.trim() || Object.entries(filters).some(([k, v]) => {
    if (k === 'genres' || k === 'excludeGenres') return Array.isArray(v) && v.length > 0;
    return Boolean(v);
  });

  const isLoading = mode === 'manga' 
    ? (hasSearchOrFilters ? mangaSearchLoading : mangaListLoading)
    : (debouncedQ.trim() ? animeSearchLoading : (hasSearchOrFilters ? animeListLoading : animeListLoading));

  const error = mode === 'manga'
    ? (hasSearchOrFilters ? mangaSearchError : mangaListError)
    : (debouncedQ.trim() ? animeSearchError : animeListError);

  const titles = mode === 'manga'
    ? (hasSearchOrFilters
        ? mangaSearchData?.pages.flatMap(page => page.results) || []
        : mangaListData?.pages.flatMap(page => page.titles) || [])
    : (debouncedQ.trim()
        ? animeSearchData?.pages.flatMap(page => page.results) || []
        : animeListData?.pages.flatMap(page => page.results) || []);

  const hasNextPage = mode === 'manga' 
    ? (hasSearchOrFilters ? hasNextMangaSearch : hasNextMangaList)
    : (debouncedQ.trim() ? hasNextAnimeSearch : hasNextAnimeList);

  const fetchNextPage = mode === 'manga'
    ? (hasSearchOrFilters ? fetchNextMangaSearch : fetchNextMangaList)
    : (debouncedQ.trim() ? fetchNextAnimeSearch : fetchNextAnimeList);

  const isFetchingNextPage = mode === 'manga'
    ? (hasSearchOrFilters ? isFetchingNextMangaSearch : isFetchingNextMangaList)
    : (debouncedQ.trim() ? isFetchingNextAnimeSearch : isFetchingNextAnimeList);

  const clearSearch = () => {
    setQuery('');
    setDebouncedQ('');
  };

  const selectFromHistory = (q) => {
    setQuery(q);
    setDebouncedQ(q);
    setShowHistory(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink-900 dark:text-ink-100 mb-1">
            Browse
          </h1>
          <p className="text-sm text-ink-400 dark:text-ink-500">
            Explore {mode === 'manga' ? 'manga, manhwa, and manhua' : 'anime and movies'}
          </p>
        </div>

        {/* Mini Toggle */}
        <div className="bg-ink-100 dark:bg-ink-900 p-1 rounded-full inline-flex relative border border-ink-200 dark:border-ink-800 self-start sm:self-center">
           <div 
            className={`absolute top-1 bottom-1 w-[80px] bg-white dark:bg-ink-950 rounded-full shadow-sm transition-transform duration-300 ${
              mode === 'manga' ? 'translate-x-0' : 'translate-x-full'
            }`} 
          />
          <button
            onClick={() => setMode('manga')}
            className={`w-[80px] relative z-10 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold transition-colors ${
              mode === 'manga' ? 'text-accent' : 'text-ink-500'
            }`}
          >
            <BookOpen size={12} /> Manga
          </button>
          <button
            onClick={() => setMode('anime')}
            className={`w-[80px] relative z-10 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold transition-colors ${
              mode === 'anime' ? 'text-blue-500' : 'text-ink-500'
            }`}
          >
            <Tv size={12} /> Anime
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col gap-3">
          <div className="relative w-full sm:max-w-md" ref={searchRef}>
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (query.trim()) addSearchHistory(query.trim());
                  setShowHistory(false);
                }
              }}
              onFocus={() => setShowHistory(true)}
              onBlur={() => {
                if (query.trim()) addSearchHistory(query.trim());
                setTimeout(() => setShowHistory(false), 200);
              }}
              placeholder={`Search ${mode}...`}
              className="input-base pl-9 pr-9"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 dark:hover:text-ink-300"
              >
                <X size={14} />
              </button>
            )}

            {showHistory && searchHistory.length > 0 && !query && (
              <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-lg shadow-lg py-1 animate-fade-in">
                <div className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-[10px] font-mono text-ink-400 uppercase tracking-wider">Recent Searches</span>
                  <button onClick={clearSearchHistory} className="text-[10px] font-mono text-ink-400 hover:text-red-500 transition-colors">
                    Clear all
                  </button>
                </div>
                {searchHistory.map((q) => (
                  <div
                    key={q}
                    className="flex items-center justify-between px-3 py-2 hover:bg-ink-50 dark:hover:bg-ink-800 cursor-pointer transition-colors"
                  >
                    <button
                      onClick={() => selectFromHistory(q)}
                      className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300 flex-1 text-left"
                    >
                      <Clock size={12} className="text-ink-300 shrink-0" />
                      <span className="truncate">{q}</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSearchHistoryItem(q); }}
                      className="text-ink-300 hover:text-red-500 transition-colors p-1"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <FilterBar genres={genres} filters={filters} onChange={(f) => { setFilters(f); }} mode={mode} />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSpinner />
      ) : error ? (
        <ErrorState message="Failed to load titles. Please try again." />
      ) : titles.length === 0 ? (
        <EmptyState
          title="No results found"
          description="Try a different search term or adjust your filters."
        />
      ) : (
        <div className="animate-fade-in">
          {mode === 'manga' ? (
            <MangaGrid titles={titles} />
          ) : (
            <AnimeGrid animeList={titles} />
          )}
          
          {hasNextPage && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="btn-ghost border border-ink-200 dark:border-ink-700 min-w-[140px] h-10"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
