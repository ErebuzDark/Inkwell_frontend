import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Moon, Sun, BookOpen, Search as SearchIcon } from 'lucide-react';
import { Input, Button } from 'antd';
import { useAppStore } from '../../store/appStore.js';

export default function Navbar() {
  const { theme, toggleTheme, addSearchHistory } = useAppStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (value) => {
    const q = value || query;
    if (q.trim()) {
      addSearchHistory(q.trim());
      navigate(`/browse?q=${encodeURIComponent(q.trim())}`);
      setQuery('');
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

  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-ink-950 border-b border-ink-100 dark:border-ink-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <BookOpen
              size={18}
              className="text-accent group-hover:scale-110 transition-transform duration-150"
            />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-ink-900 dark:text-ink-100">
            Inkwell
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium font-display transition-all duration-200
                ${
                  isActive
                    ? 'text-accent bg-accent/5'
                    : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-ink-50 dark:hover:bg-ink-900'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="hidden md:block">
            <Input
              placeholder="Search titles..."
              prefix={<SearchIcon size={14} className="text-ink-400" />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onPressEnter={() => handleSearch()}
              className="w-48 lg:w-64 rounded-full border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 transition-all focus:w-64 lg:focus:w-80"
            />
          </div>

          <Button
            type="text"
            icon={isDark ? <Sun size={18} /> : <Moon size={18} />}
            onClick={toggleTheme}
            className="text-ink-500 hover:text-ink-900 dark:hover:text-ink-100"
          />
          
          <div className="md:hidden">
             <Button
              type="text"
              icon={<SearchIcon size={18} />}
              onClick={() => navigate('/browse')}
              className="text-ink-500 hover:text-ink-900 dark:hover:text-ink-100"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
