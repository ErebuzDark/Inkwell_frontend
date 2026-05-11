import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, FolderOpen, X } from 'lucide-react';
import { Input, Button, Card, Empty, Space, Modal } from 'antd';
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

  const confirmDelete = (name) => {
    Modal.confirm({
      title: 'Delete Collection',
      content: `Are you sure you want to delete "${name}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteCollection(name),
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-1">
          <h1 className="font-display font-black text-4xl text-ink-900 dark:text-ink-50">
            Collections
          </h1>
          <p className="text-ink-400 dark:text-ink-500 font-medium">
            Organize your library into {collectionList.length} custom list{collectionList.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportImport />
          <Button
            type="primary"
            size="large"
            icon={<Plus size={18} />}
            onClick={() => setShowCreate(true)}
            className="bg-accent hover:bg-accent-hover border-none rounded-xl h-12 px-6 font-bold"
          >
            New Collection
          </Button>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        title="Create New Collection"
        open={showCreate}
        onOk={handleCreate}
        onCancel={() => setShowCreate(false)}
        okButtonProps={{ disabled: !newName.trim(), className: 'bg-accent' }}
        okText="Create"
      >
        <Input
          placeholder="e.g. Must Read, Favorites, Backlog..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onPressEnter={handleCreate}
          autoFocus
          className="mt-2 py-2"
        />
      </Modal>

      {collectionList.length === 0 ? (
        <div className="py-20 bg-ink-50 dark:bg-ink-900/30 rounded-3xl border-2 border-dashed border-ink-200 dark:border-ink-800">
           <EmptyState
            icon={FolderOpen}
            title="Your library is empty"
            description="Create a collection to start organizing your favorites."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          {collectionList.map((col) => (
            <div key={col.name} className="space-y-4">
              <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center">
                    <FolderOpen size={20} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-ink-900 dark:text-ink-100">
                      {col.name}
                    </h2>
                    <p className="text-xs font-bold text-ink-400 uppercase tracking-widest">
                      {col.manga.length} TITLE{col.manga.length !== 1 ? 'S' : ''}
                    </p>
                  </div>
                </div>
                <Button
                  type="text"
                  danger
                  icon={<Trash2 size={16} />}
                  onClick={() => confirmDelete(col.name)}
                  className="hover:bg-red-50 dark:hover:bg-red-950/30"
                />
              </div>

              {col.manga.length === 0 ? (
                <div className="py-10 text-center text-sm text-ink-400 italic">
                  No titles in this collection yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {col.manga.map((manga) => (
                    <div key={manga.id} className="group relative">
                      <Link to={`/manga/${manga.id}`} className="block">
                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-800 shadow-sm group-hover:shadow-xl transition-all duration-300">
                          <LazyImage
                            src={manga.cover}
                            alt={manga.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <p className="text-[13px] font-bold text-ink-700 dark:text-ink-200 mt-2 line-clamp-2 leading-tight group-hover:text-accent transition-colors">
                          {manga.title}
                        </p>
                      </Link>
                      <button
                        onClick={() => removeFromCollection(col.name, manga.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                      >
                        <X size={12} />
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
