/**
 * Jargon Buster — Cloudflare Worker
 * ------------------------------------------------------------
 * Two jobs:
 *  1. Serve the static site from ./public (via the Workers Assets
 *     binding configured in wrangler.toml).
 *  2. Proxy /api/jargon to the upstream Corporate BS Generator API
 *     server-side, so the browser never has to deal with the
 *     upstream's CORS policy (or lack of one), and so the upstream
 *     URL can change later without a frontend redeploy.
 * ------------------------------------------------------------
 */

const UPSTREAM_URL = "https://corporatebs-generator.sameerkumar.website/";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/jargon") {
      return handleJargon(request);
    }

    // Everything else: hand off to the static asset binding.
    return env.ASSETS.fetch(request);
  }
};

async function handleJargon(request) {
  if (request.method !== "GET") {
    return json({ error: "method_not_allowed" }, 405);
  }

  try {
    const upstream = await fetch(UPSTREAM_URL, {
      headers: { accept: "application/json" },
      cf: { cacheTtl: 0, cacheEverything: false }
    });

    if (!upstream.ok) {
      return json({ error: "upstream_error", status: upstream.status }, 502);
    }

    const data = await upstream.json();

    if (!data || typeof data.phrase !== "string") {
      return json({ error: "unexpected_upstream_shape" }, 502);
    }

    return json({ phrase: data.phrase });
  } catch (err) {
    return json({ error: "upstream_unreachable" }, 502);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*"
    }
  });
}
