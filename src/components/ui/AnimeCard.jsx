import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import LazyImage from './LazyImage.jsx';

export default function AnimeCard({ anime }) {
  return (
    <Link
      to={`/anime/${anime.id}`}
      className="group block relative"
    >
      <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-800 shadow-sm transition-transform duration-300 relative border border-ink-200/50 dark:border-ink-800/50 hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:shadow-md">
        <LazyImage
          src={anime.image}
          alt={anime.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-600/90 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 text-white ml-1" />
          </div>
        </div>

        {/* Episode/Type Badge */}
        {(anime.episodeNumber || anime.sub || anime.episodes) && (
          <div className="absolute top-2 right-2 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow backdrop-blur-sm">
            EP {anime.episodeNumber || anime.sub || anime.episodes}
          </div>
        )}
        {!(anime.episodeNumber || anime.sub || anime.episodes) && anime.type && (
          <div className="absolute top-2 right-2 bg-ink-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow backdrop-blur-sm uppercase">
            {anime.type}
          </div>
        )}
      </div>

      <div className="mt-2.5 px-0.5">
        <h3 className="font-display font-semibold text-[13px] sm:text-sm text-ink-900 dark:text-ink-100 leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {anime.title}
        </h3>
        
        <div className="flex items-center gap-2 mt-1 whitespace-nowrap overflow-hidden">
          {anime.releaseDate ? (
             <span className="text-[11px] text-ink-400 dark:text-ink-500 font-mono">
               {anime.releaseDate}
             </span>
          ) : anime.status ? (
            <span className="text-[11px] text-ink-400 dark:text-ink-500 font-mono">
               {anime.status}
             </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
