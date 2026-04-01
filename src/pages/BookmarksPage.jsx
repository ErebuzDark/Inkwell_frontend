import { useState } from 'react';
import { BookMarked, Trash2, ChevronDown, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore, BOOKMARK_STATUSES } from '../store/appStore.js';
import { EmptyState } from '../components/ui/shared.jsx';
import LazyImage from '../components/ui/LazyImage.jsx';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  ...BOOKMARK_STATUSES,
];

export default function BookmarksPage() {
  const {
    bookmarks, removeBookmark,
    bookmarkStatuses, setBookmarkStatus,
    readingHistory, getChaptersReadCount,
  } = useAppStore();

  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = statusFilter === 'all'
    ? bookmarks
    : bookmarks.filter((m) => (bookmarkStatuses[m.id] || 'reading') === statusFilter);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink-900 dark:text-ink-100 mb-1">
            Bookmarks
          </h1>
          <p className="text-sm text-ink-400 dark:text-ink-500">
            {bookmarks.length} title{bookmarks.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map((sf) => {
            const count = sf.value === 'all'
              ? bookmarks.length
              : bookmarks.filter((m) => (bookmarkStatuses[m.id] || 'reading') === sf.value).length;
            if (sf.value !== 'all' && count === 0) return null;
            return (
              <button
                key={sf.value}
                onClick={() => setStatusFilter(sf.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all duration-150
                  ${statusFilter === sf.value
                    ? 'bg-accent text-white shadow-sm shadow-accent/20'
                    : 'bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400 hover:bg-ink-200 dark:hover:bg-ink-700'
                  }`}
              >
                {sf.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title={statusFilter === 'all' ? 'No bookmarks yet' : 'No titles with this status'}
          description={statusFilter === 'all'
            ? 'Browse titles and click the bookmark icon to save them here.'
            : 'Change the filter to see other bookmarks.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((manga) => (
            <BookmarkCard
              key={manga.id}
              manga={manga}
              status={bookmarkStatuses[manga.id] || 'reading'}
              onStatusChange={(s) => setBookmarkStatus(manga.id, s)}
              onRemove={() => removeBookmark(manga.id)}
              lastReadChapterId={readingHistory[manga.id]}
              chaptersRead={getChaptersReadCount(manga.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookmarkCard({ manga, status, onStatusChange, onRemove, lastReadChapterId, chaptersRead }) {
  const [showStatus, setShowStatus] = useState(false);
  const statusObj = BOOKMARK_STATUSES.find((s) => s.value === status);

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 transition-colors">
      <Link to={`/manga/${manga.id}`} className="w-14 h-20 rounded-lg overflow-hidden shrink-0">
        <LazyImage
          src={manga.cover}
          alt={manga.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
        />
      </Link>

      <div className="flex-1 min-w-0 space-y-1">
        <Link
          to={`/manga/${manga.id}`}
          className="font-display font-semibold text-sm text-ink-900 dark:text-ink-100 hover:text-accent transition-colors line-clamp-2"
        >
          {manga.title}
        </Link>
        <div className="flex items-center gap-2">
          <p className="text-xs font-mono text-ink-400">{manga.type}</p>
          {chaptersRead > 0 && (
            <span className="text-[11px] font-mono text-ink-300 dark:text-ink-600">
              · {chaptersRead} ch. read
            </span>
          )}
        </div>

        {/* Status selector */}
        <div className="relative">
          <button
            onClick={() => setShowStatus(!showStatus)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors
              ${statusObj?.color || 'text-ink-400'} bg-ink-50 dark:bg-ink-800 hover:bg-ink-100 dark:hover:bg-ink-700`}
          >
            {statusObj?.label || 'Reading'}
            <ChevronDown size={10} />
          </button>
          {showStatus && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-lg shadow-lg py-1 min-w-[140px] animate-fade-in">
              {BOOKMARK_STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => { onStatusChange(s.value); setShowStatus(false); }}
                  className={`block w-full text-left px-3 py-1.5 text-xs font-mono transition-colors
                    hover:bg-ink-50 dark:hover:bg-ink-800 ${s.value === status ? s.color + ' font-semibold' : 'text-ink-600 dark:text-ink-300'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {manga.genres?.length > 0 && (
          <p className="text-[11px] text-ink-300 dark:text-ink-600 truncate">
            {manga.genres.slice(0, 3).join(' · ')}
          </p>
        )}
      </div>

      <div className="flex flex-col items-center gap-1 shrink-0">
        {lastReadChapterId && (
          <Link
            to={`/read/${lastReadChapterId}?manga=${manga.id}`}
            className="p-2 text-accent hover:text-accent-hover transition-colors"
            title="Continue reading"
          >
            <BookOpen size={15} />
          </Link>
        )}
        <button
          onClick={onRemove}
          className="p-2 text-ink-300 dark:text-ink-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          aria-label="Remove bookmark"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
