import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppStore } from './store/appStore.js';
import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import MangaDetailPage from './pages/MangaDetailPage.jsx';
import ReaderPage from './pages/ReaderPage.jsx';
import BookmarksPage from './pages/BookmarksPage.jsx';
import CollectionsPage from './pages/CollectionsPage.jsx';
import StatsPage from './pages/StatsPage.jsx';

export default function App() {
  const initTheme = useAppStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/manga/:id" element={<MangaDetailPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Route>
      <Route path="/read/:chapterId" element={<ReaderPage />} />
    </Routes>
  );
}
