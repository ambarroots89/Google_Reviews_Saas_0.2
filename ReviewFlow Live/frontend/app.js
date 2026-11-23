"use strict";

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const icons = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/><circle cx="9" cy="7" r="4"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.2-3 4m.1 3h.01"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m-13 5a21 21 0 0 0 18 0m-9 1v2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  sparkle: '<path d="M10 2c0 5-2 7-7 7 5 0 7 2 7 7 0-5 2-7 7-7-5 0-7-2-7-7Zm8 12c0 2.7-1.3 4-4 4 2.7 0 4 1.3 4 4 0-2.7 1.3-4 4-4-2.7 0-4-1.3-4-4Z"/>',
  qr: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><path d="M15 15h3v3h3v3m-6 0v-2m6-5h.01"/>',
  star: '<path d="m12 3 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3L3 9.6l6.2-.9z"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  success: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  pin: '<path d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  link: '<path d="M10 13a4 4 0 0 0 6 .5l4-4a4.2 4.2 0 0 0-6-6l-2 2m2 5.5a4 4 0 0 0-6-.5l-4 4a4.2 4.2 0 0 0 6 6l2-2"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  eye: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.6"/>',
  edit: '<path d="M12 20H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h10m-4 13 1-4 6-7a2 2 0 0 1 3 3l-7 7-3 1Z"/>'
};

const sampleBusiness = {
  id: "royal-gold-jewellery",
  sample: true,
  name: "Royal Gold Jewellery",
  profile: "Royal Gold Jewellery, Kolkata",
  city: "Kolkata",
  address: "12 Park Street, Kolkata, West Bengal 700016",
  phone: "+91 33 4000 1280",
  category: "Jewellery store",
  rating: "3.8",
  palette: ["#C6A253", "#142439"]
};

const clients = [
  { name: "Bloom Dental Studio", initials: "BD", colour: "", category: "Dental clinic", status: "Active", reviews: 64 },
  { name: "The Sunday Table", initials: "ST", colour: "peach", category: "Restaurant", status: "Active", reviews: 38 },
  { name: "Forma Pilates", initials: "FP", colour: "blue", category: "Fitness studio", status: "Draft", reviews: 0 }
];
const sampleVisits = ["Shopping for jewellery", "Browsing the collection", "Repair or custom work", "Something else"];
const standardVisits = ["Buying a product", "Using a service", "Making an enquiry", "Something else"];
const ratings = ["Very poor", "Poor", "Okay", "Good", "Excellent"];
const questionBank = [
  "What brought you to this business?",
  "How would you describe your overall experience?",
  "What else would you like to share?",
  "What product did you choose or explore?",
  "How did the product meet your expectations?",
  "How was your experience choosing or ordering?",
  "What service did you use?",
  "How did the service meet your expectations?",
  "How was your experience communicating with the team?",
  "What did you order or try?",
  "How would you describe the food or drinks?",
  "How was your experience at the restaurant?",
  "What kind of appointment or care did you receive?",
  "How was your experience during your appointment?",
  "How was the information or guidance you received?",
  "What treatment or service did you book?",
  "How would you describe your experience with the service?",
  "How was your experience booking or visiting?",
  "What were you looking to create or achieve?",
  "How did the result compare with what you expected?"
];

function recommendedQuestions(business) {
  const text = [business.name, business.category, business.description,
    ...(business.highlights || []).map(item => item.label)].join(" ").toLowerCase();
  if (/\b(dental|dentist|clinic|hospital|healthcare|medical|doctor|physician)\b/.test(text)) return [12, 13, 14];
  if (/\b(restaurant|cafe|café|bakery|dining|food|coffee|catering)\b/.test(text)) return [9, 10, 11];
  if (/\b(salon|spa|beauty|barber|hair|cosmetic)\b/.test(text)) return [15, 16, 17];
  if (/\b(agency|design studio|marketing|printing|custom print|print shop|photography|software)\b/.test(text)) return [18, 19, 8];
  if (/\b(store|shop|retail|jewell?ery|earbuds|headphones|electronics|apparel|fashion|products)\b/.test(text)) return [3, 4, 5];
  if (/\b(service|repair|cleaning|plumbing|consulting|consultancy)\b/.test(text)) return [6, 7, 8];
  return [0, 1, 2];
}

function selectedQuestions(business) {
  const ids = business.questions;
  return Array.isArray(ids) && ids.length === 3 && ids.every(id => Number.isInteger(id) && id >= 0 && id < questionBank.length)
    ? ids : recommendedQuestions(business);
}
const sampleWebsite = "https://royalgoldjewellery.example";
const savedKey = "reviewflow.clients.v2";
const demoStorage = {
  read() {
    try {
      const saved = JSON.parse(localStorage.getItem(savedKey) || "[]");
      if (!Array.isArray(saved)) return [];
      if (localStorage.getItem("reviewflow.royal-gold.ready") === "true" && !saved.some(entry => entry.id === sampleBusiness.id)) {
        saved.unshift(sampleBusiness);
      }
      return saved;
    } catch { return []; }
  },
  save(entries) {
    try { localStorage.setItem(savedKey, JSON.stringify(entries)); } catch { /* The current session still works. */ }
  }
};
let savedClients = demoStorage.read();
const setup = { stage: "website", website: "", query: "", selected: true, business: null, error: "", run: 0, request: null };
const googleReviewLinksEnabled = false;
let quickGoogleUrl = "";
const sharedCustomerDemo = location.pathname === "/phone";
const localPreview = location.protocol === "file:" || location.hostname === "localhost" || location.hostname.startsWith("127.") || location.hostname === "[::1]";
let previewOrigin = "";
let publicPhoneDemo = false;
let shortCustomerLink = "";
let shortCustomerTarget = "";
let customerLinkError = "";
let loadingCustomerPage = sharedCustomerDemo && new URLSearchParams(location.search).has("id");
let previewAddressPending = !sharedCustomerDemo && location.protocol !== "file:";
let customer = { answers: ["", 0, ""], draft: "", question: 0, run: 0 };
let previewMode = false;
let toastTimer;

function icon(name, size = "") {
  return `<svg class="icon ${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function businessSlug(name) {
  return name.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 65) || "business";
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => Array.from(word)[0]).join("").toUpperCase();
}

function reviewHash(business) {
  if (business.sample && !business.questions) return "#review/royal-gold-jewellery";
  const params = new URLSearchParams({ name: business.name });
  if (business.city) params.set("city", business.city.slice(0, 45));
  if (business.palette?.[0]) params.set("color", business.palette[0].slice(1));
  const logo = publicWebUrl(business.logo);
  if (logo && logo.href.length <= 200) params.set("logo", logo.href);
  if (business.questions) params.set("questions", business.questions.join("-"));
  return `#review/${businessSlug(business.name)}?${params}`;
}

function reviewUrl(business) {
  const base = previewOrigin ? new URL(publicPhoneDemo ? "/phone" : location.pathname + location.search, previewOrigin) : location.href;
  if (shortCustomerLink && shortCustomerTarget === reviewHash(business) && previewOrigin) return previewOrigin + "/phone?id=" + shortCustomerLink;
  return new URL(reviewHash(business), base).href;
}

async function prepareCustomerLink() {
  if (!setup.business || location.protocol === "file:" || !previewOrigin) return;
  const target = reviewHash(setup.business);
  if (target === shortCustomerTarget && shortCustomerLink) return;
  customerLinkError = "";
  try {
    const endpoint = new URL("/api/customer-link", location.origin);
    endpoint.searchParams.set("data", target);
    const response = await fetch(endpoint, { headers: { "X-ReviewFlow-Request": "customer-link" } });
    if (!response.ok) throw new Error("Could not create the link.");
    const { id } = await response.json();
    if (!/^[A-Za-z0-9_-]{1,1600}$/.test(id)) throw new Error("Could not create the link.");
    if (!setup.business || reviewHash(setup.business) !== target) return;
    shortCustomerLink = id;
    shortCustomerTarget = target;
    if (currentView() === "setup" && setup.stage === "complete") render();
  } catch {
    if (setup.business && reviewHash(setup.business) === target) {
      customerLinkError = "Could not create the phone link. Check that ReviewFlow is running, then retry.";
      if (currentView() === "setup" && setup.stage === "complete") render();
    }
  }
}

async function openShortCustomerLink() {
  const id = new URLSearchParams(location.search).get("id");
  if (!sharedCustomerDemo || id === null) return;
  try {
    if (!/^[A-Za-z0-9_-]{1,1600}$/.test(id)) throw new Error("This review page is unavailable.");
    const response = await fetch("/api/customer-link?id=" + id);
    if (!response.ok) throw new Error("This review page is unavailable.");
    const data = await response.json();
    if (typeof data.hash !== "string" || !data.hash.startsWith("#review/")) throw new Error("This review page is unavailable.");
    loadingCustomerPage = false;
    if (location.hash === data.hash) render();
    location.hash = data.hash;
  } catch {
    app.innerHTML = '<section class="customer"><div class="customer-card"><div class="customer-body"><h1>Review page unavailable</h1><p>Please ask the business for a new QR code.</p></div></div></section>';
  }
}
function canScanPreview() {
  return Boolean(previewOrigin) || !localPreview;
}

async function loadPreviewAddress() {
  if (!previewAddressPending) return;
  const oldOrigin = previewOrigin;
  const oldPublicPhoneDemo = publicPhoneDemo;
  try {
    const response = await fetch("/api/preview-address", { signal: AbortSignal.timeout(4500) });
    if (response.ok) {
      const { origin, publicDemo } = await response.json();
      if (origin && /^https?:\/\/[^/]+$/.test(origin) && (localPreview || publicDemo)) {
        previewOrigin = origin;
        publicPhoneDemo = Boolean(publicDemo);
      }
    }
  } catch { /* Same-device preview remains available. */ }
  previewAddressPending = false;
  if (currentView() === "setup" && setup.stage === "complete" &&
      (previewOrigin !== oldOrigin || publicPhoneDemo !== oldPublicPhoneDemo || !canScanPreview())) render();
  if (currentView() === "setup" && setup.stage === "complete") prepareCustomerLink();
}

function customerBusiness() {
  if (location.hash === reviewHash(sampleBusiness) || (sharedCustomerDemo && !location.hash.startsWith("#review/"))) return sampleBusiness;
  const params = new URLSearchParams(location.hash.split("?")[1]);
  const questionParam = params.get("questions");
  const questionIds = questionParam && /^\d{1,2}(?:-\d{1,2}){2}$/.test(questionParam)
    ? questionParam.split("-").map(Number) : null;
  return {
    name: analysisText(params.get("name"), 100) || "This business",
    city: analysisText(params.get("city"), 45),
    palette: [normaliseColour("#" + params.get("color"))].filter(Boolean),
    logo: publicWebUrl(params.get("logo"))?.href || "",
    questions: questionIds && questionIds.every(id => id < questionBank.length) ? questionIds : null
  };
}

function businessLogo(business, allowImage = true) {
  const logo = allowImage ? publicWebUrl(business.logo) : null;
  return `<span class="royal-logo" aria-hidden="true">${escapeHtml(initials(business.name))}${logo ? `<img src="${escapeHtml(logo.href)}" alt="" referrerpolicy="no-referrer">` : ""}</span>`;
}

function brand(classes = "") {
  return `<a class="brand ${classes}" href="#dashboard" aria-label="ReviewFlow dashboard"><img src="assets/mark.svg?v=2" alt=""><span>ReviewFlow</span></a>`;
}

function button(label, action, style = "primary", symbol = "") {
  return `<button class="btn btn-${style}" type="button" data-action="${action}">${symbol ? icon(symbol, "small") : ""}${label}</button>`;
}

function dashboardLink(label, style = "text") {
  return `<a class="btn btn-${style}" href="#dashboard">${label}</a>`;
}

function currentView() {
  if (sharedCustomerDemo || location.hash.startsWith("#review/")) return "customer";
  if (location.hash === "#setup") return "setup";
  if (googleReviewLinksEnabled && location.hash === "#google-qr") return "google-qr";
  return location.hash === "#clients" ? "clients" : "dashboard";
}

function workspaceRays() {
  return `<div class="ambient-rays" aria-hidden="true"><svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="ray-gradient" x1="0" x2="1" y1="1" y2="0"><stop stop-color="#994e85" stop-opacity="0"/><stop offset=".52" stop-color="#e699bb" stop-opacity=".7"/><stop offset="1" stop-color="#9d79c6" stop-opacity="0"/></linearGradient><filter id="ray-glow"><feGaussianBlur stdDeviation="5"/></filter></defs><g fill="none" stroke="url(#ray-gradient)"><g class="ray ray-one"><path d="M-180 780 C240 400 340 930 800 520 S1200 230 1660 130" stroke-width="18" opacity=".19" filter="url(#ray-glow)"/><path d="M-180 780 C240 400 340 930 800 520 S1200 230 1660 130" stroke-width="1.5" opacity=".34"/></g><g class="ray ray-two"><path d="M-150 890 C250 550 360 1010 830 650 S1300 320 1640 260" stroke-width="14" opacity=".13" filter="url(#ray-glow)"/><path d="M-150 890 C250 550 360 1010 830 650 S1300 320 1640 260" stroke-width="1" opacity=".3"/></g><g class="ray ray-three"><path d="M-200 700 C160 400 430 850 900 460 S1310 260 1600 50" stroke-width="1" opacity=".2"/></g></g></svg></div>`;
}

function profileIllustration() {
  return `<div class="profile-visual" aria-hidden="true"><div class="profile-orbit orbit-back"><div class="orbit-ring"></div></div><div class="profile-float"><div class="profile-tilt"><div class="profile-illustration"><div class="profile-browser-bar"><span></span><span></span><span></span><i></i></div><div class="profile-browser-content"><div class="profile-map-icon"><svg viewBox="0 0 36 36" fill="none"><path d="M18 32S7.5 22.8 7.5 14.9a10.5 10.5 0 1 1 21 0C28.5 22.8 18 32 18 32Z" fill="#34a853"/><path d="M7.7 17c-.15-.7-.2-1.4-.2-2.1C7.5 9.1 12.2 4.4 18 4.4c3.1 0 5.9 1.3 7.8 3.4L17 18.1Z" fill="#4285f4"/><path d="M25.8 7.8c1.7 1.9 2.7 4.4 2.7 7.1 0 2.3-.9 4.8-2.2 7.2l-9.3-4Z" fill="#fbbc04"/><path d="M7.7 17c.9 4.6 4.6 9.5 7.3 12.4L22 19.1 17 18.1Z" fill="#ea4335"/><circle cx="18" cy="15" r="4.2" fill="#fff"/></svg></div><div class="profile-browser-copy"><strong>Google Business Profile</strong><small>Make every experience count</small><span class="profile-stars">★★★★★</span></div></div><div class="profile-lines"><span></span><span></span></div><div class="profile-illustration-footer"><span class="profile-footer-icon">${icon("sparkle", "small")}</span><span>Made for meaningful reviews</span></div></div></div></div><div class="profile-orbit orbit-front"><div class="orbit-ring"></div></div></div>`;
}

function workspace(content, view) {
  const title = { setup: "Client setup", clients: "Clients", dashboard: "Overview", "google-qr": "Google Review QR" }[view];
  return `<div class="workspace">${workspaceRays()}
    <aside class="sidebar">
      ${brand()}
      <div class="workspace-id"><div class="workspace-icon">${icon("briefcase", "small")}</div><div><strong>Agency Workspace</strong><small>Review management</small></div></div>
      <p class="eyebrow">Workspace</p>
      <nav class="nav-items" aria-label="Workspace">
        <a class="nav-link" href="#dashboard" ${view === "dashboard" ? 'aria-current="page"' : ""}>${icon("grid", "small")} Overview</a>
        <a class="nav-link" href="#clients" ${view === "clients" ? 'aria-current="page"' : ""}>${icon("users", "small")} Clients</a>
      </nav>
      <div class="sidebar-bottom">
        <button type="button" class="nav-link" data-action="help">${icon("help", "small")} Help &amp; support</button>
        <div class="account"><div class="avatar" aria-hidden="true">AM</div><div><strong>Agency Manager</strong><small>Workspace owner</small></div></div>
      </div>
    </aside>
    <div>
      <header class="topbar">
        ${brand("mobile-brand")}
        <div class="breadcrumbs"><span>Workspace</span>${icon("chevron", "small")}<span>${title}</span></div>
        <span class="demo-badge"><i class="dot"></i> Demo workspace</span>
      </header>
      <div class="main-area">${content}</div>
    </div>
    <dialog id="workspace-dialog" aria-labelledby="dialog-title"></dialog>
  </div>`;
}

function availableClients() {
  return [...savedClients.map(business => ({
    id: business.id, name: business.name, initials: initials(business.name), colour: "gold",
    category: business.category || "Website client", status: "Active", reviews: 0
  })), ...clients];
}

function clientRows(query = "", status = "all") {
  const visibleClients = availableClients().filter(client => {
    const text = `${client.name} ${client.category}`.toLowerCase();
    return text.includes(query.trim().toLowerCase()) && (status === "all" || client.status === status);
  });
  if (!visibleClients.length) return '<tr><td colspan="5" class="empty">No clients match your filters.</td></tr>';
  return visibleClients.map(client => `<tr>
    <td><div class="client-info"><span class="client-logo ${client.colour}" aria-hidden="true">${escapeHtml(client.initials)}</span><div><strong>${escapeHtml(client.name)}</strong><small>${escapeHtml(client.category)}</small></div></div></td>
    <td><span class="status ${client.status.toLowerCase()}"><i class="dot"></i>${client.status}</span></td>
    <td class="detail-col">${client.status === "Active" ? "Available" : "Pending"}</td>
    <td class="detail-col">${client.reviews || (client.status === "Active" ? "0" : "—")}</td>
    <td><button type="button" class="icon-button" data-action="open-client" data-client="${escapeHtml(client.id || client.initials)}" aria-label="Open ${escapeHtml(client.name)}">${icon("dots", "small")}</button></td>
  </tr>`).join("");
}

function dashboard(view) {
  const list = availableClients();
  const active = list.filter(client => client.status === "Active");
  const reviews = list.reduce((total, client) => total + client.reviews, 0);
  const summary = [
    ["users", "", list.length, "Total clients"],
    [googleReviewLinksEnabled ? "qr" : "link", "lavender", active.length, googleReviewLinksEnabled ? "Active QR campaigns" : "Active review pages"],
    ["star", "amber", reviews, "Reviews collected"]
  ];
  return `<div class="page-heading"><div><h1>${view === "clients" ? "Clients" : "Dashboard"}</h1><p>${googleReviewLinksEnabled ? "Manage client review pages and QR campaigns." : "Manage client review pages."}</p></div><div class="heading-actions">${googleReviewLinksEnabled ? `<a class="btn btn-secondary" href="#google-qr">${icon("qr", "small")} Create Google Review QR</a>` : ""}${button("Add New Client", "add-client", "primary", "plus")}</div></div>
    ${view === "dashboard" ? `<section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy"><span class="hero-kicker eyebrow">${icon("sparkle", "small")} AI-assisted reviews</span><h2 id="hero-title">Make it easy to leave a review.</h2><p>${googleReviewLinksEnabled ? "Give every client a branded QR code and a guided review page." : "Give every client a branded review page that guides customers through their draft."}</p>${button("Set up a review page", "add-client", "hero", googleReviewLinksEnabled ? "qr" : "edit")}</div>
      <div class="hero-art" aria-hidden="true"><div class="orbit"></div><div class="hero-spark">${icon("sparkle")}</div><div class="hero-qr">${icon(googleReviewLinksEnabled ? "qr" : "edit")}<b>Share your experience</b></div><div class="hero-rating">★★★★★</div></div>
    </section>
    <section class="stats" aria-label="Workspace summary">${summary.map(([symbol, colour, value, label]) => `<div class="stat"><div class="stat-icon ${colour}">${icon(symbol)}</div><div><strong>${value}</strong><span>${label}</span></div></div>`).join("")}</section>` : ""}
    <section class="panel" aria-labelledby="client-heading">
      <div class="list-header"><div><h2 id="client-heading">Your clients</h2><p>Review pages and campaign status</p></div>
        <div class="list-tools"><label class="field-wrap">${icon("search")}<span class="sr-only">Search clients</span><input id="client-search" type="search" placeholder="Search clients"></label>
        <label><span class="sr-only">Filter client status</span><select id="client-status"><option value="all">All statuses</option><option>Active</option><option>Draft</option></select></label></div>
      </div>
      <table class="client-table"><thead><tr><th scope="col">Client</th><th scope="col">Status</th><th scope="col" class="detail-col">Review page</th><th scope="col" class="detail-col">Reviews</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead><tbody id="client-rows">${clientRows()}</tbody></table>
    </section>`;
}

function stepIntro(symbol, title, details) {
  return `<div class="step-intro"><div class="step-icon">${icon(symbol)}</div><div><h2>${title}</h2><p>${details}</p></div></div>`;
}

function renderWebsiteStep() {
  const business = setup.business;
  if (setup.stage === "edit-business") {
    return `${stepIntro("edit", "Edit business details", "Check the information used in your client setup.")}
      <form id="business-form" class="business-form">
        <label class="label" for="business-name">Business name</label>
        <input id="business-name" name="name" value="${escapeHtml(business.name)}" maxlength="100" required>
        <label class="label" for="business-category">Business category</label>
        <input id="business-category" name="category" value="${escapeHtml(business.category || "")}" maxlength="100">
        <label class="label" for="business-address">Address</label>
        <input id="business-address" name="address" value="${escapeHtml(business.address || "")}" maxlength="180">
        <label class="label" for="business-city">City</label>
        <input id="business-city" name="city" value="${escapeHtml(business.city || "")}" maxlength="45">
        <label class="label" for="business-phone">Phone</label>
        <input id="business-phone" name="phone" value="${escapeHtml(business.phone || "")}" maxlength="45">
        <div class="panel-actions split">${button("Cancel", "cancel-business", "text")}<button class="btn btn-primary" type="submit">Save details</button></div>
      </form>`;
  }
  if (setup.stage === "analysing") {
    return `<div class="process" role="status">
      <div class="loader">${icon("sparkle")}</div><h2>Analysing your website</h2><p>Finding the details for your client’s review page.</p>
      <div class="progress-track" aria-hidden="true"><span></span></div>
      <ul><li data-analysis>${icon("globe", "small")} Checking website address</li><li data-analysis>${icon("sparkle", "small")} Identifying brand colours</li><li data-analysis>${icon("pin", "small")} Finding business contact details</li></ul>
    </div>`;
  }
  if (setup.stage === "detected") {
    const swatches = business.palette.map((colour, index) => `<span class="swatch" style="--swatch:${colour}">${business.sample ? ["Gold ", "Navy "][index] : ""}${colour}</span>`).join("");
    const source = business.sourceUrl ? new URL(business.sourceUrl).hostname : "Sample data";
    const highlights = business.highlights?.map(item => `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)}</a>`).join("");
    const publishedReview = googleReviewLinksEnabled && publishedReviewSuggestion(business);
    return `${stepIntro("success", "Business details detected", business.sample ? "Review the sample business details for this demo." : "Review the details found in the website’s public pages.")}
      <div class="business-card">${businessLogo(business)}<div><strong>${escapeHtml(business.name)}</strong><small>${escapeHtml(business.category || (business.nameFromDomain ? "Name inferred from website address" : "Website client"))}</small></div><span class="match-tag">${escapeHtml(source)}</span></div>
      <dl class="business-details"><div><dt>Address</dt><dd>${business.address ? escapeHtml(business.address) : '<button class="inline-button" type="button" data-action="edit-business" data-focus="address">Add business address</button>'}</dd></div><div><dt>Phone</dt><dd>${business.phone ? escapeHtml(business.phone) : '<button class="inline-button" type="button" data-action="edit-business" data-focus="phone">Add phone number</button>'}</dd></div>
      <div class="colours"><dt>Brand colours</dt><dd class="swatches">${swatches || "Not listed on the website"}</dd></div></dl>
      ${business.description || highlights ? `<section class="site-summary" aria-labelledby="site-summary-title"><h2 id="site-summary-title">Website overview</h2>${business.description ? `<p>${escapeHtml(business.description)}</p>` : ""}${highlights ? `<div class="site-highlights">${highlights}</div>` : ""}</section>` : ""}
      ${publishedReview ? '<p class="help-text">Google review link found. It will be filled in on the setup screen.</p>' : ""}
      ${business.truncated ? '<p class="help-text">This is a large page. These results come from the portion that was scanned.</p>' : ""}
      <div class="panel-actions split"><div>${button("Edit website URL", "edit-website", "text")}${button("Edit business details", "edit-business", "secondary", "edit")}</div>${button("Continue to Google Profile", "start-profile")}</div>`;
  }
  return `${stepIntro("globe", "Client website", "Enter the business website to find its branding and contact details.")}
    <form id="website-form">
      <label class="label" for="website-url">Website URL</label>
      <div class="field-wrap">${icon("link", "small")}<input type="text" id="website-url" name="website" value="${escapeHtml(setup.website)}" inputmode="url" autocomplete="url" spellcheck="false" placeholder="https://yourclient.com" aria-describedby="website-help website-error" ${setup.error ? 'aria-invalid="true"' : ""} required></div>
      <p class="help-text" id="website-help">Try the demo with <button class="inline-button" type="button" data-action="sample-website">Royal Gold Jewellery’s sample URL</button>.</p>
      <p id="website-error" class="help-text error-text" role="alert" ${setup.error ? "" : "hidden"}>${escapeHtml(setup.error)}</p>
      <div class="panel-actions"><button class="btn btn-primary" type="submit">${icon("sparkle", "small")} Analyse Website</button></div>
    </form>`;
}

function profileMatches() {
  const words = setup.query.toLowerCase().trim().split(/[\s,]+/).filter(Boolean);
  return words.every(word => setup.business.profile.toLowerCase().includes(word));
}

function profileResult() {
  const business = setup.business;
  if (!profileMatches()) return '<p class="help-text" role="status">No matching preview. Search for the business name or city.</p>';
  return `<button type="button" class="profile-card" data-action="select-profile" aria-pressed="${setup.selected}">
    ${businessLogo(business)}<span class="profile-copy"><strong>${escapeHtml(business.profile)}</strong><span class="profile-rating">${business.sample ? icon("star", "small") + " " + business.rating + " · " : ""}${escapeHtml(business.category || "Profile preview")}</span><small>${escapeHtml(business.address || "Address not found on website")}</small></span>
    <span class="selected-mark ${setup.selected ? "" : "off"}">${icon("check", "small")}</span></button>`;
}

function renderProfileStep() {
  return `${stepIntro("pin", "Google Business Profile", setup.business.sample ? "Confirm the sample Google listing for this demo." : "Confirm the profile preview built from your website details. This step simulates Google confirmation.")}
    <label class="label" for="profile-search">Search business profiles</label>
    <div class="field-wrap">${icon("search", "small")}<input type="search" id="profile-search" placeholder="Business name or city" value="${escapeHtml(setup.query)}"></div>
    <div id="profile-result" class="profile-result">${profileResult()}</div>
    <div class="panel-actions split">${button("Back", "back-details", "text")}<button id="confirm-button" class="btn btn-primary" type="button" data-action="confirm-profile" ${setup.selected && profileMatches() ? "" : "disabled"}>${icon("check", "small")} Confirm Profile</button></div>`;
}

function renderCompleteStep() {
  const business = setup.business;
  const url = reviewUrl(business);
  const scannable = canScanPreview() && shortCustomerLink && shortCustomerTarget === reviewHash(business);
  return `${googleReviewLinksEnabled ? stepIntro("qr", "Google review QR", "Create a QR poster that customers can scan to open Google.") + renderGoogleQr(business) : ""}
    <section class="guided-preview" aria-labelledby="guided-preview-title">
      <div class="setup-grid">
        <div>
          <h2 id="guided-preview-title">Guided review preview</h2>
          <p class="guided-description">Try the customer experience for ${escapeHtml(business.name)}. Answer three questions and see how ReviewFlow turns your answers into an editable draft.</p>
          <div class="question-settings"><h3>Questions your customer will see</h3><p>ReviewFlow suggests these questions from the website. You can change them here. The customer answers them on their own device after scanning the QR code.</p>
            ${selectedQuestions(business).map((id, index) => `<label class="label" for="question-select-${index}">Question ${index + 1}</label><select id="question-select-${index}" data-question-index="${index}">${questionBank.map((question, option) => `<option value="${option}" ${id === option ? "selected" : ""}>${escapeHtml(question)}</option>`).join("")}</select>`).join("")}
          </div>
          <label class="label" for="review-url">Customer review-page URL</label>
          <div class="link-box"><input id="review-url" value="${scannable ? escapeHtml(url) : ""}" placeholder="Preparing link…" readonly><button class="btn btn-secondary" type="button" data-action="copy-link" aria-label="Copy review-page URL" ${scannable ? "" : "disabled"}>${icon("copy", "small")} Copy</button></div>
          <div class="panel-actions">${button("Preview Customer Journey", "preview", "primary", "eye")}</div>
          <div class="panel-actions">${button("Edit business details", "edit-business", "secondary", "edit")}</div>
        </div>
        <div class="setup-qr preview-qr" aria-label="Customer preview QR">
          ${scannable ? `<img data-qr="${escapeHtml(url)}" alt="Scan to open the guided review preview for ${escapeHtml(business.name)}"><h3>Scan to try it</h3><p>${publicPhoneDemo ? "Mobile data or Wi-Fi works." : location.protocol === "https:" ? "Open the camera on your phone." : "Use the same Wi-Fi."}</p>${button("Download QR Code", "download-preview-qr", "text", "download")}` : `<div class="step-icon">${icon("qr")}</div><h3>Preview on your phone</h3><p role="status">${customerLinkError ? escapeHtml(customerLinkError) : canScanPreview() || previewAddressPending ? "Preparing your QR code…" : "Start ReviewFlow with Open ReviewFlow.cmd to enable the QR code."}</p>${customerLinkError ? button("Try again", "retry-customer-link", "secondary") : ""}`}
        </div>
      </div>
    </section>`;
}

function publishedReviewSuggestion(business) {
  const candidates = business?.googleReviewCandidates;
  return candidates?.length === 1 ? googleReviewUrl(candidates[0], false) : "";
}

function currentGoogleUrl() {
  return currentView() === "setup" ? googleReviewUrl(setup.business?.googleReviewUrl) : quickGoogleUrl;
}

function renderGoogleQr(business) {
  const url = googleReviewUrl(business ? business.googleReviewUrl : quickGoogleUrl);
  const suggested = !url && publishedReviewSuggestion(business);
  const reviewHelp = suggested
    ? `ReviewFlow found this link on the website. <a href="${escapeHtml(suggested)}" target="_blank" rel="noopener noreferrer">Check the Google listing</a> before generating the QR.`
    : !url && business?.googleReviewCandidates?.length > 1
      ? 'The website published multiple review links. Paste the link for the location you want to use.'
      : 'Copy the link from <strong>Get more reviews</strong> in your Google Business Profile. <a href="https://support.google.com/business/answer/16816815?hl=en" target="_blank" rel="noopener noreferrer">Where to find it</a>';
  return `<div class="setup-grid">
    <div>
      <form id="google-qr-form">
        <label class="label" for="google-review-url">Google review link</label>
        <div class="field-wrap">${icon("link", "small")}<input id="google-review-url" name="googleReviewUrl" type="text" value="${escapeHtml(url || suggested || "")}" inputmode="url" autocomplete="url" spellcheck="false" placeholder="https://g.page/r/…/review" aria-describedby="google-qr-help google-qr-error" required></div>
        <p class="help-text" id="google-qr-help">${reviewHelp}</p>
        <p id="google-qr-error" class="help-text error-text" role="alert" hidden></p>
        <div class="panel-actions"><button class="btn btn-primary" type="submit">${icon("qr", "small")} Generate QR Code</button></div>
      </form>
      <div class="panel-actions qr-actions" id="google-qr-actions" ${url ? "" : "hidden"}>${button("Download QR Poster", "download-poster", "secondary", "download")}<a class="btn btn-text" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Test Google Link</a></div>
    </div>
    <section class="setup-qr" id="google-qr-result" aria-label="Google review QR preview" ${url ? "" : "hidden"}>${url ? `<img data-qr="${escapeHtml(url)}" alt="QR code that opens the supplied Google review link"><h2 id="qr-result-title">QR code ready</h2><p>Scan to open Google</p>` : ""}</section>
  </div>`;
}

function googleQrPage() {
  return `<section class="wizard">
    ${dashboardLink("Back to dashboard")}
    <div class="wizard-heading"><h1>Create Google Review QR</h1><p>Paste your Google review link to make a QR code and printable poster.</p></div>
    <div class="panel wizard-panel">${renderGoogleQr()}</div>
  </section>`;
}

function wizard() {
  const stage = setup.stage === "profile" ? 1 : setup.stage === "complete" ? 2 : 0;
  const steps = ["Business details", "Google profile", googleReviewLinksEnabled ? "QR & review page" : "Review preview"];
  const subtitle = ["Find the client’s business details from their website.", "Review your client’s example Google listing.", "Your client’s guided review page is ready to preview."];
  const body = [renderWebsiteStep, renderProfileStep, renderCompleteStep][stage]();
  return `<section class="wizard">
    ${dashboardLink("Back to dashboard")}
    <div class="wizard-hero"><div class="wizard-heading"><span class="wizard-kicker">CLIENT ONBOARDING</span><h1>${stage === 2 ? "Setup complete" : "Set up a new client"}</h1><p>${subtitle[stage]}</p></div>${profileIllustration()}</div>
    <ol class="stepper" aria-label="Setup progress">${steps.map((step, index) => `<li class="${index < stage ? "done" : index === stage ? "current" : ""}" ${index === stage ? 'aria-current="step"' : ""}><span class="step-number">${index < stage ? icon("check", "small") : index + 1}</span>${step}</li>`).join("")}</ol>
    <div class="wizard-layout ${stage === 0 && setup.stage === "website" ? "with-insight" : ""}"><div class="panel wizard-panel">${body}</div>${stage === 0 && setup.stage === "website" ? `<aside class="analysis-insight"><div class="insight-icon">${icon("sparkle")}</div><span class="insight-label">WEBSITE ANALYSIS</span><h2>Get to know your client</h2><p>We’ll look for a few key details to help you set up their review experience.</p><div class="insight-divider"></div><ul><li>${icon("check", "small")} Business information</li><li>${icon("check", "small")} Branding and colours</li><li>${icon("check", "small")} Relevant customer questions</li></ul><span class="insight-note">You can review and edit the details.</span></aside>` : ""}</div>
  </section>`;
}

function questionProgress(index, total) {
  return `<div class="question-meta"><div class="question-meta-heading"><span class="question-badge">Question ${index + 1} of ${total}</span><span class="question-meta-hint">Your experience</span></div><span class="question-progress" aria-hidden="true">${Array.from({ length: total }, (_, step) => `<i class="${step < index ? "completed" : step === index ? "current" : ""}"></i>`).join("")}</span></div>`;
}

function answerCounter(value) {
  return `<div class="answer-count" aria-hidden="true"><span id="answer-count">${value.length}</span> / 500</div>`;
}

function customerQuestion() {
  const business = customerBusiness();
  if (business.questions) {
    const index = customer.question;
    const question = questionBank[business.questions[index]];
    const optional = index === 2;
    const answer = String(customer.answers[index] || "");
    return `${questionProgress(index, business.questions.length)}
      <div class="question-content"><h1>${escapeHtml(question)}</h1><p>${optional ? "You can skip this question." : "Share your genuine experience in your own words."}</p></div>
      <label class="customer-field-label" for="customer-answer">Your answer <span aria-hidden="true">A few words</span></label><textarea id="customer-answer" maxlength="500" placeholder="Write your answer here...">${escapeHtml(answer)}</textarea>${answerCounter(answer)}
      <div class="panel-actions ${index > 0 ? "split" : ""}">${index > 0 ? button("Back", "previous-question", "text") : ""}
      <button id="next-question" class="btn btn-primary" type="button" data-action="next-question" ${!optional && !answer.trim() ? "disabled" : ""}>${optional ? "Prepare my review" : "Continue"}</button></div>`;
  }
  const visitOptions = customerBusiness().sample ? sampleVisits : standardVisits;
  const index = customer.question;
  const titles = ["What brought you in today?", "How was your experience?", "What would you like to share?"];
  const descriptions = ["Choose the option that fits your visit.", "Select a star rating for your visit.", "Share a detail in your own words. You can skip this question."];
  const questions = [
    () => `<div class="choices">${visitOptions.map(label => `<button type="button" class="choice" data-action="visit-option" data-option="${label}" aria-pressed="${customer.answers[0] === label}">${label}</button>`).join("")}</div>`,
    () => `<div class="stars" role="group" aria-label="Rate your experience">${ratings.map((rating, option) => `<button type="button" class="star ${customer.answers[1] >= option + 1 ? "selected" : ""}" data-action="rating" data-option="${option + 1}" aria-label="${option + 1} ${option ? "stars" : "star"} — ${rating}" aria-pressed="${customer.answers[1] === option + 1}">${icon("star")}</button>`).join("")}</div><p class="help-text" id="rating-label" aria-live="polite">${ratings[customer.answers[1] - 1] || "Tap a star to choose your rating."}</p>`,
    () => `<label class="customer-field-label" for="customer-extra">Details about your visit <span aria-hidden="true">Optional</span></label><textarea id="customer-extra" maxlength="500" placeholder="Write your answer here...">${escapeHtml(customer.answers[2])}</textarea>${answerCounter(customer.answers[2])}`
  ];
  return `${questionProgress(index, titles.length)}
    <div class="question-content"><h1>${titles[index]}</h1><p>${descriptions[index]}</p></div>${questions[index]()}
    <div class="panel-actions ${index > 0 ? "split" : ""}">${index > 0 ? button("Back", "previous-question", "text") : ""}
    <button id="next-question" class="btn btn-primary" type="button" data-action="next-question" ${index < 2 && !customer.answers[index] ? "disabled" : ""}>${index === 2 ? "Prepare my review" : "Continue"}</button></div>`;
}

function customerBody() {
  if (customer.question < 3) return customerQuestion();
  if (customer.question === 3) return `<div class="process" role="status"><div class="loader">${icon("sparkle")}</div><h1>Preparing your review</h1><p>Putting your answers into a draft you can edit.</p><div class="progress-track" style="--duration:1.8s" aria-hidden="true"><span></span></div></div>`;
  if (customer.question === 4) return `<span class="draft-badge">${icon("sparkle", "small")} Draft from your answers</span><h1>Make it your own</h1><p>ReviewFlow used your answers to write this draft. Edit anything you’d like before copying it.</p>
    <label class="customer-field-label" for="review-draft">Your review draft <span aria-hidden="true">Ready to edit</span></label><textarea id="review-draft" class="draft-text">${escapeHtml(customer.draft)}</textarea>
    <div class="panel-actions split">${button("Edit answers", "edit-answers", "text")}<button id="continue-google" class="btn btn-primary" type="button" data-action="continue-google" ${customer.draft.trim() ? "" : "disabled"}>${googleReviewLinksEnabled ? "Continue to Google Review" : "Finish Preview"}</button></div>`;
  return `<div class="step-intro"><div class="step-icon">${icon("success")}</div><div><h1>${googleReviewLinksEnabled ? "Google review preview" : "Review preview complete"}</h1><p>${googleReviewLinksEnabled ? "This demo simulates the handoff to Google. You can copy your draft from here." : "Your edited draft is ready to copy."}</p></div></div>
    <div class="panel-actions split">${button("Back to draft", "back-draft", "text")}${button("Copy review draft", "copy-draft", "primary", "copy")}</div>`;
}

function customerPage() {
  const business = customerBusiness();
  return `<section class="customer">
    ${previewMode ? `<div class="customer-toolbar">${brand()}${button("Back to setup", "back-setup", "secondary")}</div>` : ""}
    <div class="customer-card"><header class="customer-mast">${businessLogo(business)}<div><strong>${escapeHtml(business.name)}</strong><small>Share your experience</small></div><span class="customer-mast-tag">CUSTOMER FEEDBACK</span></header><div class="customer-body">${customerBody()}</div></div>
    <p class="customer-credit"><img src="assets/mark.svg?v=2" alt=""><span>Powered by <strong>ReviewFlow</strong></span></p>
  </section>`;
}

function qrCanvas(maxSize, url) {
  const qr = window.qrcode(0, "M");
  qr.addData(url);
  qr.make();
  const count = qr.getModuleCount();
  const quietZone = 4;
  const cellSize = Math.floor(maxSize / (count + 2 * quietZone));
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = cellSize * (count + 2 * quietZone);
  const drawing = canvas.getContext("2d");
  drawing.fillStyle = "#fff";
  drawing.fillRect(0, 0, canvas.width, canvas.height);
  drawing.fillStyle = "#000";
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (qr.isDark(row, col)) drawing.fillRect((col + quietZone) * cellSize, (row + quietZone) * cellSize, cellSize, cellSize);
    }
  }
  return canvas;
}

async function downloadPoster() {
  const url = currentGoogleUrl();
  if (!url) return;
  const business = currentView() === "setup" ? setup.business : null;
  const accent = business?.palette?.[0] || "#C6A253";
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#142439";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);
  ctx.textAlign = "center";
  ctx.fillStyle = "#efd289";
  ctx.font = "48px Georgia";
  ctx.fillText(business ? initials(business.name) : "G", 600, 196);
  ctx.font = "50px Georgia";
  ctx.fillText(business?.name || "Google reviews", 600, 291, 1040);
  ctx.fillStyle = "#fff";
  ctx.font = 'bold 78px "Segoe UI", sans-serif';
  ctx.fillText("Share your experience", 600, 453, 1030);
  ctx.font = '34px "Segoe UI", sans-serif';
  ctx.fillText("Scan to leave a Google review", 600, 518);
  const qr = qrCanvas(630, url);
  ctx.drawImage(qr, (1200 - qr.width) / 2, 620);
  ctx.fillStyle = "#efd289";
  ctx.font = '30px "Segoe UI", sans-serif';
  if (business?.city) ctx.fillText([business.name, business.city].join(" · "), 600, 1385, 1040);
  ctx.font = '23px "Segoe UI", sans-serif';
  try {
    const mark = new Image();
    mark.src = "assets/mark.svg?v=2";
    await mark.decode();
    const textWidth = ctx.measureText("Powered by ReviewFlow").width;
    ctx.drawImage(mark, 600 - textWidth / 2 - 34, 1423, 25, 25);
  } catch {
    // Keep the poster downloadable if the optional logo cannot be loaded.
  }
  ctx.fillText("Powered by ReviewFlow", 600, 1443);
  const download = document.createElement("a");
  download.download = (business ? businessSlug(business.name) : "google-review") + "-qr-poster.png";
  download.href = canvas.toDataURL("image/png");
  download.click();
  notify("QR poster downloaded");
}

function downloadPreviewQr() {
  if (!canScanPreview()) return;
  const business = setup.business;
  const download = document.createElement("a");
  download.download = businessSlug(business.name) + "-review-preview-qr.png";
  download.href = qrCanvas(960, reviewUrl(business)).toDataURL("image/png");
  download.click();
  notify("Preview QR code downloaded");
}

function notify(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toastTimer = setTimeout(() => { toast.textContent = ""; }, 3200);
}

async function copyText(value, message) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const field = document.createElement("textarea");
    field.value = value;
    field.style.position = "fixed";
    field.style.opacity = "0";
    const focused = document.activeElement;
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    focused?.focus();
    if (!copied) {
      notify("Copy is unavailable in this browser.");
      return;
    }
  }
  notify(message);
}

function render(focusSelector) {
  const view = currentView();
  if (loadingCustomerPage) {
    app.innerHTML = '<section class="customer"><div class="customer-card"><div class="customer-body"><p role="status">Opening your review page…</p></div></div></section>';
    return;
  }
  document.title = view === "customer" ? `Review ${customerBusiness().name} · ReviewFlow` : "ReviewFlow · Agency Workspace";
  app.innerHTML = view === "customer" ? customerPage() : workspace(view === "setup" ? wizard() : view === "google-qr" ? googleQrPage() : dashboard(view), view);
  for (const image of app.querySelectorAll("[data-qr]")) {
    image.src = qrCanvas(510, image.dataset.qr).toDataURL("image/png");
  }
  app.querySelectorAll(".royal-logo img").forEach(image => {
    image.addEventListener("error", () => image.remove(), { once: true });
    if (image.complete && !image.naturalWidth) image.remove();
  });
  if (focusSelector) {
    const element = app.querySelector(focusSelector);
    if (element) {
      if (element.matches("h1, h2")) element.tabIndex = -1;
      element.focus({ preventScroll: true });
    }
  }
}

function navigate(hash) {
  if (location.hash === hash) {
    render("h1");
  } else {
    location.hash = hash;
  }
}

function showSetup(stage, focusSelector = ".wizard-panel h2") {
  setup.stage = stage;
  if (currentView() === "setup") render(focusSelector);
  else navigate("#setup");
  if (stage === "complete" && location.protocol !== "file:") {
    previewAddressPending = true;
    loadPreviewAddress();
  }
}

async function startAnalysis(form) {
  const field = form.elements.website;
  const value = field.value.trim();
  const error = form.querySelector("#website-error");
  let address;
  try {
    address = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`);
  } catch { /* An invalid address is handled below. */ }
  if (!address || !["http:", "https:"].includes(address.protocol) || !address.hostname.includes(".") || address.username || address.password) {
    error.textContent = "Enter a website URL like https://yourclient.com.";
    error.hidden = false;
    field.setAttribute("aria-invalid", "true");
    field.focus();
    return;
  }
  setup.website = address.href;
  const run = ++setup.run;
  setup.error = "";
  const request = new AbortController();
  setup.request = request;
  const timeout = setTimeout(() => request.abort(), 36000);
  showSetup("analysing");
  [410, 970, 1510].forEach((delay, index) => {
    setTimeout(() => {
      if (run !== setup.run || setup.stage !== "analysing" || currentView() !== "setup") return;
      const task = app.querySelectorAll("[data-analysis]")[index];
      if (task) {
        task.classList.add("complete");
        task.querySelector("svg").outerHTML = icon("check", "small");
      }
    }, delay);
  });
  try {
    const minimumAnimation = new Promise(resolve => setTimeout(resolve, 1680));
    const isSample = address.hostname === "royalgoldjewellery.example";
    const [details] = await Promise.all([isSample ? sampleBusiness : analyseWebsite(address.href, request.signal, googleReviewLinksEnabled), minimumAnimation]);
    if (run !== setup.run) return;
    setup.business = isSample ? sampleBusiness : {
      ...details,
      id: "website:" + new URL(details.sourceUrl).hostname.replace(/^www\./, ""),
      profile: [details.name, details.city].filter(Boolean).join(", ")
    };
    setup.stage = "detected";
    if (currentView() === "setup") render(".wizard-panel h2");
  } catch (error) {
    if (run !== setup.run) return;
    setup.error = request.signal.aborted ? "The analysis timed out. Try again or paste another page from the website." : error.message;
    setup.stage = "website";
    if (currentView() === "setup") render("#website-url");
  } finally {
    clearTimeout(timeout);
    if (run === setup.run) setup.request = null;
  }
}

function selectCustomerAnswer(index, value) {
  customer.answers[index] = value;
  if (index === 0) {
    app.querySelectorAll(".choice").forEach(choice => choice.setAttribute("aria-pressed", choice.dataset.option === value));
  } else {
    app.querySelectorAll(".star").forEach(star => {
      const rating = Number(star.dataset.option);
      star.classList.toggle("selected", rating <= value);
      star.setAttribute("aria-pressed", rating === value);
    });
    app.querySelector("#rating-label").textContent = ratings[value - 1];
  }
  app.querySelector("#next-question").disabled = false;
}

function makeDraft(answers) {
  const business = customerBusiness();
  if (business.questions) {
    return answers.map(answer => String(answer || "").trim()).filter(Boolean)
      .map(answer => /[.!?…]$/.test(answer) ? answer : answer + ".").join(" ");
  }
  const name = business.name;
  const visits = {
    "Shopping for jewellery": `I visited ${name} to shop for jewellery.`,
    "Browsing the collection": `I stopped by ${name} to browse the collection.`,
    "Repair or custom work": `I visited ${name} to ask about repair or custom work.`,
    "Buying a product": `I visited ${name} to buy a product.`,
    "Using a service": `I used a service from ${name}.`,
    "Making an enquiry": `I contacted ${name} to ask a question.`,
    "Something else": `I visited ${name}.`
  };
  const ratingText = ["I had a very poor experience.", "I had a poor experience.", "Overall, my experience was okay.", "I had a good experience.", "I had an excellent experience."];
  const details = answers[2].trim();
  const sentences = [visits[answers[0]], ratingText[answers[1] - 1]];
  if (details) sentences.push(/[.!?]$/.test(details) ? details : `${details}.`);
  return sentences.join(" ");
}

function nextQuestion() {
  customer.question += 1;
  render("h1");
  if (customer.question !== 3) return;
  const run = ++customer.run;
  setTimeout(() => {
    if (customer.run !== run || customer.question !== 3) return;
    customer.draft = makeDraft(customer.answers);
    customer.question = 4;
    if (currentView() === "customer") render("h1");
  }, 1800);
}

function showDialog(title, content) {
  const dialog = document.querySelector("#workspace-dialog");
  dialog.innerHTML = `<h2 id="dialog-title">${title}</h2><p>${content}</p><form method="dialog" class="panel-actions"><button class="btn btn-secondary">Close</button></form>`;
  dialog.showModal();
}

function saveClient(business) {
  savedClients = [business, ...savedClients.filter(client => client.id !== business.id)];
  demoStorage.save(savedClients);
}

function generateGoogleQr(form) {
  const field = form.elements.googleReviewUrl;
  const url = googleReviewUrl(field.value);
  if (!url) {
    const error = form.querySelector("#google-qr-error");
    error.textContent = "Paste the Google review link from Get more reviews. Shorten long links by copying the one Google provides.";
    error.hidden = false;
    field.setAttribute("aria-invalid", "true");
    field.focus();
    return;
  }
  if (currentView() === "setup") {
    setup.business = { ...setup.business, googleReviewUrl: url };
    saveClient(setup.business);
  } else {
    quickGoogleUrl = url;
  }
  render("#qr-result-title");
  app.querySelector("#google-qr-result").scrollIntoView({ block: "nearest" });
}

const actions = {
  "add-client": () => {
    setup.run += 1;
    setup.request?.abort();
    setup.website = "";
    setup.error = "";
    setup.business = null;
    setup.selected = true;
    showSetup("website", "#website-url");
  },
  "sample-website": () => {
    const field = document.querySelector("#website-url");
    field.value = sampleWebsite;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.focus();
  },
  "edit-website": () => showSetup("website", "#website-url"),
  "edit-business": control => {
    setup.returnAfterEdit = setup.stage;
    const field = control.dataset.focus;
    showSetup("edit-business", field === "address" || field === "phone" ? `#business-${field}` : "#business-name");
  },
  "cancel-business": () => showSetup(setup.returnAfterEdit || "detected"),
  "start-profile": () => {
    setup.query = setup.business.profile;
    setup.selected = true;
    showSetup("profile", "#profile-search");
  },
  "back-details": () => showSetup("detected"),
  "select-profile": button => {
    setup.selected = !setup.selected;
    button.setAttribute("aria-pressed", setup.selected);
    button.querySelector(".selected-mark").classList.toggle("off", !setup.selected);
    document.querySelector("#confirm-button").disabled = !setup.selected;
  },
  "confirm-profile": () => {
    const previous = savedClients.find(client => client.id === setup.business.id);
    if (previous?.googleReviewUrl) setup.business = { ...setup.business, googleReviewUrl: previous.googleReviewUrl };
    if (!googleReviewLinksEnabled && previous?.googleReviewCandidates?.length) {
      setup.business = { ...setup.business, googleReviewCandidates: previous.googleReviewCandidates };
    }
    setup.business = { ...setup.business, questions: previous?.questions || selectedQuestions(setup.business) };
    saveClient(setup.business);
    showSetup("complete", "h1");
  },
  "copy-link": () => copyText(reviewUrl(setup.business), "Review page link copied"),
  "download-preview-qr": downloadPreviewQr,
  "retry-customer-link": () => {
    customerLinkError = "";
    render();
    prepareCustomerLink();
  },
  "download-poster": downloadPoster,
  "preview": () => {
    previewMode = true;
    customer = { answers: ["", 0, ""], draft: "", question: 0, run: customer.run + 1 };
    navigate(reviewHash(setup.business));
  },
  "back-setup": () => showSetup("complete"),
  "visit-option": button => selectCustomerAnswer(0, button.dataset.option),
  "rating": button => selectCustomerAnswer(1, Number(button.dataset.option)),
  "previous-question": () => { customer.question -= 1; render("h1"); },
  "next-question": nextQuestion,
  "edit-answers": () => { customer.question = 2; render("h1"); },
  "continue-google": () => { customer.question = 5; render("h1"); },
  "back-draft": () => { customer.question = 4; render("h1"); },
  "copy-draft": () => copyText(customer.draft, "Review draft copied"),
  "help": () => showDialog("Help & support", googleReviewLinksEnabled ? "Select Create Google Review QR to turn a Google review request link into a scannable poster. Use Add New Client to analyse a business website and preview the guided review flow." : "Use Add New Client to analyse a business website and preview the guided review flow."),
  "open-client": button => {
    const business = savedClients.find(entry => entry.id === button.dataset.client);
    if (business) {
      setup.run += 1;
      setup.request?.abort();
      setup.business = business;
      showSetup("complete");
      return;
    }
    const client = clients.find(entry => entry.initials === button.dataset.client);
    if (client) showDialog(client.name, `${client.category} · ${client.status}. This sample client has ${client.reviews} reviews recorded in the demo.`);
  }
};

app.addEventListener("click", event => {
  const control = event.target.closest("[data-action]");
  if (control && !control.disabled) actions[control.dataset.action]?.(control);
});

app.addEventListener("submit", event => {
  if (event.target.id === "website-form") {
    event.preventDefault();
    startAnalysis(event.target);
  } else if (event.target.id === "business-form") {
    event.preventDefault();
    const form = event.target;
    const name = form.elements.name.value.trim();
    if (!name) {
      form.elements.name.setCustomValidity("Enter a business name.");
      form.elements.name.reportValidity();
      return;
    }
    const business = {
      ...setup.business,
      name,
      category: form.elements.category.value.trim(),
      address: form.elements.address.value.trim(),
      city: form.elements.city.value.trim(),
      phone: form.elements.phone.value.trim()
    };
    business.profile = [business.name, business.city].filter(Boolean).join(", ");
    if (business.sample && (business.name !== sampleBusiness.name || business.city !== sampleBusiness.city)) business.sample = false;
    setup.business = business;
    if (setup.returnAfterEdit === "complete") saveClient(business);
    showSetup(setup.returnAfterEdit || "detected", "h1");
  } else if (event.target.id === "google-qr-form") {
    event.preventDefault();
    generateGoogleQr(event.target);
  }
});

app.addEventListener("input", event => {
  const { id, value } = event.target;
  if (id === "client-search" || id === "client-status") {
    app.querySelector("#client-rows").innerHTML = clientRows(app.querySelector("#client-search").value, app.querySelector("#client-status").value);
  } else if (id === "profile-search") {
    setup.query = value;
    app.querySelector("#profile-result").innerHTML = profileResult();
    app.querySelector("#confirm-button").disabled = !setup.selected || !profileMatches();
  } else if (id === "customer-extra") {
    customer.answers[2] = value;
    app.querySelector("#answer-count").textContent = value.length;
  } else if (id === "customer-answer") {
    customer.answers[customer.question] = value;
    app.querySelector("#answer-count").textContent = value.length;
    app.querySelector("#next-question").disabled = customer.question < 2 && !value.trim();
  } else if (id === "review-draft") {
    customer.draft = value;
    app.querySelector("#continue-google").disabled = !value.trim();
  } else if (id === "website-url") {
    setup.error = "";
    event.target.removeAttribute("aria-invalid");
    app.querySelector("#website-error").hidden = true;
  } else if (id === "business-name") {
    event.target.setCustomValidity("");
  } else if (id === "google-review-url") {
    event.target.removeAttribute("aria-invalid");
    app.querySelector("#google-qr-error").hidden = true;
    const generated = currentGoogleUrl();
    const showResult = Boolean(generated) && generated === googleReviewUrl(value);
    app.querySelector("#google-qr-actions").hidden = !showResult;
    app.querySelector("#google-qr-result").hidden = !showResult;
  }
});

app.addEventListener("change", event => {
  const field = event.target;
  if (!field.matches("[data-question-index]") || !setup.business) return;
  const questions = [...selectedQuestions(setup.business)];
  questions[Number(field.dataset.questionIndex)] = Number(field.value);
  setup.business = { ...setup.business, questions };
  saveClient(setup.business);
  shortCustomerLink = "";
  shortCustomerTarget = "";
  customerLinkError = "";
  render();
  prepareCustomerLink();
});

let profileBounds = null;
app.addEventListener("pointerover", event => {
  const visual = event.target.closest(".profile-visual");
  if (!visual || visual.contains(event.relatedTarget) || event.pointerType !== "mouse") return;
  profileBounds = visual.getBoundingClientRect();
});
app.addEventListener("pointermove", event => {
  const visual = event.target.closest(".profile-visual");
  if (!visual || !profileBounds || event.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const x = (event.clientX - profileBounds.left) / profileBounds.width - .5;
  const y = (event.clientY - profileBounds.top) / profileBounds.height - .5;
  visual.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
  visual.style.setProperty("--tilt-x", `${(-y * 4).toFixed(2)}deg`);
});
app.addEventListener("pointerout", event => {
  const visual = event.target.closest(".profile-visual");
  if (!visual || visual.contains(event.relatedTarget)) return;
  visual.style.removeProperty("--tilt-y");
  visual.style.removeProperty("--tilt-x");
  profileBounds = null;
});

window.addEventListener("hashchange", () => {
  if (currentView() !== "customer") previewMode = false;
  else if (!previewMode) customer = { answers: ["", 0, ""], draft: "", question: 0, run: customer.run + 1 };
  render("h1");
  window.scrollTo(0, 0);
});
render();
loadPreviewAddress();
openShortCustomerLink();
