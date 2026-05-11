import { useParams, Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  Star, Eye, BookOpen, Bookmark, BookmarkCheck,
  ArrowLeft, User, Tag, Activity, ChevronDown,
  FolderPlus, Check, X
} from 'lucide-react';
import { useMangaDetail, useRelatedManga } from '../hooks/usemanga.js';
import { useAppStore, BOOKMARK_STATUSES } from '../store/appStore.js';
import { useAchievementStore } from '../store/achievementStore.js';
import ChapterList from '../components/ui/ChapterList.jsx';
import { PageSpinner, ErrorState, SectionHeader } from '../components/ui/shared.jsx';
import LazyImage from '../components/ui/LazyImage.jsx';
import MangaGrid from '../components/ui/MangaGrid.jsx';
import CharacterSection from '../components/ui/CharacterSection.jsx';

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
  const {
    isBookmarked, addBookmark, removeBookmark,
    bookmarkStatuses, setBookmarkStatus, getChaptersReadCount,
  } = useAppStore();
  const incrementStat = useAchievementStore((s) => s.incrementStat);
  const [showStatus, setShowStatus] = useState(false);

  if (isLoading) return <PageSpinner />;
  if (error || !manga) return <ErrorState message="Could not load this title." />;

  const bookmarked = isBookmarked(manga.id);
  const firstChapter = manga.chapters?.[manga.chapters.length - 1];
  const latestChapter = manga.chapters?.[0];
  const status = bookmarkStatuses[manga.id] || 'reading';
  const statusObj = BOOKMARK_STATUSES.find((s) => s.value === status);
  const chaptersRead = getChaptersReadCount(manga.id);
  const totalChapters = manga.chapters?.length || 0;

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
          <div className="aspect-[2/3] rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-800 shadow-lg relative">
            <LazyImage
              src={manga.cover}
              alt={manga.title}
              className="w-full h-full object-cover"
            />
            {/* Progress bar */}
            {bookmarked && chaptersRead > 0 && totalChapters > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${Math.min((chaptersRead / totalChapters) * 100, 100)}%` }}
                />
              </div>
            )}
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

          {/* Reading progress */}
          {bookmarked && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Status dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStatus(!showStatus)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors
                    ${statusObj?.color || 'text-ink-400'} border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 hover:bg-ink-100 dark:hover:bg-ink-700`}
                >
                  {statusObj?.label || 'Reading'}
                  <ChevronDown size={11} />
                </button>
                {showStatus && (
                  <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-lg shadow-lg py-1 min-w-[150px] animate-fade-in">
                    {BOOKMARK_STATUSES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => { setBookmarkStatus(manga.id, s.value); setShowStatus(false); }}
                        className={`block w-full text-left px-3 py-1.5 text-xs font-mono transition-colors
                          hover:bg-ink-50 dark:hover:bg-ink-800 ${s.value === status ? s.color + ' font-semibold' : 'text-ink-600 dark:text-ink-300'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Progress text */}
              <span className="text-xs font-mono text-ink-400">
                {chaptersRead} / {totalChapters} chapters read
              </span>
            </div>
          )}

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
              onClick={() => {
                if (bookmarked) {
                  removeBookmark(manga.id);
                } else {
                  addBookmark(manga);
                  incrementStat('collectionsAdded', 1);
                }
              }}
              className={`btn-ghost border ${bookmarked
                ? 'border-accent text-accent'
                : 'border-ink-200 dark:border-ink-700'
              }`}
            >
              {bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
            
            <CollectionDropdown manga={manga} />
          </div>
        </div>
      </div>
      {/* Characters */}
      <div className="mb-12">
        <CharacterSection title={manga.title} type="MANGA" />
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

      {/* Related manga */}
      <RelatedMangaSection mangaId={manga.id} />
    </div>
  );
}

function RelatedMangaSection({ mangaId }) {
  const { data: related, isLoading } = useRelatedManga(mangaId);

  if (isLoading || !related || related.length === 0) return null;

  return (
    <div className="mt-12">
      <SectionHeader
        title="You Might Also Like"
        subtitle="Based on similar genres"
      />
      <MangaGrid titles={related} />
    </div>
  );
}

function CollectionDropdown({ manga }) {
  const { collections, addToCollection, removeFromCollection } = useAppStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const collectionList = Object.values(collections);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleCollection = (colName, isInCollection) => {
    if (isInCollection) {
      removeFromCollection(colName, manga.id);
    } else {
      addToCollection(colName, manga);
    }
  };

  if (collectionList.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="btn-ghost border border-ink-200 dark:border-ink-700 h-full"
        title="Add to Collection"
      >
        <FolderPlus size={15} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 shadow-xl z-20 animate-fade-in overflow-hidden">
          <div className="px-3 py-2 border-b border-ink-100 dark:border-ink-800 bg-ink-50 dark:bg-ink-900">
            <p className="text-xs font-semibold text-ink-900 dark:text-ink-100">Save to...</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {collectionList.map((col) => {
              const isInCollection = col.manga.some(m => m.id === manga.id);
              return (
                <button
                  key={col.name}
                  onClick={() => toggleCollection(col.name, isInCollection)}
                  className="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-ink-50 dark:hover:bg-ink-900 transition-colors"
                >
                  <span className="truncate pr-2 text-ink-700 dark:text-ink-300">{col.name}</span>
                  {isInCollection && <Check size={14} className="text-accent shrink-0" />}
                </button>
              );
            })}
          </div>
          <Link
            to="/collections"
            className="block w-full text-center px-3 py-2 text-xs font-medium text-accent hover:bg-ink-50 dark:hover:bg-ink-900 border-t border-ink-100 dark:border-ink-800 transition-colors"
          >
            Manage Collections
          </Link>
        </div>
      )}
    </div>
  );
}
