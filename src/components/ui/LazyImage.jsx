import { useState, useRef, useEffect } from 'react';

export default function LazyImage({ src, alt, className, fallback }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className || ''}`}>
      {/* Skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-ink-100 dark:bg-ink-800 animate-pulse" />
      )}

      {inView && !error && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-100 dark:bg-ink-800">
          <span className="text-xs text-ink-400 font-mono">No image</span>
        </div>
      )}
    </div>
  );
}
