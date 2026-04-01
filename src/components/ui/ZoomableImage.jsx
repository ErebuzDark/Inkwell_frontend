import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * ZoomableImage — Wraps an image with pinch-to-zoom, wheel zoom, and drag-to-pan.
 * Uses CSS transform for smooth rendering.
 */
export default function ZoomableImage({ src, fallbackUrls, alt, className = '' }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const [imgSrc, setImgSrc] = useState(src);
  const [fallbackIdx, setFallbackIdx] = useState(0);

  // Reset on src change
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setImgSrc(src);
    setFallbackIdx(0);
  }, [src]);

  const handleImgError = () => {
    if (fallbackUrls && fallbackIdx < fallbackUrls.length) {
      setImgSrc(fallbackUrls[fallbackIdx]);
      setFallbackIdx(fallbackIdx + 1);
    }
  };

  // Wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setScale((prev) => {
      const next = prev + (e.deltaY > 0 ? -0.15 : 0.15);
      return Math.max(1, Math.min(5, next));
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Mouse drag
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { ...position };
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPosition({
      x: posStart.current.x + (e.clientX - dragStart.current.x),
      y: posStart.current.y + (e.clientY - dragStart.current.y),
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch pinch zoom
  const lastTouchDist = useRef(0);
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.hypot(dx, dy);
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      posStart.current = { ...position };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const diff = dist - lastTouchDist.current;
      setScale((prev) => Math.max(1, Math.min(5, prev + diff * 0.005)));
      lastTouchDist.current = dist;
    } else if (e.touches.length === 1 && isDragging) {
      setPosition({
        x: posStart.current.x + (e.touches[0].clientX - dragStart.current.x),
        y: posStart.current.y + (e.touches[0].clientY - dragStart.current.y),
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Double tap/click to reset
  const handleDoubleClick = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default', touchAction: 'none' }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
    >
      <img
        src={imgSrc}
        alt={alt}
        onError={handleImgError}
        referrerPolicy="no-referrer"
        draggable={false}
        className="w-full select-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
      />
      {scale > 1 && (
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/50 text-white text-[10px] font-mono">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
}
