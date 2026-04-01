import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, FolderOpen, X } from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import { EmptyState } from '../components/ui/shared.jsx';
import LazyImage from '../components/ui/LazyImage.jsx';
import ExportImport from '../components/ui/ExportImport.jsx';

export default function CollectionsPage() {
  const { collections, createCollection, deleteCollection, removeFromCollection } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const collectionList = Object.values(collections).sort((a, b) => b.createdAt - a.createdAt);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name || collections[name]) return;
    createCollection(name);
    setNewName('');
    setShowCreate(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 space-y-3">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink-900 dark:text-ink-100 mb-1">
            Collections
          </h1>
          <p className="text-sm text-ink-400 dark:text-ink-500">
            {collectionList.length} collection{collectionList.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ExportImport />
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="btn-primary text-sm"
          >
            <Plus size={15} />
            New Collection
          </button>
        </div>
      </div>

      {/* Create dialog */}
      {showCreate && (
        <div className="mb-6 p-4 rounded-xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 animate-fade-in">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Collection name..."
              className="input-base flex-1"
              autoFocus
            />
            <button onClick={handleCreate} className="btn-primary text-sm" disabled={!newName.trim()}>
              Create
            </button>
            <button onClick={() => setShowCreate(false)} className="btn-ghost text-sm">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {collectionList.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No collections yet"
          description="Create a collection to organize your manga into custom lists."
        />
      ) : (
        <div className="space-y-6">
          {collectionList.map((col) => (
            <div key={col.name} className="rounded-xl border border-ink-100 dark:border-ink-800 overflow-hidden">
              {/* Collection header */}
              <div className="flex items-center justify-between px-4 py-3 bg-ink-50 dark:bg-ink-900">
                <div>
                  <h2 className="font-display font-semibold text-ink-900 dark:text-ink-100">
                    {col.name}
                  </h2>
                  <p className="text-xs font-mono text-ink-400">
                    {col.manga.length} title{col.manga.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => deleteCollection(col.name)}
                  className="p-2 text-ink-400 hover:text-red-500 transition-colors"
                  title="Delete collection"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Manga in collection */}
              {col.manga.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-ink-400">
                  No titles yet. Add manga from detail pages.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 p-3">
                  {col.manga.map((manga) => (
                    <div key={manga.id} className="group relative">
                      <Link to={`/manga/${manga.id}`} className="block">
                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-ink-100 dark:bg-ink-800">
                          <LazyImage
                            src={manga.cover}
                            alt={manga.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <p className="text-xs font-display font-medium text-ink-700 dark:text-ink-300 mt-1 line-clamp-2 group-hover:text-accent transition-colors">
                          {manga.title}
                        </p>
                      </Link>
                      <button
                        onClick={() => removeFromCollection(col.name, manga.id)}
                        className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
