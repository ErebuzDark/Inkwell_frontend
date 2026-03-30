import { BookMarked, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore.js';
import { EmptyState } from '../components/ui/shared.jsx';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useAppStore();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-ink-900 dark:text-ink-100 mb-1">
          Bookmarks
        </h1>
        <p className="text-sm text-ink-400 dark:text-ink-500">
          {bookmarks.length} title{bookmarks.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No bookmarks yet"
          description="Browse titles and click the bookmark icon to save them here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bookmarks.map((manga) => (
            <div
              key={manga.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800"
            >
              <Link to={`/manga/${manga.id}`} className="w-14 h-20 rounded-lg overflow-hidden shrink-0">
                <img
                  src={manga.cover}
                  alt={manga.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/manga/${manga.id}`}
                  className="font-display font-semibold text-sm text-ink-900 dark:text-ink-100 hover:text-accent transition-colors line-clamp-2"
                >
                  {manga.title}
                </Link>
                <p className="text-xs font-mono text-ink-400 mt-0.5">{manga.type}</p>
                {manga.genres?.length > 0 && (
                  <p className="text-[11px] text-ink-300 dark:text-ink-600 mt-1 truncate">
                    {manga.genres.slice(0, 3).join(' · ')}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeBookmark(manga.id)}
                className="p-2 text-ink-300 dark:text-ink-600 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
                aria-label="Remove bookmark"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
