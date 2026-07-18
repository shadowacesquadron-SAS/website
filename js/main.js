// ============================================================
// Shadow Ace Squadron — page logic
// Loads data/site.json, data/roster.json, data/ops.json and
// renders roster, ops, gallery, stats. Handles nav + reveals.
// ============================================================

async function j(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

// ---------- loader ----------
const loader = document.getElementById("loader");
let sceneReady = false, pageReady = false;
function maybeHideLoader() {
  if (sceneReady && pageReady) setTimeout(() => loader.classList.add("done"), 350);
}
if (window.__sasSceneReady) sceneReady = true;
window.addEventListener("sas-scene-ready", () => { sceneReady = true; maybeHideLoader(); });
// failsafe: never trap the user on the loader
setTimeout(() => { sceneReady = true; pageReady = true; maybeHideLoader(); }, 6000);

// ---------- nav ----------
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });
const toggle = document.getElementById("nav-toggle");
const links = document.querySelector(".nav-links");
toggle.addEventListener("click", () => links.classList.toggle("open"));
links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => links.classList.remove("open")));

// ---------- reveal on scroll ----------
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((n) => io.observe(n));

// ---------- data-driven sections ----------
(async () => {
  try {
    const [site, roster, ops] = await Promise.all([
      j("data/site.json"), j("data/roster.json"), j("data/ops.json"),
    ]);

    // Discord CTA
    const btn = document.getElementById("discord-btn");
    btn.href = site.discordInvite || "#";
    if (!site.discordInvite || site.discordInvite.includes("PLACEHOLDER")) {
      btn.textContent = "DISCORD OPENING SOON";
    }

    // stats
    const statList = document.getElementById("stat-list");
    for (const s of site.stats) {
      statList.append(el("li", null,
        `<span class="stat-num">${s.value}</span><span class="stat-label">${s.label}</span>`));
    }

    // roster
    const grid = document.getElementById("roster-grid");
    for (const p of roster) {
      grid.append(el("div", "pilot-card", `
        <div class="pilot-callsign">"${p.callsign}"</div>
        <div class="pilot-role">${p.role}</div>
        <div class="pilot-aircraft">Primary: <b>${p.aircraft}</b></div>
      `));
    }

    // operations
    const opsList = document.getElementById("ops-list");
    for (const o of ops) {
      opsList.append(el("div", "op-row", `
        <div class="op-date">${o.date}</div>
        <div>
          <div class="op-name">${o.name}</div>
          <div class="op-desc">${o.desc}</div>
        </div>
        <div class="op-status ${o.status}">${o.status}</div>
      `));
    }

    // gallery
    const gal = document.getElementById("gallery-grid");
    for (const g of site.gallery) {
      if (g.src) {
        const img = el("img");
        img.src = g.src;
        img.alt = g.alt || "Squadron media";
        img.loading = "lazy";
        gal.append(img);
      } else {
        gal.append(el("img", "ph")).src = "assets/gallery/placeholder.svg";
      }
    }
  } catch (err) {
    console.error("[SAS] data load failed:", err);
  } finally {
    pageReady = true;
    maybeHideLoader();
  }
})();
