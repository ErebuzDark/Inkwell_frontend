import { useState, useRef, useEffect } from 'react';

export default function LazyImage({ src, fallbackUrls = [], alt, className }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(-1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const imgRef = useRef(null);

  // Sync currentSrc if src prop changes (e.g. navigation)
  useEffect(() => {
    setCurrentSrc(src);
    setLoaded(false);
    setError(false);
    setFallbackIndex(-1);
    setIsInitialLoading(true);
  }, [src]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' }
    );
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  const handleError = () => {
    const nextIndex = fallbackIndex + 1;
    if (nextIndex < fallbackUrls.length) {
      setFallbackIndex(nextIndex);
      setCurrentSrc(fallbackUrls[nextIndex]);
      // We don't reset loaded here, we wait for the next onLoad
      setLoaded(false);
    } else {
      setError(true);
      setIsInitialLoading(false);
    }
  };

  const handleLoad = () => {
    setLoaded(true);
    setIsInitialLoading(false);
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden bg-ink-200 dark:bg-ink-800 ${className || ''}`}>
      {/* Initial Skeleton */}
      {isInitialLoading && !error && (
        <div className="absolute inset-0 bg-ink-300 dark:bg-ink-700 animate-pulse transition-opacity duration-300" />
      )}

      {inView && !error && (
        <img
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      )}

      {error && !loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-ink-200 dark:bg-ink-900 border border-dashed border-ink-400">
           <svg className="w-6 h-6 text-ink-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] text-ink-500 font-mono uppercase">Broken image</span>
        </div>
      )}
    </div>
  );
}
