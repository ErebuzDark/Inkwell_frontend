import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, List } from 'lucide-react';
import { useAnimeDetail, useAnimeWatch } from '../hooks/useAnime.js';
import { PageSpinner, ErrorState } from '../components/ui/shared.jsx';
import VideoPlayer from '../components/ui/VideoPlayer.jsx';

export default function AnimeWatchPage() {
  const { episodeId } = useParams();
  const [searchParams] = useSearchParams();
  const animeId = searchParams.get('anime');
  const navigate = useNavigate();

  const { data: watchData, isLoading: watchLoading, error: watchError } = useAnimeWatch(episodeId);
  const { data: anime, isLoading: animeLoading } = useAnimeDetail(animeId);

  if (watchLoading || animeLoading) return <PageSpinner />;
  if (watchError || !watchData) return <ErrorState message="Could not load video player." />;

  // Construct Proxy URL
  const defaultSource = watchData.sources?.find(s => s.quality === 'default') || watchData.sources?.[0];
  
  let proxyUrl = '';
  if (defaultSource) {
    const backendUrl = (import.meta.env.VITE_API_BASE_URL || window.location.origin.replace('5173', '3001')) + '/api/proxy';
    const headersBase64 = watchData.headers ? window.btoa(JSON.stringify(watchData.headers)) : '';
    proxyUrl = `${backendUrl}?url=${encodeURIComponent(defaultSource.url)}&headers=${headersBase64}`;
  }

  const currentEpIndex = anime?.episodes?.findIndex(e => e.id === episodeId);
  const nextEp = currentEpIndex >= 0 && currentEpIndex < anime.episodes.length - 1 ? anime.episodes[currentEpIndex + 1] : null;
  const prevEp = currentEpIndex > 0 ? anime.episodes[currentEpIndex - 1] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <Link
          to={`/anime/${animeId}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          {anime ? anime.title : 'Back to details'}
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-ink-800">
            {proxyUrl ? (
              <VideoPlayer url={proxyUrl} />
            ) : (
              <div className="w-full aspect-video flex flex-col items-center justify-center text-ink-400">
                <span>No playable sources found.</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between px-2">
            <div>
              <h1 className="text-xl font-bold text-ink-900 dark:text-white">
                Episode {anime?.episodes?.[currentEpIndex]?.number || '?'}
              </h1>
              <p className="text-sm text-ink-500">
                {anime?.episodes?.[currentEpIndex]?.title || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar / Episodes List */}
        <div className="w-full lg:w-80 flex flex-col bg-ink-50 dark:bg-ink-900/50 rounded-2xl border border-ink-200 dark:border-ink-800 overflow-hidden shrink-0">
          <div className="p-4 border-b border-ink-200 dark:border-ink-800 flex items-center gap-2">
            <List size={18} className="text-ink-600 dark:text-ink-400" />
            <h3 className="font-semibold text-ink-900 dark:text-ink-100">Episodes</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-ink-300 dark:scrollbar-thumb-ink-700">
            {anime?.episodes?.map((ep) => (
              <button
                key={ep.id}
                onClick={() => navigate(`/anime/watch/${ep.id}?anime=${animeId}`)}
                className={`w-full text-left p-3 mb-1 rounded-xl flex items-center gap-3 transition-colors ${
                  ep.id === episodeId
                    ? 'bg-accent/10 border-accent/20 text-accent border'
                    : 'hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-700 dark:text-ink-300 border border-transparent'
                }`}
              >
                <div className="w-8 flex justify-center text-sm font-mono opacity-60">
                  {ep.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {ep.title || `Episode ${ep.number}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
