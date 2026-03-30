import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useAppStore } from '../../store/appStore.js';

export default function ChapterList({ chapters = [], mangaId }) {
  const [expanded, setExpanded] = useState(false);
  const { readingHistory } = useAppStore();
  const lastRead = readingHistory[mangaId];

  const visible = expanded ? chapters : chapters.slice(0, 15);

  return (
    <div>
      <div className="divide-y divide-ink-100 dark:divide-ink-800 rounded-xl border border-ink-100 dark:border-ink-800 overflow-hidden">
        {visible.map((ch) => {
          const isLastRead = ch.id === lastRead;
          return (
            <Link
              key={ch.id}
              to={`/read/${ch.id}?manga=${mangaId}`}
              className={`flex items-center justify-between px-4 py-3 transition-colors duration-100
                ${isLastRead
                  ? 'bg-accent/5 dark:bg-accent/10'
                  : 'bg-white dark:bg-ink-900 hover:bg-ink-50 dark:hover:bg-ink-800'
                }`}
            >
              <div className="flex items-center gap-3">
                {isLastRead && (
                  <BookOpen size={13} className="text-accent shrink-0" />
                )}
                <div>
                  <span className="text-sm font-display font-medium text-ink-800 dark:text-ink-200">
                    {ch.title || `Chapter ${ch.number}`}
                  </span>
                  {isLastRead && (
                    <span className="ml-2 badge bg-accent/10 text-accent text-[10px]">
                      Last read
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs font-mono text-ink-400 shrink-0">{ch.date}</span>
            </Link>
          );
        })}
      </div>

      {chapters.length > 15 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-sm text-ink-500 dark:text-ink-400
            hover:text-ink-900 dark:hover:text-ink-100 font-medium font-display transition-colors"
        >
          {expanded ? (
            <>Show less <ChevronUp size={14} /></>
          ) : (
            <>Show all {chapters.length} chapters <ChevronDown size={14} /></>
          )}
        </button>
      )}
    </div>
  );
}
