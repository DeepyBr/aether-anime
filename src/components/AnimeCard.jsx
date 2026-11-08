import React from 'react';
import { Play, Heart, Star, Sparkles } from 'lucide-react';

export default function AnimeCard({ 
  anime, 
  onSelect, 
  onPlay, 
  onToggleFavorite, 
  isFavorite 
}) {
  if (!anime) return null;
  const favored = isFavorite ? isFavorite(anime.upstreamCid) : false;

  return (
    <div className="group relative flex flex-col cursor-pointer select-none">
      
      {/* Poster Container with Neon Border & Hover/Tap effects */}
      <div 
        onClick={() => onSelect(anime)}
        className="relative aspect-[3/4.3] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-cyber-card border border-cyber-border/70 group-hover:border-cyber-cyan group-hover:shadow-neon-cyan transition-all duration-300"
      >
        <img 
          src={anime.posterUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400'} 
          alt={anime.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient shadow from bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-bg/95 via-transparent to-black/30 group-hover:from-cyber-bg transition-colors duration-300"></div>

        {/* Audio Mix Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
          {anime.audioMix && (
            <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded bg-cyber-pink/90 text-white shadow-neon-pink">
              {anime.audioMix}
            </span>
          )}
          {anime.hasNewEpisode && (
            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyber-cyan text-cyber-bg shadow-neon-cyan flex items-center gap-0.5">
              <Sparkles className="w-2 h-2 animate-spin" />
              NOVO
            </span>
          )}
        </div>

        {/* Quick Favorite Heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(anime);
          }}
          className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all duration-200 z-20 cursor-pointer ${
            favored
              ? 'bg-cyber-pink text-white shadow-neon-pink scale-110'
              : 'bg-black/50 text-slate-300 hover:text-cyber-pink hover:scale-110 border border-slate-700'
          }`}
          title={favored ? "Remover da Minha Lista" : "Adicionar à Minha Lista"}
        >
          <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${favored ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Quick Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-cyber-cyan to-cyber-pink flex items-center justify-center shadow-neon-dual transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-current ml-0.5" />
          </div>
        </div>

        {/* Card Footer Info inside Poster */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs text-slate-300">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300">
            {anime.year || '2024'}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-amber-300 font-bold">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
            4.8
          </span>
        </div>
      </div>

      {/* Title & Metadata outside Poster */}
      <div className="mt-2 px-0.5" onClick={() => onSelect(anime)}>
        <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyber-cyan line-clamp-1 transition-colors">
          {anime.name}
        </h3>
        <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1 mt-0.5">
          {anime.status || 'Dublado & Legendado'}
        </p>
      </div>

    </div>
  );
}
