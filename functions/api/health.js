// Cloudflare Pages Function: Health Check
export async function onRequest(context) {
  return new Response(JSON.stringify({
    status: "ok",
    platform: "Cloudflare Pages Edge Workers",
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
