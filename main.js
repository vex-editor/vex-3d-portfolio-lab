// VEX v2 — scroll-driven 3D world + sheet-driven works + rich interactions
// Three.js scene: the camera travels through themed 3D zones as you scroll.
// Interactive: drag to spin, hover 3D objects (they light up), click for a
// particle burst, pointer parallax, magnetic buttons, 3D card tilt.
// Works section + social links read live from a Google Sheet the owner edits.

import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* ================= Config ================= */

const SHEET_ID = "1xUSmTZYU8j4_-2RyUTJnj7fpmiZEKEfyv_5Q0Ten08A";
const SUPA_URL = "https://aoabbtazodqpkkriitfj.supabase.co";
const SUPA_KEY = "sb_publishable_PKo1mx_pBxg16R8y2_6y6Q_aGRWWDU4";

async function supaGet(path) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  if (!res.ok) throw new Error("supabase http " + res.status);
  return res.json();
}
const DEFAULT_WHATSAPP =
  "https://wa.me/201558077266?text=%D8%A3%D9%87%D9%84%D8%A7%D9%8B+VEX+%F0%9F%91%8B+%D8%B9%D8%A7%D9%8A%D8%B2+%D8%A3%D8%B7%D9%84%D8%A8+%D8%B1%D9%8A%D9%84+%D9%84%D8%AA%D8%AC%D8%B1%D8%A8%D8%A9+%D8%A8%D8%B5%D8%B1%D9%8A%D8%A9+%D8%AC%D8%AF%D9%8A%D8%AF%D8%A9";

const FALLBACK_WORKS = [
  {
    title: "المهندس علاء — ريل",
    video: "https://drive.google.com/file/d/1HficdsCKxcewqkemYcpuD048rxR2DNSz/preview",
    cover: "",
    desc: "مونتاج كامل: إيقاع، انتقالات، وألوان.",
  },
  {
    title: "مونتاجي — ريل 2",
    video: "https://drive.google.com/file/d/1WbaMt4MIgAnjuavP2QU51zOy8nRf0pWw/preview",
    cover: "",
    desc: "قطع سريع على البيت مع كابشن متزامن.",
  },
  {
    title: "مونتاجي — ريل",
    video: "https://drive.google.com/file/d/1sSnMK7QRq8X4gK285PBntAN3xSbRZf7r/preview",
    cover: "",
    desc: "ستايل سينمائي هادي بيخدم الرسالة.",
  },
];

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);

/* ================= Sheet data (works + links) ================= */

function gvizUrl(sheet) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheet)}`;
}

async function fetchGviz(sheet) {
  const res = await fetch(gvizUrl(sheet));
  if (!res.ok) throw new Error("sheet http " + res.status);
  const text = await res.text();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("bad gviz payload");
  const json = JSON.parse(text.slice(start, end + 1));
  const cols = (json.table.cols || []).map((c) => (c.label || "").trim());
  const rows = (json.table.rows || []).map((r) =>
    (r.c || []).map((cell) => (cell && cell.v != null ? String(cell.v) : ""))
  );
  return { cols, rows };
}

function toDrivePreview(url) {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  const m2 = url.match(/drive\.google\.com\/open\?id=([^&#]+)/);
  if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
  return null;
}

function toYoutubeEmbed(url) {
  const m =
    url.match(/(?:youtube\.com\/watch\?[^#]*v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  return null;
}

function toDriveImage(url) {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800`;
  return url;
}

function buildWorkCard({ title, video, cover, desc }) {
  const card = document.createElement("article");
  card.className = "work-card tilt";

  const frame = document.createElement("div");
  frame.className = "work-frame";

  const drive = video ? toDrivePreview(video) : null;
  const yt = video ? toYoutubeEmbed(video) : null;
  const isMp4 = video ? /\.mp4($|\?)/i.test(video) : false;

  if (drive || yt) {
    const iframe = document.createElement("iframe");
    iframe.src = drive || yt;
    iframe.loading = "lazy";
    iframe.allow = "autoplay; fullscreen";
    iframe.allowFullscreen = true;
    iframe.title = title;
    frame.appendChild(iframe);
  } else if (isMp4) {
    const v = document.createElement("video");
    v.src = video;
    v.controls = true;
    v.preload = "metadata";
    if (cover) v.poster = toDriveImage(cover);
    frame.appendChild(v);
  } else if (cover) {
    const img = document.createElement("img");
    img.className = "work-cover";
    img.src = toDriveImage(cover);
    img.alt = title;
    img.loading = "lazy";
    frame.appendChild(img);
    if (video) {
      const a = document.createElement("a");
      a.className = "work-open";
      a.href = video;
      a.target = "_blank";
      a.rel = "noopener";
      a.setAttribute("aria-label", "شغّل " + title);
      frame.appendChild(a);
    }
  } else if (video) {
    const a = document.createElement("a");
    a.className = "work-open";
    a.href = video;
    a.target = "_blank";
    a.rel = "noopener";
    frame.appendChild(a);
  }

  const h3 = document.createElement("h3");
  h3.textContent = title;
  card.appendChild(frame);
  card.appendChild(h3);
  if (desc) {
    const p = document.createElement("p");
    p.textContent = desc;
    card.appendChild(p);
  }
  const glare = document.createElement("div");
  glare.className = "glare";
  card.appendChild(glare);
  return card;
}

async function loadWorks() {
  const grid = document.getElementById("work-grid");
  if (!grid) return;
  let works = FALLBACK_WORKS;
  let usedFallback = true;
  try {
    const rows = await supaGet("works?select=title,video_url,cover_url,description&order=sort_order.asc");
    const parsed = rows
      .map((r) => ({
        title: (r.title || "").trim(),
        video: (r.video_url || "").trim(),
        cover: (r.cover_url || "").trim(),
        desc: (r.description || "").trim(),
      }))
      .filter((w) => w.title && (w.video || w.cover));
    if (parsed.length) {
      works = parsed;
      usedFallback = false;
    }
  } catch (e) {
    console.warn("works supabase fetch failed, trying sheet", e);
  }
  if (usedFallback) try {
    const { rows } = await fetchGviz("works");
    const parsed = [];
    for (const r of rows) {
      const title = (r[0] || "").trim();
      const video = (r[1] || "").trim();
      const cover = (r[2] || "").trim();
      const desc = (r[3] || "").trim();
      if (!title || title === "العنوان") continue; // skip header row if echoed
      if (!video && !cover) continue;
      parsed.push({ title, video, cover, desc });
    }
    if (parsed.length) {
      works = parsed;
      usedFallback = false;
    }
  } catch (e) {
    console.warn("sheet fallback failed, using bundled works", e);
  }
  grid.innerHTML = "";
  for (const w of works) grid.appendChild(buildWorkCard(w));
  if (usedFallback) {
    const note = document.createElement("p");
    note.className = "work-error";
    note.textContent = "تعذر تحميل الأعمال — معروضة نسخة محفوظة.";
    grid.appendChild(note);
  }
  initTilt(grid);
}

async function loadLinks() {
  const waCta = document.getElementById("cta-whatsapp");
  const waFooter = document.getElementById("social-whatsapp");
  if (waCta) waCta.href = DEFAULT_WHATSAPP;
  if (waFooter) waFooter.href = DEFAULT_WHATSAPP;
  const map = {};
  try {
    const rows = await supaGet("site_links?select=key,url");
    for (const r of rows) {
      if (r.key && r.url) map[String(r.key).toLowerCase()] = r.url;
    }
  } catch (e) {
    console.warn("links supabase fetch failed, trying sheet", e);
  }
  if (!Object.keys(map).length) try {
    const { rows } = await fetchGviz("links");
    for (const r of rows) {
      const k = (r[0] || "").trim().toLowerCase();
      const v = (r[1] || "").trim();
      if (k && v && k !== "المفتاح") map[k] = v;
    }
  } catch (e) {
    console.warn("links sheet fallback failed", e);
  }
    if (map.whatsapp) {
      if (waCta) waCta.href = map.whatsapp;
      if (waFooter) waFooter.href = map.whatsapp;
    }
    const fb = document.getElementById("social-facebook");
    const ig = document.getElementById("social-instagram");
    if (map.facebook && fb) {
      fb.href = map.facebook;
      fb.hidden = false;
    }
    if (map.instagram && ig) {
      ig.href = map.instagram;
      ig.hidden = false;
    }
}

/* ================= DOM interactions ================= */

function initTilt(scope) {
  if (reducedMotion || isMobile) return;
  (scope || document).querySelectorAll(".tilt").forEach((el) => {
    if (el.dataset.tiltBound) return;
    el.dataset.tiltBound = "1";
    let raf = null;
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      el.style.setProperty("--gx", px * 100 + "%");
      el.style.setProperty("--gy", py * 100 + "%");
      if (raf) return;
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateY(${(px - 0.5) * -10}deg) rotateX(${(py - 0.5) * 8}deg) translateY(-6px)`;
        raf = null;
      });
    });
    el.addEventListener("mouseleave", () => {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      el.style.transform = "";
    });
  });
}

function initMagnetic() {
  if (reducedMotion || isMobile) return;
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.22}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
}

function initCursorGlow() {
  const glow = document.getElementById("cursor-glow");
  if (!glow || reducedMotion || isMobile) return;
  window.addEventListener("pointermove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  }, { passive: true });
}

/* ================= 3D scene ================= */

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) {
    return false;
  }
}

const canvas = document.getElementById("scene");
if (!canvas || !webglAvailable()) {
  document.body.classList.add("no-webgl");
  const hint = document.getElementById("drag-hint");
  if (hint) hint.style.display = "none";
} else {
  initScene();
}

function initScene() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06070f, 0.045);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.AmbientLight(0x8b3dff, 0.35));
  const key = new THREE.PointLight(0x7058d4, 60, 60);
  key.position.set(5, 6, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0x8b3dff, 45, 60);
  rim.position.set(-6, -4, 4);
  scene.add(rim);

  // One particle field spanning the whole journey
  const ZONE_GAP = 14;
  const ZONES = 5; // hero, work, about, pricing, contact
  const journeyDepth = ZONE_GAP * (ZONES - 1);

  const particleCount = isMobile ? 700 : 2200;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 44;
    positions[i * 3 + 1] = -Math.random() * (journeyDepth + 24) + 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 34;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({ color: 0x7058d4, size: 0.05, transparent: true, opacity: 0.65 })
  );
  scene.add(particles);

  const hoverables = []; // meshes the raycaster watches

  function standardMat(color, emissive, intensity) {
    return new THREE.MeshStandardMaterial({
      color,
      metalness: 0.65,
      roughness: 0.3,
      emissive,
      emissiveIntensity: intensity,
    });
  }

  function roundedRectShape(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  function makeReelFrame() {
    const outer = roundedRectShape(1.9, 3.2, 0.28);
    const hole = roundedRectShape(1.55, 2.85, 0.2);
    outer.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(outer, {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
      curveSegments: 10,
    });
    geo.center();
    const mesh = new THREE.Mesh(geo, standardMat(0x302c39, 0x8b3dff, 0.22));
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo, 24),
      new THREE.LineBasicMaterial({ color: 0x7058d4, transparent: true, opacity: 0.55 })
    );
    mesh.add(edges);
    return mesh;
  }

  function makePlayButton(scale) {
    const shape = new THREE.Shape();
    shape.moveTo(-0.5, -0.65);
    shape.lineTo(-0.5, 0.65);
    shape.lineTo(0.7, 0);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
    });
    geo.center();
    const mesh = new THREE.Mesh(geo, standardMat(0x2b2924, 0x8b3dff, 0.35));
    mesh.scale.setScalar(scale);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo, 24),
      new THREE.LineBasicMaterial({ color: 0x8b3dff, transparent: true, opacity: 0.6 })
    );
    mesh.add(edges);
    return mesh;
  }

  function register(mesh, zone, extra) {
    mesh.userData.zone = zone;
    mesh.userData.baseEmissive = mesh.material.emissiveIntensity;
    mesh.userData.hover = 0;
    Object.assign(mesh.userData, extra || {});
    hoverables.push(mesh);
    return mesh;
  }

  // ---- Zone 0: hero — orbiting reel frames + VEX text ----
  const heroGroup = new THREE.Group();
  heroGroup.position.set(0, -0.6, isMobile ? -3.2 : -2);
  scene.add(heroGroup);

  const heroFrames = [];
  for (let i = 0; i < 3; i++) {
    const f = register(makeReelFrame(), 0, {
      angle: (i / 3) * Math.PI * 2,
      radius: isMobile ? 4.4 : 3.9,
      bobOffset: i * 2.1,
    });
    if (isMobile) f.scale.setScalar(0.65);
    heroGroup.add(f);
    heroFrames.push(f);
  }

  let vexText = null;
  const heroStars = [];
  new FontLoader().load(
    "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json",
    (font) => {
      const geo = new TextGeometry("VEX", {
        font,
        size: isMobile ? 0.9 : 1.1,
        height: 0.35,
        curveSegments: 8,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.03,
        bevelSegments: 3,
      });
      geo.center();
      vexText = new THREE.Mesh(geo, standardMat(0x2b2924, 0x8b3dff, 0.18));
      vexText.position.set(0, 3.7, -1.5);
      register(vexText, 0, {});
      heroGroup.add(vexText);

      // Small floating Arabic-flavored accents: stars around the text
      const starGeo = new THREE.OctahedronGeometry(0.16, 0);
      for (let i = 0; i < 6; i++) {
        const star = new THREE.Mesh(starGeo, standardMat(0x3b334b, 0x8b3dff, 0.5));
        const a = (i / 6) * Math.PI * 2;
        star.position.set(Math.cos(a) * 2.4, 3.7 + Math.sin(a * 2) * 0.5, -1.5 + Math.sin(a) * 1.2);
        register(star, 0, { spinFast: 1.5 + i * 0.2, bobOffset: i * 1.3, baseY: star.position.y });
        heroGroup.add(star);
        heroStars.push(star);
      }
    },
    undefined,
    () => {}
  );

  // ---- Zone 1: works — a carousel of play buttons + reel frames ----
  const workGroup = new THREE.Group();
  workGroup.position.set(0, -ZONE_GAP, -2.5);
  scene.add(workGroup);
  const workItems = [];
  for (let i = 0; i < 6; i++) {
    const isPlay = i % 2 === 0;
    const m = register(isPlay ? makePlayButton(1) : makeReelFrame(), 1, {
      angle: (i / 6) * Math.PI * 2,
      radius: isMobile ? 4.6 : 5.2,
      bobOffset: i * 1.1,
    });
    if (isMobile) m.scale.multiplyScalar(0.7);
    workGroup.add(m);
    workItems.push(m);
  }
  const workRing = new THREE.Mesh(
    new THREE.TorusGeometry(isMobile ? 4.6 : 5.2, 0.02, 8, 90),
    new THREE.MeshBasicMaterial({ color: 0x8b3dff, transparent: true, opacity: 0.35 })
  );
  workRing.rotation.x = Math.PI / 2;
  workGroup.add(workRing);

  // ---- Zone 2: about — stacked wireframe gems rotating against each other ----
  const aboutGroup = new THREE.Group();
  aboutGroup.position.set(0, -ZONE_GAP * 2, -2.5);
  scene.add(aboutGroup);
  const gem1 = register(
    new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 0), standardMat(0x302c39, 0x8b3dff, 0.25)),
    2, { spin: 0.35 }
  );
  gem1.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(gem1.geometry),
    new THREE.LineBasicMaterial({ color: 0x7058d4, transparent: true, opacity: 0.5 })
  ));
  gem1.position.set(-2.6, 0.4, 0);
  aboutGroup.add(gem1);
  const gem2 = register(
    new THREE.Mesh(new THREE.OctahedronGeometry(1.1, 0), standardMat(0x2b2924, 0x8b3dff, 0.3)),
    2, { spin: -0.5 }
  );
  gem2.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(gem2.geometry),
    new THREE.LineBasicMaterial({ color: 0x8b3dff, transparent: true, opacity: 0.5 })
  ));
  gem2.position.set(2.8, -0.5, -0.5);
  aboutGroup.add(gem2);
  const gem3 = register(
    new THREE.Mesh(new THREE.TorusKnotGeometry(0.7, 0.22, 90, 12), standardMat(0x302c39, 0x8b3dff, 0.2)),
    2, { spin: 0.25 }
  );
  gem3.position.set(0.2, 1.6, -1.2);
  aboutGroup.add(gem3);

  // ---- Zone 3: pricing — a big gem with orbiting coins ----
  const priceGroup = new THREE.Group();
  priceGroup.position.set(0, -ZONE_GAP * 3, -2.5);
  scene.add(priceGroup);
  const bigGem = register(
    new THREE.Mesh(new THREE.OctahedronGeometry(1.7, 0), standardMat(0x3b334b, 0x7058d4, 0.3)),
    3, { spin: 0.3 }
  );
  bigGem.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(bigGem.geometry),
    new THREE.LineBasicMaterial({ color: 0x7058d4, transparent: true, opacity: 0.65 })
  ));
  priceGroup.add(bigGem);
  const coins = [];
  for (let i = 0; i < 5; i++) {
    const coin = register(
      new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 24), standardMat(0x5934a8, 0x8b3dff, 0.35)),
      3, { angle: (i / 5) * Math.PI * 2, radius: 2.8, bobOffset: i * 1.7 }
    );
    coin.rotation.x = Math.PI / 2.4;
    priceGroup.add(coin);
    coins.push(coin);
  }

  // ---- Zone 4: contact — torus knot heart + spark storm ----
  const contactGroup = new THREE.Group();
  contactGroup.position.set(0, -ZONE_GAP * 4, -2.5);
  scene.add(contactGroup);
  const knot = register(
    new THREE.Mesh(new THREE.TorusKnotGeometry(1.5, 0.4, 140, 18), standardMat(0x302c39, 0x8b3dff, 0.28)),
    4, { spin: 0.22 }
  );
  knot.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.TorusKnotGeometry(1.5, 0.4, 60, 8), 30),
    new THREE.LineBasicMaterial({ color: 0x8b3dff, transparent: true, opacity: 0.28 })
  ));
  contactGroup.add(knot);
  const sparks = [];
  const sparkGeo = new THREE.TetrahedronGeometry(0.14, 0);
  for (let i = 0; i < (isMobile ? 10 : 22); i++) {
    const s = new THREE.Mesh(sparkGeo, standardMat(0x3b334b, i % 2 ? 0x8b3dff : 0x7058d4, 0.55));
    const a = Math.random() * Math.PI * 2;
    const r = 2.2 + Math.random() * 2.4;
    s.position.set(Math.cos(a) * r, (Math.random() - 0.5) * 4, Math.sin(a) * r);
    register(s, 4, { spinFast: 1 + Math.random() * 2, drift: Math.random() * Math.PI * 2, baseY: s.position.y });
    contactGroup.add(s);
    sparks.push(s);
  }

  // ---- Click / tap particle bursts ----
  const burstCount = 26;
  const bursts = [];
  function spawnBurst(point) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(burstCount * 3);
    const vel = [];
    for (let i = 0; i < burstCount; i++) {
      pos[i * 3] = point.x;
      pos[i * 3 + 1] = point.y;
      pos[i * 3 + 2] = point.z;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 1.6 + Math.random() * 2.4;
      vel.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed
      ));
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: Math.random() > 0.5 ? 0x8b3dff : 0x7058d4,
      size: 0.12,
      transparent: true,
      opacity: 1,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    bursts.push({ pts, vel, life: 1 });
  }

  // ---- Interaction state ----
  const pointer = { x: 0, y: 0 };
  const ndc = new THREE.Vector2(-2, -2);
  let dragging = false;
  let dragMoved = 0;
  let lastX = 0;
  let rotY = 0;
  let rotVelocity = 0;

  window.addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    ndc.set(pointer.x, pointer.y);
    if (dragging) {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      dragMoved += Math.abs(dx);
      rotVelocity = dx * 0.004;
      rotY += rotVelocity;
    }
  }, { passive: true });

  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    dragMoved = 0;
    lastX = e.clientX;
  });
  window.addEventListener("pointerup", (e) => {
    dragging = false;
    if (dragMoved < 6 && e.type === "pointerup") {
      // treat as a tap: burst where the ray meets the current zone plane
      ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(hoverables, false)[0];
      if (hit) {
        hit.object.userData.clicked = 1;
        spawnBurst(hit.point);
      } else {
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 2.5);
        const p = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(plane, p)) spawnBurst(p);
      }
    }
  });
  window.addEventListener("pointercancel", () => { dragging = false; });

  // Scroll: camera travels down the zones
  let scrollProgress = 0;
  function updateScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  }
  window.addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const raycaster = new THREE.Raycaster();
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    const camTargetY = -scrollProgress * journeyDepth;
    camera.position.y += (camTargetY + pointer.y * 0.5 - camera.position.y) * 0.06;
    camera.position.x += (pointer.x * 0.9 - camera.position.x) * 0.05;
    camera.lookAt(0, camera.position.y - pointer.y * 0.2, 0);

    // Which zone is the camera in?
    const zoneFloat = scrollProgress * (ZONES - 1);
    const activeZone = Math.round(zoneFloat);

    // Hero orbit
    for (const f of heroFrames) {
      const a = f.userData.angle + t * 0.18;
      f.position.set(
        Math.cos(a) * f.userData.radius,
        Math.sin(t * 0.7 + f.userData.bobOffset) * 0.35,
        Math.sin(a) * f.userData.radius
      );
      f.rotation.y = -a + Math.PI / 2;
      f.rotation.z = Math.sin(t * 0.5 + f.userData.bobOffset) * 0.08;
    }
    if (vexText) {
      vexText.rotation.y = Math.sin(t * 0.3) * 0.15 + rotY * 0.4;
      vexText.position.y = 3.7 + Math.sin(t * 0.6) * 0.15;
    }
    for (const s of heroStars) {
      s.rotation.y += 0.01 * s.userData.spinFast;
      s.position.y = s.userData.baseY + Math.sin(t * 0.8 + s.userData.bobOffset) * 0.3;
    }

    // Works carousel
    for (const m of workItems) {
      const a = m.userData.angle + t * 0.14;
      m.position.set(
        Math.cos(a) * m.userData.radius,
        Math.sin(t * 0.8 + m.userData.bobOffset) * 0.4,
        Math.sin(a) * m.userData.radius
      );
      m.rotation.y = -a + Math.PI / 2;
    }
    workRing.rotation.z = t * 0.05;

    // Gems & knot & coins & sparks
    for (const g of [gem1, gem2, gem3, bigGem, knot]) {
      g.rotation.x += 0.002 * (g.userData.spin > 0 ? 1 : -1);
      g.rotation.y += 0.0035 * (g.userData.spin > 0 ? 1 : -1);
    }
    for (const c of coins) {
      const a = c.userData.angle + t * 0.5;
      c.position.set(
        Math.cos(a) * c.userData.radius,
        Math.sin(t * 1.1 + c.userData.bobOffset) * 0.5,
        Math.sin(a) * c.userData.radius
      );
      c.rotation.z = a;
    }
    for (const s of sparks) {
      s.rotation.x += 0.02 * s.userData.spinFast;
      s.rotation.y += 0.015 * s.userData.spinFast;
      s.position.y = s.userData.baseY + Math.sin(t * 0.9 + s.userData.drift) * 0.6;
    }

    particles.rotation.y = t * 0.012;

    // Drag rotation with inertia on the active zone's group
    if (!dragging) {
      rotVelocity *= 0.95;
      rotY += rotVelocity;
    }
    const groups = [heroGroup, workGroup, aboutGroup, priceGroup, contactGroup];
    groups.forEach((g, i) => {
      const target = i === activeZone ? rotY + Math.sin(t * 0.1) * 0.05 : 0;
      g.rotation.y += (target - g.rotation.y) * 0.08;
      // fade far zones a touch via scale for depth feel
      const dist = Math.abs(i - zoneFloat);
      const s = Math.max(0.55, 1 - dist * 0.18);
      g.scale.setScalar(s);
    });

    // Hover raycast: light up + scale the hovered mesh
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(hoverables, false)[0];
    const hovered = hit ? hit.object : null;
    canvas.style.cursor = hovered ? "pointer" : "grab";
    for (const m of hoverables) {
      const target = m === hovered ? 1 : 0;
      m.userData.hover += (target - m.userData.hover) * 0.15;
      if (m.userData.clicked) {
        m.userData.clicked *= 0.94;
        if (m.userData.clicked < 0.01) m.userData.clicked = 0;
      }
      const boost = m.userData.hover + (m.userData.clicked || 0) * 1.4;
      m.material.emissiveIntensity = m.userData.baseEmissive + boost * 0.9;
      const baseScale = m.userData.origScale || (m.userData.origScale = m.scale.x);
      const targetScale = baseScale * (1 + m.userData.hover * 0.14 + (m.userData.clicked || 0) * 0.25);
      m.scale.setScalar(targetScale);
      if (m.userData.spinFast && m === hovered) m.rotation.y += 0.05;
    }

    // Bursts
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.life -= 0.016;
      const arr = b.pts.geometry.attributes.position.array;
      for (let j = 0; j < burstCount; j++) {
        arr[j * 3] += b.vel[j].x * 0.016;
        arr[j * 3 + 1] += b.vel[j].y * 0.016;
        arr[j * 3 + 2] += b.vel[j].z * 0.016;
        b.vel[j].multiplyScalar(0.985);
      }
      b.pts.geometry.attributes.position.needsUpdate = true;
      b.pts.material.opacity = Math.max(b.life, 0);
      if (b.life <= 0) {
        scene.remove(b.pts);
        b.pts.geometry.dispose();
        b.pts.material.dispose();
        bursts.splice(i, 1);
      }
    }

    renderer.render(scene, camera);
  }

  if (reducedMotion) {
    camera.position.y = 0;
    renderer.render(scene, camera);
    const hint = document.getElementById("drag-hint");
    if (hint) hint.style.display = "none";
  } else {
    animate();
  }
}

/* ================= Boot ================= */

loadWorks();
loadLinks();
initMagnetic();
initCursorGlow();
initTilt(document);
