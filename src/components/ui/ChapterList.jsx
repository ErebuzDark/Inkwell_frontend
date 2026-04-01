import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, BookOpen, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/appStore.js';

export default function ChapterList({ chapters = [], mangaId }) {
  const [expanded, setExpanded] = useState(false);
  const { readingHistory, isChapterRead } = useAppStore();
  const lastRead = readingHistory[mangaId];

  // Find last-read index to determine "new" chapters
  const lastReadIdx = lastRead ? chapters.findIndex((c) => c.id === lastRead) : -1;

  const visible = expanded ? chapters : chapters.slice(0, 15);

  return (
    <div>
      {chapters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-ink-200 dark:border-ink-800 rounded-xl bg-ink-50 dark:bg-ink-900/50">
          <BookOpen strokeWidth={1.5} className="w-10 h-10 text-ink-300 dark:text-ink-600 mb-3" />
          <h3 className="text-sm font-medium text-ink-700 dark:text-ink-300 font-display mb-1">
            No English Chapters
          </h3>
          <p className="text-xs text-ink-500 max-w-sm">
            MangaDex does not currently host English chapters for this title. This usually means the series has been officially licensed and removed.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-ink-100 dark:divide-ink-800 rounded-xl border border-ink-100 dark:border-ink-800 overflow-hidden">
          {visible.map((ch, i) => {
            const isLastRead = ch.id === lastRead;
            const isRead = isChapterRead(mangaId, ch.id);
            const isExternal = !!ch.externalUrl;
            // Chapters above lastReadIdx are newer (chapters list is desc order: newest first)
            const isNew = lastReadIdx > 0 && i < lastReadIdx && !isRead;

            const content = (
              <div className={`flex items-center justify-between px-4 py-3 transition-colors duration-100 cursor-pointer
                ${isLastRead
                  ? 'bg-accent/5 dark:bg-accent/10'
                  : isRead
                    ? 'bg-ink-50/50 dark:bg-ink-900/50'
                    : 'bg-white dark:bg-ink-900 hover:bg-ink-50 dark:hover:bg-ink-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isLastRead && (
                    <BookOpen size={13} className="text-accent shrink-0" />
                  )}
                  {isNew && !isLastRead && (
                    <Sparkles size={13} className="text-amber-500 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-display font-medium
                        ${isRead && !isLastRead
                          ? 'text-ink-400 dark:text-ink-500'
                          : 'text-ink-800 dark:text-ink-200'
                        }`}
                      >
                        {ch.title || `Chapter ${ch.number}`}
                      </span>
                      {isExternal && (
                        <span className="badge bg-ink-100 dark:bg-ink-800 text-ink-400 text-[9px] uppercase tracking-wider font-mono">
                          External
                        </span>
                      )}
                      {isNew && (
                        <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[9px] uppercase tracking-wider font-mono">
                          NEW
                        </span>
                      )}
                    </div>
                    {isLastRead && (
                      <span className="badge bg-accent/10 text-accent text-[10px]">
                        Last read
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-mono text-ink-400 shrink-0">{ch.date}</span>
              </div>
            );

            return isExternal ? (
              <a key={ch.id} href={ch.externalUrl} target="_blank" rel="noopener noreferrer" className="block">
                {content}
              </a>
            ) : (
              <Link key={ch.id} to={`/read/${ch.id}?manga=${mangaId}`} className="block">
                {content}
              </Link>
            );
          })}
        </div>
      )}

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
