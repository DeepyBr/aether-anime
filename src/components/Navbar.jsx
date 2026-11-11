import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, User, Play, Flame, Calendar, Tv, HelpCircle, CheckCircle, X } from 'lucide-react';
import { searchAnimes } from '../services/api';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  onSelectAnime, 
  onOpenAuth, 
  user,
  myListCount 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const mobileInputRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchAnimes(searchQuery, 6);
      setSearchResults(results);
      setIsSearching(false);
      setShowSearchDropdown(true);
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Focus mobile input when opened
  useEffect(() => {
    if (mobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  // Click outside to close search
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'home', label: 'Início', icon: Play },
    { id: 'catalog', label: 'Catálogo', icon: Tv },
    { id: 'temporada-2026', label: '2026', icon: Calendar },
    { id: 'dublados', label: 'Dublados', icon: Flame },
    { id: 'quiz', label: 'Quiz Otaku', icon: HelpCircle },
    { id: 'my-list', label: 'Minha Lista', icon: Heart, badge: myListCount },
  ];

  const bottomNavItems = [
    { id: 'home', label: 'Início', icon: Play },
    { id: 'catalog', label: 'Catálogo', icon: Tv },
    { id: 'temporada-2026', label: '2026', icon: Calendar },
    { id: 'dublados', label: 'Dublados', icon: Flame },
    { id: 'my-list', label: 'Lista', icon: Heart, badge: myListCount },
  ];

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-cyber-border shadow-card-glow">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          
          {/* Brand Logo */}
          <div 
            onClick={() => { setCurrentTab('home'); setMobileSearchOpen(false); }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-cyber-bg border-2 border-cyber-cyan p-1 flex items-center justify-center shadow-neon-cyan group-hover:shadow-neon-dual transition-all duration-300">
              <div className="absolute inset-0 rounded-lg border border-cyber-pink opacity-70 animate-pulse"></div>
              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 text-cyber-cyan filter drop-shadow-[0_0_8px_#00f0ff]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
                <path d="M7 8c3 2 7 2 10 0" stroke="#ff007f"></path>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-base sm:text-xl tracking-wider neon-text-cyan flex items-center gap-1">
                AETHER<span className="neon-text-pink text-[9px] sm:text-xs uppercase px-1 sm:px-1.5 py-0.2 rounded bg-pink-500/10 border border-cyber-pink/50">OTAKU</span>
              </span>
              <span className="hidden xs:block text-[9px] sm:text-[10px] tracking-widest text-slate-400 font-mono">100% LIVRE</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    active 
                      ? 'text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/40 shadow-neon-cyan' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-cyber-cyan' : 'text-slate-400'}`} />
                  {item.label}
                  {item.badge > 0 && (
                    <span className="ml-1 text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-cyber-pink text-white shadow-neon-pink">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Search Bar & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Desktop Live Search Input */}
            <div ref={searchRef} className="hidden sm:block relative w-48 md:w-64 lg:w-72">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-cyan" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar animes..."
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-cyber-card/80 border border-cyber-border rounded-full text-white placeholder-slate-400 focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan transition-all"
                />
                {isSearching && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              {showSearchDropdown && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-cyber-card border border-cyber-border rounded-2xl shadow-2xl p-2 z-50 max-h-96 overflow-y-auto backdrop-blur-xl">
                  {searchResults.length > 0 ? (
                    searchResults.map(anime => (
                      <div
                        key={anime.upstreamCid || anime.id}
                        onClick={() => {
                          onSelectAnime(anime);
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-cyber-cyan/10 hover:border-cyber-cyan/30 border border-transparent transition cursor-pointer group"
                      >
                        <img 
                          src={anime.posterUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100'} 
                          alt={anime.name}
                          className="w-10 h-14 object-cover rounded-lg border border-slate-700 group-hover:border-cyber-cyan"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-cyber-cyan transition">
                            {anime.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400">{anime.year || '2024'}</span>
                            {anime.audioMix && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyber-pink/20 text-cyber-pink font-mono font-semibold">
                                {anime.audioMix}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Nenhum anime encontrado para "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Search Toggle Icon */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="sm:hidden p-2 rounded-full bg-cyber-card border border-cyber-border text-cyber-cyan hover:border-cyber-cyan cursor-pointer"
              title="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Unrestricted / Free Access Badge on Tablet/Desktop */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% LIVRE</span>
            </div>

            {/* User Profile */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 p-1 rounded-full border border-cyber-cyan/40 bg-cyber-card hover:border-cyber-cyan hover:shadow-neon-cyan transition cursor-pointer"
              title="Conta do Usuário"
            >
              <img 
                src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=AetherOtaku'} 
                alt="Avatar" 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
              />
            </button>

          </div>
        </div>

        {/* Mobile Full-Width Search Overlay */}
        {mobileSearchOpen && (
          <div className="sm:hidden px-3 pb-3 pt-1 border-t border-cyber-border/40 bg-cyber-card/95 backdrop-blur-xl animate-fadeIn">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-cyan" />
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar animes, filmes..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-cyber-bg border border-cyber-border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyber-cyan transition"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="p-2 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
            </div>

            {/* Mobile Dropdown Results */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="mt-2 bg-cyber-bg border border-cyber-border rounded-xl p-2 max-h-72 overflow-y-auto space-y-1">
                {searchResults.map(anime => (
                  <div
                    key={anime.upstreamCid || anime.id}
                    onClick={() => {
                      onSelectAnime(anime);
                      setShowSearchDropdown(false);
                      setMobileSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-cyber-card/70 border border-cyber-border/60 hover:border-cyber-cyan"
                  >
                    <img 
                      src={anime.posterUrl} 
                      alt={anime.name}
                      className="w-9 h-12 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{anime.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{anime.year || '2024'} • {anime.audioMix || 'DUB'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile Cyberpunk Bottom Navigation Bar (Fixed for phones) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-panel border-t border-cyber-border/80 shadow-2xl safe-bottom">
        <div className="grid grid-cols-5 h-14">
          {bottomNavItems.map(item => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`relative flex flex-col items-center justify-center gap-0.5 transition cursor-pointer select-none ${
                  active ? 'text-cyber-cyan' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-lg ${active ? 'bg-cyber-cyan/15 shadow-neon-cyan' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold leading-none">{item.label}</span>
                {item.badge > 0 && (
                  <span className="absolute top-1.5 right-1/4 translate-x-2 text-[9px] font-bold px-1 rounded-full bg-cyber-pink text-white">
                    {item.badge}
                  </span>
                )}
                {active && (
                  <span className="absolute bottom-1 w-4 h-0.5 rounded-full bg-cyber-cyan shadow-neon-cyan"></span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
