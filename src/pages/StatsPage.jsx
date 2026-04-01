import { useAppStore } from '../store/appStore.js';
import {
  BookOpen, BarChart3, Calendar, TrendingUp,
  Award, Clock,
} from 'lucide-react';
import { EmptyState } from '../components/ui/shared.jsx';

export default function StatsPage() {
  const { stats, bookmarks, chaptersRead, readingHistory } = useAppStore();

  const totalMangaStarted = Object.keys(readingHistory).length;
  const totalChaptersRead = stats.totalChaptersRead || 0;
  const uniqueMangaRead = Object.keys(chaptersRead).length;

  // Reading streak calculation
  const readDates = (stats.readDates || []).map((ts) => new Date(ts).toDateString());
  const uniqueDates = [...new Set(readDates)];
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  let streak = 0;
  let checkDate = new Date();
  // Count backwards from today
  while (true) {
    const dateStr = checkDate.toDateString();
    if (uniqueDates.includes(dateStr)) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    } else if (streak === 0 && dateStr === today) {
      // Today hasn't been read yet, skip
      checkDate = new Date(checkDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  // Top genres
  const genreBreakdown = stats.genreBreakdown || {};
  const sortedGenres = Object.entries(genreBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);
  const maxGenreCount = sortedGenres[0]?.[1] || 1;

  // Reading activity (last 30 days)
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    const count = readDates.filter((d) => d === dateStr).length;
    last30Days.push({ date: dateStr, count, day: date.getDate() });
  }
  const maxDayCount = Math.max(...last30Days.map((d) => d.count), 1);

  if (totalChaptersRead === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-ink-900 dark:text-ink-100 mb-1">
            Reading Stats
          </h1>
          <p className="text-sm text-ink-400 dark:text-ink-500">
            Track your reading progress
          </p>
        </div>
        <EmptyState
          icon={BarChart3}
          title="No stats yet"
          description="Start reading some chapters to see your stats here!"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-ink-900 dark:text-ink-100 mb-1">
          Reading Stats
        </h1>
        <p className="text-sm text-ink-400 dark:text-ink-500">
          Your reading journey at a glance
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={BookOpen} label="Chapters Read" value={totalChaptersRead} color="text-accent" />
        <StatCard icon={TrendingUp} label="Manga Started" value={totalMangaStarted} color="text-emerald-500" />
        <StatCard icon={Award} label="Titles Tracked" value={uniqueMangaRead} color="text-violet-500" />
        <StatCard icon={Clock} label="Day Streak" value={streak} color="text-amber-500" />
      </div>

      {/* Reading activity heatmap */}
      <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-5">
        <h2 className="font-display font-semibold text-ink-900 dark:text-ink-100 mb-4">
          Reading Activity
        </h2>
        <div className="flex items-end gap-1 h-24">
          {last30Days.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-sm transition-all duration-200"
                style={{
                  height: `${Math.max((d.count / maxDayCount) * 100, d.count > 0 ? 10 : 3)}%`,
                  backgroundColor: d.count > 0
                    ? `hsl(var(--accent-hue, 259) 70% ${60 - (d.count / maxDayCount) * 25}%)`
                    : 'var(--color-ink-100, #e5e5ea)',
                }}
                title={`${d.date}: ${d.count} chapter${d.count !== 1 ? 's' : ''}`}
              />
              {i % 5 === 0 && (
                <span className="text-[8px] font-mono text-ink-400">{d.day}</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] font-mono text-ink-400">30 days ago</span>
          <span className="text-[10px] font-mono text-ink-400">Today</span>
        </div>
      </div>

      {/* Top genres */}
      {sortedGenres.length > 0 && (
        <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-5">
          <h2 className="font-display font-semibold text-ink-900 dark:text-ink-100 mb-4">
            Top Genres
          </h2>
          <div className="space-y-2.5">
            {sortedGenres.map(([genre, count]) => (
              <div key={genre} className="flex items-center gap-3">
                <span className="text-xs font-mono text-ink-500 dark:text-ink-400 w-24 shrink-0 truncate">
                  {genre}
                </span>
                <div className="flex-1 h-4 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent/80 to-accent rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxGenreCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-ink-400 w-8 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Library stats */}
      <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-5">
        <h2 className="font-display font-semibold text-ink-900 dark:text-ink-100 mb-3">
          Library
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-ink-400 font-mono text-xs">Bookmarks</span>
            <p className="font-display font-semibold text-ink-900 dark:text-ink-100 text-lg">{bookmarks.length}</p>
          </div>
          <div>
            <span className="text-ink-400 font-mono text-xs">Days Active</span>
            <p className="font-display font-semibold text-ink-900 dark:text-ink-100 text-lg">{uniqueDates.length}</p>
          </div>
          <div>
            <span className="text-ink-400 font-mono text-xs">Avg. Ch/Day</span>
            <p className="font-display font-semibold text-ink-900 dark:text-ink-100 text-lg">
              {uniqueDates.length > 0 ? (totalChaptersRead / uniqueDates.length).toFixed(1) : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-4 text-center">
      <Icon size={20} className={`${color} mx-auto mb-2`} />
      <p className="font-display font-bold text-2xl text-ink-900 dark:text-ink-100">{value}</p>
      <p className="text-[11px] font-mono text-ink-400 mt-0.5">{label}</p>
    </div>
  );
}
