import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AnimeCard from './AnimeCard';

export default function AnimeRow({ 
  title, 
  subtitle, 
  animes = [], 
  icon: Icon,
  onSelectAnime, 
  onPlayAnime, 
  onToggleFavorite, 
  isFavorite,
  onViewAll 
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

  if (!animes || animes.length === 0) return null;

  return (
    <section className="relative my-8 sm:my-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Row Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-cyber-card border border-cyber-cyan/40 shadow-neon-cyan">
                <Icon className="w-4 h-4 text-cyber-cyan" />
              </div>
            )}
            <h2 className="font-display font-bold text-lg sm:text-2xl text-white tracking-wide">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Controls / View All */}
        <div className="flex items-center gap-2">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs sm:text-sm font-semibold text-cyber-cyan hover:text-cyber-pink transition mr-2"
            >
              Ver todos →
            </button>
          )}
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-cyber-card border border-cyber-border hover:border-cyber-cyan text-white transition hover:shadow-neon-cyan hidden sm:flex items-center justify-center"
            title="Rolar esquerda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-cyber-card border border-cyber-border hover:border-cyber-cyan text-white transition hover:shadow-neon-cyan hidden sm:flex items-center justify-center"
            title="Rolar direita"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Carousel */}
      <div
        ref={rowRef}
        className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto scrollbar-none scroll-smooth pb-3 -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {animes.map((anime) => (
          <div
            key={anime.upstreamCid || anime.id}
            className="w-36 sm:w-44 md:w-48 lg:w-52 shrink-0"
          >
            <AnimeCard
              anime={anime}
              onSelect={onSelectAnime}
              onPlay={onPlayAnime}
              onToggleFavorite={onToggleFavorite}
              isFavorite={isFavorite}
            />
          </div>
        ))}
      </div>

    </section>
  );
}
