import React, { useState } from 'react';
import { Heart, History, Play, Trash2, Clock, Sparkles } from 'lucide-react';
import AnimeCard from './AnimeCard';

export default function MyListView({ 
  myList = [], 
  watchHistory = [], 
  onSelectAnime, 
  onPlayAnime, 
  onToggleFavorite, 
  isFavorite,
  onResumeHistory,
  onClearHistory 
}) {
  const [activeTab, setActiveTab] = useState('favorites'); // 'favorites' | 'history'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 mb-8 neon-border-box">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="neon-badge px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider">
                CENTRAL DO USUÁRIO
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-wide">
              Minha Coleção & Histórico
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Gerencie seus animes favoritos e continue assistindo exatamente de onde parou.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-cyber-bg border border-cyber-border self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'favorites'
                  ? 'bg-gradient-to-r from-cyber-cyan to-cyber-pink text-white shadow-neon-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4 fill-current" />
              Favoritos ({myList.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-cyber-cyan to-cyber-pink text-white shadow-neon-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              Continuar Assistindo ({watchHistory.length})
            </button>
          </div>
        </div>
      </div>

      {/* Favorites Tab Content */}
      {activeTab === 'favorites' && (
        <div>
          {myList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {myList.map((anime) => (
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
          ) : (
            <div className="py-20 text-center bg-cyber-card/40 rounded-3xl border border-cyber-border">
              <Heart className="w-12 h-12 text-cyber-pink mx-auto mb-3 opacity-60" />
              <h3 className="font-display font-bold text-lg text-white">Sua lista está vazia</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Adicione animes clicando no ícone de coração nos cards ou na página de detalhes para salvá-los aqui!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Watch History Tab Content */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {watchHistory.length > 0 && onClearHistory && (
            <div className="flex justify-end mb-2">
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar Histórico
              </button>
            </div>
          )}

          {watchHistory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchHistory.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onResumeHistory(item)}
                  className="group p-3 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan hover:shadow-neon-cyan transition cursor-pointer flex gap-4"
                >
                  <div className="relative w-28 aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                    <img
                      src={item.posterUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300'}
                      alt={item.animeName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Play className="w-8 h-8 text-white fill-current drop-shadow" />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-cyber-cyan">
                        EP {item.episodeNumber || 1}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyber-cyan line-clamp-1 mt-0.5">
                        {item.animeName}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {item.episodeTitle || `Episódio ${item.episodeNumber}`}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {item.progressPercent}% assistido
                        </span>
                        {item.completed && (
                          <span className="text-emerald-400 font-semibold">Concluído</span>
                        )}
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-pink"
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-cyber-card/40 rounded-3xl border border-cyber-border">
              <History className="w-12 h-12 text-cyber-cyan mx-auto mb-3 opacity-60" />
              <h3 className="font-display font-bold text-lg text-white">Nenhum histórico recente</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Seus episódios assistidos e o progresso em cada temporada aparecerão aqui automaticamente.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
