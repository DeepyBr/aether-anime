import React, { useState, useEffect } from 'react';
import { Play, Plus, Check, Star, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

export default function HeroBanner({ highlights = [], onSelectAnime, onPlayAnime, onToggleFavorite, isFavorite }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance banner every 6.5s
  useEffect(() => {
    if (!highlights || highlights.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % highlights.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [highlights]);

  if (!highlights || highlights.length === 0) return null;
  const current = highlights[currentIndex];
  const favored = isFavorite(current?.upstreamCid);

  return (
    <div className="relative w-full h-[420px] sm:h-[500px] md:h-[560px] lg:h-[620px] overflow-hidden select-none">
      
      {/* Background Anime Backdrop with Cyberpunk Mesh */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
        style={{ 
          backgroundImage: `url(${current?.posterUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600'})`,
          filter: 'brightness(0.35) blur(3px)'
        }}
      />

      {/* Cyberpunk Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyber-bg via-cyber-bg/75 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-cyber-bg via-cyber-bg/85 to-transparent"></div>
      
      {/* Neon Scanline / Ambient Glow */}
      <div className="absolute top-1/4 -left-20 w-72 sm:w-96 h-72 sm:h-96 bg-cyber-cyan/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-72 sm:w-96 h-72 sm:h-96 bg-cyber-pink/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
        
        {/* Left Info Column */}
        <div className="max-w-2xl space-y-3 sm:space-y-5">
          
          {/* Neon Badges */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="neon-badge px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyber-cyan animate-pulse" />
              Destaque
            </span>
            <span className="neon-badge-pink px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold">
              {current?.audioMix || 'DUB / LEG'}
            </span>
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 font-semibold">
              {current?.year || '2024'}
            </span>
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
              {current?.status || 'Completo'}
            </span>
          </div>

          {/* Anime Title */}
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-wide leading-tight drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            {current?.name}
          </h1>
          {current?.nameEn && current.nameEn !== current.name && (
            <p className="text-xs sm:text-sm text-cyber-cyan/80 font-mono -mt-1 sm:-mt-2 truncate">
              {current?.nameEn}
            </p>
          )}

          {/* Synopsis */}
          <p className="text-xs sm:text-sm md:text-base text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
            {current?.synopsis?.replace(/<[^>]*>?/gm, '') || 'Assista a todos os episódios completos dublados e legendados em altíssima definição no Aether Anime.'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-1 sm:pt-2">
            <button
              onClick={() => onPlayAnime(current)}
              className="btn-neon-gradient px-4 py-2.5 sm:px-7 sm:py-3.5 rounded-xl font-display font-bold text-xs sm:text-sm md:text-base flex items-center gap-2 sm:gap-3 cursor-pointer"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ASSISTIR
            </button>

            <button
              onClick={() => onToggleFavorite(current)}
              className={`px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-xl font-semibold text-xs sm:text-sm md:text-base flex items-center gap-1.5 sm:gap-2.5 transition border cursor-pointer ${
                favored
                  ? 'bg-cyber-pink/20 border-cyber-pink text-cyber-pink shadow-neon-pink'
                  : 'bg-cyber-card/80 border-cyber-border text-white hover:border-cyber-cyan'
              }`}
            >
              {favored ? (
                <>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-pink" />
                  <span className="hidden xs:inline">Salvo</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-cyan" />
                  <span className="hidden xs:inline">Minha Lista</span>
                </>
              )}
            </button>

            <button
              onClick={() => onSelectAnime(current)}
              className="px-3.5 py-2.5 sm:px-4 sm:py-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-900/60 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition cursor-pointer"
            >
              Detalhes
            </button>
          </div>
        </div>

        {/* Right Column: Poster Card with Cyber Frame (hidden on small mobile) */}
        <div className="hidden md:block shrink-0">
          <div 
            onClick={() => onSelectAnime(current)}
            className="group relative cursor-pointer"
          >
            <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-cyber-cyan via-purple-500 to-cyber-pink opacity-70 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-300 animate-pulse"></div>
            
            <div className="relative w-56 lg:w-68 h-80 lg:h-96 rounded-2xl overflow-hidden border-2 border-cyber-cyan/60 bg-cyber-bg shadow-2xl">
              <img 
                src={current?.posterUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500'} 
                alt={current?.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyber-bg via-transparent to-transparent opacity-60"></div>
              
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded bg-cyber-bg/90 border border-cyber-cyan/50 text-cyber-cyan font-bold font-mono text-[10px]">
                  1080p FHD
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyber-bg/90 border border-amber-400/50 text-amber-400 font-bold text-[10px]">
                  <Star className="w-3 h-3 fill-current" />
                  4.9
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Banner Slide Controls */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 flex items-center gap-2 sm:gap-3 z-20">
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + highlights.length) % highlights.length)}
          className="p-1.5 sm:p-2.5 rounded-full bg-cyber-card/80 border border-cyber-border hover:border-cyber-cyan text-white transition hover:shadow-neon-cyan cursor-pointer"
          title="Anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Indicators */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {highlights.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-5 sm:w-7 bg-gradient-to-r from-cyber-cyan to-cyber-pink shadow-neon-cyan'
                  : 'w-1.5 sm:w-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % highlights.length)}
          className="p-1.5 sm:p-2.5 rounded-full bg-cyber-card/80 border border-cyber-border hover:border-cyber-cyan text-white transition hover:shadow-neon-cyan cursor-pointer"
          title="Próximo"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

    </div>
  );
}
