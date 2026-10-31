/**
 * Lumina 24-Hour Cafe - Cloudflare Edge Worker CDN Router
 * Target: 50,000 Concurrent Mobile Users Global Edge Optimization
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    // 1. REAL-TIME API & WEBSOCKET: Always Bypass Edge Cache & Add Security Headers
    if (pathname.startsWith('/api/') || pathname.startsWith('/ws')) {
      const originResponse = await fetch(request);
      const newHeaders = new Headers(originResponse.headers);

      // Disable caching for sensitive state, sessions, and payments
      newHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      newHeaders.set('Pragma', 'no-cache');
      newHeaders.set('X-Edge-Origin-Time', new Date().toISOString());
      newHeaders.set('X-Lumina-Node', 'edge-router-bkk-01');

      return new Response(originResponse.body, {
        status: originResponse.status,
        statusText: originResponse.statusText,
        headers: newHeaders,
      });
    }

    // 2. 3D GLTF/Three.js ASSETS & STATIC ASSETS: Cache aggressively at edge
    if (pathname.match(/\.(glb|gltf|bin|png|jpg|webp|svg|woff2|css|js)$/)) {
      const cache = caches.default;
      let response = await cache.match(request);

      if (!response) {
        response = await fetch(request);
        const headers = new Headers(response.headers);

        // 1 Year Cache for static immutable bundles
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('CF-Cache-Status', 'MISS');
        headers.set('Access-Control-Allow-Origin', '*');

        response = new Response(response.body, { ...response, headers });
        ctx.waitUntil(cache.put(request, response.clone()));
      }

      return response;
    }

    // 3. DEFAULT HTML & APP SHELL: Stale-While-Revalidate
    const response = await fetch(request);
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');
    return new Response(response.body, { ...response, headers });
  },
};
