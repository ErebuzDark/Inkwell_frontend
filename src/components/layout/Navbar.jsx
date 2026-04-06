import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Moon, Sun, BookOpen, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore.js';

export default function Navbar() {
  const { theme, toggleTheme, addSearchHistory } = useAppStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      addSearchHistory(query.trim());
      navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/browse', label: 'Browse' },
    { to: '/bookmarks', label: 'Bookmarks' },
    { to: '/browse?type=anime', label: 'Anime' },
    { to: '/collections', label: 'Collections' },
    { to: '/stats', label: 'Stats' },
    { to: '/achievements', label: 'Achievements' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-ink-50/90 dark:bg-ink-950/90 backdrop-blur-md border-b border-ink-200 dark:border-ink-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0 group"
        >
          <BookOpen
            size={20}
            className="text-accent group-hover:scale-110 transition-transform duration-150"
          />
          <span className="font-display font-semibold text-lg tracking-tight text-ink-900 dark:text-ink-100">
            Inkwell
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              id={to === '/browse' ? 'tour-nav-browse' : undefined}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium font-display transition-colors duration-150
                ${
                  isActive
                    ? 'text-ink-900 dark:text-ink-100 bg-ink-100 dark:bg-ink-800'
                    : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-ink-100 dark:hover:bg-ink-800'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Search bar (desktop inline) */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles..."
                className="input-base w-52"
              />
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSearchOpen(false);
                }}
                className="btn-ghost p-2"
              >
                <X size={16} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="btn-ghost p-2 hidden md:flex"
              aria-label="Search"
              id="tour-nav-search"
            >
              <Search size={16} />
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="btn-ghost p-2"
            aria-label="Toggle theme"
            id="tour-nav-theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
