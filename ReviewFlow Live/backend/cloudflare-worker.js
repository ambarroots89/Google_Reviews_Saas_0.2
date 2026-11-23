const MAX_HTML_BYTES = 5 * 1024 * 1024;

function json(data, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function publicWebsite(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error("Enter a valid public website URL."); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.port ||
      url.hostname.length > 253 || !url.hostname.includes(".") ||
      /^(?:\d+\.){3}\d+$/.test(url.hostname) || url.hostname.includes(":") ||
      /\.(?:local|internal|localhost|home|lan|test|invalid)$/i.test(url.hostname)) {
    throw new Error("Enter a public website with a standard HTTP or HTTPS address.");
  }
  return url;
}

async function analyse(value) {
  if (!value || value.length > 2048) throw new Error("Enter a valid website URL.");
  let url = publicWebsite(value);
  for (let redirect = 0; redirect <= 4; redirect++) {
    const response = await fetch(url.href, {
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
      headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": "Mozilla/5.0 (compatible; ReviewFlow Website Analyzer/1.0)" }
    });
    if ([301, 302, 303, 307, 308].includes(response.status) && response.headers.has("location")) {
      url = publicWebsite(new URL(response.headers.get("location"), url).href);
      continue;
    }
    if (!response.ok) throw new Error("The website returned HTTP " + response.status + ". Try another public page.");
    const contentType = response.headers.get("content-type") || "";
    if (!/^(text\/html|application\/xhtml\+xml)(;|$)/i.test(contentType)) {
      throw new Error("This URL does not point to an HTML page. Try the business homepage.");
    }
    if (!response.body) throw new Error("The website returned an empty page.");
    const reader = response.body.getReader();
    const chunks = [];
    let total = 0;
    let truncated = false;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const remaining = MAX_HTML_BYTES - total;
        if (value.length > remaining) {
          chunks.push(value.subarray(0, remaining));
          total += remaining;
          truncated = true;
          break;
        }
        chunks.push(value);
        total += value.length;
      }
    } finally {
      if (truncated) await reader.cancel();
      reader.releaseLock();
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const charset = /charset\s*=\s*["']?([\w-]+)/i.exec(contentType)?.[1] || "utf-8";
    let decoder;
    try { decoder = new TextDecoder(charset); } catch { decoder = new TextDecoder(); }
    return { url: url.href, html: decoder.decode(bytes), truncated };
  }
  throw new Error("The website redirected too many times.");
}

function encodeLink(hash) {
  const bytes = new TextEncoder().encode(hash);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeLink(id) {
  if (!/^[A-Za-z0-9_-]{1,2000}$/.test(id)) throw new Error("Customer page not found.");
  const binary = atob(id.replace(/-/g, "+").replace(/_/g, "/"));
  const hash = new TextDecoder().decode(Uint8Array.from(binary, character => character.charCodeAt(0)));
  if (!hash.startsWith("#review/") || hash.length > 1200) throw new Error("Customer page not found.");
  return hash;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/preview-address") return json({ origin: url.origin, publicDemo: true });
    if (url.pathname === "/api/analyse") {
      if (request.method !== "GET" || request.headers.get("X-ReviewFlow-Request") !== "website") {
        return json({ error: "Open ReviewFlow to analyse a website." }, 403);
      }
      try { return json(await analyse(url.searchParams.get("url"))); }
      catch (error) { return json({ error: error.message || "Could not reach the website." }, 422); }
    }
    if (url.pathname === "/api/customer-link") {
      try {
        const data = url.searchParams.get("data");
        if (data !== null) {
          if (request.headers.get("X-ReviewFlow-Request") !== "customer-link" || !data.startsWith("#review/") || data.length > 1200) {
            return json({ error: "Invalid customer page." }, 400);
          }
          return json({ id: encodeLink(data) });
        }
        return json({ hash: decodeLink(url.searchParams.get("id") || "") });
      } catch { return json({ error: "Customer page not found." }, 404); }
    }
    if (url.pathname === "/phone") {
      const asset = new URL("/", url);
      return env.ASSETS.fetch(new Request(asset, request));
    }
    return env.ASSETS.fetch(request);
  }
};
