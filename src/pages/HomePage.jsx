import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useMangaList, useLatestUpdates, useTrending } from '../hooks/usemanga.js';
import { useAppStore, BOOKMARK_STATUSES } from '../store/appStore.js';
import MangaGrid from '../components/ui/MangaGrid.jsx';
import DataSourceBadge from '../components/ui/DataSourceBadge.jsx';
import { PageSpinner, ErrorState, SectionHeader } from '../components/ui/shared.jsx';
import LazyImage from '../components/ui/LazyImage.jsx';

export default function HomePage() {
  const { data: listData, isLoading: listLoading, error: listError } = useMangaList(1);
  const { data: latest, isLoading: latestLoading } = useLatestUpdates();
  const { data: trending, isLoading: trendingLoading } = useTrending();
  const { bookmarks, readingHistory, bookmarkStatuses, getChaptersReadCount } = useAppStore();

  // Build "Continue Reading" list from bookmarks that have a reading history entry
  const continueReading = bookmarks
    .filter((m) => readingHistory[m.id] && bookmarkStatuses[m.id] !== 'completed' && bookmarkStatuses[m.id] !== 'dropped')
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-14">
      {/* Hero */}
      <section className="text-center py-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ink-200 dark:border-ink-700 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-ink-500 dark:text-ink-400">
            Manga · Manhwa · Manhua
          </span>
        </div>
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-ink-950 dark:text-ink-50 tracking-tight">
          Your reading universe,<br />
          <span className="text-accent">all in one place.</span>
        </h1>
        <p className="text-ink-500 dark:text-ink-400 max-w-md mx-auto text-base font-body">
          Discover thousands of titles across manga, manhwa, and manhua. Clean reader, zero clutter.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/browse" className="btn-primary">
            Browse Library
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Continue Reading */}
      {continueReading.length > 0 && (
        <section>
          <SectionHeader
            title="Continue Reading"
            subtitle="Pick up where you left off"
            action={
              <Link to="/bookmarks" className="btn-ghost text-xs">
                All bookmarks <ArrowRight size={13} />
              </Link>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {continueReading.map((manga) => (
              <ContinueCard
                key={manga.id}
                manga={manga}
                lastChapterId={readingHistory[manga.id]}
                chaptersRead={getChaptersReadCount(manga.id)}
                status={bookmarkStatuses[manga.id]}
              />
            ))}
          </div>
        </section>
      )}

      {/* Latest Updates */}
      <section>
        <SectionHeader
          title="Latest Updates"
          subtitle="Recently updated chapters"
          action={
            <div className="flex items-center gap-2">
              <DataSourceBadge source={latest?.[0]?.source} />
              <Link to="/browse" className="btn-ghost text-xs">
                View all <ArrowRight size={13} />
              </Link>
            </div>
          }
        />
        {latestLoading ? (
          <PageSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(latest || []).slice(0, 8).map((manga) => (
              <LatestCard key={manga.id} manga={manga} />
            ))}
          </div>
        )}
      </section>

      {/* Trending Now */}
      <section>
        <SectionHeader
          title="Trending Now"
          subtitle="Popular this month"
          action={
            <Link to="/browse" className="btn-ghost text-xs">
              See more <ArrowRight size={13} />
            </Link>
          }
        />
        {trendingLoading ? (
          <PageSpinner />
        ) : (
          <MangaGrid titles={trending?.titles?.slice(0, 12) || []} />
        )}
      </section>

      {/* Popular */}
      <section>
        <SectionHeader
          title="Popular Titles"
          subtitle="Top-rated across all categories"
          action={
            <div className="flex items-center gap-2">
              <DataSourceBadge source={listData?.titles?.[0]?.source} />
              <Link to="/browse" className="btn-ghost text-xs">
                See more <ArrowRight size={13} />
              </Link>
            </div>
          }
        />
        {listLoading ? (
          <PageSpinner />
        ) : listError ? (
          <ErrorState message="Failed to load titles." />
        ) : (
          <MangaGrid titles={listData?.pages?.[0]?.titles || []} />
        )}
      </section>
    </div>
  );
}

function ContinueCard({ manga, lastChapterId, chaptersRead, status }) {
  const statusObj = BOOKMARK_STATUSES.find((s) => s.value === status);
  return (
    <Link
      to={`/read/${lastChapterId}?manga=${manga.id}`}
      className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800
        hover:border-accent/40 dark:hover:border-accent/30 transition-all duration-200 group shadow-sm hover:shadow-md"
    >
      <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0 bg-ink-100 dark:bg-ink-800 relative">
        <LazyImage
          src={manga.cover}
          alt={manga.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-display font-semibold text-sm text-ink-900 dark:text-ink-100 truncate group-hover:text-accent transition-colors">
          {manga.title}
        </p>
        {statusObj && (
          <span className={`text-[10px] font-mono font-medium ${statusObj.color}`}>
            {statusObj.label}
          </span>
        )}
        <div className="flex items-center gap-2">
          {chaptersRead > 0 && (
            <span className="text-[11px] font-mono text-ink-400">
              {chaptersRead} ch. read
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-accent text-xs font-medium">
          <BookOpen size={12} />
          Continue
        </div>
      </div>
    </Link>
  );
}

function LatestCard({ manga }) {
  return (
    <Link
      to={`/manga/${manga.id}`}
      className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800
        hover:border-ink-200 dark:hover:border-ink-700 transition-colors group"
    >
      <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-ink-100 dark:bg-ink-800 relative">
        <LazyImage
          src={manga.cover}
          alt={manga.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display font-semibold text-sm text-ink-900 dark:text-ink-100 truncate group-hover:text-accent transition-colors">
          {manga.title}
        </p>
        {manga.latestChapter && (
          <p className="text-xs font-mono text-ink-400 mt-0.5 truncate">
            Ch. {manga.latestChapter.number}
          </p>
        )}
        <p className="text-[11px] text-ink-300 dark:text-ink-600 mt-0.5 font-mono">
          {manga.latestChapter?.date}
        </p>
      </div>
    </Link>
  );
}