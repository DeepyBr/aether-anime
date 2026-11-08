// Cloudflare Pages Function: GraphQL Proxy
export async function onRequest(context) {
  const { request } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await request.text();
    const upstream = await fetch("https://api.otakulogia.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Origin": "https://otakulogia.com",
        "Referer": "https://otakulogia.com/"
      },
      body: body
    });

    const headers = new Headers(upstream.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Headers", "Content-Type");

    return new Response(upstream.body, {
      status: upstream.status,
      headers
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
}
