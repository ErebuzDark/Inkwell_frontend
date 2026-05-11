import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, BookOpen, Tv, X } from 'lucide-react';
import { Input, Button, Space, Tag, Empty } from 'antd';
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

  // Sync with store
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

  // Update URL
  useEffect(() => {
    const params = { type: mode };
    if (debouncedQ) params.q = debouncedQ;
    setSearchParams(params, { replace: true });
  }, [debouncedQ, mode, setSearchParams]);

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
    : (debouncedQ.trim() ? animeSearchLoading : animeListLoading);

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

  const handleSearch = (value) => {
     if (value.trim()) {
        addSearchHistory(value.trim());
     }
     setShowHistory(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div className="space-y-1">
          <h1 className="font-display font-black text-4xl text-ink-900 dark:text-ink-50">
            Browse
          </h1>
          <p className="text-ink-400 dark:text-ink-500 font-medium">
            Explore {mode === 'manga' ? 'manga, manhwa, and manhua' : 'anime and movies'}
          </p>
        </div>

        {/* Toggle & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="bg-ink-100 dark:bg-ink-900 p-1 rounded-2xl flex relative w-full sm:w-auto border border-ink-200 dark:border-ink-800">
             <div 
              className={`absolute top-1 bottom-1 w-[100px] bg-white dark:bg-ink-950 rounded-[14px] shadow-sm transition-transform duration-300 ${
                mode === 'manga' ? 'translate-x-0' : 'translate-x-[100px]'
              }`} 
            />
            <button
              onClick={() => setMode('manga')}
              className={`w-[100px] h-9 relative z-10 flex items-center justify-center gap-2 text-xs font-bold transition-colors ${
                mode === 'manga' ? 'text-accent' : 'text-ink-500'
              }`}
            >
              <BookOpen size={14} /> Manga
            </button>
            <button
              onClick={() => setMode('anime')}
              className={`w-[100px] h-9 relative z-10 flex items-center justify-center gap-2 text-xs font-bold transition-colors ${
                mode === 'anime' ? 'text-blue-500' : 'text-ink-500'
              }`}
            >
              <Tv size={14} /> Anime
            </button>
          </div>

          <div className="relative w-full sm:w-72 lg:w-80" ref={searchRef}>
            <Input
              placeholder={`Search ${mode}...`}
              size="large"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onPressEnter={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowHistory(true)}
              suffix={query && <X size={14} className="text-ink-300 cursor-pointer hover:text-ink-600" onClick={() => setQuery('')} />}
              className="rounded-2xl border-none bg-ink-100 dark:bg-ink-900 hover:bg-ink-200 dark:hover:bg-ink-800 h-11"
            />
            
            {showHistory && searchHistory.length > 0 && !query && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-2xl shadow-2xl py-2 overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between px-4 py-2 border-b border-ink-50 dark:border-ink-800 mb-1">
                  <span className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">Recent</span>
                  <Button type="link" size="small" onClick={clearSearchHistory} className="text-[10px] text-ink-400 font-bold p-0">Clear</Button>
                </div>
                {searchHistory.map((q) => (
                  <div
                    key={q}
                    className="flex items-center justify-between px-4 py-2 hover:bg-ink-50 dark:hover:bg-ink-800 cursor-pointer group transition-colors"
                  >
                    <button
                      onClick={() => { setQuery(q); setDebouncedQ(q); setShowHistory(false); }}
                      className="flex items-center gap-3 text-sm text-ink-700 dark:text-ink-300 flex-1 text-left"
                    >
                      <Clock size={12} className="text-ink-300" />
                      <span className="truncate font-medium">{q}</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSearchHistoryItem(q); }}
                      className="text-ink-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-10 bg-ink-50/50 dark:bg-ink-900/20 p-4 rounded-3xl border border-ink-100/50 dark:border-ink-800/50">
        <FilterBar genres={genres} filters={filters} onChange={(f) => setFilters(f)} mode={mode} />
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSpinner />
      ) : error ? (
        <ErrorState message="Something went wrong while fetching titles." />
      ) : titles.length === 0 ? (
        <EmptyState
          title="No results found"
          description="Try adjusting your filters or search term."
        />
      ) : (
        <div className="space-y-12">
          {mode === 'manga' ? (
            <MangaGrid titles={titles} />
          ) : (
            <AnimeGrid animeList={titles} />
          )}
          
          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                size="large"
                loading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
                className="min-w-[160px] h-12 rounded-xl font-bold border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300"
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
