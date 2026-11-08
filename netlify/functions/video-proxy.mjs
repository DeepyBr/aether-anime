// Netlify Function: Video Stream Proxy with Byte-Range & CORS Support
export default async (req, context) => {
  const url = new URL(req.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('URL query parameter is required', { status: 400 });
  }

  try {
    const rangeHeader = req.headers.get('range');
    const upstreamHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://otakulogia.com/',
    };

    if (rangeHeader) {
      upstreamHeaders['Range'] = rangeHeader;
    }

    const upstreamResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: upstreamHeaders
    });

    const responseHeaders = new Headers();
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Headers', 'Range, Accept-Ranges, Content-Type');
    responseHeaders.set('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
    responseHeaders.set('Accept-Ranges', 'bytes');

    if (upstreamResponse.headers.get('content-range')) {
      responseHeaders.set('Content-Range', upstreamResponse.headers.get('content-range'));
    }
    if (upstreamResponse.headers.get('content-length')) {
      responseHeaders.set('Content-Length', upstreamResponse.headers.get('content-length'));
    }
    if (upstreamResponse.headers.get('content-type')) {
      responseHeaders.set('Content-Type', upstreamResponse.headers.get('content-type'));
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status || 200,
      headers: responseHeaders
    });
  } catch (err) {
    console.error('Video Proxy Function Error:', err);
    return new Response(`Error proxying video: ${err.message}`, { status: 502 });
  }
};

export const config = {
  path: "/api/video-proxy",
};
