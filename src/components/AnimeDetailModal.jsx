import React, { useState, useEffect } from 'react';
import { X, Play, Heart, Star, Sparkles, Layers, CheckCircle2, Clock } from 'lucide-react';
import { getAnimeCatalogDetail, getAnimeRating, submitAnimeRating } from '../services/api';

export default function AnimeDetailModal({ 
  anime, 
  onClose, 
  onPlayEpisode, 
  onToggleFavorite, 
  isFavorite,
  watchHistory = [] 
}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const [rating, setRating] = useState({ average: 4.9, count: 142 });
  const [userVote, setUserVote] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);

  // Load detail data from API
  useEffect(() => {
    if (!anime?.upstreamCid) return;
    let active = true;
    setLoading(true);

    async function load() {
      const data = await getAnimeCatalogDetail(anime.upstreamCid);
      const rateData = await getAnimeRating(anime.upstreamCid);
      if (active) {
        setDetail(data);
        if (rateData) setRating(rateData);
        setLoading(false);
      }
    }
    load();

    return () => { active = false; };
  }, [anime]);

  const handleRate = async (star) => {
    setUserVote(star);
    const updated = await submitAnimeRating(anime.upstreamCid, star);
    if (updated) {
      setRating(updated);
    }
  };

  if (!anime) return null;
  const favored = isFavorite ? isFavorite(anime.upstreamCid) : false;

  const seasons = detail?.seasons || [];
  const currentSeason = seasons[selectedSeasonIndex] || null;
  
  const episodes = detail?.episodes || [];
  const filteredEpisodes = currentSeason 
    ? episodes.filter(ep => ep.upstreamTempId === currentSeason.upstreamTid || !ep.upstreamTempId)
    : episodes;

  const episodesToDisplay = filteredEpisodes.length > 0 ? filteredEpisodes : episodes;

  const isEpisodeWatched = (epId) => {
    return watchHistory.some(h => h.episodeId === epId && h.completed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-cyber-card border-t sm:border border-cyber-border rounded-t-3xl sm:rounded-3xl shadow-neon-dual overflow-hidden z-10 flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-cyber-bg/90 border border-cyber-border text-slate-300 hover:text-white hover:border-cyber-pink hover:shadow-neon-pink transition z-30 cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto touch-scroll">
          
          {/* Header Backdrop Banner */}
          <div className="relative h-48 sm:h-64 md:h-76 w-full overflow-hidden shrink-0">
            <img 
              src={anime.posterUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200'} 
              alt={anime.name}
              className="w-full h-full object-cover filter brightness-40 blur-sm scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyber-card via-cyber-card/60 to-transparent"></div>

            {/* Poster & Main Meta Over Banner */}
            <div className="absolute bottom-3 left-4 right-4 sm:left-6 sm:right-6 flex items-end gap-3 sm:gap-6">
              
              {/* Poster with Cyber Glow */}
              <div className="relative w-20 sm:w-32 md:w-40 aspect-[3/4.2] rounded-xl sm:rounded-2xl overflow-hidden border-2 border-cyber-cyan shadow-neon-cyan shrink-0">
                <img 
                  src={anime.posterUrl} 
                  alt={anime.name} 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Title & Info */}
              <div className="flex-1 space-y-1 sm:space-y-2 pb-0.5 sm:pb-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {anime.audioMix && (
                    <span className="neon-badge-pink px-2 py-0.2 sm:py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold">
                      {anime.audioMix}
                    </span>
                  )}
                  <span className="text-[10px] sm:text-xs px-2 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                    {anime.year || '2024'}
                  </span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                    {anime.status || 'Completo'}
                  </span>
                </div>

                <h1 className="font-display font-extrabold text-lg sm:text-2xl md:text-3xl text-white drop-shadow-[0_0_15px_rgba(0,240,255,0.4)] line-clamp-2">
                  {anime.name}
                </h1>
                {anime.nameEn && (
                  <p className="text-[11px] sm:text-xs text-cyber-cyan/80 font-mono truncate">
                    {anime.nameEn}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Details & Actions Section */}
          <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
            
            {/* Quick Actions & Rating Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-cyber-border">
              
              {/* Play & Favorite Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const firstEp = episodesToDisplay[0] || {
                      upstreamId: 1,
                      title: 'Episódio 01',
                      episodeNumber: 1
                    };
                    onPlayEpisode(anime, firstEp, episodesToDisplay);
                  }}
                  className="flex-1 sm:flex-initial btn-neon-gradient px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Assistir EP 01
                </button>

                <button
                  onClick={() => onToggleFavorite(anime)}
                  className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition border cursor-pointer ${
                    favored
                      ? 'bg-cyber-pink/20 border-cyber-pink text-cyber-pink shadow-neon-pink'
                      : 'bg-cyber-bg border-cyber-border text-white hover:border-cyber-cyan'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favored ? 'fill-current text-cyber-pink' : ''}`} />
                  <span className="hidden xs:inline">{favored ? 'Salvo' : 'Minha Lista'}</span>
                </button>
              </div>

              {/* Interactive Star Rating */}
              <div className="flex items-center gap-2 bg-cyber-bg px-3 py-1.5 rounded-xl border border-cyber-border text-xs">
                <span className="text-slate-400 font-medium">Nota:</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverStar(star)}
                      onMouseLeave={() => setHoverStar(0)}
                      onClick={() => handleRate(star)}
                      className="p-0.5 text-slate-600 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star 
                        className={`w-3.5 h-3.5 ${
                          star <= (hoverStar || userVote || Math.round(rating.average))
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <span className="font-bold text-amber-300 ml-1">
                  {rating.average}
                </span>
                <span className="text-[10px] text-slate-500">
                  ({rating.count})
                </span>
              </div>

            </div>

            {/* Synopsis */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyber-cyan font-mono mb-1.5">
                Sinopse
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-justify">
                {anime.synopsis?.replace(/<[^>]*>?/gm, '') || 'Sinopse não informada.'}
              </p>
            </div>

            {/* Seasons Selection Tabs */}
            {seasons.length > 1 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyber-cyan font-mono">
                  <Layers className="w-3.5 h-3.5" />
                  Temporadas ({seasons.length})
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {seasons.map((season, idx) => (
                    <button
                      key={season.id || idx}
                      onClick={() => setSelectedSeasonIndex(idx)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                        idx === selectedSeasonIndex
                          ? 'bg-cyber-cyan text-cyber-bg font-bold shadow-neon-cyan'
                          : 'bg-cyber-bg border border-cyber-border text-slate-300 hover:text-white'
                      }`}
                    >
                      {season.name || `Temporada ${idx + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Episodes List */}
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-cyber-pink" />
                Episódios ({episodesToDisplay.length})
              </h3>

              {loading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <div className="w-7 h-7 rounded-full border-2 border-cyber-cyan/30 border-t-cyber-cyan animate-spin"></div>
                  <p className="text-xs font-mono text-slate-400">Carregando episódios...</p>
                </div>
              ) : episodesToDisplay.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3.5 max-h-80 sm:max-h-96 overflow-y-auto pr-1">
                  {episodesToDisplay.map((ep, idx) => {
                    const watched = isEpisodeWatched(ep.upstreamId);
                    return (
                      <div
                        key={ep.id || ep.upstreamId || idx}
                        onClick={() => onPlayEpisode(anime, ep, episodesToDisplay)}
                        className="group flex items-center gap-2.5 p-2 rounded-xl bg-cyber-bg/80 border border-cyber-border hover:border-cyber-cyan transition cursor-pointer"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-20 sm:w-24 aspect-video rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                          <img 
                            src={ep.thumbnailSmall || ep.thumbnailLarge || anime.posterUrl} 
                            alt={ep.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition">
                            <Play className="w-4 h-4 text-white group-hover:text-cyber-cyan fill-current transition" />
                          </div>
                        </div>

                        {/* Title & Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-cyber-cyan font-bold">
                              EP {ep.episodeNumber || idx + 1}
                            </span>
                            {watched && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" title="Assistido" />
                            )}
                          </div>
                          <h4 className="text-xs font-semibold text-white group-hover:text-cyber-cyan truncate transition mt-0.5">
                            {ep.title || `Episódio ${ep.episodeNumber || idx + 1}`}
                          </h4>
                          <span className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-slate-500" />
                            24 min
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center bg-cyber-bg/50 rounded-2xl border border-cyber-border">
                  <p className="text-xs text-slate-400">Episódios em processamento para esta temporada.</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
