import { Router } from 'itty-router';
import { error, json, status } from 'itty-router-extras';

const router = Router();

// Example usage: /proxy?url=https://stream-url.m3u8&referer=https://aniwatch.to/&userAgent=Mozilla/5.0
router.get('/proxy', async (request) => {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const referer = searchParams.get('referer') || 'https://megacloud.blog';
  const userAgent = searchParams.get('userAgent') || 'Mozilla/5.0';

  if (!url) {
    return error(400, 'Missing url');
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Referer': referer,
        'User-Agent': userAgent,
      },
    });

    if (!response.ok) {
      return error(response.status, 'Upstream request failed');
    }

    // Create a new response to avoid immutable headers
    const { headers, status } = response;
    const proxyResponse = new Response(response.body, {
      headers: new Headers(headers),
      status,
    });

    // Add CORS headers
    proxyResponse.headers.set('Access-Control-Allow-Origin', '*');
    proxyResponse.headers.set('Access-Control-Allow-Methods', 'GET');

    return proxyResponse;
  } catch (err) {
    return error(500, `Proxy error: ${err.message}`);
  }
});

// 404 for everything else
router.all('*', () => error(404, 'Not Found'));

// Cloudflare Workers entry point
export default {
  async fetch(request, env, ctx) {
    return router.handle(request);
  },
};
