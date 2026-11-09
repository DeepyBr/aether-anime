import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import AnimeRow from './components/AnimeRow';
import CatalogView from './components/CatalogView';
import AnimeDetailModal from './components/AnimeDetailModal';
import VideoPlayerView from './components/VideoPlayerView';
import QuizView from './components/QuizView';
import MyListView from './components/MyListView';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';

import { 
  getHomeHighlights, 
  getNavCategories, 
  getAnimesByCategory, 
  searchAnimes,
  getMyList, 
  toggleMyList, 
  isAnimeInMyList,
  getWatchHistory,
  getUserProfile,
  saveUserProfile,
  getAnimeCatalogDetail
} from './services/api';

import { Flame, Sparkles, Film, Tv, PlayCircle, Star, Compass } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home'); // home | catalog | dublados | donghuas | quiz | my-list
  const [catalogCategory, setCatalogCategory] = useState(null);

  // App Data
  const [highlights, setHighlights] = useState([]);
  const [actionAnimes, setActionAnimes] = useState([]);
  const [shounenAnimes, setShounenAnimes] = useState([]);
  const [dubbedAnimes, setDubbedAnimes] = useState([]);
  const [donghuas, setDonghuas] = useState([]);
  const [categories, setCategories] = useState([]);

  // User State (Unrestricted)
  const [user, setUser] = useState(getUserProfile());
  const [myList, setMyList] = useState(getMyList());
  const [watchHistory, setWatchHistory] = useState(getWatchHistory());

  // Modals & Player State
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [activePlayer, setActivePlayer] = useState(null); // { anime, episode, allEpisodes }
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial content on startup
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [hData, cats, act, shou, dub, dong] = await Promise.all([
          getHomeHighlights(),
          getNavCategories(),
          getAnimesByCategory('acao', 18),
          getAnimesByCategory('shounen', 18),
          getAnimesByCategory('dub', 18),
          getAnimesByCategory('dong', 18),
        ]);

        if (hData && hData.length > 0) {
          setHighlights(hData);
        } else {
          const fallbackHighlights = await searchAnimes('Naruto', 10);
          setHighlights(fallbackHighlights);
        }

        if (cats) setCategories(cats);

        // Populate shelves with fallback to popular searches if needed
        setActionAnimes(act?.items?.length > 0 ? act.items : await searchAnimes('Jujutsu', 12));
        setShounenAnimes(shou?.items?.length > 0 ? shou.items : await searchAnimes('One Piece', 12));
        setDubbedAnimes(dub?.items?.length > 0 ? dub.items : await searchAnimes('Dragon Ball', 12));
        setDonghuas(dong?.items?.length > 0 ? dong.items : await searchAnimes('Solo Leveling', 12));
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Sync user state to localStorage
  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    saveUserProfile(updatedUser);
  };

  // Toggle favorite
  const handleToggleFavorite = (anime) => {
    toggleMyList(anime);
    setMyList(getMyList());
  };

  const checkIsFavorite = (cid) => {
    return isAnimeInMyList(cid);
  };

  // Play anime directly (from banner or card)
  const handlePlayAnime = async (anime) => {
    // Fetch seasons/episodes to get real episode 1
    const detail = await getAnimeCatalogDetail(anime.upstreamCid);
    const episodes = detail?.episodes || [];
    const firstEp = episodes[0] || {
      upstreamId: anime.upstreamCid * 1000 + 1,
      title: `${anime.name} - Episódio 01`,
      episodeNumber: 1,
      videoUrl: 'https://nsrv.classotaku.app/file/classgg/1852/144.mp4'
    };

    setActivePlayer({
      anime: detail?.anime || anime,
      episode: firstEp,
      allEpisodes: episodes.length > 0 ? episodes : [firstEp]
    });
  };

  // Play specific episode from detail modal
  const handlePlayEpisode = (anime, episode, allEpisodes) => {
    setSelectedAnime(null);
    setActivePlayer({ anime, episode, allEpisodes });
  };

  // Resume playback from watch history
  const handleResumeHistory = async (historyItem) => {
    const detail = await getAnimeCatalogDetail(historyItem.animeCid);
    const episodes = detail?.episodes || [];
    const ep = episodes.find(e => e.upstreamId === historyItem.episodeId) || episodes[0] || {
      upstreamId: historyItem.episodeId,
      title: historyItem.episodeTitle,
      episodeNumber: historyItem.episodeNumber
    };

    setActivePlayer({
      anime: detail?.anime || { upstreamCid: historyItem.animeCid, name: historyItem.animeName, posterUrl: historyItem.posterUrl },
      episode: ep,
      allEpisodes: episodes
    });
  };

  const handleClearHistory = () => {
    localStorage.removeItem('aether_anime_watch_history');
    setWatchHistory([]);
  };

  // Navigate to catalog with specific category filter
  const handleSelectCategory = (catSlug) => {
    setCatalogCategory(catSlug);
    setCurrentTab('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 flex flex-col">
      
      {/* Sticky Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'catalog') setCatalogCategory('todos');
          if (tab === 'dublados') { setCatalogCategory('dub'); setCurrentTab('catalog'); }
          if (tab === 'donghuas') { setCatalogCategory('dong'); setCurrentTab('catalog'); }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectAnime={(anime) => setSelectedAnime(anime)}
        onOpenAuth={() => setIsAuthOpen(true)}
        user={user}
        myListCount={myList.length}
      />

      {/* Main Content Area based on Tab */}
      <main className="flex-1">
        
        {/* HOME TAB */}
        {currentTab === 'home' && (
          <div>
            {/* Hero Carousel Banner */}
            <HeroBanner
              highlights={highlights}
              onSelectAnime={(anime) => setSelectedAnime(anime)}
              onPlayAnime={handlePlayAnime}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={checkIsFavorite}
            />

            {/* Quick Genre Quick-Links Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
              <div className="flex items-center gap-3 overflow-x-auto p-3.5 pb-3 sm:pb-4 rounded-2xl glass-panel border border-cyber-border shadow-neon-cyan responsive-scroll-x">
                <span className="text-xs font-mono font-bold text-cyber-cyan uppercase tracking-wider shrink-0 flex items-center gap-1.5 pl-2">
                  <Compass className="w-3.5 h-3.5" /> Gêneros:
                </span>
                {categories.slice(0, 10).map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => handleSelectCategory(cat.slug)}
                    className="px-3.5 py-1.5 rounded-xl bg-cyber-bg/80 border border-cyber-border/70 hover:border-cyber-cyan text-xs font-semibold whitespace-nowrap text-slate-300 hover:text-white hover:shadow-neon-cyan transition cursor-pointer"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* "Continuar Assistindo" shelf if user has history */}
            {watchHistory.length > 0 && (
              <div className="mt-8">
                <AnimeRow
                  title="Continuar Assistindo"
                  subtitle="Retome seus episódios em andamento"
                  icon={PlayCircle}
                  animes={watchHistory.map(h => ({
                    upstreamCid: h.animeCid,
                    name: h.animeName,
                    posterUrl: h.posterUrl,
                    status: `${h.progressPercent}% assistido`,
                    year: 'Ep ' + (h.episodeNumber || 1)
                  }))}
                  onSelectAnime={(a) => {
                    const item = watchHistory.find(h => h.animeCid === a.upstreamCid);
                    if (item) handleResumeHistory(item);
                  }}
                  onPlayAnime={(a) => {
                    const item = watchHistory.find(h => h.animeCid === a.upstreamCid);
                    if (item) handleResumeHistory(item);
                  }}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={checkIsFavorite}
                />
              </div>
            )}

            {/* Shelf 1: Destaques & Ação */}
            <AnimeRow
              title="Destaques & Ação Cósmica"
              subtitle="As batalhas mais épicas e lançamentos em alta"
              icon={Flame}
              animes={actionAnimes}
              onSelectAnime={(anime) => setSelectedAnime(anime)}
              onPlayAnime={handlePlayAnime}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={checkIsFavorite}
              onViewAll={() => handleSelectCategory('acao')}
            />

            {/* Shelf 2: Shounen Clássicos & Modernos */}
            <AnimeRow
              title="Mundo Shounen"
              subtitle="Jornadas inesquecíveis, superações e amizade"
              icon={Star}
              animes={shounenAnimes}
              onSelectAnime={(anime) => setSelectedAnime(anime)}
              onPlayAnime={handlePlayAnime}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={checkIsFavorite}
              onViewAll={() => handleSelectCategory('shounen')}
            />

            {/* Shelf 3: Dublados em Português */}
            <AnimeRow
              title="Animes Dublados (PT-BR)"
              subtitle="Assista com os melhores dubladores do Brasil"
              icon={Sparkles}
              animes={dubbedAnimes}
              onSelectAnime={(anime) => setSelectedAnime(anime)}
              onPlayAnime={handlePlayAnime}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={checkIsFavorite}
              onViewAll={() => handleSelectCategory('dub')}
            />

            {/* Shelf 4: Donghuas & Animações Orientais */}
            <AnimeRow
              title="Donghuas (Animes Chineses)"
              subtitle="Cultivação, poderes místicos e 3D de tirar o fôlego"
              icon={Film}
              animes={donghuas}
              onSelectAnime={(anime) => setSelectedAnime(anime)}
              onPlayAnime={handlePlayAnime}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={checkIsFavorite}
              onViewAll={() => handleSelectCategory('dong')}
            />

          </div>
        )}

        {/* CATALOG TAB */}
        {currentTab === 'catalog' && (
          <CatalogView
            initialCategory={catalogCategory}
            categories={categories}
            onSelectAnime={(anime) => setSelectedAnime(anime)}
            onPlayAnime={handlePlayAnime}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={checkIsFavorite}
          />
        )}

        {/* QUIZ TAB */}
        {currentTab === 'quiz' && (
          <QuizView />
        )}

        {/* MY LIST & HISTORY TAB */}
        {currentTab === 'my-list' && (
          <MyListView
            myList={myList}
            watchHistory={watchHistory}
            onSelectAnime={(anime) => setSelectedAnime(anime)}
            onPlayAnime={handlePlayAnime}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={checkIsFavorite}
            onResumeHistory={handleResumeHistory}
            onClearHistory={handleClearHistory}
          />
        )}

      </main>

      {/* Footer */}
      <Footer onSelectCategory={handleSelectCategory} />

      {/* Anime Detail Modal */}
      {selectedAnime && (
        <AnimeDetailModal
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
          onPlayEpisode={handlePlayEpisode}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={checkIsFavorite}
          watchHistory={watchHistory}
        />
      )}

      {/* Cyberpunk Video Player View */}
      {activePlayer && (
        <VideoPlayerView
          anime={activePlayer.anime}
          episode={activePlayer.episode}
          allEpisodes={activePlayer.allEpisodes}
          onClose={() => {
            setActivePlayer(null);
            setWatchHistory(getWatchHistory());
          }}
          onSelectEpisode={(ep) => {
            setActivePlayer(prev => ({ ...prev, episode: ep }));
          }}
          user={user}
        />
      )}

      {/* Auth / Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
      />

    </div>
  );
}
