import { ArrowUpDown as SortIcon } from 'lucide-react';
import { Select, Button, Tag } from 'antd';
import { useRatings } from '../../hooks/usemanga.js';

const MANGA_TYPES = ['All', 'Manga', 'Manhwa', 'Manhua'];
const ANIME_TYPES = ['All', 'TV', 'Movie', 'OVA', 'ONA', 'Special'];

const STATUSES = ['All', 'Ongoing', 'Completed'];
const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'follows', label: 'Most Followed' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'update', label: 'Latest Update' },
  { value: 'title', label: 'Title A → Z' },
];

export default function FilterBar({ genres = [], filters, onChange, mode = 'manga' }) {
  const isManga = mode === 'manga';
  const TYPES = isManga ? MANGA_TYPES : ANIME_TYPES;
  const { data: ratings = [] } = useRatings();

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value === 'All' ? '' : value });
  };

  const selectedGenres = filters.genres || [];
  const excludedGenres = filters.excludeGenres || [];

  const handleGenreChange = (values) => {
    onChange({ ...filters, genres: values });
  };

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => {
    if (k === 'genres' || k === 'excludeGenres') return Array.isArray(v) && v.length > 0;
    return Boolean(v);
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Type */}
        <Select
          value={filters.type || 'All'}
          onChange={(v) => handleChange('type', v)}
          options={TYPES.map(t => ({ value: t, label: t === 'All' ? 'Type: All' : t }))}
          className="min-w-[120px]"
          variant="filled"
        />

        {/* Status */}
        <Select
          value={filters.status || 'All'}
          onChange={(v) => handleChange('status', v)}
          options={STATUSES.map(s => ({ value: s, label: s === 'All' ? 'Status: All' : s }))}
          className="min-w-[120px]"
          variant="filled"
        />

        {/* Sort */}
        <Select
          value={filters.sort || ''}
          onChange={(v) => handleChange('sort', v)}
          options={SORT_OPTIONS.map(s => ({ 
            value: s.value, 
            label: s.value === '' ? 'Sort: Default' : s.label 
          }))}
          className="min-w-[150px]"
          variant="filled"
          suffixIcon={<SortIcon size={12} className="text-ink-400" />}
        />

        {/* Rating */}
        {isManga && (
          <Select
            value={filters.rating || 'All'}
            onChange={(v) => handleChange('rating', v)}
            options={['All', ...ratings].map(r => ({ value: r, label: r === 'All' ? 'Rating: All' : `Rating: ${r}` }))}
            className="min-w-[120px]"
            variant="filled"
          />
        )}

        {/* Genres */}
        <Select
          mode="multiple"
          placeholder="Select Genres"
          value={selectedGenres}
          onChange={handleGenreChange}
          options={genres.map(g => ({ value: g, label: g }))}
          className="min-w-[200px] flex-1 sm:flex-none sm:max-w-xs"
          variant="filled"
          maxTagCount="responsive"
        />

        {/* Clear */}
        {hasActiveFilters && (
          <Button 
            type="link" 
            onClick={() => onChange({})} 
            className="text-accent hover:text-accent-hover p-0 h-auto text-xs font-mono"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Excluded Genres */}
      {excludedGenres.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-mono text-ink-400 uppercase tracking-wider mr-1">Excluding:</span>
          {excludedGenres.map((g) => (
            <Tag
              key={g}
              closable
              onClose={() => onChange({ ...filters, excludeGenres: excludedGenres.filter(ex => ex !== g) })}
              color="error"
              className="m-0 border-none rounded-full px-2 text-[10px] font-mono"
            >
              {g}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
}
