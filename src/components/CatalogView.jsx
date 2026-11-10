import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Sparkles, RotateCcw, Filter, ChevronDown, Check, Layers, ArrowDown } from 'lucide-react';
import AnimeCard from './AnimeCard';
import { getCatalogAnimes, FALLBACK_CATEGORIES } from '../services/api';

const LETTERS = ['TODOS', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0-9'];

export default function CatalogView({ 
  initialCategory = null,
  categories = [],
  onSelectAnime,
  onPlayAnime,
  onToggleFavorite,
  isFavorite
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'todos');
  const [selectedLetter, setSelectedLetter] = useState('TODOS');
  const [selectedAudio, setSelectedAudio] = useState('all'); // all, DUB, LEG
  const [selectedYear, setSelectedYear] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // popular, year, name

  const [animes, setAnimes] = useState([]);
  const [totalCount, setTotalCount] = useState(4352);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const PAGE_SIZE = 36;
  const searchTimeoutRef = useRef(null);

  // Sync initialCategory
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      setOffset(0);
    }
  }, [initialCategory]);

  // Load animes whenever main filters change (category, letter, search)
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setOffset(0);

      const res = await getCatalogAnimes({
        category: selectedCategory,
        searchQuery: searchFilter,
        letter: selectedLetter,
        limit: PAGE_SIZE,
        offset: 0
      });

      if (res && res.items) {
        setAnimes(res.items);
        setTotalCount(res.total || 4352);
      }
      setLoading(false);
    }, searchFilter ? 300 : 0);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [selectedCategory, selectedLetter, searchFilter]);

  // Load More (Pagination)
  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextOffset = offset + PAGE_SIZE;

    const res = await getCatalogAnimes({
      category: selectedCategory,
      searchQuery: searchFilter,
      letter: selectedLetter,
      limit: PAGE_SIZE,
      offset: nextOffset
    });

    if (res && res.items && res.items.length > 0) {
      setAnimes(prev => [...prev, ...res.items]);
      setOffset(nextOffset);
      if (res.total) setTotalCount(res.total);
    }
    setLoadingMore(false);
  };

  // Client-side filtering for audio, year, sort
  const displayAnimes = useMemo(() => {
    return animes
      .filter(anime => {
        // Audio filter
        if (selectedAudio === 'DUB') {
          return anime.audioMix?.includes('DUB');
        } else if (selectedAudio === 'LEG') {
          return anime.audioMix?.includes('LEG');
        }

        // Year filter
        if (selectedYear !== 'all') {
          const yr = anime.year || 0;
          if (selectedYear === '2025' && yr !== 2025) return false;
          if (selectedYear === '2024' && yr !== 2024) return false;
          if (selectedYear === '2023' && yr !== 2023) return false;
          if (selectedYear === '2020s' && (yr < 2020 || yr > 2029)) return false;
          if (selectedYear === '2010s' && (yr < 2010 || yr > 2019)) return false;
          if (selectedYear === 'classic' && yr >= 2010) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'year') {
          return (b.year || 0) - (a.year || 0);
        } else if (sortBy === 'name') {
          return (a.name || '').localeCompare(b.name || '');
        }
        return 0;
      });
  }, [animes, selectedAudio, selectedYear, sortBy]);

  const categoriesList = useMemo(() => {
    const list = categories.length > 0 ? categories : FALLBACK_CATEGORIES;
    return [
      { id: 'recentes', name: '⚡ Recém-Atualizados', slug: 'recentes', animeCount: 84 },
      ...list
    ];
  }, [categories]);

  const hasMore = animes.length < totalCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Catalog Title Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden neon-border-box">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyber-pink/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyber-cyan/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="neon-badge px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider">
                CATÁLOGO COMPLETO ({totalCount.toLocaleString()} ANIMES)
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold">
                100% LIBERADO
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-wide">
              Explorador do Multiverso Anime
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-xl">
              Navegue por todo o catálogo com mais de 4.300 animes, dublados, donghuas e filmes em alta definição.
            </p>
          </div>

          {/* Search inside catalog */}
          <div className="relative w-full md:w-84">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-cyan" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar em todo o catálogo..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-cyber-bg/90 border border-cyber-border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan transition"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* A-Z Letter Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-cyber-card/80 border border-cyber-border space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-cyber-cyan px-1">
          <span>FILTRAR POR LETRA INICIAL (A - Z):</span>
          {selectedLetter !== 'TODOS' && (
            <span className="text-cyber-pink">Ativo: {selectedLetter}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-3 responsive-scroll-x">
          {LETTERS.map(letter => {
            const active = selectedLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer shrink-0 ${
                  active
                    ? 'bg-cyber-cyan text-cyber-bg shadow-neon-cyan'
                    : 'bg-cyber-bg/70 border border-cyber-border/70 text-slate-300 hover:text-white hover:border-cyber-cyan'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category & Genre Pills Bar */}
      <div className="space-y-2">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block px-1">
          Gêneros & Categorias:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-3 responsive-scroll-x">
          {categoriesList.map(cat => {
            const active = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id || cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                  active
                    ? 'bg-gradient-to-r from-cyber-cyan to-cyber-pink text-white shadow-neon-cyan'
                    : 'bg-cyber-card/70 border border-cyber-border text-slate-300 hover:text-white hover:border-cyber-cyan/50'
                }`}
              >
                <span>{cat.name}</span>
                {cat.animeCount && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    active ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {cat.animeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-cyber-card/60 border border-cyber-border/60 text-xs sm:text-sm">
        
        {/* Left Side: Audio & Year Filters */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Audio Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Áudio:</span>
            <div className="flex rounded-lg bg-cyber-bg p-1 border border-cyber-border">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'DUB', label: 'Dublado PT-BR' },
                { id: 'LEG', label: 'Legendado' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedAudio(opt.id)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    selectedAudio === opt.id
                      ? 'bg-cyber-cyan text-cyber-bg font-bold shadow-neon-cyan'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Year Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Ano:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-cyber-bg border border-cyber-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyber-cyan cursor-pointer"
            >
              <option value="all">Todos os Anos</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2020s">Anos 2020s</option>
              <option value="2010s">Anos 2010s</option>
              <option value="classic">Clássicos (&lt; 2010)</option>
            </select>
          </div>

        </div>

        {/* Right Side: Sorting & Reset */}
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-cyber-bg border border-cyber-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyber-cyan cursor-pointer"
          >
            <option value="popular">Mais Populares</option>
            <option value="year">Mais Recentes</option>
            <option value="name">Alfabético (A - Z)</option>
          </select>

          {(selectedCategory !== 'todos' || selectedLetter !== 'TODOS' || selectedAudio !== 'all' || selectedYear !== 'all' || searchFilter || sortBy !== 'popular') && (
            <button
              onClick={() => {
                setSelectedCategory('todos');
                setSelectedLetter('TODOS');
                setSelectedAudio('all');
                setSelectedYear('all');
                setSearchFilter('');
                setSortBy('popular');
              }}
              className="flex items-center gap-1 text-slate-400 hover:text-cyber-pink transition text-xs cursor-pointer ml-2"
              title="Redefinir filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar
            </button>
          )}
        </div>

      </div>

      {/* Catalog Counter Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
        <span>
          Exibindo <strong className="text-cyber-cyan">{displayAnimes.length}</strong> de <strong className="text-white">{totalCount.toLocaleString()}</strong> animes no catálogo
        </span>
      </div>

      {/* Animes Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-cyber-cyan/30 border-t-cyber-cyan animate-spin"></div>
          <p className="text-sm font-mono text-cyber-cyan tracking-wider">CARREGANDO CATÁLOGO AETHER...</p>
        </div>
      ) : displayAnimes.length > 0 ? (
        <div className="space-y-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {displayAnimes.map(anime => (
              <AnimeCard
                key={anime.upstreamCid || anime.id}
                anime={anime}
                onSelect={onSelectAnime}
                onPlay={onPlayAnime}
                onToggleFavorite={onToggleFavorite}
                isFavorite={isFavorite}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn-neon-gradient px-10 py-3.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-3 cursor-pointer disabled:opacity-60"
              >
                {loadingMore ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Carregando mais animes...</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-5 h-5" />
                    <span>Carregar Mais Animes (+36)</span>
                  </>
                )}
              </button>
              <p className="text-xs text-slate-400 font-mono mt-2">
                Mais de {(totalCount - animes.length).toLocaleString()} animes disponíveis para explorar
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-cyber-card/40 rounded-3xl border border-cyber-border">
          <p className="text-base text-slate-300 font-semibold">Nenhum anime encontrado com esses filtros.</p>
          <p className="text-xs text-slate-400 mt-1">Experimente limpar a busca ou selecionar outra letra/gênero.</p>
        </div>
      )}

    </div>
  );
}
