import { Link } from 'react-router-dom';
import { Star, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button, Tooltip } from 'antd';
import { useAppStore } from '../../store/appStore.js';
import LazyImage from './LazyImage.jsx';

function getTypeClass(type) {
  switch (type?.toLowerCase()) {
    case 'manga': return 'bg-blue-500/10 text-blue-500';
    case 'manhwa': return 'bg-purple-500/10 text-purple-500';
    case 'manhua': return 'bg-orange-500/10 text-orange-500';
    default: return 'bg-ink-500/10 text-ink-500';
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
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-ink-900/50 border border-ink-100 dark:border-ink-800/50 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-1"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-ink-100 dark:bg-ink-800">
        <LazyImage
          src={manga.cover}
          alt={manga.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Bookmark Action */}
        <button
          onClick={handleBookmark}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 transform
            ${bookmarked
              ? 'bg-accent text-white scale-100 opacity-100 shadow-lg shadow-accent/20'
              : 'bg-black/40 text-white scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 hover:bg-black/60'
            }`}
        >
          {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>

        {/* Status Badge */}
        {manga.status && (
          <div className="absolute bottom-3 left-3">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-md
              ${manga.status === 'Ongoing'
                ? 'bg-emerald-500/80 text-white'
                : 'bg-ink-800/80 text-white'
              }`}>
              {manga.status}
            </span>
          </div>
        )}

        {/* Reading Progress */}
        {bookmarked && chaptersRead > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 backdrop-blur-sm">
            <div
              className="h-full bg-accent shadow-[0_0_8px_rgba(232,83,58,0.6)] transition-all duration-500"
              style={{ width: `${Math.min(chaptersRead * 2, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getTypeClass(manga.type)}`}>
            {manga.type?.toUpperCase()}
          </span>
          {manga.rating && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
              <Star size={12} className="fill-amber-500" />
              {manga.rating}
            </div>
          )}
        </div>

        <h3 className="font-display font-bold text-sm text-ink-900 dark:text-ink-50 leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-accent transition-colors duration-200">
          {manga.title}
        </h3>

        {manga.genres?.length > 0 && (
          <div className="flex items-center gap-1 overflow-hidden">
             <p className="text-[10px] text-ink-400 dark:text-ink-500 font-medium truncate uppercase tracking-tight">
                {manga.genres.slice(0, 3).join(' • ')}
              </p>
          </div>
        )}
      </div>
    </Link>
  );
}
