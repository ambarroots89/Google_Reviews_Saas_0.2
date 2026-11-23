const dns = require("node:dns/promises");
const http = require("node:http");
const https = require("node:https");
const net = require("node:net");

const MAX_BYTES = 2 * 1024 * 1024;

function validateUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error("Enter a valid public website URL."); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.port ||
      url.hostname.length > 253 || !url.hostname.includes(".") || net.isIP(url.hostname) ||
      /\.(?:local|internal|localhost|home|lan|test|invalid)$/i.test(url.hostname)) {
    throw new Error("Enter a public website with a standard HTTP or HTTPS address.");
  }
  return url;
}

function isPublicIPv4(address) {
  if (net.isIP(address) !== 4) return false;
  const [a, b, c] = address.split(".").map(Number);
  return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 168 || (b === 0 && [0, 2].includes(c)))) ||
    (a === 198 && ([18, 19].includes(b) || (b === 51 && c === 100))) ||
    (a === 203 && b === 0 && c === 113));
}

async function fetchPage(url) {
  let addresses;
  try { addresses = await dns.lookup(url.hostname, { all: true, family: 4 }); }
  catch { throw new Error("The website address could not be found."); }
  if (!addresses.length || addresses.some(item => !isPublicIPv4(item.address))) {
    throw new Error("Analysis is available for public websites only.");
  }
  const address = addresses[0].address;
  return new Promise((resolve, reject) => {
    const transport = url.protocol === "https:" ? https : http;
    let finished = false;
    const done = (error, value) => {
      if (finished) return;
      finished = true;
      if (error) reject(error);
      else resolve(value);
    };
    const request = transport.get(url, {
      family: 4,
      lookup: (_hostname, _options, callback) => callback(null, address, 4),
      headers: {
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Encoding": "identity",
        "User-Agent": "Mozilla/5.0 (compatible; ReviewFlow Website Analyzer/1.0)"
      }
    }, incoming => {
      const status = incoming.statusCode;
      if ([301, 302, 303, 307, 308].includes(status) && incoming.headers.location) {
        incoming.resume();
        done(null, { redirect: incoming.headers.location });
        return;
      }
      if (status < 200 || status >= 300) {
        incoming.resume();
        done(new Error("The website returned HTTP " + status + ". Try another public page."));
        return;
      }
      const contentType = incoming.headers["content-type"] || "";
      if (!/^(text\/html|application\/xhtml\+xml)(?:;|$)/i.test(contentType)) {
        incoming.resume();
        done(new Error("This URL does not point to an HTML page. Try the business homepage."));
        return;
      }
      if (incoming.headers["content-encoding"] && incoming.headers["content-encoding"] !== "identity") {
        incoming.resume();
        done(new Error("The website returned a compressed page that could not be analysed. Try another page."));
        return;
      }
      const chunks = [];
      let size = 0;
      let truncated = false;
      function complete() {
        const charset = /charset\s*=\s*["']?([\w-]+)/i.exec(contentType)?.[1] || "utf-8";
        let decoder;
        try { decoder = new TextDecoder(charset); } catch { decoder = new TextDecoder(); }
        done(null, { url: url.href, html: decoder.decode(Buffer.concat(chunks)), truncated });
      }
      incoming.on("data", chunk => {
        const remaining = MAX_BYTES - size;
        chunks.push(chunk.subarray(0, remaining));
        size += Math.min(chunk.length, remaining);
        if (chunk.length > remaining) {
          truncated = true;
          complete();
          incoming.destroy();
        }
      });
      incoming.on("end", complete);
      incoming.on("error", () => done(new Error("The website response was interrupted.")));
      incoming.on("aborted", () => done(new Error("The website response was interrupted.")));
    });
    request.setTimeout(10000, () => request.destroy(new Error("The website took too long to respond.")));
    request.on("error", () => done(new Error("Could not reach the website. Check the URL or try again shortly.")));
  });
}

module.exports = async function analyse(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "GET" || request.headers["x-reviewflow-request"] !== "website") {
    return response.status(403).json({ error: "Open ReviewFlow to analyse a website." });
  }
  try {
    if (typeof request.query.url !== "string" || request.query.url.length > 2048) {
      throw new Error("Enter a valid public website URL.");
    }
    let url = validateUrl(request.query.url);
    for (let redirects = 0; redirects <= 4; redirects++) {
      const page = await fetchPage(url);
      if (!page.redirect) {
        while (Buffer.byteLength(JSON.stringify(page), "utf8") > 4 * 1024 * 1024) {
          page.html = page.html.slice(0, Math.floor(page.html.length * 0.75));
          page.truncated = true;
        }
        return response.status(200).json(page);
      }
      url = validateUrl(new URL(page.redirect, url).href);
    }
    throw new Error("The website redirected too many times.");
  } catch (error) {
    return response.status(422).json({ error: error.message || "Could not analyse the website." });
  }
};
