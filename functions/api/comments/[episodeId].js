// Cloudflare Pages Function: Comments
export async function onRequest(context) {
  const { request, params } = context;
  const episodeId = params.episodeId || "default";

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const defaultComments = [
    { id: '1', author: 'Renan_Uchiha', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Renan', text: 'Essa animação está em outro nível! Abertura lendária 🔥', timestamp: 'Há 12 min', likes: 14 },
    { id: '2', author: 'SakuraVibes', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sakura', text: 'O episódio 1 me pegou de surpresa, dublagem sensacional!', timestamp: 'Há 45 min', likes: 8 },
    { id: '3', author: 'KageLevel', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kage', text: 'Melhor player de anime que já vi, sem travamentos e com visual cyberpunk neon!', timestamp: 'Há 2 horas', likes: 29 }
  ];

  if (request.method === "POST") {
    try {
      const body = await request.json();
      const newComment = {
        id: Date.now().toString(),
        author: body.author || 'Otaku Cyber',
        avatar: body.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${body.author || Date.now()}`,
        text: body.text || '',
        timestamp: 'Agora mesmo',
        likes: 1
      };
      return new Response(JSON.stringify({ comment: newComment }), { status: 200, headers: corsHeaders });
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders });
    }
  }

  return new Response(JSON.stringify({ comments: defaultComments }), { status: 200, headers: corsHeaders });
}
