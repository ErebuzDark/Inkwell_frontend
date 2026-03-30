import { useParams, Link } from 'react-router-dom';
import {
  Star, Eye, BookOpen, Bookmark, BookmarkCheck,
  ArrowLeft, User, Tag, Activity,
} from 'lucide-react';
import { useMangaDetail } from '../hooks/usemanga.js';
import { useAppStore } from '../store/appStore.js';
import ChapterList from '../components/ui/ChapterList.jsx';
import { PageSpinner, ErrorState } from '../components/ui/shared.jsx';

function getTypeClass(type) {
  switch (type?.toLowerCase()) {
    case 'manga': return 'type-manga';
    case 'manhwa': return 'type-manhwa';
    case 'manhua': return 'type-manhua';
    default: return 'type-default';
  }
}

export default function MangaDetailPage() {
  const { id } = useParams();
  const { data: manga, isLoading, error } = useMangaDetail(id);
  const { isBookmarked, addBookmark, removeBookmark } = useAppStore();

  if (isLoading) return <PageSpinner />;
  if (error || !manga) return <ErrorState message="Could not load this title." />;

  const bookmarked = isBookmarked(manga.id);
  const firstChapter = manga.chapters?.[manga.chapters.length - 1];
  const latestChapter = manga.chapters?.[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-slide-up">
      {/* Back */}
      <Link
        to="/browse"
        className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 mb-6 transition-colors font-body"
      >
        <ArrowLeft size={14} />
        Back to browse
      </Link>

      {/* Main info */}
      <div className="flex flex-col sm:flex-row gap-6 mb-10">
        {/* Cover */}
        <div className="shrink-0 w-40 sm:w-48 mx-auto sm:mx-0">
          <div className="aspect-[2/3] rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-800 shadow-lg">
            <img
              src={manga.cover}
              alt={manga.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4">
          {/* Type badge */}
          <span className={`badge ${getTypeClass(manga.type)}`}>{manga.type}</span>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink-950 dark:text-ink-50 leading-tight">
            {manga.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 text-sm text-ink-500 dark:text-ink-400 font-body">
            {manga.author && (
              <span className="flex items-center gap-1.5">
                <User size={13} />
                {manga.author}
              </span>
            )}
            {manga.rating && (
              <span className="flex items-center gap-1.5 text-amber-500">
                <Star size={13} className="fill-amber-500" />
                {manga.rating} / 10
              </span>
            )}
            {manga.views && (
              <span className="flex items-center gap-1.5">
                <Eye size={13} />
                {manga.views} views
              </span>
            )}
            {manga.status && (
              <span className={`flex items-center gap-1.5 ${
                manga.status === 'Ongoing' ? 'text-emerald-500' : 'text-ink-400'
              }`}>
                <Activity size={13} />
                {manga.status}
              </span>
            )}
          </div>

          {/* Genres */}
          {manga.genres?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <Tag size={12} className="text-ink-300 dark:text-ink-600" />
              {manga.genres.map((g) => (
                <span
                  key={g}
                  className="badge bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 text-[11px]"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {manga.description && (
            <p className="text-sm text-ink-600 dark:text-ink-400 leading-relaxed max-w-prose font-body">
              {manga.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {firstChapter && (
              <Link to={`/read/${firstChapter.id}?manga=${manga.id}`} className="btn-primary">
                <BookOpen size={15} />
                Start Reading
              </Link>
            )}
            {latestChapter && latestChapter.id !== firstChapter?.id && (
              <Link
                to={`/read/${latestChapter.id}?manga=${manga.id}`}
                className="btn-ghost border border-ink-200 dark:border-ink-700"
              >
                Latest Chapter
              </Link>
            )}
            <button
              onClick={() => bookmarked ? removeBookmark(manga.id) : addBookmark(manga)}
              className={`btn-ghost border ${bookmarked
                ? 'border-accent text-accent'
                : 'border-ink-200 dark:border-ink-700'
              }`}
            >
              {bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
          </div>
        </div>
      </div>

      {/* Chapter list */}
      <div>
        <h2 className="font-display font-semibold text-lg text-ink-900 dark:text-ink-100 mb-4">
          Chapters
          <span className="ml-2 text-sm font-mono font-normal text-ink-400">
            ({manga.chapters?.length || 0})
          </span>
        </h2>
        <ChapterList chapters={manga.chapters || []} mangaId={manga.id} />
      </div>
    </div>
  );
}
