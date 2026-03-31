import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useSearch, useMangaList, useGenres } from '../hooks/usemanga.js';
import MangaGrid from '../components/ui/MangaGrid.jsx';
import FilterBar from '../components/ui/FilterBar.jsx';
import { PageSpinner, ErrorState, EmptyState, Pagination } from '../components/ui/shared.jsx';
import { useAppStore } from '../store/appStore.js';

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { browseFilters, setBrowseFilters, clearBrowseFilters } = useAppStore();

  const [query, setQuery] = useState(browseFilters.q || searchParams.get('q') || '');
  const [debouncedQ, setDebouncedQ] = useState(query);
  const [filters, setFilters] = useState(browseFilters.filters || {});

  const { data: genres = [] } = useGenres();

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

  const hasSearchOrFilters = debouncedQ.trim() || Object.values(filters).some(Boolean);

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
    setSearchParams({});
  };

  return (
    <div className="max-width-7xl mx-auto px-4 sm:px-6 py-10">
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
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
        </div>

        {/* Filters */}
        <FilterBar genres={genres} filters={filters} onChange={(f) => { setFilters(f); }} />
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
