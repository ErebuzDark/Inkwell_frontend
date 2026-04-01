import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  LayoutList, Moon, Sun, Settings, BookOpen,
  Columns2, FlipHorizontal2, Play, Pause, ZoomIn,
} from 'lucide-react';
import { useChapterPages, useMangaDetail } from '../hooks/usemanga.js';
import { useAppStore } from '../store/appStore.js';
import { PageSpinner, ErrorState } from '../components/ui/shared.jsx';
import LazyImage from '../components/ui/LazyImage.jsx';
import ZoomableImage from '../components/ui/ZoomableImage.jsx';
import { useAchievementStore } from '../store/achievementStore.js';

const READER_THEMES = [
  { value: 'dark', label: 'Dark', bg: 'bg-ink-950', text: 'text-ink-100' },
  { value: 'light', label: 'Light', bg: 'bg-white', text: 'text-ink-900' },
  { value: 'sepia', label: 'Sepia', bg: 'bg-[#f4ecd8]', text: 'text-[#5b4636]' },
  { value: 'amoled', label: 'AMOLED', bg: 'bg-black', text: 'text-ink-100' },
];

export default function ReaderPage() {
  const { chapterId } = useParams();
  const [searchParams] = useSearchParams();
  const mangaId = searchParams.get('manga');
  const navigate = useNavigate();

  const { data: pages, isLoading, error } = useChapterPages(chapterId);
  const { data: manga } = useMangaDetail(mangaId);
  const {
    theme, toggleTheme, setLastRead, markChapterRead, trackChapterRead,
    readerSettings, setReaderSettings,
  } = useAppStore();
  const incrementStat = useAchievementStore((s) => s.incrementStat);

  const [readerMode, setReaderMode] = useState(readerSettings.mode || 'scroll');
  const [currentPage, setCurrentPage] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fitMode, setFitMode] = useState(readerSettings.fitMode || 'width');
  const [rtl, setRtl] = useState(readerSettings.rtl || false);
  const [readerTheme, setReaderTheme] = useState(readerSettings.readerTheme || 'dark');
  const [autoScroll, setAutoScroll] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(readerSettings.autoScrollSpeed || 2);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const scrollRef = useRef(null);
  const touchStart = useRef(null);

  const themeObj = READER_THEMES.find((t) => t.value === readerTheme) || READER_THEMES[0];

  // Persist reader settings
  useEffect(() => {
    setReaderSettings({ mode: readerMode, fitMode, rtl, readerTheme, autoScrollSpeed });
  }, [readerMode, fitMode, rtl, readerTheme, autoScrollSpeed, setReaderSettings]);

  // Save reading progress & mark chapter as read
  useEffect(() => {
    if (mangaId && chapterId) {
      setLastRead(mangaId, chapterId);
      markChapterRead(mangaId, chapterId);
      trackChapterRead(manga?.genres || []);
      
      // Update achievements
      incrementStat('chaptersRead', 1);
      
      if (manga?.chapters && manga?.chapters.length > 0) {
        const isLatest = manga.chapters[0].id === chapterId;
        if (isLatest) {
          incrementStat('mangasFinished', 1);
        }
      }
    }
  }, [mangaId, chapterId, setLastRead, markChapterRead, trackChapterRead, manga?.genres, incrementStat, manga?.chapters]);

  // Auto-scroll effect
  useEffect(() => {
    if (!autoScroll || readerMode !== 'scroll') return;
    const interval = setInterval(() => {
      window.scrollBy(0, autoScrollSpeed);
    }, 16); // ~60fps
    return () => clearInterval(interval);
  }, [autoScroll, autoScrollSpeed, readerMode]);

  // Auto-scroll interrupt (stop if user scrolls up or presses up keys)
  useEffect(() => {
    if (!autoScroll) return;
    const handleInterrupt = (e) => {
      if (e.type === 'wheel' && e.deltaY < 0) {
        setAutoScroll(false);
      }
      if (e.type === 'keydown' && ['ArrowUp', 'PageUp'].includes(e.key)) {
        setAutoScroll(false);
      }
    };
    window.addEventListener('wheel', handleInterrupt, { passive: true });
    window.addEventListener('keydown', handleInterrupt);
    return () => {
      window.removeEventListener('wheel', handleInterrupt);
      window.removeEventListener('keydown', handleInterrupt);
    };
  }, [autoScroll]);

  // Auto-page for paged/double mode
  useEffect(() => {
    if (!autoScroll || readerMode === 'scroll' || !pages) return;
    const interval = setInterval(() => {
      setCurrentPage((p) => {
        const max = readerMode === 'double' ? Math.ceil(pages.totalPages / 2) : pages.totalPages;
        return p < max ? p + 1 : p;
      });
    }, Math.max(1000, 6000 - autoScrollSpeed * 500));
    return () => clearInterval(interval);
  }, [autoScroll, autoScrollSpeed, readerMode, pages]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!pages) return;
    const isPagedOrDouble = readerMode === 'paged' || readerMode === 'double';
    if (!isPagedOrDouble) return;

    const prevKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    const nextKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    const maxPage = readerMode === 'double' ? Math.ceil(pages.totalPages / 2) : pages.totalPages;

    if (e.key === nextKey || e.key === 'ArrowDown') {
      setCurrentPage((p) => Math.min(p + 1, maxPage));
    } else if (e.key === prevKey || e.key === 'ArrowUp') {
      setCurrentPage((p) => Math.max(p - 1, 1));
    }
  }, [readerMode, pages, rtl]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Swipe gestures
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
  };

  const handleTouchEnd = (e) => {
    if (!touchStart.current || !pages) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.time;

    // Only process horizontal swipes that are fast enough and wide enough
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && dt < 500) {
      const isPagedOrDouble = readerMode === 'paged' || readerMode === 'double';
      if (!isPagedOrDouble) return;

      const maxPage = readerMode === 'double' ? Math.ceil(pages.totalPages / 2) : pages.totalPages;
      const isNext = rtl ? dx > 0 : dx < 0;

      if (isNext) {
        setCurrentPage((p) => Math.min(p + 1, maxPage));
      } else {
        setCurrentPage((p) => Math.max(p - 1, 1));
      }
    }
    touchStart.current = null;
  };

  // Get adjacent chapters
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
    <div className={`min-h-screen ${themeObj.bg} flex items-center justify-center`}>
      <PageSpinner />
    </div>
  );

  if (error || !pages) return (
    <div className={`min-h-screen ${themeObj.bg} flex items-center justify-center`}>
      <ErrorState message="Failed to load chapter." />
    </div>
  );

  // Page rendering helpers
  const getDoublePages = () => {
    const pairs = [];
    const arr = rtl ? [...pages.pages].reverse() : pages.pages;
    for (let i = 0; i < arr.length; i += 2) {
      pairs.push(arr.slice(i, i + 2));
    }
    return pairs;
  };

  const renderPageImage = (page) => {
    if (zoomEnabled) {
      return (
        <ZoomableImage
          key={page.index}
          src={page.url}
          fallbackUrls={page.fallbackUrls}
          alt={`Page ${page.index}`}
          className="relative"
        />
      );
    }
    return (
      <LazyImage
        key={page.index}
        src={page.url}
        fallbackUrls={page.fallbackUrls}
        alt={`Page ${page.index}`}
        className="w-full"
      />
    );
  };

  const maxPage = readerMode === 'double'
    ? Math.ceil(pages.totalPages / 2)
    : pages.totalPages;

  return (
    <div
      className={`min-h-screen ${themeObj.bg} flex flex-col`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        if (autoScroll) setAutoScroll(false);
      }}
    >
      {/* Auto-Scroll Floating Stop Button */}
      {autoScroll && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] animate-slide-up">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAutoScroll(false);
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-white shadow-xl hover:bg-accent-hover hover:scale-105 active:scale-95 transition-all font-display font-medium backdrop-blur-md"
          >
            <Pause fill="currentColor" size={16} />
            Stop Reading
          </button>
        </div>
      )}

      {/* Reader Toolbar */}
      <header className={`sticky top-0 z-50 ${readerTheme === 'amoled' ? 'bg-black/95' : 'bg-ink-950/95'} backdrop-blur-md border-b border-ink-800`}>
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
          <div className="flex items-center gap-0.5 shrink-0">
            {(readerMode === 'paged' || readerMode === 'double') && pages && (
              <span className="text-xs font-mono text-ink-500 px-1.5">
                {currentPage} / {maxPage}
              </span>
            )}

            {/* Mode buttons */}
            <ToolbarBtn
              onClick={() => { setReaderMode('scroll'); setCurrentPage(1); }}
              active={readerMode === 'scroll'}
              title="Scroll mode"
            >
              <LayoutList size={15} />
            </ToolbarBtn>

            <ToolbarBtn
              onClick={() => { setReaderMode('paged'); setCurrentPage(1); }}
              active={readerMode === 'paged'}
              title="Paged mode"
            >
              <BookOpen size={15} />
            </ToolbarBtn>

            <ToolbarBtn
              onClick={() => { setReaderMode('double'); setCurrentPage(1); }}
              active={readerMode === 'double'}
              title="Double page"
            >
              <Columns2 size={15} />
            </ToolbarBtn>

            <div className="w-px h-4 bg-ink-800 mx-0.5" />

            <ToolbarBtn onClick={() => setRtl(!rtl)} active={rtl} title="RTL reading">
              <FlipHorizontal2 size={15} />
            </ToolbarBtn>

            <ToolbarBtn onClick={() => setZoomEnabled(!zoomEnabled)} active={zoomEnabled} title="Zoom mode">
              <ZoomIn size={15} />
            </ToolbarBtn>

            <ToolbarBtn
              onClick={() => setAutoScroll(!autoScroll)}
              active={autoScroll}
              title={autoScroll ? 'Stop auto-scroll' : 'Start auto-scroll'}
            >
              {autoScroll ? <Pause size={15} /> : <Play size={15} />}
            </ToolbarBtn>

            <ToolbarBtn onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </ToolbarBtn>

            <ToolbarBtn onClick={() => setSettingsOpen(!settingsOpen)} active={settingsOpen} title="Settings">
              <Settings size={15} />
            </ToolbarBtn>
          </div>
        </div>

        {/* Settings panel */}
        {settingsOpen && (
          <div className="border-t border-ink-800 bg-ink-900 px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center gap-6 flex-wrap">
              {/* Fit mode */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-ink-400">Fit:</span>
                {['width', 'height'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setFitMode(m)}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors
                      ${fitMode === m ? 'bg-accent text-white' : 'text-ink-400 hover:text-ink-200'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Reader theme */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-ink-400">Background:</span>
                {READER_THEMES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setReaderTheme(t.value)}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors
                      ${readerTheme === t.value ? 'bg-accent text-white' : 'text-ink-400 hover:text-ink-200'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Auto-scroll speed */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-ink-400">Speed:</span>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={autoScrollSpeed}
                  onChange={(e) => setAutoScrollSpeed(parseInt(e.target.value))}
                  className="w-20 accent-accent"
                />
                <span className="text-xs font-mono text-ink-500">{autoScrollSpeed}x</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Chapter navigation top */}
      <div className={`${readerTheme === 'amoled' ? 'bg-black' : 'bg-ink-900'} border-b border-ink-800`}>
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
      <main className={`flex-1 flex flex-col items-center py-4 text-center ${themeObj.bg}`} ref={scrollRef}>
        {readerMode === 'scroll' ? (
          /* Scroll mode */
          <div className={`w-full ${fitMode === 'width' ? 'max-w-3xl' : 'max-w-xl'} mx-auto space-y-1`}>
            {(rtl ? [...pages.pages].reverse() : pages.pages).map((page) => renderPageImage(page))}
          </div>
        ) : readerMode === 'double' ? (
          /* Double page spread */
          <div className="flex-1 flex flex-col items-center justify-center w-full px-4">
            {(() => {
              const pairs = getDoublePages();
              const pair = pairs[currentPage - 1];
              if (!pair) return null;
              return (
                <div className={`flex gap-1 ${fitMode === 'width' ? 'w-full max-w-5xl' : 'h-[80vh]'} ${rtl ? 'flex-row-reverse' : ''}`}>
                  {pair.map((page) => (
                    <div key={page.index} className={`flex-1 ${fitMode === 'height' ? 'h-[80vh]' : ''}`}>
                      {zoomEnabled ? (
                        <ZoomableImage src={page.url} fallbackUrls={page.fallbackUrls} alt={`Page ${page.index}`} className="relative" />
                      ) : (
                        <LazyImage src={page.url} fallbackUrls={page.fallbackUrls} alt={`Page ${page.index}`}
                          className={`block mx-auto ${fitMode === 'height' ? 'h-[80vh] w-auto' : 'w-full'}`} />
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Paged navigation */}
            <PageNav
              currentPage={currentPage}
              maxPage={Math.ceil(pages.totalPages / 2)}
              setCurrentPage={setCurrentPage}
              rtl={rtl}
            />
          </div>
        ) : (
          /* Paged mode */
          <div className="flex-1 flex flex-col items-center justify-center w-full px-4">
            <div className={`relative shadow-2xl ${fitMode === 'width' ? 'w-full max-w-2xl' : 'h-[80vh] w-auto'}`}>
              {pages.pages[currentPage - 1] && (
                zoomEnabled ? (
                  <ZoomableImage
                    src={pages.pages[currentPage - 1].url}
                    fallbackUrls={pages.pages[currentPage - 1].fallbackUrls}
                    alt={`Page ${currentPage}`}
                    className="relative"
                  />
                ) : (
                  <LazyImage
                    src={pages.pages[currentPage - 1].url}
                    fallbackUrls={pages.pages[currentPage - 1].fallbackUrls}
                    alt={`Page ${currentPage}`}
                    className={`block mx-auto ${fitMode === 'height' ? 'h-[80vh] w-auto' : 'w-full'}`}
                  />
                )
              )}
            </div>

            <PageNav
              currentPage={currentPage}
              maxPage={pages.totalPages}
              setCurrentPage={setCurrentPage}
              rtl={rtl}
            />
          </div>
        )}
      </main>

      {/* Chapter navigation bottom */}
      <div className={`${readerTheme === 'amoled' ? 'bg-black' : 'bg-ink-900'} border-t border-ink-800 py-4`}>
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

function ToolbarBtn({ children, onClick, active, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 transition-colors rounded ${active ? 'text-accent bg-accent/10' : 'text-ink-400 hover:text-ink-100'}`}
    >
      {children}
    </button>
  );
}

function PageNav({ currentPage, maxPage, setCurrentPage, rtl }) {
  const prevLabel = rtl ? 'Next Page' : 'Prev Page';
  const nextLabel = rtl ? 'Prev Page' : 'Next Page';
  const PrevIcon = rtl ? ChevronRight : ChevronLeft;
  const NextIcon = rtl ? ChevronLeft : ChevronRight;

  return (
    <div className="flex items-center gap-6 mt-6">
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="btn-ghost border border-ink-700 text-ink-300 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <PrevIcon size={16} />
        {prevLabel}
      </button>
      <span className="text-sm font-mono text-ink-400">
        {currentPage} / {maxPage}
      </span>
      <button
        onClick={() => setCurrentPage((p) => Math.min(p + 1, maxPage))}
        disabled={currentPage === maxPage}
        className="btn-ghost border border-ink-700 text-ink-300 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {nextLabel}
        <NextIcon size={16} />
      </button>
    </div>
  );
}
