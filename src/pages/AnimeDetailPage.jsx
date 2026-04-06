import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Tv, Calendar, Star, Info } from 'lucide-react';
import { useAnimeDetail } from '../hooks/useAnime.js';
import { PageSpinner, ErrorState } from '../components/ui/shared.jsx';
import LazyImage from '../components/ui/LazyImage.jsx';
import { getProxyUrl } from '../services/api.js';

export default function AnimeDetailPage() {
  const { id } = useParams();
  const { data: anime, isLoading, error } = useAnimeDetail(id);

  if (isLoading) return <PageSpinner />;
  if (error || !anime) return <ErrorState message="Could not load this anime." />;

  const firstEpisode = anime.episodes?.[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-slide-up">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 mb-6 transition-colors font-body"
      >
        <ArrowLeft size={14} />
        Back
      </Link>

      {/* Main info */}
      <div className="flex flex-col sm:flex-row gap-6 mb-10">
        <div className="shrink-0 w-40 sm:w-56 mx-auto sm:mx-0">
          <div className="aspect-[2/3] rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-800 shadow-lg relative">
            <LazyImage
              src={getProxyUrl(anime.image)}
              alt={anime.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {anime.type || 'Anime'}
          </span>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink-950 dark:text-ink-50 leading-tight">
            {anime.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-ink-500 dark:text-ink-400 font-body">
            {anime.releaseDate && (
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {anime.releaseDate}
              </span>
            )}
            {anime.subOrDub && (
              <span className="flex items-center gap-1.5">
                <Tv size={13} />
                {anime.subOrDub?.toUpperCase()}
              </span>
            )}
            {anime.status && (
              <span className="flex items-center gap-1.5 text-emerald-500">
                <Info size={13} />
                {anime.status}
              </span>
            )}
          </div>

          {anime.genres?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {anime.genres.map((g) => (
                <span
                  key={g}
                  className="badge bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 text-[11px]"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {anime.description && (
            <p className="text-sm text-ink-600 dark:text-ink-400 leading-relaxed max-w-prose font-body mt-4">
              {anime.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-4">
            {firstEpisode && (
              <Link to={`/anime/watch/${firstEpisode.id}?anime=${anime.id}`} className="btn-primary">
                <Play size={15} />
                Watch First Episode
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Episodes List */}
      <div>
        <h2 className="font-display font-semibold text-lg text-ink-900 dark:text-ink-100 mb-4">
          Episodes
          <span className="ml-2 text-sm font-mono font-normal text-ink-400">
            ({anime.episodes?.length || 0})
          </span>
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {anime.episodes?.map((ep) => (
            <Link
              key={ep.id}
              to={`/anime/watch/${ep.id}?anime=${anime.id}`}
              className="flex flex-col p-3 rounded-xl border border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900 hover:border-accent hover:shadow-sm transition-all"
            >
              <span className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                Episode {ep.number}
              </span>
              <span className="text-xs text-ink-500 mt-1 line-clamp-1">
                {ep.title || `Episode ${ep.number}`}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
