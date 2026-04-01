import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Clock, Trash2 } from 'lucide-react';
import { useSearch, useMangaList, useGenres } from '../hooks/usemanga.js';
import MangaGrid from '../components/ui/MangaGrid.jsx';
import FilterBar from '../components/ui/FilterBar.jsx';
import { PageSpinner, ErrorState, EmptyState } from '../components/ui/shared.jsx';
import { useAppStore } from '../store/appStore.js';

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { browseFilters, setBrowseFilters, searchHistory, addSearchHistory, removeSearchHistoryItem, clearSearchHistory } = useAppStore();

  const [query, setQuery] = useState(browseFilters.q || searchParams.get('q') || '');
  const [debouncedQ, setDebouncedQ] = useState(query);
  const [filters, setFilters] = useState(browseFilters.filters || {});
  const [showHistory, setShowHistory] = useState(false);
  const searchRef = useRef(null);

  const { data: genres = [] } = useGenres();

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

  // Sync with store
  useEffect(() => {
    setBrowseFilters(debouncedQ, filters);
  }, [debouncedQ, filters, setBrowseFilters]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(query);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  // Sync URL param (only for search query)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== query) {
      setQuery(q);
      setDebouncedQ(q);
    }
  }, [searchParams]);

  // Update URL when search changes
  useEffect(() => {
    if (debouncedQ) {
      setSearchParams({ q: debouncedQ }, { replace: true });
    } else if (searchParams.get('q')) {
      setSearchParams({}, { replace: true });
    }
  }, [debouncedQ, setSearchParams, searchParams]);

  const hasSearchOrFilters = debouncedQ.trim() || Object.entries(filters).some(([k, v]) => {
    if (k === 'genres' || k === 'excludeGenres') return Array.isArray(v) && v.length > 0;
    return Boolean(v);
  });

  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
    fetchNextPage: fetchNextSearch,
    hasNextPage: hasNextSearch,
    isFetchingNextPage: isFetchingNextSearch,
  } = useSearch(debouncedQ, filters);

  const {
    data: listData,
    isLoading: listLoading,
    error: listError,
    fetchNextPage: fetchNextList,
    hasNextPage: hasNextList,
    isFetchingNextPage: isFetchingNextList,
  } = useMangaList();

  const isLoading = hasSearchOrFilters ? searchLoading : listLoading;
  const error = hasSearchOrFilters ? searchError : listError;
  const isFetchingNextPage = hasSearchOrFilters ? isFetchingNextSearch : isFetchingNextList;
  const hasNextPage = hasSearchOrFilters ? hasNextSearch : hasNextList;
  const fetchNextPage = hasSearchOrFilters ? fetchNextSearch : fetchNextList;

  // Flatten titles from pages
  const titles = hasSearchOrFilters
    ? searchData?.pages.flatMap(page => page.results) || []
    : listData?.pages.flatMap(page => page.titles) || [];

  const totalResults = hasSearchOrFilters
    ? searchData?.pages[0]?.total || 0
    : listData?.pages[0]?.total || 0;

  const clearSearch = () => {
    setQuery('');
    setDebouncedQ('');
    setSearchParams({});
  };

  const selectFromHistory = (q) => {
    setQuery(q);
    setDebouncedQ(q);
    setShowHistory(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-ink-900 dark:text-ink-100 mb-1">
          Browse
        </h1>
        <p className="text-sm text-ink-400 dark:text-ink-500">
          Explore manga, manhwa, and manhua
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col gap-3">
          {/* Search input with history */}
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
              placeholder="Search by title, genre, author..."
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

            {/* Search history dropdown */}
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

          {/* Filters */}
          <FilterBar genres={genres} filters={filters} onChange={(f) => { setFilters(f); }} />
        </div>
      </div>

      {/* Results header */}
      {hasSearchOrFilters && !isLoading && (
        <p className="text-xs font-mono text-ink-400 dark:text-ink-500 mb-4">
          {totalResults} result{totalResults !== 1 ? 's' : ''}
          {debouncedQ && ` for "${debouncedQ}"`}
        </p>
      )}

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
          <MangaGrid titles={titles} />
          
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
