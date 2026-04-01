import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-ink-50 dark:bg-ink-950">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-ink-200 dark:border-ink-800 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-display font-semibold text-ink-900 dark:text-ink-100 text-sm">
            Inkwell
          </span>
          <div className="flex items-center gap-2">
            {/* gitgub icon */}
            <a href="https://github.com/ErebuzDark/mangareader">
              <img src="https://img.icons8.com/ios-filled/50/000000/github.png" alt="GitHub" width={20} height={20} className="dark:invert" />
            </a>
            <p className="text-xs text-ink-400 dark:text-ink-600 font-mono">
              ErebuzDark — All rights to respective creators.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
