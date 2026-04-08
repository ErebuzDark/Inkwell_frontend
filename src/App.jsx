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
import AchievementsPage from './pages/AchievementsPage.jsx';
import AnimeDetailPage from './pages/AnimeDetailPage.jsx';
import AnimeWatchPage from './pages/AnimeWatchPage.jsx';
import GuidedTour from './components/ui/GuidedTour.jsx';
import ScrollToTop from './components/ui/ScrollToTop.jsx';
import AchievementToast from './components/ui/AchievementToast.jsx';
import { useAchievementStore } from './store/achievementStore.js';

export default function App() {
  const initTheme = useAppStore((s) => s.initTheme);
  const recordActivity = useAchievementStore((s) => s.recordActivity);

  useEffect(() => {
    initTheme();
    recordActivity();
  }, [initTheme, recordActivity]);

  return (
    <>
      <ScrollToTop />
      <AchievementToast />
      {/* <GuidedTour /> */}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/manga/:id" element={<MangaDetailPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/anime/:id" element={<AnimeDetailPage />} />
          <Route path="/anime/watch/:episodeId" element={<AnimeWatchPage />} />
        </Route>
        <Route path="/read/:chapterId" element={<ReaderPage />} />
      </Routes>
    </>
  );
}
