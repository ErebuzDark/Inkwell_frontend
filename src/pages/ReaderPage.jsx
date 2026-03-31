import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  LayoutList, Maximize2, Moon, Sun, Settings, X,
} from 'lucide-react';
import { useChapterPages, useMangaDetail } from '../hooks/usemanga.js';
import { useAppStore } from '../store/appStore.js';
import { PageSpinner, ErrorState } from '../components/ui/shared.jsx';
import LazyImage from '../components/ui/LazyImage.jsx';

export default function ReaderPage() {
  const { chapterId } = useParams();
  const [searchParams] = useSearchParams();
  const mangaId = searchParams.get('manga');
  const navigate = useNavigate();

  const { data: pages, isLoading, error } = useChapterPages(chapterId);
  const { data: manga } = useMangaDetail(mangaId);
  const { theme, toggleTheme, setLastRead } = useAppStore();

  const [readerMode, setReaderMode] = useState('scroll'); // scroll | paged
  const [currentPage, setCurrentPage] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fitMode, setFitMode] = useState('width'); // width | height

  // Save reading progress
  useEffect(() => {
    if (mangaId && chapterId) {
      setLastRead(mangaId, chapterId);
    }
  }, [mangaId, chapterId, setLastRead]);

  // Keyboard navigation for paged mode
  const handleKeyDown = useCallback((e) => {
    if (readerMode !== 'paged' || !pages) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      setCurrentPage((p) => Math.min(p + 1, pages.totalPages));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      setCurrentPage((p) => Math.max(p - 1, 1));
    }
  }, [readerMode, pages]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Get adjacent chapters for navigation
  const allChapters = manga?.chapters || [];
  const currentIdx = allChapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentIdx < allChapters.length - 1 ? allChapters[currentIdx + 1] : null;
  const nextChapter = currentIdx > 0 ? allChapters[currentIdx - 1] : null;

  const goToChapter = (ch) => {
    navigate(`/read/${ch.id}?manga=${mangaId}`);
    setCurrentPage(1);
    window.scrollTo(0, 0);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center">
      <PageSpinner />
    </div>
  );

  if (error || !pages) return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center">
      <ErrorState message="Failed to load chapter." />
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      {/* Reader Toolbar */}
      <header className="sticky top-0 z-50 bg-ink-950/95 backdrop-blur-md border-b border-ink-800">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between gap-3">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-2 min-w-0">
            <Link
              to={mangaId ? `/manga/${mangaId}` : '/'}
              className="text-ink-400 hover:text-ink-100 transition-colors shrink-0"
              aria-label="Back"
            >
              <ChevronLeft size={18} />
            </Link>
            <div className="min-w-0">
              {manga && (
                <p className="text-xs font-display font-medium text-ink-100 truncate">
                  {manga.title}
                </p>
              )}
              <p className="text-[11px] font-mono text-ink-500 truncate">
                {chapterId.replace(/-/g, ' ').replace(/ch /i, 'Ch.')}
              </p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {readerMode === 'paged' && pages && (
              <span className="text-xs font-mono text-ink-500 px-2">
                {currentPage} / {pages.totalPages}
              </span>
            )}

            <button
              onClick={() => setReaderMode(readerMode === 'scroll' ? 'paged' : 'scroll')}
              className="p-2 text-ink-400 hover:text-ink-100 transition-colors"
              title={readerMode === 'scroll' ? 'Switch to paged' : 'Switch to scroll'}
            >
              <LayoutList size={16} />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 text-ink-400 hover:text-ink-100 transition-colors"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-2 text-ink-400 hover:text-ink-100 transition-colors"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {settingsOpen && (
          <div className="border-t border-ink-800 bg-ink-900 px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-ink-400">Fit:</span>
                {['width', 'height'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setFitMode(m)}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors
                      ${fitMode === m
                        ? 'bg-accent text-white'
                        : 'text-ink-400 hover:text-ink-200'
                      }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-ink-400">Mode:</span>
                {['scroll', 'paged'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setReaderMode(m)}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors
                      ${readerMode === m
                        ? 'bg-accent text-white'
                        : 'text-ink-400 hover:text-ink-200'
                      }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Chapter navigation top */}
      <div className="bg-ink-900 border-b border-ink-800">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => prevChapter && goToChapter(prevChapter)}
            disabled={!prevChapter}
            className="flex items-center gap-1.5 text-xs font-mono text-ink-400 hover:text-ink-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft size={13} />
            Previous
          </button>

          <select
            value={chapterId}
            onChange={(e) => {
              const ch = allChapters.find((c) => c.id === e.target.value);
              if (ch) goToChapter(ch);
            }}
            className="text-xs font-mono bg-ink-800 border border-ink-700 text-ink-300 rounded px-2 py-1
              focus:outline-none focus:ring-1 focus:ring-accent/50"
          >
            {allChapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                Ch. {ch.number}
              </option>
            ))}
          </select>

          <button
            onClick={() => nextChapter && goToChapter(nextChapter)}
            disabled={!nextChapter}
            className="flex items-center gap-1.5 text-xs font-mono text-ink-400 hover:text-ink-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Pages */}
      <main className="flex-1 flex flex-col items-center py-4 text-center">
        {readerMode === 'scroll' ? (
          // Scroll mode
          <div className={`w-full ${fitMode === 'width' ? 'max-w-3xl' : 'max-w-xl'} mx-auto space-y-1`}>
            {pages.pages.map((page) => (
              <LazyImage
                key={page.index}
                src={page.url}
                fallbackUrls={page.fallbackUrls}
                alt={`Page ${page.index}`}
                className="w-full"
              />
            ))}
          </div>
        ) : (
          // Paged mode
          <div className="flex-1 flex flex-col items-center justify-center w-full px-4">
            <div
              className={`relative shadow-2xl ${
                fitMode === 'width' ? 'w-full max-w-2xl' : 'h-[80vh] w-auto'
              }`}
            >
              {pages.pages[currentPage - 1] && (
                <LazyImage
                  src={pages.pages[currentPage - 1].url}
                  fallbackUrls={pages.pages[currentPage - 1].fallbackUrls}
                  alt={`Page ${currentPage}`}
                  className={`block mx-auto ${
                    fitMode === 'height' ? 'h-[80vh] w-auto' : 'w-full'
                  }`}
                />
              )}
            </div>

            {/* Paged navigation */}
            <div className="flex items-center gap-6 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="btn-ghost border border-ink-700 text-ink-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Prev Page
              </button>
              <span className="text-sm font-mono text-ink-400">
                {currentPage} / {pages.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, pages.totalPages))}
                disabled={currentPage === pages.totalPages}
                className="btn-ghost border border-ink-700 text-ink-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next Page
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Chapter navigation bottom */}
      <div className="bg-ink-900 border-t border-ink-800 py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <button
            onClick={() => prevChapter && goToChapter(prevChapter)}
            disabled={!prevChapter}
            className="btn-ghost border border-ink-700 text-ink-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
          >
            <ArrowLeft size={14} />
            Previous Chapter
          </button>

          <Link
            to={mangaId ? `/manga/${mangaId}` : '/'}
            className="btn-ghost text-ink-400 text-sm"
          >
            Chapter List
          </Link>

          <button
            onClick={() => nextChapter && goToChapter(nextChapter)}
            disabled={!nextChapter}
            className="btn-ghost border border-ink-700 text-ink-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
          >
            Next Chapter
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
