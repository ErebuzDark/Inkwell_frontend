import { useState, useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { useAppStore } from '../../store/appStore.js';

export default function ExportImport() {
  const fileRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);

  const handleExport = () => {
    const state = useAppStore.getState();
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      bookmarks: state.bookmarks,
      bookmarkStatuses: state.bookmarkStatuses,
      readingHistory: state.readingHistory,
      chaptersRead: state.chaptersRead,
      collections: state.collections,
      stats: state.stats,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inkwell-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.version || !data.bookmarks) {
          setImportStatus('error');
          return;
        }

        const state = useAppStore.getState();

        // Merge bookmarks (don't duplicate)
        if (data.bookmarks) {
          const existingIds = new Set(state.bookmarks.map((b) => b.id));
          const newBookmarks = data.bookmarks.filter((b) => !existingIds.has(b.id));
          useAppStore.setState({
            bookmarks: [...state.bookmarks, ...newBookmarks],
            bookmarkStatuses: { ...state.bookmarkStatuses, ...data.bookmarkStatuses },
          });
        }

        // Merge reading history
        if (data.readingHistory) {
          useAppStore.setState({
            readingHistory: { ...state.readingHistory, ...data.readingHistory },
          });
        }

        // Merge chapters read
        if (data.chaptersRead) {
          const merged = { ...state.chaptersRead };
          Object.entries(data.chaptersRead).forEach(([mangaId, chapters]) => {
            const existing = merged[mangaId] || [];
            const combined = [...new Set([...existing, ...chapters])];
            merged[mangaId] = combined;
          });
          useAppStore.setState({ chaptersRead: merged });
        }

        // Merge collections
        if (data.collections) {
          useAppStore.setState({
            collections: { ...state.collections, ...data.collections },
          });
        }

        setImportStatus('success');
        setTimeout(() => setImportStatus(null), 3000);
      } catch {
        setImportStatus('error');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleExport}
        className="btn-ghost text-xs border border-ink-200 dark:border-ink-700"
        title="Export data"
      >
        <Download size={13} />
        Export
      </button>
      <button
        onClick={() => fileRef.current?.click()}
        className={`btn-ghost text-xs border transition-colors ${
          importStatus === 'success'
            ? 'border-emerald-400 text-emerald-500'
            : importStatus === 'error'
              ? 'border-red-400 text-red-500'
              : 'border-ink-200 dark:border-ink-700'
        }`}
        title="Import data"
      >
        <Upload size={13} />
        {importStatus === 'success' ? 'Imported!' : importStatus === 'error' ? 'Error' : 'Import'}
      </button>
      <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
    </div>
  );
}
