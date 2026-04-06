import { NavLink } from 'react-router-dom';
import { IoHomeOutline, IoCompassOutline, IoBookmarkOutline, IoLibraryOutline, IoStatsChartOutline, IoPlayCircleOutline } from 'react-icons/io5';

export default function BottomTabBar() {
  const navTabs = [
    { to: '/', label: 'Home', icon: IoHomeOutline },
    { to: '/browse?type=anime', label: 'Watch', icon: IoPlayCircleOutline },
    { to: '/bookmarks', label: 'Bookmarks', icon: IoBookmarkOutline },
    { to: '/collections', label: 'Library', icon: IoLibraryOutline },
    { to: '/stats', label: 'Stats', icon: IoStatsChartOutline },
  ];

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 flex justify-around items-center h-[68px] md:hidden
                    bg-white/80 dark:bg-ink-900/80 backdrop-blur-xl border border-white/20 dark:border-ink-800/50 
                    rounded-3xl shadow-xl shadow-ink-900/5 dark:shadow-black/20 px-2 transition-all duration-300">
      {navTabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200
            ${isActive
              ? 'text-accent scale-110 drop-shadow-sm'
              : 'text-ink-400 dark:text-ink-500 hover:text-ink-600 dark:hover:text-ink-300'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={24} strokeWidth={isActive ? 2 : 1} />
              <span className={`text-[10px] mt-1 font-display transition-all ${isActive ? 'font-bold' : 'font-medium'}`}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
