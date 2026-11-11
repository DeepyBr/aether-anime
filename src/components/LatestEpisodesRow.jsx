import React, { useRef } from 'react';
import { Play, Sparkles, ChevronLeft, ChevronRight, Radio, Info } from 'lucide-react';

export default function LatestEpisodesRow({
  episodes = [],
  onPlayEpisode,
  onSelectAnime
}) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (!rowRef.current) return;
    const { scrollLeft, clientWidth } = rowRef.current;
    const scrollAmount = clientWidth * 0.75;
    rowRef.current.scrollTo({
      left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: 'smooth'
    });
  };

  if (!episodes || episodes.length === 0) return null;

  return (
    <section className="relative my-8 sm:my-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Row Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-1.5 rounded-lg bg-cyber-card border border-cyber-pink/50 shadow-neon-pink">
              <Radio className="w-4 h-4 text-cyber-pink animate-pulse" />
            </div>
            
            <h2 className="font-display font-bold text-lg sm:text-2xl text-white tracking-wide flex items-center gap-2">
              Últimos Episódios Lançados
            </h2>

            <span className="neon-badge-pink px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-pink animate-ping"></span>
              Recém-Saídos
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            Episódios novos fresquinhos adicionados diretamente das transmissões
          </p>
        </div>

        {/* Scroll Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-cyber-card border border-cyber-border hover:border-cyber-cyan text-white transition hover:shadow-neon-cyan hidden sm:flex items-center justify-center cursor-pointer"
            title="Rolar esquerda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-cyber-card border border-cyber-border hover:border-cyber-cyan text-white transition hover:shadow-neon-cyan hidden sm:flex items-center justify-center cursor-pointer"
            title="Rolar direita"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={rowRef}
        className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto responsive-scroll-x scroll-smooth pb-3 sm:pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {episodes.map((ep, idx) => {
          const isDub = ep.audioType === 'DUB' || ep.episodeLabel?.includes('DUB');
          
          return (
            <div
              key={ep.id || ep.upstreamId || idx}
              className="w-60 sm:w-72 md:w-80 shrink-0 group flex flex-col cursor-pointer select-none"
              onClick={() => onPlayEpisode(ep)}
            >
              {/* Thumbnail Container (16:9) */}
              <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-cyber-card border border-cyber-border/70 group-hover:border-cyber-cyan group-hover:shadow-neon-cyan transition-all duration-300">
                <img
                  src={ep.thumbnail || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600'}
                  alt={ep.animeName}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Gradient Shadow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 group-hover:from-black/95 transition-colors"></div>

                {/* Top Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyber-pink text-white shadow-neon-pink flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    NOVO EP
                  </span>

                  {(ep.isThisYear || ep.year === 2026) && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-black shadow-sm font-bold">
                      2026
                    </span>
                  )}

                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isDub 
                      ? 'bg-cyber-cyan/90 text-cyber-bg font-bold shadow-neon-cyan' 
                      : 'bg-purple-600/90 text-white'
                  }`}>
                    {isDub ? 'DUB' : 'LEG'}
                  </span>
                </div>

                {/* Info Button to Open Anime Details */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAnime(ep);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-cyber-cyan hover:text-cyber-bg text-slate-300 backdrop-blur-md border border-slate-700 hover:border-cyber-cyan transition z-20 cursor-pointer"
                  title="Ver Detalhes do Anime"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {/* Center Hover Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyber-cyan to-cyber-pink flex items-center justify-center shadow-neon-dual transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                  </div>
                </div>

                {/* Bottom Overlay Label inside Thumbnail */}
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-white text-xs bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                    {ep.episodeLabel || ep.episodeTitle || 'Novo Episódio'}
                  </span>
                  
                  <span className="text-[10px] font-mono text-cyber-cyan bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    1080p FHD
                  </span>
                </div>
              </div>

              {/* Title & Info outside Thumbnail */}
              <div className="mt-2.5 px-0.5 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyber-cyan transition-colors truncate">
                    {ep.animeName}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {ep.seasonName ? `${ep.seasonName} • ` : ''}{ep.episodeTitle || 'Assistir Agora'}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayEpisode(ep);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-cyber-cyan/15 hover:bg-cyber-cyan text-cyber-cyan hover:text-cyber-bg text-[11px] font-bold border border-cyber-cyan/40 transition shrink-0 mt-0.5 flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Assistir
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
}
