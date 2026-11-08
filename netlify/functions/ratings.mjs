// Netlify Function: Anime Ratings
const memoryRatings = {};

export default async (req, context) => {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  const cid = parts[parts.length - 1] || 'default';

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
      const stars = Number(body.stars) || 5;

      if (!memoryRatings[cid]) {
        memoryRatings[cid] = { total: 4.9 * 128 + stars, count: 129 };
      } else {
        memoryRatings[cid].total += stars;
        memoryRatings[cid].count += 1;
      }
      const average = Number((memoryRatings[cid].total / memoryRatings[cid].count).toFixed(1));
      return new Response(JSON.stringify({ average, count: memoryRatings[cid].count }), {
        status: 200,
        headers
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
    }
  }

  // GET
  const current = memoryRatings[cid] || { average: 4.9, count: 142 };
  return new Response(JSON.stringify(current), {
    status: 200,
    headers
  });
};

export const config = {
  path: "/api/ratings/:cid",
};
