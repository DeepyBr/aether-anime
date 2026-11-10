// Aether Anime API Service
const GRAPHQL_ENDPOINT = '/api/graphql';

const ANIME_FIELDS = `
  fragment AnimeFields on AnimeEntity {
    id
    upstreamCid
    name
    slug
    nameEn
    year
    status
    synopsis
    posterUrl
    audioMix
    hasNewEpisode
  }
`;

// Known category UUID mapping from Otakulogia
export const KNOWN_CATEGORY_MAP = {
  'todos': '4e0c4509-cbb0-486e-a52d-dcf3fe56e479',
  'anime': '4e0c4509-cbb0-486e-a52d-dcf3fe56e479',
  'acao': '9a80b0f2-5896-4abd-a105-7fc3e2e0f48a',
  'shounen': 'af8eae0b-fbd3-4e7d-960d-1c1d0204800c',
  'fantasia': '1c890a6c-19b3-49d6-a097-5006278a70bf',
  'comedia': '4956b3e5-e7cf-481d-a141-832f373996d3',
  'aventura': 'c964eea3-982e-452b-b051-e4d623062c7a',
  'drama': 'f0d67389-713e-4435-92e5-853afc5a862a',
  'romance': '5fedbc0f-b98e-4453-b58b-de9d426a5df0',
  'sci-fi': '2d7696bd-f9b6-433b-ba8e-2142a4cd13ac',
  'sobrenatural': '576ecaab-e9dd-4b94-adc5-64469f34bdc8',
  'slice-of-life': '9df54cd1-f942-4148-979e-1bdd372b028a',
  'misterio': '6a70c2f3-bbad-4895-a1a5-166d26aecbca',
  'ecchi': '3bdcc72f-1d43-4db1-9eec-e019249d2d96',
  'mecha': 'ab8762c1-1da4-4f4f-a7dc-6b92cd69f3c6',
  'musica': '0b305961-feef-4f44-bc83-0e4620bfe725',
  'esportes': 'cc84a244-ece6-4eec-9f76-f71e290c0151',
  'shoujo': '40ed1c9d-60d4-44ce-b45f-176d507502f6',
  'dub': '88443a9f-0639-4e53-b29d-6bd928564283',
  'dublado': '88443a9f-0639-4e53-b29d-6bd928564283',
  'filme': '56b338d8-963f-4d4c-a4d8-49ad1b399397',
  'filme-2': '56b338d8-963f-4d4c-a4d8-49ad1b399397',
  'dong': 'bcbdf77a-b82d-4d9a-8324-7e1563704f54',
  'desen': '6af0da05-90f9-4a17-b697-97223198656d',
  'recentes': 'recentes',
  'atualizados': 'atualizados'
};

// Helper for GraphQL queries via our backend proxy
export async function fetchGraphQL(query, variables = {}) {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error('FetchGraphQL Error:', err);
    return null;
  }
}

// 1. Fetch Home Highlights
export async function getHomeHighlights() {
  const query = `
    ${ANIME_FIELDS}
    query HomeHighlights($input: HomeHighlightsInput) {
      homeHighlights(input: $input) {
        ...AnimeFields
      }
    }
  `;
  const res = await fetchGraphQL(query);
  if (res && res.homeHighlights && res.homeHighlights.length > 0) {
    return res.homeHighlights;
  }
  return await searchAnimes("", 12, 0);
}

// 2. Fetch Navigation Categories
export async function getNavCategories() {
  const query = `
    fragment CategoryFields on CategoryEntity {
      id
      kind
      name
      slug
      animeCount
    }
    query NavCategories {
      navCategories {
        key
        category {
          ...CategoryFields
        }
      }
    }
  `;
  const res = await fetchGraphQL(query);
  if (res && res.navCategories && res.navCategories.length > 0) {
    return res.navCategories.map(item => item.category);
  }
  return FALLBACK_CATEGORIES;
}

// 3. Unified Catalog Fetcher with Pagination (access to all 4,352+ animes)
export async function getCatalogAnimes({
  category = 'todos',
  searchQuery = '',
  letter = '',
  limit = 30,
  offset = 0
} = {}) {
  // If user searched for text or clicked a specific letter (A-Z)
  const effectiveQuery = searchQuery.trim() || (letter && letter !== 'TODOS' ? letter : '');
  
  if (effectiveQuery) {
    const searchRes = await searchAnimesWithMeta(effectiveQuery, limit, offset);
    return searchRes;
  }

  // If user requested recent updates / releases
  if (category === 'recentes' || category === 'atualizados') {
    const recent = await getLatestReleases(limit, offset);
    if (recent && recent.items && recent.items.length > 0) {
      return recent;
    }
  }

  // If a specific genre or audio/format category is selected
  const categoryId = KNOWN_CATEGORY_MAP[category];

  if (categoryId && category !== 'todos') {
    const query = `
      ${ANIME_FIELDS}
      query AnimesByCategory($input: AnimesByCategoryInput!) {
        animesByCategory(input: $input) {
          total
          offset
          limit
          items {
            ...AnimeFields
          }
        }
      }
    `;
    const res = await fetchGraphQL(query, {
      input: { categoryId, limit, offset }
    });
    if (res && res.animesByCategory) {
      return res.animesByCategory;
    }
  }

  // Default: Browse entire 4,352 anime database
  return await searchAnimesWithMeta('', limit, offset);
}

// 4. Search with metadata (total, offset, limit, items)
export async function searchAnimesWithMeta(searchQuery = '', limit = 30, offset = 0) {
  const query = `
    ${ANIME_FIELDS}
    query SearchAnimes($input: SearchAnimesInput) {
      searchAnimes(input: $input) {
        total
        offset
        limit
        items {
          ...AnimeFields
        }
      }
    }
  `;
  const res = await fetchGraphQL(query, {
    input: { query: searchQuery, limit, offset }
  });
  if (res && res.searchAnimes) {
    return res.searchAnimes;
  }
  return { total: FALLBACK_HIGHLIGHTS.length, offset: 0, limit, items: FALLBACK_HIGHLIGHTS };
}

// 5. Quick Search (returns items array)
export async function searchAnimes(searchQuery, limit = 24, offset = 0) {
  const data = await searchAnimesWithMeta(searchQuery, limit, offset);
  return data.items || [];
}

// 6. Fetch Animes by Category Slug/ID (for shelves)
export async function getAnimesByCategory(categoryIdentifier, limit = 20, offset = 0) {
  const categoryId = KNOWN_CATEGORY_MAP[categoryIdentifier] || categoryIdentifier;

  if (categoryId && categoryId.includes('-')) {
    const query = `
      ${ANIME_FIELDS}
      query AnimesByCategory($input: AnimesByCategoryInput!) {
        animesByCategory(input: $input) {
          total
          offset
          limit
          items {
            ...AnimeFields
          }
        }
      }
    `;
    const res = await fetchGraphQL(query, {
      input: { categoryId, limit, offset }
    });
    if (res && res.animesByCategory && res.animesByCategory.items && res.animesByCategory.items.length > 0) {
      return res.animesByCategory;
    }
  }

  const items = await searchAnimes(categoryIdentifier === 'todos' ? '' : categoryIdentifier, limit, offset);
  return { total: items.length, items };
}

// 7. Fetch Full Anime Catalog Detail with Seasons & Episodes
export async function getAnimeCatalogDetail(upstreamCid, upstreamTid = null) {
  const query = `
    ${ANIME_FIELDS}
    query AnimeCatalogDetail($upstreamCid: Int!, $upstreamTid: Int) {
      animeCatalogDetail(
        upstreamCid: $upstreamCid
        upstreamTid: $upstreamTid
      ) {
        anime {
          ...AnimeFields
        }
        seasons {
          id
          upstreamTid
          name
          slug
          imageUrl
          audioType
          year
          status
          synopsis
        }
        episodes {
          id
          upstreamId
          title
          slug
          episodeNumber
          upstreamTempId
          description
          videoUrl
          videoUrlFhd
          videoUrlSd
          thumbnailLarge
          thumbnailSmall
          videoType
          audioType
          isNew
        }
      }
    }
  `;
  const res = await fetchGraphQL(query, { upstreamCid: Number(upstreamCid), upstreamTid });
  if (res && res.animeCatalogDetail) {
    return res.animeCatalogDetail;
  }
  return null;
}

// 8. Video Stream Proxy
export function getVideoProxyUrl(originalUrl) {
  if (!originalUrl) return '';
  return `/api/video-proxy?url=${encodeURIComponent(originalUrl)}`;
}

// 9. Comments
export async function getComments(episodeId) {
  try {
    const res = await fetch(`/api/comments/${episodeId || 'default'}`);
    const data = await res.json();
    return data.comments || [];
  } catch {
    return [];
  }
}

export async function addComment(episodeId, commentData) {
  try {
    const res = await fetch(`/api/comments/${episodeId || 'default'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData)
    });
    return await res.json();
  } catch {
    return null;
  }
}

// 10. Ratings
export async function getAnimeRating(cid) {
  try {
    const res = await fetch(`/api/ratings/${cid}`);
    return await res.json();
  } catch {
    return { average: 4.9, count: 120 };
  }
}

export async function submitAnimeRating(cid, stars) {
  try {
    const res = await fetch(`/api/ratings/${cid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stars })
    });
    return await res.json();
  } catch {
    return null;
  }
}

// 11. Fetch Latest Released Episodes (raw newly released episodes)
export async function getLatestEpisodes() {
  const query = `
    query LatestVideos {
      LatestVideos
    }
  `;
  const res = await fetchGraphQL(query);
  if (res && res.LatestVideos) {
    const key = Object.keys(res.LatestVideos)[0];
    const rawList = res.LatestVideos[key] || [];
    return rawList.map(item => {
      const match = (item.video_thumbnail_b || '').match(/_c(\d+)\./);
      const upstreamCid = match ? Number(match[1]) : null;
      return {
        id: item.id,
        upstreamId: Number(item.id),
        upstreamCid,
        animeName: item.category_name,
        animeNameEn: item.category_name_en,
        episodeTitle: item.video_title,
        episodeLabel: item.video_ep,
        seasonName: item.temp_name,
        audioType: item.audio_type || (item.video_ep?.includes('DUB') ? 'DUB' : 'LEG'),
        thumbnail: item.video_thumbnail_b,
        type: item.type
      };
    });
  }
  return [];
}

// 12. Fetch Latest Updated Animes (animes with new episodes released)
export async function getLatestReleases(limit = 24, offset = 0) {
  const query = `
    ${ANIME_FIELDS}
    query LatestReleases($input: LatestReleasesInput) {
      latestReleases(input: $input) {
        total
        offset
        limit
        items {
          ...AnimeFields
        }
      }
    }
  `;
  const res = await fetchGraphQL(query, { input: { limit, offset } });
  if (res && res.latestReleases && res.latestReleases.items) {
    return res.latestReleases;
  }
  return { total: 0, items: [] };
}

// 13. Local Storage Management (Favorites & History)
const FAVORITES_KEY = 'aether_anime_my_list';
const HISTORY_KEY = 'aether_anime_watch_history';
const USER_KEY = 'aether_anime_user';

export function getMyList() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

export function isAnimeInMyList(upstreamCid) {
  const list = getMyList();
  return list.some(item => item.upstreamCid === upstreamCid);
}

export function toggleMyList(anime) {
  const list = getMyList();
  const exists = list.some(item => item.upstreamCid === anime.upstreamCid);
  let updated;
  if (exists) {
    updated = list.filter(item => item.upstreamCid !== anime.upstreamCid);
  } else {
    updated = [anime, ...list];
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return !exists;
}

export function getWatchHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveWatchProgress(anime, episode, currentTime, duration) {
  const history = getWatchHistory();
  const progressPercent = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
  
  const entry = {
    animeCid: anime.upstreamCid,
    animeName: anime.name,
    animeSlug: anime.slug,
    posterUrl: anime.posterUrl,
    episodeId: episode.upstreamId,
    episodeTitle: episode.title,
    episodeNumber: episode.episodeNumber,
    currentTime: Math.floor(currentTime),
    duration: Math.floor(duration),
    progressPercent,
    completed: progressPercent >= 90,
    updatedAt: Date.now()
  };

  const filtered = history.filter(h => h.animeCid !== anime.upstreamCid);
  const updated = [entry, ...filtered].slice(0, 30);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return entry;
}

export function getUserProfile() {
  try {
    const u = JSON.parse(localStorage.getItem(USER_KEY));
    if (u) return u;
  } catch {}
  return {
    name: 'Otaku Pilot',
    email: 'pilot@aether.app',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AetherOtaku'
  };
}

export function saveUserProfile(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Built-in backup data
const FALLBACK_HIGHLIGHTS = [
  {
    upstreamCid: 34150,
    name: "Solo Leveling",
    slug: "solo-leveling",
    year: 2024,
    status: "Concluído",
    synopsis: "Dizem que tudo o que não o mata o torna mais forte, mas esse não é o caso do caçador mais fraco do mundo, Seong Jin-U. Agora, ele está inspirado a descobrir os segredos por trás de seus novos poderes cósmicos.",
    posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png",
    audioMix: "DUB,LEG",
    hasNewEpisode: true
  },
  {
    upstreamCid: 649,
    name: "NARUTO Shippuuden",
    slug: "naruto-shippuuden",
    year: 2007,
    status: "Concluído",
    synopsis: "Naruto: Shippuuden é a continuação épica da jornada shinobi de Naruto Uzumaki, retornando mais forte para defender seus laços e salvar seu amigo Sasuke das sombras.",
    posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1735-kGfVm0YqCPcu.png",
    audioMix: "DUB",
    hasNewEpisode: false
  },
  {
    upstreamCid: 21,
    name: "One Piece",
    slug: "one-piece",
    year: 1999,
    status: "Em Lançamento",
    synopsis: "Houve um homem que conquistou tudo aquilo que o mundo tinha a oferecer: Gol D. Roger, o Rei dos Piratas. Monkey D. Luffy navega pela Grand Line em busca do tesouro supremo.",
    posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YCDanmKjWdn8.jpg",
    audioMix: "DUB,LEG",
    hasNewEpisode: true
  }
];

export const FALLBACK_CATEGORIES = [
  { id: '4e0c4509-cbb0-486e-a52d-dcf3fe56e479', name: 'Todos', slug: 'todos', animeCount: 4352 },
  { id: '9a80b0f2-5896-4abd-a105-7fc3e2e0f48a', name: 'Ação', slug: 'acao', animeCount: 2035 },
  { id: 'af8eae0b-fbd3-4e7d-960d-1c1d0204800c', name: 'Shounen', slug: 'shounen', animeCount: 1691 },
  { id: '1c890a6c-19b3-49d6-a097-5006278a70bf', name: 'Fantasia', slug: 'fantasia', animeCount: 1652 },
  { id: '4956b3e5-e7cf-481d-a141-832f373996d3', name: 'Comédia', slug: 'comedia', animeCount: 1488 },
  { id: 'c964eea3-982e-452b-b051-e4d623062c7a', name: 'Aventura', slug: 'aventura', animeCount: 1182 },
  { id: 'f0d67389-713e-4435-92e5-853afc5a862a', name: 'Drama', slug: 'drama', animeCount: 1053 },
  { id: '5fedbc0f-b98e-4453-b58b-de9d426a5df0', name: 'Romance', slug: 'romance', animeCount: 872 },
  { id: '2d7696bd-f9b6-433b-ba8e-2142a4cd13ac', name: 'Sci-Fi', slug: 'sci-fi', animeCount: 774 },
  { id: '576ecaab-e9dd-4b94-adc5-64469f34bdc8', name: 'Sobrenatural', slug: 'sobrenatural', animeCount: 707 },
  { id: '9df54cd1-f942-4148-979e-1bdd372b028a', name: 'Slice of Life', slug: 'slice-of-life', animeCount: 679 },
  { id: '88443a9f-0639-4e53-b29d-6bd928564283', name: 'Dublados', slug: 'dub', animeCount: 493 },
  { id: '6a70c2f3-bbad-4895-a1a5-166d26aecbca', name: 'Mistério', slug: 'misterio', animeCount: 334 },
  { id: '56b338d8-963f-4d4c-a4d8-49ad1b399397', name: 'Filmes', slug: 'filme-2', animeCount: 315 },
  { id: 'bcbdf77a-b82d-4d9a-8324-7e1563704f54', name: 'Donghuas', slug: 'dong', animeCount: 281 },
  { id: '3bdcc72f-1d43-4db1-9eec-e019249d2d96', name: 'Ecchi', slug: 'ecchi', animeCount: 292 },
  { id: 'ab8762c1-1da4-4f4f-a7dc-6b92cd69f3c6', name: 'Mecha', slug: 'mecha', animeCount: 219 },
  { id: '0b305961-feef-4f44-bc83-0e4620bfe725', name: 'Música', slug: 'musica', animeCount: 155 },
  { id: 'cc84a244-ece6-4eec-9f76-f71e290c0151', name: 'Esportes', slug: 'esportes', animeCount: 148 },
  { id: '40ed1c9d-60d4-44ce-b45f-176d507502f6', name: 'Shoujo', slug: 'shoujo', animeCount: 86 }
];
