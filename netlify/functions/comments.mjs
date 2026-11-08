// Netlify Function: Episode Comments
const memoryComments = {
  default: [
    { id: '1', author: 'Renan_Uchiha', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Renan', text: 'Essa animação está em outro nível! Abertura lendária 🔥', timestamp: 'Há 12 min', likes: 14 },
    { id: '2', author: 'SakuraVibes', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sakura', text: 'O episódio 1 me pegou de surpresa, dublagem sensacional!', timestamp: 'Há 45 min', likes: 8 },
    { id: '3', author: 'KageLevel', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kage', text: 'Melhor player de anime que já vi, sem travamentos e com visual cyberpunk neon!', timestamp: 'Há 2 horas', likes: 29 }
  ]
};

export default async (req, context) => {
  const url = new URL(req.url);
  // Extract episode id from path e.g. /api/comments/1234
  const parts = url.pathname.split('/');
  const episodeId = parts[parts.length - 1] || 'default';

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const newComment = {
        id: Date.now().toString(),
        author: body.author || 'Otaku Cyber',
        avatar: body.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${body.author || Date.now()}`,
        text: body.text || '',
        timestamp: 'Agora mesmo',
        likes: 1
      };

      if (!memoryComments[episodeId]) {
        memoryComments[episodeId] = [...memoryComments.default];
      }
      memoryComments[episodeId].unshift(newComment);

      return new Response(JSON.stringify({ comment: newComment }), {
        status: 200,
        headers
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
    }
  }

  // GET
  const list = memoryComments[episodeId] || memoryComments.default || [];
  return new Response(JSON.stringify({ comments: list }), {
    status: 200,
    headers
  });
};

export const config = {
  path: "/api/comments/:episodeId",
};
