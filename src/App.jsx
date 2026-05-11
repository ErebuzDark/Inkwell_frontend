import { useEffect, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
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
  const theme = useAppStore((s) => s.theme);
  const initTheme = useAppStore((s) => s.initTheme);
  const recordActivity = useAchievementStore((s) => s.recordActivity);

  useEffect(() => {
    initTheme();
    recordActivity();
  }, [initTheme, recordActivity]);

  const isDark = theme === 'dark';

  const antdThemeConfig = useMemo(() => ({
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#e8533a',
      borderRadius: 12,
      fontFamily: '"DM Sans", sans-serif',
      colorBgContainer: isDark ? '#1a1a22' : '#ffffff',
      colorBgElevated: isDark ? '#25252e' : '#ffffff',
      colorBorder: isDark ? '#3d3d4a' : '#d9d9de',
      colorText: isDark ? '#eeeef0' : '#35353f',
      colorTextPlaceholder: isDark ? '#717185' : '#9090a0',
    },
    components: {
      Select: {
        controlHeight: 40,
        optionSelectedBg: isDark ? '#3d3d4a' : '#f7f7f8',
      },
      Input: {
        controlHeight: 40,
      },
      Button: {
        controlHeight: 40,
      }
    }
  }), [isDark]);

  return (
    <ConfigProvider theme={antdThemeConfig}>
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
    </ConfigProvider>
  );
}
