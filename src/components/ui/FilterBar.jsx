import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, ArrowUpDown } from 'lucide-react';
import { useRatings } from '../../hooks/usemanga.js';

const TYPES = ['All', 'Manga', 'Manhwa', 'Manhua'];
const STATUSES = ['All', 'Ongoing', 'Completed'];
const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'follows', label: 'Most Followed' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'update', label: 'Latest Update' },
  { value: 'title', label: 'Title A → Z' },
];

export default function FilterBar({ genres = [], filters, onChange }) {
  const { data: ratings = [] } = useRatings();
  const [genreOpen, setGenreOpen] = useState(false);
  const genreRef = useRef(null);

  // Close genre dropdown on click outside
  useEffect(() => {
    const handler = (e) => {
      if (genreRef.current && !genreRef.current.contains(e.target)) {
        setGenreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value === 'All' ? '' : value });
  };

  // Multi-tag toggle
  const selectedGenres = filters.genres || [];
  const excludedGenres = filters.excludeGenres || [];

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      // Remove from included
      onChange({
        ...filters,
        genres: selectedGenres.filter((g) => g !== genre),
      });
    } else if (excludedGenres.includes(genre)) {
      // Remove from excluded
      onChange({
        ...filters,
        excludeGenres: excludedGenres.filter((g) => g !== genre),
      });
    } else {
      // Add to included
      onChange({
        ...filters,
        genres: [...selectedGenres, genre],
      });
    }
  };

  const toggleExclude = (genre, e) => {
    e.stopPropagation();
    if (excludedGenres.includes(genre)) {
      onChange({
        ...filters,
        excludeGenres: excludedGenres.filter((g) => g !== genre),
      });
    } else {
      onChange({
        ...filters,
        genres: selectedGenres.filter((g) => g !== genre),
        excludeGenres: [...excludedGenres, genre],
      });
    }
  };

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => {
    if (k === 'genres' || k === 'excludeGenres') return Array.isArray(v) && v.length > 0;
    return Boolean(v);
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap sm:overflow-visible">
        {/* Type */}
        <SelectFilter
          label="Type"
          value={filters.type || 'All'}
          options={TYPES}
          onChange={(v) => handleChange('type', v)}
        />

        {/* Status */}
        <SelectFilter
          label="Status"
          value={filters.status || 'All'}
          options={STATUSES}
          onChange={(v) => handleChange('status', v)}
        />

        {/* Sort */}
        <SelectFilter
          label="Sort"
          value={filters.sort || ''}
          options={SORT_OPTIONS.map((s) => s.value)}
          optionLabels={SORT_OPTIONS.reduce((acc, s) => {
            acc[s.value] = s.value === '' ? 'Sort: Default' : s.label;
            return acc;
          }, {})}
          onChange={(v) => handleChange('sort', v)}
          icon={<ArrowUpDown size={12} className="text-ink-400" />}
        />

        {/* Rating */}
        <SelectFilter
          label="Rating"
          value={filters.rating || 'All'}
          options={['All', ...ratings]}
          onChange={(v) => handleChange('rating', v)}
        />

        {/* Genre multi-select button */}
        <div className="relative" ref={genreRef}>
          <button
            onClick={() => setGenreOpen(!genreOpen)}
            className={`appearance-none flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg border
              bg-white dark:bg-ink-900 text-sm font-body cursor-pointer transition-colors
              ${selectedGenres.length > 0 || excludedGenres.length > 0
                ? 'border-accent/50 text-accent'
                : 'border-ink-200 dark:border-ink-700 text-ink-800 dark:text-ink-200'
              } focus:outline-none focus:ring-2 focus:ring-accent/30`}
          >
            Genres {(selectedGenres.length + excludedGenres.length) > 0
              ? `(${selectedGenres.length + excludedGenres.length})`
              : ''}
            <ChevronDown size={14} className="text-ink-400" />
          </button>

          {genreOpen && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-xl shadow-xl py-2 w-72 max-h-80 overflow-y-auto animate-fade-in">
              <p className="px-3 pb-2 text-[10px] font-mono text-ink-400 uppercase tracking-wider">
                Click to include · Right-click to exclude
              </p>
              <div className="flex flex-wrap gap-1.5 px-3">
                {genres.map((g) => {
                  const isIncluded = selectedGenres.includes(g);
                  const isExcluded = excludedGenres.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => toggleGenre(g)}
                      onContextMenu={(e) => { e.preventDefault(); toggleExclude(g, e); }}
                      className={`px-2 py-1 rounded-md text-[11px] font-mono transition-all duration-100 border
                        ${isIncluded
                          ? 'bg-accent/10 border-accent/40 text-accent font-medium'
                          : isExcluded
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-500 line-through'
                            : 'bg-ink-50 dark:bg-ink-800 border-transparent text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700'
                        }`}
                    >
                      {isExcluded && '−'}{isIncluded && '+'}{g}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={() => onChange({})}
            className="text-xs font-mono text-accent hover:text-accent-hover transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Active tag chips */}
      {(selectedGenres.length > 0 || excludedGenres.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {selectedGenres.map((g) => (
            <span key={`inc-${g}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-accent/10 text-accent border border-accent/30">
              {g}
              <button onClick={() => toggleGenre(g)} className="hover:text-accent-hover"><X size={10} /></button>
            </span>
          ))}
          {excludedGenres.map((g) => (
            <span key={`exc-${g}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-300 dark:border-red-700">
              −{g}
              <button onClick={() => toggleExclude(g, { stopPropagation: () => {} })} className="hover:text-red-700"><X size={10} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SelectFilter({ label, value, options, onChange, optionLabels, icon }) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none pr-8 py-1.5 rounded-lg border border-ink-200 dark:border-ink-700
          bg-white dark:bg-ink-900 text-ink-800 dark:text-ink-200
          text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/30
          cursor-pointer transition-colors ${icon ? 'pl-7' : 'pl-3'}`}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {optionLabels ? optionLabels[opt] : (opt === 'All' || opt === '' ? `${label}: All` : opt)}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
      />
    </div>
  );
}
