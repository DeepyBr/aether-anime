import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize, 
  Minimize, SkipForward, SkipBack, MessageSquare, Send, ArrowLeft, 
  Sparkles, CheckCircle2, List, Info, ChevronDown 
} from 'lucide-react';
import { getVideoProxyUrl, getComments, addComment, saveWatchProgress } from '../services/api';

export default function VideoPlayerView({ 
  anime, 
  episode, 
  allEpisodes = [], 
  onClose, 
  onSelectEpisode,
  user 
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const lastTapRef = useRef(0);

  // Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [useProxy, setUseProxy] = useState(true);
  const [autoNext, setAutoNext] = useState(true);

  // Mobile Tabs: 'episodes' | 'comments' | 'info'
  const [mobileTab, setMobileTab] = useState('episodes');

  // Comments State
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Active video URL
  const rawVideoUrl = episode?.videoUrlFhd || episode?.videoUrl || episode?.videoUrlSd || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const streamUrl = useProxy ? getVideoProxyUrl(rawVideoUrl) : rawVideoUrl;

  // Find index of current episode
  const currentEpIndex = allEpisodes.findIndex(
    ep => (ep.id === episode?.id) || (ep.upstreamId === episode?.upstreamId)
  );
  const nextEpisode = currentEpIndex >= 0 && currentEpIndex + 1 < allEpisodes.length 
    ? allEpisodes[currentEpIndex + 1] 
    : null;
  const prevEpisode = currentEpIndex > 0 
    ? allEpisodes[currentEpIndex - 1] 
    : null;

  // Load comments
  useEffect(() => {
    let active = true;
    async function fetchEpComments() {
      const data = await getComments(episode?.upstreamId || 'default');
      if (active) setComments(data);
    }
    fetchEpComments();
    return () => { active = false; };
  }, [episode]);

  // Handle Controls Auto-hide
  const handleUserActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  };

  // Video Time & Progress Update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(curr);
    setDuration(dur);

    if (anime && episode && Math.floor(curr) % 5 === 0) {
      saveWatchProgress(anime, episode, curr, dur);
    }
  };

  // Video ended: auto next
  const handleEnded = () => {
    setIsPlaying(false);
    if (anime && episode) {
      saveWatchProgress(anime, episode, duration, duration);
    }
    if (autoNext && nextEpisode) {
      onSelectEpisode(nextEpisode);
    }
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Seek
  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  // Skip +/- 10s
  const skip = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(Math.max(videoRef.current.currentTime + seconds, 0), duration);
  };

  // Mobile Double Tap Gesture for Skip
  const handleTouchContainer = (e) => {
    handleUserActivity();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      const rect = containerRef.current.getBoundingClientRect();
      const touchX = e.changedTouches[0]?.clientX - rect.left;
      if (touchX < rect.width / 2) {
        skip(-10);
      } else {
        skip(10);
      }
    }
    lastTapRef.current = now;
  };

  // Volume
  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  // Playback Rate
  const changeSpeed = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  // Fullscreen (Cross-browser and mobile safe)
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    // Check if on iOS Safari
    if (videoRef.current && videoRef.current.webkitEnterFullscreen) {
      videoRef.current.webkitEnterFullscreen();
      return;
    }

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skip(10);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skip(-10);
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Submit comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);

    const created = await addComment(episode?.upstreamId || 'default', {
      author: user?.name || 'Otaku Cyber',
      text: newComment,
      avatar: user?.avatar
    });

    if (created && created.comment) {
      setComments(prev => [created.comment, ...prev]);
      setNewComment('');
    }
    setIsSubmittingComment(false);
  };

  // Format MM:SS
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-cyber-bg overflow-y-auto flex flex-col">
      
      {/* Top Bar Navigation (Responsive) */}
      <div className="glass-panel border-b border-cyber-border px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between z-20 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-cyber-cyan transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-cyber-cyan" />
          <span className="hidden xs:inline">Voltar</span>
        </button>

        <div className="text-center max-w-xs sm:max-w-md truncate px-2">
          <h2 className="text-xs sm:text-sm font-bold text-white truncate font-display">
            {anime?.name}
          </h2>
          <p className="text-[10px] sm:text-xs text-cyber-cyan font-mono truncate">
            {episode?.title || `Episódio ${episode?.episodeNumber || 1}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden xs:inline text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
            1080p FHD
          </span>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-cyber-card border border-cyber-border hover:border-cyber-pink hover:text-cyber-pink transition cursor-pointer"
            title="Sair do Player"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        
        {/* Video Player Column */}
        <div className="lg:col-span-2 flex flex-col space-y-3 sm:space-y-4">
          
          {/* Video Player Frame - Sticky on mobile portrait */}
          <div
            ref={containerRef}
            onMouseMove={handleUserActivity}
            onTouchStart={handleTouchContainer}
            className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black border sm:border-2 border-cyber-cyan/50 shadow-neon-dual flex items-center justify-center group select-none sticky top-0 sm:static z-30"
          >
            <video
              ref={videoRef}
              src={streamUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onClick={togglePlay}
              playsInline
              webkit-playsinline="true"
              autoPlay
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Big Center Play Indicator on Pause */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-cyber-cyan/20 border-2 border-cyber-cyan flex items-center justify-center text-white shadow-neon-cyan hover:scale-110 transition cursor-pointer backdrop-blur-md"
              >
                <Play className="w-7 h-7 sm:w-10 sm:h-10 text-cyber-cyan fill-current ml-0.5 sm:ml-1" />
              </button>
            )}

            {/* Custom Cyber Neon Controls Overlay */}
            <div
              className={`absolute inset-x-0 bottom-0 p-2 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 flex flex-col gap-1.5 sm:gap-2 ${
                showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Scrubber / Progress Bar */}
              <div className="relative group/bar flex items-center">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 sm:h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyber-cyan focus:outline-none hover:h-2.5 transition-all"
                  style={{
                    background: `linear-gradient(to right, #00f0ff ${(currentTime / (duration || 1)) * 100}%, rgba(255, 0, 127, 0.4) ${(currentTime / (duration || 1)) * 100}%, #1e293b ${(currentTime / (duration || 1)) * 100}%)`
                  }}
                />
              </div>

              {/* Bottom Buttons Row */}
              <div className="flex items-center justify-between text-slate-200 text-xs pt-0.5">
                
                {/* Left Controls */}
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-1 sm:p-1.5 hover:text-cyber-cyan transition cursor-pointer"
                    title={isPlaying ? "Pausar" : "Reproduzir"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />}
                  </button>

                  <button
                    onClick={() => skip(-10)}
                    className="p-1 sm:p-1.5 hover:text-cyber-cyan transition cursor-pointer"
                    title="-10s"
                  >
                    <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  <button
                    onClick={() => skip(10)}
                    className="p-1 sm:p-1.5 hover:text-cyber-cyan transition cursor-pointer"
                    title="+10s"
                  >
                    <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  {/* Volume (compact on mobile) */}
                  <div className="flex items-center gap-1">
                    <button onClick={toggleMute} className="p-1 hover:text-cyber-cyan transition cursor-pointer">
                      {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyber-pink" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolume}
                      className="hidden sm:block w-14 sm:w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
                    />
                  </div>

                  {/* Time display */}
                  <div className="text-[10px] sm:text-[11px] font-mono text-slate-300 ml-1">
                    <span className="text-cyber-cyan">{formatTime(currentTime)}</span> / {formatTime(duration)}
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-1.5 sm:gap-3">
                  
                  {/* Next episode quick button */}
                  {nextEpisode && (
                    <button
                      onClick={() => onSelectEpisode(nextEpisode)}
                      className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-cyber-cyan/15 border border-cyber-cyan/40 text-cyber-cyan text-[10px] sm:text-xs font-bold transition cursor-pointer"
                    >
                      <SkipForward className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">Próximo</span>
                    </button>
                  )}

                  {/* Speed Selector */}
                  <select
                    value={playbackRate}
                    onChange={(e) => changeSpeed(parseFloat(e.target.value))}
                    className="bg-black/60 border border-slate-700 text-[10px] sm:text-xs rounded px-1 py-0.5 text-slate-200 focus:outline-none focus:border-cyber-cyan cursor-pointer"
                  >
                    <option value="0.75">0.75x</option>
                    <option value="1">1.0x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                  </select>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-1 sm:p-1.5 hover:text-cyber-cyan transition cursor-pointer"
                    title="Tela Cheia"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>

              </div>
            </div>

          </div>

          {/* Episode Info Card */}
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-cyber-card border border-cyber-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="neon-badge px-2 py-0.2 rounded text-[10px] font-mono font-bold">
                  EP {episode?.episodeNumber || '1'}
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-300">
                  {episode?.audioType || anime?.audioMix || 'DUB/LEG'}
                </span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3" /> 1080p Liberado
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-1">
                {episode?.title || `${anime?.name} - Episódio ${episode?.episodeNumber || 1}`}
              </h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoNext}
                  onChange={(e) => setAutoNext(e.target.checked)}
                  className="rounded accent-cyber-cyan"
                />
                Auto Próximo
              </label>

              {nextEpisode && (
                <button
                  onClick={() => onSelectEpisode(nextEpisode)}
                  className="btn-neon-gradient px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  Próximo
                </button>
              )}
            </div>
          </div>

          {/* Mobile Tabs Switcher for Episodes & Comments */}
          <div className="lg:hidden flex items-center border-b border-cyber-border/70 text-xs font-bold">
            <button
              onClick={() => setMobileTab('episodes')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
                mobileTab === 'episodes'
                  ? 'border-cyber-cyan text-cyber-cyan'
                  : 'border-transparent text-slate-400'
              }`}
            >
              <List className="w-4 h-4" />
              Episódios ({allEpisodes.length})
            </button>
            <button
              onClick={() => setMobileTab('comments')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
                mobileTab === 'comments'
                  ? 'border-cyber-pink text-cyber-pink'
                  : 'border-transparent text-slate-400'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Comentários ({comments.length})
            </button>
          </div>

          {/* Mobile Episode List Tab (when on mobile screen) */}
          <div className={`lg:hidden ${mobileTab === 'episodes' ? 'block' : 'hidden'}`}>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {allEpisodes.map((ep, idx) => {
                const active = (ep.id === episode?.id) || (ep.upstreamId === episode?.upstreamId);
                return (
                  <div
                    key={ep.id || ep.upstreamId || idx}
                    onClick={() => {
                      onSelectEpisode(ep);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-center gap-3 p-2 rounded-xl transition cursor-pointer border ${
                      active
                        ? 'bg-cyber-cyan/15 border-cyber-cyan text-white shadow-neon-cyan'
                        : 'bg-cyber-card/70 border-cyber-border/50 text-slate-300'
                    }`}
                  >
                    <div className="relative w-20 aspect-video rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                      <img
                        src={ep.thumbnailSmall || ep.thumbnailLarge || anime?.posterUrl}
                        alt={ep.title}
                        className="w-full h-full object-cover"
                      />
                      {active && (
                        <div className="absolute inset-0 bg-cyber-cyan/30 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-current animate-pulse" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] font-mono font-bold ${active ? 'text-cyber-cyan' : 'text-slate-400'}`}>
                        EP {ep.episodeNumber || idx + 1}
                      </span>
                      <h4 className="text-xs font-medium truncate mt-0.5">
                        {ep.title || `Episódio ${ep.episodeNumber || idx + 1}`}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comments Section (always on desktop, tabbed on mobile) */}
          <div className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-cyber-card border border-cyber-border space-y-4 ${
            mobileTab === 'comments' ? 'block' : 'hidden lg:block'
          }`}>
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyber-cyan" />
              Discussão do Episódio ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Comente sobre o episódio..."
                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-cyber-bg border border-cyber-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan transition"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="btn-neon-gradient px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Enviar</span>
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {comments.map((c) => (
                <div key={c.id} className="p-2.5 sm:p-3 rounded-xl bg-cyber-bg/70 border border-cyber-border/60 flex items-start gap-2.5">
                  <img src={c.avatar} alt={c.author} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-cyber-cyan/50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyber-cyan truncate">{c.author}</span>
                      <span className="text-[10px] text-slate-500">{c.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Desktop Playlist Sidebar (Hidden on mobile, since mobile has interactive tab) */}
        <div className="hidden lg:flex lg:col-span-1 p-5 rounded-2xl bg-cyber-card border border-cyber-border flex-col max-h-[780px]">
          <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 mb-3">
            <Play className="w-4 h-4 text-cyber-pink" />
            Playlist de Episódios ({allEpisodes.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {allEpisodes.map((ep, idx) => {
              const active = (ep.id === episode?.id) || (ep.upstreamId === episode?.upstreamId);
              return (
                <div
                  key={ep.id || ep.upstreamId || idx}
                  onClick={() => onSelectEpisode(ep)}
                  className={`flex items-center gap-3 p-2 rounded-xl transition cursor-pointer border ${
                    active
                      ? 'bg-cyber-cyan/15 border-cyber-cyan text-white shadow-neon-cyan'
                      : 'bg-cyber-bg/60 border-cyber-border/50 text-slate-300 hover:border-slate-600 hover:bg-cyber-bg'
                  }`}
                >
                  <div className="relative w-16 aspect-video rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                    <img
                      src={ep.thumbnailSmall || ep.thumbnailLarge || anime?.posterUrl}
                      alt={ep.title}
                      className="w-full h-full object-cover"
                    />
                    {active && (
                      <div className="absolute inset-0 bg-cyber-cyan/30 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-current animate-pulse" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-mono font-bold ${active ? 'text-cyber-cyan' : 'text-slate-400'}`}>
                        EP {ep.episodeNumber || idx + 1}
                      </span>
                    </div>
                    <h4 className="text-xs font-medium truncate mt-0.5">
                      {ep.title || `Episódio ${ep.episodeNumber || idx + 1}`}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
