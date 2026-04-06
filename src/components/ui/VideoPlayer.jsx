import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, 
  Settings, Loader2 
} from 'lucide-react';

export default function VideoPlayer({ url, poster }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  let controlsTimeout = null;

  useEffect(() => {
    let hls;
    const video = videoRef.current;
    
    // Simple format detection
    const isM3U8 = url && (url.includes('.m3u8') || url.includes('m3u8'));

    if (Hls.isSupported() && url && isM3U8) {
      hls = new Hls({
        maxMaxBufferLength: 100,
        xhrSetup: (xhr, url) => {
          // Prevent sending the localhost Referer which many providers block
          xhr.withCredentials = false;
        }
      });
      hlsRef.current = hls;
      
      hls.loadSource(url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
           console.error('HLS Fatal Error, falling back to native player:', data.type);
           video.src = url;
           setIsBuffering(false);
        }
      });
    } else if (url) {
      // Fallback for native HLS (Safari) or direct MP4/WebM
      video.src = url;
      setIsBuffering(false);
      
      // Clear levels for non-HLS
      setLevels([]);
      setCurrentLevel(-1);
    }
    
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    videoRef.current.volume = val;
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
      videoRef.current.muted = true;
    } else {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatTime = (timeInSeconds) => {
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleQualityChange = (index) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      setCurrentLevel(index);
      setShowSettings(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettings(false);
      }
    }, 3000);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-video bg-black group overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        referrerPolicy="no-referrer"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => setCurrentTime(videoRef.current.currentTime)}
        onDurationChange={() => setDuration(videoRef.current.duration)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
      />

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin opacity-80" />
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pt-12 pb-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-2 group/progress">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer hover:h-1.5 transition-all outline-none"
            style={{
              background: `linear-gradient(to right, #3b82f6 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%)`
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            
            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer transition-all duration-300"
                style={{
                  background: `linear-gradient(to right, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%)`
                }}
              />
            </div>

            <div className="text-white text-sm font-medium tabular-nums shadow-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:text-blue-400 transition-colors relative"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Settings Menu */}
            {showSettings && (
              <div className="absolute bottom-full right-10 mb-2 w-32 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-gray-700/50">
                <div className="p-2 border-b border-gray-700">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Quality</span>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <button
                    onClick={() => handleQualityChange(-1)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-800 ${currentLevel === -1 ? 'text-blue-400 bg-blue-900/20' : 'text-gray-200'}`}
                  >
                    Auto
                  </button>
                  {levels.map((level, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQualityChange(idx)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-800 ${currentLevel === idx ? 'text-blue-400 bg-blue-900/20' : 'text-gray-200'}`}
                    >
                      {level.height}p
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={toggleFullscreen} className="text-white hover:text-blue-400 transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
