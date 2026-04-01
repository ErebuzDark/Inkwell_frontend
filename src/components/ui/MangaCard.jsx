import { Link } from 'react-router-dom';
import { Star, Bookmark, BookmarkCheck } from 'lucide-react';
import { useAppStore } from '../../store/appStore.js';
import LazyImage from './LazyImage.jsx';

function getTypeClass(type) {
  switch (type?.toLowerCase()) {
    case 'manga': return 'type-manga';
    case 'manhwa': return 'type-manhwa';
    case 'manhua': return 'type-manhua';
    default: return 'type-default';
  }
}

export default function MangaCard({ manga }) {
  const { isBookmarked, addBookmark, removeBookmark, getChaptersReadCount } = useAppStore();
  const bookmarked = isBookmarked(manga.id);
  const chaptersRead = getChaptersReadCount(manga.id);

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    bookmarked ? removeBookmark(manga.id) : addBookmark(manga);
  };

  return (
    <Link
      to={`/manga/${manga.id}`}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 card-hover shadow-sm hover:shadow-md dark:hover:shadow-ink-800/50 transition-shadow duration-200"
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] overflow-hidden bg-ink-100 dark:bg-ink-800">
        <LazyImage
          src={manga.cover}
          alt={manga.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Bookmark button */}
        <button
          onClick={handleBookmark}
          className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-sm transition-all duration-150
            ${bookmarked
              ? 'bg-accent text-white'
              : 'bg-black/30 text-white opacity-0 group-hover:opacity-100'
            }`}
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          {bookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
        </button>

        {/* Status badge */}
        {manga.status && (
          <span className={`absolute bottom-2 left-2 badge text-[10px] backdrop-blur-sm
            ${manga.status === 'Ongoing'
              ? 'bg-emerald-500/90 text-white'
              : 'bg-ink-700/80 text-ink-200'
            }`}>
            {manga.status}
          </span>
        )}

        {/* Progress bar for bookmarked manga */}
        {bookmarked && chaptersRead > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${Math.min(chaptersRead * 2, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="flex items-start justify-between gap-1">
          <span className={`badge ${getTypeClass(manga.type)}`}>{manga.type}</span>
          {manga.rating && (
            <span className="flex items-center gap-0.5 text-xs font-mono text-amber-500">
              <Star size={11} className="fill-amber-500" />
              {manga.rating}
            </span>
          )}
        </div>

        <h3 className="font-display font-semibold text-sm text-ink-900 dark:text-ink-100 leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {manga.title}
        </h3>

        {manga.genres?.length > 0 && (
          <p className="text-[11px] text-ink-400 dark:text-ink-500 font-mono truncate">
            {manga.genres.slice(0, 3).join(' · ')}
          </p>
        )}
      </div>
    </Link>
  );
}
