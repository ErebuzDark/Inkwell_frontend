import { AlertCircle, SearchX, BookMarked } from 'lucide-react';

export function Spinner({ size = 'md' }) {
  const sz = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6';
  return (
    <div className={`${sz} border-2 border-ink-200 dark:border-ink-700 border-t-accent rounded-full animate-spin`} />
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Spinner size="lg" />
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 min-h-[30vh] text-center px-4">
      <AlertCircle className="text-accent" size={32} />
      <p className="text-sm text-ink-500 dark:text-ink-400 font-body max-w-xs">{message}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon = SearchX, title = 'Nothing found', description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 min-h-[30vh] text-center px-4">
      <Icon className="text-ink-300 dark:text-ink-600" size={36} />
      <div>
        <p className="font-display font-medium text-ink-700 dark:text-ink-300">{title}</p>
        {description && (
          <p className="text-sm text-ink-400 dark:text-ink-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="font-display font-semibold text-xl text-ink-900 dark:text-ink-100">{title}</h2>
        {subtitle && <p className="text-sm text-ink-400 dark:text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-2 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-1.5 rounded-md text-sm font-medium hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">1</button>
          {start > 2 && <span className="px-2 text-ink-300">...</span>}
        </>
      )}

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            p === currentPage
              ? 'bg-accent text-white shadow-md shadow-accent/20'
              : 'text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800'
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-ink-300">...</span>}
          <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 rounded-md text-sm font-medium hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">{totalPages}</button>
        </>
      )}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
