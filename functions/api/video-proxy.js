// Cloudflare Pages Function: Video Stream Proxy with Byte-Range & CORS
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return new Response("URL parameter required", { status: 400 });
  }

  try {
    const range = request.headers.get("range");
    const upstreamHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://otakulogia.com/"
    };
    if (range) {
      upstreamHeaders["Range"] = range;
    }

    const upstream = await fetch(targetUrl, {
      method: "GET",
      headers: upstreamHeaders
    });

    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Headers", "Range, Accept-Ranges, Content-Type");
    headers.set("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
    headers.set("Accept-Ranges", "bytes");

    if (upstream.headers.get("content-range")) {
      headers.set("Content-Range", upstream.headers.get("content-range"));
    }
    if (upstream.headers.get("content-length")) {
      headers.set("Content-Length", upstream.headers.get("content-length"));
    }
    if (upstream.headers.get("content-type")) {
      headers.set("Content-Type", upstream.headers.get("content-type"));
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers
    });
  } catch (err) {
    return new Response("Error streaming video: " + err.message, { status: 502 });
  }
}
