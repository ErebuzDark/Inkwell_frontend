import { ChevronDown } from 'lucide-react';
import { useRatings } from '../../hooks/usemanga.js';

const TYPES = ['All', 'Manga', 'Manhwa', 'Manhua'];
const STATUSES = ['All', 'Ongoing', 'Completed'];

export default function FilterBar({ genres = [], filters, onChange }) {
  const { data: ratings = [] } = useRatings();

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value === 'All' ? '' : value });
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
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

      {/* Genre */}
      <SelectFilter
        label="Genre"
        value={filters.genre || 'All'}
        options={['All', ...genres]}
        onChange={(v) => handleChange('genre', v)}
      />

      {/* Rating */}
      <SelectFilter
        label="Rating"
        value={filters.rating || 'All'}
        options={['All', ...ratings]}
        onChange={(v) => handleChange('rating', v)}
      />

      {/* Active filters count */}
      {Object.values(filters).filter(Boolean).length > 0 && (
        <button
          onClick={() => onChange({})}
          className="text-xs font-mono text-accent hover:text-accent-hover transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function SelectFilter({ label, value, options, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-ink-200 dark:border-ink-700
          bg-white dark:bg-ink-900 text-ink-800 dark:text-ink-200
          text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/30
          cursor-pointer transition-colors"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === 'All' ? `${label}: All` : opt}
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
