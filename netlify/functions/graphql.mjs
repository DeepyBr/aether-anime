// Netlify Function: GraphQL Proxy
export default async (req, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    const body = await req.json();
    const upstreamRes = await fetch('https://api.otakulogia.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://otakulogia.com',
        'Referer': 'https://otakulogia.com/'
      },
      body: JSON.stringify(body)
    });

    const data = await upstreamRes.text();
    return new Response(data, {
      status: upstreamRes.status,
      headers
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 502, headers });
  }
};

export const config = {
  path: "/.netlify/functions/graphql",
};
