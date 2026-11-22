"use strict";

function analysisText(value, limit = 180) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, limit) : "";
}

function normaliseColour(value) {
  const match = analysisText(value).match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (!match) return "";
  return "#" + (match[1].length === 3 ? Array.from(match[1], digit => digit.repeat(2)).join("") : match[1]).toUpperCase();
}

function publicWebUrl(value, base) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value, base);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password ||
        !url.hostname.includes(".") || /^(?:\d+\.){3}\d+$/.test(url.hostname) ||
        url.hostname.endsWith(".local") || url.port) return null;
    return url;
  } catch {
    return null;
  }
}

function googleReviewUrl(value, allowMapsShare = true) {
  const text = value?.trim();
  if (!text || /\s/.test(text)) return "";
  let url;
  try { url = new URL(text.includes("://") ? text : "https://" + text); } catch { return ""; }
  if (url.protocol !== "https:" || url.port || url.username || url.password || url.href.length > 500) return "";
  const host = url.hostname;
  const shortGoogle = host === "g.page" && /^\/(?:r\/)?[^/]+\/review\/?$/i.test(url.pathname);
  const mapsShare = allowMapsShare && host === "maps.app.goo.gl" && /^\/[a-z0-9_-]+\/?$/i.test(url.pathname);
  const googleHost = ["search.google.com", "google.com", "www.google.com", "maps.google.com"].includes(host);
  const directGoogle = googleHost && /^\/local\/writereview\/?$/i.test(url.pathname) && Boolean(url.searchParams.get("placeid"));
  const mapsWrite = googleHost && /^\/maps\/place\/.*\/?data=.*!1s0x[\da-f]+:0x[\da-f]+.*!12e1(?:!|$)/i.test(url.pathname);
  return shortGoogle || mapsShare || directGoogle || mapsWrite ? url.href : "";
}

function publishedGoogleReviewLinks(content, sourceUrl) {
  const matches = new Set();
  for (const link of content.querySelectorAll("a[href]")) {
    const href = link.getAttribute("href");
    if (!/google\.|g\.page/i.test(href)) continue;
    const resolved = publicWebUrl(href, sourceUrl);
    const reviewLink = googleReviewUrl(resolved?.href, false);
    if (reviewLink) matches.add(reviewLink);
    if (matches.size >= 2) break;
  }
  return Array.from(matches);
}

function structuredBusinesses(page) {
  const candidates = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    const types = [node["@type"]].flat().map(type => String(type || "").split(/[\/#]/).pop());
    const generic = /^(WebSite|WebPage|AboutPage|ContactPage|CollectionPage|ItemPage|Product|Person|Article|ImageObject|BreadcrumbList|ListItem|PostalAddress|Place|Service)$/i;
    const type = types.find(item => /Organization|Business|Store|Restaurant|Dentist|Physician|Hotel|Salon|Clinic|Cafe|Bakery|Florist|Corporation|Shop|Studio|Lodging|GasStation|HealthClub|Optician|Pharmacy|Veterinary|Practice/i.test(item)) ||
      types.find(item => item && !generic.test(item) && (node.address || node.telephone || node.logo));
    if (type && analysisText(node.name)) {
      const score = (node.address ? 4 : 0) + (node.telephone ? 3 : 0) + (node.logo ? 2 : 0) +
        (/^(Organization|Corporation|LocalBusiness)$/.test(type) ? 1 : 2);
      candidates.push({ node, type, score });
    }
    ["@graph", "publisher", "provider", "mainEntity", "about", "department"].forEach(key => visit(node[key]));
  }
  for (const script of page.querySelectorAll('script[type="application/ld+json"]')) {
    try { visit(JSON.parse(script.textContent.trim())); } catch (error) {
      if (!(error instanceof SyntaxError || error instanceof RangeError)) throw error;
    }
  }
  return candidates.sort((first, second) => second.score - first.score);
}

function addressFields(value) {
  if (Array.isArray(value)) return addressFields(value[0]);
  if (typeof value !== "object" || !value) return { address: analysisText(value), city: "" };
  const country = typeof value.addressCountry === "object" ? value.addressCountry?.name : value.addressCountry;
  const city = analysisText(value.addressLocality, 50);
  const address = [value.streetAddress, city, value.addressRegion, value.postalCode, country]
    .map(part => analysisText(part)).filter(Boolean).join(", ");
  return { address, city };
}

function detectedPhone(value) {
  const number = analysisText(value, 45);
  return /^\+?[\d().\s-]{7,30}(?:\s*(?:ext\.?|x)\s*\d{1,8})?$/i.test(number) && number.replace(/\D/g, "").length >= 7 ? number : "";
}

function imageSource(value) {
  if (Array.isArray(value)) return imageSource(value[0]);
  return typeof value === "object" && value ? value.contentUrl || value.url : value;
}

function addressText(element) {
  const copy = element.cloneNode(true);
  for (const lineBreak of copy.querySelectorAll("br")) lineBreak.replaceWith(" ");
  return analysisText(copy.getAttribute("content") || copy.textContent);
}

function paletteFromPage(page) {
  const palette = new Set();
  const add = value => {
    const color = normaliseColour(value);
    if (color && color !== "#FFFFFF" && color !== "#000000") palette.add(color);
  };
  page.querySelectorAll('meta[name="theme-color"], meta[name="msapplication-TileColor"]').forEach(meta => add(meta.content));
  for (const style of page.querySelectorAll("style, [style*='--']")) {
    const css = style.getAttribute("style") || style.textContent;
    for (const match of css.matchAll(/--[\w-]*(?:primary|brand|accent|secondary)[\w-]*\s*:\s*(#[\da-f]{6}|#[\da-f]{3})(?=[;\s}])/gi)) {
      add(match[1]);
      if (palette.size === 2) break;
    }
    if (palette.size >= 2) break;
  }
  return Array.from(palette).slice(0, 2);
}

function websiteHighlights(content, sourceUrl) {
  const origin = new URL(sourceUrl).origin;
  const links = content.querySelectorAll("nav a[href], header a[href], a[href*='/collections/']");
  const highlights = new Map();
  for (const link of links) {
    const url = publicWebUrl(link.getAttribute("href"), sourceUrl);
    if (!url || url.origin !== origin || !/^\/(?:collections|categories|services|solutions)\/[^/]+/i.test(url.pathname)) continue;
    const label = analysisText(link.getAttribute("aria-label") || link.textContent, 55);
    if (label.length < 4 || /\d+\s*%|(?:\b(?:use )?code\s*:)|\bshop now\b/i.test(label) ||
        /^(?:view all|learn more|all products|back|home|best sellers|daily deals)$/i.test(label) ||
        highlights.has(label.toLowerCase())) continue;
    highlights.set(label.toLowerCase(), { label, url: url.href });
    if (highlights.size === 6) break;
  }
  return Array.from(highlights.values());
}

function extractWebsiteDetails(html, sourceUrl, findGoogleReviewLink) {
  const page = document.createElement("template");
  page.innerHTML = html;
  const content = page.content;
  const getMeta = (type, key) => analysisText(content.querySelector('meta[' + type + '="' + key + '"]')?.content);
  const records = structuredBusinesses(content);
  const primary = records[0] || { node: {}, type: "" };
  const businessName = analysisText(primary.node.name, 100);
  const matchingRecords = records.filter(record => analysisText(record.node.name, 100) === businessName);
  const title = analysisText(content.querySelector("title")?.textContent || getMeta("property", "og:title"), 110);
  const name = businessName || getMeta("property", "og:site_name") ||
    analysisText(title.split(/\s+[|–—-]\s+/)[0]) || new URL(sourceUrl).hostname.replace(/^www\./i, "");
  if (/^(just a moment|attention required|access denied|request blocked|checking your browser|one moment, please)\b/i.test(name)) {
    throw new Error("The website showed a browser verification or access page. Try a different public page.");
  }
  const getProperty = (key, convert) => matchingRecords.map(record => convert(record.node[key])).find(Boolean);
  const cityTag = content.querySelector('[itemprop="addressLocality"]');
  const city = getProperty("address", value => addressFields(value).city) || getMeta("property", "business:contact_data:locality") ||
    analysisText(cityTag?.getAttribute("content") || cityTag?.textContent, 50);
  const postedAddress = addressFields({
    streetAddress: getMeta("property", "business:contact_data:street_address"),
    addressLocality: getMeta("property", "business:contact_data:locality"),
    addressRegion: getMeta("property", "business:contact_data:region"),
    postalCode: getMeta("property", "business:contact_data:postal_code"),
    addressCountry: getMeta("property", "business:contact_data:country_name")
  }).address;
  const address = getProperty("address", value => addressFields(value).address) || postedAddress ||
    Array.from(content.querySelectorAll("address, [itemprop='address']")).map(addressText).find(text => /\d|\b(?:street|road|avenue|lane|floor|suite)\b/i.test(text)) || "";
  const telTag = content.querySelector('[itemprop="telephone"]');
  const phoneLinks = Array.from(content.querySelectorAll("a[href^='tel:' i]"));
  const phone = getProperty("telephone", detectedPhone) || detectedPhone(getMeta("property", "business:contact_data:phone_number")) ||
    detectedPhone(telTag?.getAttribute("content") || telTag?.textContent) ||
    phoneLinks.map(link => detectedPhone(link.getAttribute("href").slice(4))).find(Boolean) || "";
  const logoImage = content.querySelector('img[itemprop="logo"], img.custom-logo, header img[alt*="logo" i], header img[class*="logo" i]');
  const logoCandidates = [getProperty("logo", imageSource), logoImage?.getAttribute("src"), content.querySelector('link[rel~="apple-touch-icon"], link[rel~="icon"]')?.getAttribute("href")];
  const logo = logoCandidates.map(value => publicWebUrl(value, sourceUrl)).find(Boolean)?.href || "";
  const contact = Array.from(content.querySelectorAll("a[href]")).map(link => publicWebUrl(link.getAttribute("href"), sourceUrl))
    .find(url => url && url.origin === new URL(sourceUrl).origin && /\/(?:contact(?:-us)?|locations?)(?:\/|\.html?|$)/i.test(url.pathname) && url.pathname !== new URL(sourceUrl).pathname);
  const palette = paletteFromPage(content);
  const category = /^(Organization|Corporation|LocalBusiness)$/i.test(primary.type) ? "" :
    primary.type.replace(/([a-z])([A-Z])/g, "$1 $2");
  const description = [
    ...matchingRecords.map(record => record.node.description),
    getMeta("name", "description"),
    getMeta("property", "og:description"),
    ...Array.from(content.querySelectorAll("main p")).slice(0, 12).map(paragraph => paragraph.textContent)
  ].map(text => analysisText(text, 330)).find(text => text.length >= 35 &&
    !/^(?:sign in|get \d+%|enable javascript|privacy settings|we use cookies|use block text)/i.test(text)) || "";
  return {
    name: analysisText(name, 100), address, phone, city, category, logo, palette, sourceUrl,
    nameFromDomain: !businessName && !getMeta("property", "og:site_name") && !title,
    contactUrl: contact?.href || "",
    description,
    highlights: websiteHighlights(content, sourceUrl),
    googleReviewCandidates: findGoogleReviewLink ? publishedGoogleReviewLinks(content, sourceUrl) : []
  };
}

async function analyseWebsite(website, signal, findGoogleReviewLink) {
  if (location.protocol === "file:") {
    throw new Error("Live analysis needs the local ReviewFlow server. Launch Open ReviewFlow.cmd in this folder, then try again.");
  }
  async function readPage(url) {
    const endpoint = new URL("/api/analyse", location.origin);
    endpoint.searchParams.set("url", url);
    let response;
    try {
      response = await fetch(endpoint, { headers: { "X-ReviewFlow-Request": "website" }, signal });
    } catch (error) {
      if (signal.aborted) throw error;
      throw new Error("The local ReviewFlow server is unavailable. Open it again and retry.");
    }
    if (!(response.headers.get("content-type") || "").includes("application/json")) {
      throw new Error("Live analysis needs the updated ReviewFlow server. Restart it with Open ReviewFlow.cmd.");
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "The website could not be read.");
    return result;
  }
  const page = await readPage(website);
  const details = extractWebsiteDetails(page.html, page.url, findGoogleReviewLink);
  details.truncated = Boolean(page.truncated);
  if ((!details.address || !details.phone || (findGoogleReviewLink && !details.googleReviewCandidates.length)) && details.contactUrl) {
    try {
      const contact = await readPage(details.contactUrl);
      if (new URL(contact.url).origin === new URL(page.url).origin) {
        const extra = extractWebsiteDetails(contact.html, contact.url, findGoogleReviewLink);
        for (const key of ["address", "city", "phone"]) details[key] ||= extra[key];
        if (!details.googleReviewCandidates.length) details.googleReviewCandidates = extra.googleReviewCandidates;
      }
    } catch (error) {
      if (signal.aborted) throw error;
    }
  }
  return details;
}
