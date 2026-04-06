import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, List, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { useAnimeDetail, useAnimeWatch, useAnimeSearch } from '../hooks/useAnime.js';
import { PageSpinner, ErrorState } from '../components/ui/shared.jsx';
import VideoPlayer from '../components/ui/VideoPlayer.jsx';
import { getProxyUrl } from '../services/api.js';

export default function AnimeWatchPage() {
  const { episodeId } = useParams();
  const [searchParams] = useSearchParams();
  const animeId = searchParams.get('anime');
  const navigate = useNavigate();

  const { data: watchData, isLoading: watchLoading, error: watchError } = useAnimeWatch(episodeId);
  const { data: anime, isLoading: animeLoading } = useAnimeDetail(animeId);
  
  // Search for related versions/seasons based on the base title
  const baseTitle = anime?.title?.split(' (')[0]?.split(' - ')[0] || '';
  const { data: searchData } = useAnimeSearch(baseTitle);
  const relatedAnimes = searchData?.pages?.flatMap(p => p.results)
    ?.filter(a => a.id !== animeId)
    ?.slice(0, 5) || [];

  if (watchLoading || animeLoading) return <PageSpinner />;
  
  // Clean up and filter out broken source URLs (like those containing .replace() from Saturn)
  const validSources = watchData?.sources?.filter(s => 
    s.url && 
    !s.url.includes('.replace(') && 
    !s.url.includes('function') &&
    s.url.startsWith('http')
  ) || [];

  // Show error state if the backend returns a 404 or sources are empty
  if (watchError || !watchData || validSources.length === 0) {
    const errorMessage = watchError?.message || "Episode sources not found. This title might be currently unavailable on our primary servers.";
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <ErrorState message={errorMessage} />
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-accent text-white rounded-xl hover:opacity-90 transition-opacity"
        >
          Go Back
        </button>
      </div>
    );
  }

  const defaultSource = validSources.find(s => s.quality === 'default') || validSources[0];
  
  const proxyUrl = defaultSource ? getProxyUrl(defaultSource.url, watchData.headers) : '';

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
        <div className="flex-1 flex flex-col gap-4">
          <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-ink-800">
            {proxyUrl ? (
              <VideoPlayer 
                url={proxyUrl} 
                onEnded={() => nextEp && navigate(`/anime/watch/${encodeURIComponent(nextEp.id)}?anime=${animeId}`)}
              />
            ) : (
              <div className="w-full aspect-video flex flex-col items-center justify-center text-ink-400">
                <span>No playable sources found.</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between px-2 gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-ink-900 dark:text-white truncate">
                Episode {anime?.episodes?.[currentEpIndex]?.number || '?'}
              </h1>
              <p className="text-sm text-ink-500 truncate">
                {anime?.episodes?.[currentEpIndex]?.title || ''}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                disabled={!prevEp}
                onClick={() => prevEp && navigate(`/anime/watch/${encodeURIComponent(prevEp.id)}?anime=${animeId}`)}
                className="p-2.5 rounded-xl bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Previous Episode"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                disabled={!nextEp}
                onClick={() => nextEp && navigate(`/anime/watch/${encodeURIComponent(nextEp.id)}?anime=${animeId}`)}
                className="p-2.5 rounded-xl bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Next Episode"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar / Episodes & Related List */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 h-full overflow-y-auto no-scrollbar">
          {/* Episode List */}
          <div className="flex flex-col bg-ink-50/50 dark:bg-ink-900/30 rounded-2xl border border-ink-200 dark:border-ink-800 overflow-hidden min-h-[300px]">
            <div className="p-4 border-b border-ink-200 dark:border-ink-800 flex items-center gap-2 bg-ink-50/80 dark:bg-ink-900/80 backdrop-blur-sm">
              <List size={18} className="text-ink-600 dark:text-ink-400" />
              <h3 className="font-semibold text-ink-900 dark:text-ink-100">Episodes</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-ink-300 dark:scrollbar-thumb-ink-700">
              {anime?.episodes?.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => navigate(`/anime/watch/${encodeURIComponent(ep.id)}?anime=${animeId}`)}
                  className={`w-full text-left p-3 mb-1 rounded-xl flex items-center gap-3 transition-all ${
                    ep.id === episodeId
                      ? 'bg-accent/10 border-accent/20 text-accent border shadow-sm'
                      : 'hover:bg-ink-100 dark:hover:bg-ink-800/50 text-ink-700 dark:text-ink-300 border border-transparent'
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

          {/* Related Versions / Seasons */}
          {relatedAnimes.length > 0 && (
            <div className="flex flex-col bg-ink-50/50 dark:bg-ink-900/30 rounded-2xl border border-ink-200 dark:border-ink-800 overflow-hidden">
              <div className="p-4 border-b border-ink-200 dark:border-ink-800 flex items-center gap-2 bg-ink-50/80 dark:bg-ink-900/80 backdrop-blur-sm">
                <Layers size={18} className="text-accent" />
                <h3 className="font-semibold text-ink-900 dark:text-ink-100">Other Versions</h3>
              </div>
              <div className="p-3 gap-2 flex flex-col">
                {relatedAnimes.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/anime/${rel.id}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800/50 transition-colors group"
                  >
                    <div className="w-12 h-16 rounded-md overflow-hidden bg-ink-200 shrink-0">
                      <img 
                        src={getProxyUrl(rel.image)} 
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-ink-900 dark:text-ink-100 truncate group-hover:text-accent transition-colors">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-ink-500">
                        {rel.releaseDate || 'Related'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
