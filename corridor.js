/* VEX Corridor — scroll-driven 3D hallway with the works on its walls.
   Inserted between the hero and the playlists. At the end the normal site
   continues (playlists section follows directly).
   Performance contract (S22): no shadows, no postFX, DPR <= 1.5, at most two
   live video textures (nearest panels), posters elsewhere, renderer paused
   while the corridor is off screen, reduced-motion skips the whole thing. */
import * as THREE from 'three';

(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('section.hero');
  if (reduced || !hero) return;

  /* ---- test WebGL before touching the page ---- */
  let renderer;
  const canvas = document.createElement('canvas');
  canvas.id = 'corridor-canvas';
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));

  /* ---- scroll region + overlays ---- */
  const region = document.createElement('div');
  region.id = 'corridor-region';
  hero.insertAdjacentElement('afterend', region);

  const worksSection = document.getElementById('works');
  if (worksSection) worksSection.hidden = true; /* the corridor is the works showcase in this variant */

  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;display:block;z-index:4;pointer-events:none;opacity:0;transition:opacity .45s';
  document.body.append(canvas);

  const ui = document.createElement('div');
  ui.style.cssText = 'position:fixed;inset:0;z-index:5;pointer-events:none;display:none';
  ui.innerHTML =
    '<div id="corridor-cap" style="position:absolute;bottom:8vh;left:0;right:0;text-align:center;padding:0 24px;transition:opacity .35s">' +
      '<h2 id="corridor-cap-title" style="font-size:clamp(1.4rem,4vw,2.6rem);font-weight:900;text-shadow:0 4px 30px rgba(6,7,15,.95)"></h2>' +
      '<p id="corridor-cap-desc" style="color:#8E8CA8;font-size:.9rem;margin-top:8px;max-width:520px;margin-inline:auto;text-shadow:0 2px 14px rgba(6,7,15,.9)"></p>' +
    '</div>' +
    '<div id="corridor-hint" style="position:absolute;bottom:2.6vh;left:50%;transform:translateX(-50%);font-size:.78rem;color:#8E8CA8;border:1px solid rgba(139,61,255,.18);border-radius:999px;padding:8px 18px;backdrop-filter:blur(8px);background:rgba(6,7,15,.5);white-space:nowrap">اسكرول — <b style="color:#B07CFF;font-weight:600">الممر بيمشي معاك</b></div>' +
    '<button id="corridor-skip" type="button" style="position:absolute;top:84px;inset-inline-start:20px;pointer-events:auto;font:inherit;font-size:.8rem;color:#8E8CA8;border:1px solid rgba(139,61,255,.18);border-radius:999px;padding:8px 16px;background:rgba(6,7,15,.5);backdrop-filter:blur(8px);cursor:pointer">تخطي المشهد ↗</button>';
  document.body.append(ui);
  const capEl = ui.querySelector('#corridor-cap');
  const capTitle = ui.querySelector('#corridor-cap-title');
  const capDesc = ui.querySelector('#corridor-cap-desc');
  const hintEl = ui.querySelector('#corridor-hint');

  /* ---- data: works from the control panel ---- */
  const SUPA = 'https://aoabbtazodqpkkriitfj.supabase.co/rest/v1/';
  const KEY = 'sb_publishable_PKo1mx_pBxg16R8y2_6y6Q_aGRWWDU4';
  const PREVIEW = { /* work_id -> [poster, mp4] small local previews */
    '7c11e63f-5f84-470d-8bbc-52e27c59909d': ['4-preview-7c11e63f-5f84-470d-8bbc-52e27c59909d.jpg', '3-preview-7c11e63f-5f84-470d-8bbc-52e27c59909d.mp4'],
    '5f9f9fed-f2ec-4a7d-bcaf-95000bdd67a6': ['6-preview-5f9f9fed-f2ec-4a7d-bcaf-95000bdd67a6.jpg', '5-preview-5f9f9fed-f2ec-4a7d-bcaf-95000bdd67a6.mp4'],
    '6c9ebc68-5644-49d3-94f3-00b08b263573': ['8-preview-6c9ebc68-5644-49d3-94f3-00b08b263573.jpg', '7-preview-6c9ebc68-5644-49d3-94f3-00b08b263573.mp4'],
  };
  const LOCAL_BY_DRIVE = { /* drive id -> [mp4, poster] hosted copies */
    '1hMPFL4FP6bvHEjTy363dKyEVCwFp01yK': ['5-vxw1.mp4', '1-vxw1.jpg'],
    '1HficdsCKxcewqkemYcpuD048rxR2DNSz': ['6-vxw2.mp4', '2-vxw2.jpg'],
    '1sSnMK7QRq8X4gK285PBntAN3xSbRZf7r': ['7-vxw3.mp4', '3-vxw3.jpg'],
    '1WbaMt4MIgAnjuavP2QU51zOy8nRf0pWw': ['8-vxw4.mp4', '4-vxw4.jpg'],
    '1nNUt_X0fD4ve6w9z69FtasiRk8N0WfGR': ['1-vxw5.mp4', '2-vxw5.jpg'],
    '1D7skyywm9PLi5VvN2YbYXkMf8qc-T8_B': ['1-vxw6.mp4', '2-vxw6.jpg'],
  };
  const driveId = (url) => {
    const m = (url || '').match(/drive\.google\.com\/file\/d\/([\w-]+)/) || (url || '').match(/drive\.google\.com\/open\?id=([\w-]+)/);
    return m ? m[1] : null;
  };
  const driveThumb = (id) => 'https://drive.google.com/thumbnail?id=' + id + '&sz=w800';

  /* ---- scene ---- */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x06070f);
  scene.fog = new THREE.FogExp2(0x0b0618, 0.034);
  const PORTRAIT = innerWidth < innerHeight;
  const camera = new THREE.PerspectiveCamera(PORTRAIT ? 88 : 62, innerWidth / innerHeight, 0.1, 90);

  scene.add(new THREE.AmbientLight(0x9a7bd8, 1.0));
  scene.add(new THREE.HemisphereLight(0x4a3a80, 0x0a0a18, 0.5));
  const key = new THREE.PointLight(0xb07cff, 50, 34); scene.add(key);

  /* Corridor path: straight, turn right, straight, turn left, straight out. */
  const pts2 = [
    [0, 12], [0, 4], [0, -6], [0.6, -10.5], [3.5, -13.5], [8, -15], [13, -15],
    [16.5, -16.2], [18.8, -19.5], [19.5, -25], [19.5, -31], [19.5, -38],
  ];
  const curve = new THREE.CatmullRomCurve3(pts2.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'catmullrom', 0.35);
  const HALF_W = 3.1, WALL_H = 4.2;

  /* subtle wall texture: seams + dado line, generated once on a canvas */
  function wallTexture() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 256, 0, 0);
    grad.addColorStop(0, '#171a30'); grad.addColorStop(0.35, '#12142a'); grad.addColorStop(1, '#0d0f22');
    g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(139,61,255,.28)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 168); g.lineTo(256, 168); g.stroke(); /* dado rail */
    g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 1;
    for (let x = 0; x <= 256; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const wallTex = wallTexture();

  /* Ribbon geometry builder: floor, ceiling, left/right walls along the curve */
  function ribbon(offsetA, offsetB, yA, yB, color, opts) {
    const N = 160;
    const pos = [], idx = [], uv = [];
    const p = new THREE.Vector3(), tan = new THREE.Vector3(), nor = new THREE.Vector3();
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      curve.getPointAt(u, p);
      curve.getTangentAt(u, tan);
      nor.set(-tan.z, 0, tan.x).normalize(); /* left of travel */
      pos.push(p.x + nor.x * offsetA, yA, p.z + nor.z * offsetA);
      pos.push(p.x + nor.x * offsetB, yB, p.z + nor.z * offsetB);
      uv.push(u * 24, 0, u * 24, 1);
      if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.05, map: (opts && opts.map) || null, side: THREE.DoubleSide });
    scene.add(new THREE.Mesh(g, m));
  }
  ribbon(-HALF_W, HALF_W, -2.1, -2.1, 0x0e1020);            /* floor */
  ribbon(-HALF_W, HALF_W, WALL_H - 2.1, WALL_H - 2.1, 0x0a0a18); /* ceiling */
  ribbon(HALF_W, HALF_W, -2.1, WALL_H - 2.1, 0xffffff, { map: wallTex });     /* right wall */
  ribbon(-HALF_W, -HALF_W, -2.1, WALL_H - 2.1, 0xffffff, { map: wallTex });   /* left wall */

  /* glow rails along floor edges + ceiling center, following the curve */
  function rail(offset, y, color, opacity) {
    const pts = [];
    const p = new THREE.Vector3(), tan = new THREE.Vector3(), nor = new THREE.Vector3();
    for (let i = 0; i <= 160; i++) {
      const u = i / 160;
      curve.getPointAt(u, p); curve.getTangentAt(u, tan);
      nor.set(-tan.z, 0, tan.x).normalize();
      pts.push(new THREE.Vector3(p.x + nor.x * offset, y, p.z + nor.z * offset));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    scene.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity })));
  }
  rail(HALF_W - 0.12, -2.08, 0x8b3dff, 0.55);
  rail(-(HALF_W - 0.12), -2.08, 0x8b3dff, 0.55);
  rail(0, WALL_H - 2.12, 0x8b3dff, 0.3);

  /* exit glow at the end of the path */
  const exitGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(HALF_W * 2, WALL_H),
    new THREE.MeshBasicMaterial({ color: 0x8b3dff, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
  );
  {
    const end = curve.getPointAt(1), tan = curve.getTangentAt(1);
    exitGlow.position.copy(end).add(new THREE.Vector3(0, WALL_H / 2 - 2.1, 0));
    exitGlow.lookAt(end.clone().sub(tan));
  }
  scene.add(exitGlow);

  /* title plate above a panel: Arabic text on a canvas texture */
  function titlePlate(text) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 96;
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(6,7,15,0)'; g.clearRect(0, 0, 512, 96);
    g.font = '700 44px "Readex Pro", sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = '#8B3DFF'; g.shadowBlur = 18;
    g.fillStyle = '#E9E4FF';
    g.fillText(text.slice(0, 30), 256, 50);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.6), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
  }

  const texLoader = new THREE.TextureLoader();
  texLoader.setCrossOrigin('anonymous');
  const panels = [];
  let works = [];

  function posterTexture(work) {
    return new Promise((resolve) => {
      const url = work.poster;
      if (!url) return resolve(null);
      texLoader.load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; resolve(t); }, undefined, () => resolve(null));
    });
  }

  function placeholderTexture(title) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 800;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 512, 800);
    grad.addColorStop(0, '#141126'); grad.addColorStop(1, '#1d1040');
    g.fillStyle = grad; g.fillRect(0, 0, 512, 800);
    g.font = '900 90px "Readex Pro", sans-serif'; g.textAlign = 'center';
    g.fillStyle = '#8B3DFF'; g.shadowColor = '#8B3DFF'; g.shadowBlur = 30;
    g.fillText('VEX.', 256, 420);
    g.font = '600 34px "Readex Pro", sans-serif'; g.fillStyle = '#E9E4FF'; g.shadowBlur = 8;
    g.fillText((title || '').slice(0, 18), 256, 500);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function addPanel(work, i, total) {
    const u = 0.07 + (i / Math.max(1, total - 1)) * 0.82;
    const side = i % 2 === 0 ? 1 : -1; /* alternate right/left */
    const p = curve.getPointAt(u), tan = curve.getTangentAt(u);
    const nor = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const group = new THREE.Group();
    const W = 3.2, H = 4.3; /* 9:16-ish reel frame */

    const mat = new THREE.MeshBasicMaterial({ map: work.posterTex || placeholderTexture(work.title), side: THREE.DoubleSide });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat);
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.22, H + 0.22), new THREE.MeshBasicMaterial({ color: 0x8b3dff, transparent: true, opacity: 0.85, wireframe: true }));
    frame.position.z = -0.02;
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(W + 1.4, H + 1.4), new THREE.MeshBasicMaterial({ color: 0x8b3dff, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    halo.position.z = -0.09;
    const plate = titlePlate(work.title);
    plate.position.y = H / 2 + 0.55;

    group.add(halo, frame, screen, plate);
    const wallPoint = p.clone().add(nor.clone().multiplyScalar(side * (HALF_W - 1.1)));
    group.position.set(wallPoint.x, 0.35, wallPoint.z);
    /* face the spot where the visitor stands when the panel is the nearest one */
    const stand = curve.getPointAt(Math.max(0.001, u - 0.07));
    group.lookAt(stand.setY(0.35));
    /* purple light strip above the panel */
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.4, 0.07), new THREE.MeshBasicMaterial({ color: 0xb07cff, side: THREE.DoubleSide }));
    strip.position.y = H / 2 + 0.25;
    group.add(strip);
    scene.add(group);
    panels.push({ u, group, work, mat, video: null, live: false });
  }

  /* upgrade the nearest panels to live video (local mp4 only: Drive can't hotlink) */
  function refreshLivePanels(u) {
    const sorted = panels.map((p, i) => [Math.abs(p.u - u), i]).sort((a, b) => a[0] - b[0]);
    const want = new Set(sorted.slice(0, 2).map(([, i]) => i));
    panels.forEach((panel, i) => {
      if (want.has(i) && !panel.live && panel.work.mp4) {
        const v = document.createElement('video');
        v.src = panel.work.mp4; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
        v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
        v.play().catch(() => {});
        const t = new THREE.VideoTexture(v); t.colorSpace = THREE.SRGBColorSpace;
        panel.mat.map = t; panel.mat.needsUpdate = true; /* poster texture kept for the downgrade */
        panel.video = v; panel.live = true;
      } else if (!want.has(i) && panel.live) {
        panel.video.pause(); panel.video.removeAttribute('src'); panel.video.load();
        if (panel.mat.map && panel.mat.map.dispose) panel.mat.map.dispose();
        panel.mat.map = panel.work.posterTex || placeholderTexture(panel.work.title);
        panel.mat.needsUpdate = true;
        panel.video = null; panel.live = false;
      }
    });
  }

  /* ---- scroll driver (Athens-style damping) ---- */
  let target = 0, current = 0, active = false, inView = false;
  const clock = new THREE.Clock();

  function regionProgress() {
    const r = region.getBoundingClientRect();
    const total = region.offsetHeight - innerHeight;
    if (total <= 0) return r.top > 0 ? 0 : 1;
    return Math.min(1, Math.max(0, -r.top / total));
  }

  const START = new THREE.Vector3(), look = new THREE.Vector3(), pos = new THREE.Vector3(), tan = new THREE.Vector3();
  let lastTan = new THREE.Vector3(0, 0, -1), roll = 0;

  function frame() {
    requestAnimationFrame(frame);
    if (!inView) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    target = regionProgress();
    current += (target - current) * (1 - Math.exp(-dt * 4.5));
    if (Math.abs(target - current) < 0.0004) current = target;

    const u = Math.min(0.9999, Math.max(0.0001, current));
    curve.getPointAt(u, pos);
    curve.getTangentAt(u, tan);
    camera.position.set(pos.x, 0.1, pos.z);
    look.copy(pos).add(tan); camera.lookAt(look);
    /* drone banking: roll into turns */
    const turn = lastTan.clone().cross(tan).y;
    roll += ((turn * 14) - roll) * Math.min(1, dt * 5);
    camera.rotateZ(roll * 0.35);
    lastTan.copy(tan);
    key.position.copy(pos).add(new THREE.Vector3(0, 1.6, 0)).add(tan.clone().multiplyScalar(2.5));

    refreshLivePanels(u);

    /* captions: nearest panel ahead */
    let best = null, bd = 1;
    panels.forEach((p) => { const d = Math.abs(p.u - u); if (d < bd) { bd = d; best = p; } });
    const show = best && bd < 0.12 && current > 0.015 && current < 0.985;
    capEl.style.opacity = show ? 1 : 0;
    if (show) {
      if (capTitle.textContent !== best.work.title) {
        capTitle.textContent = best.work.title;
        capDesc.textContent = best.work.description || '';
      }
    }
    hintEl.style.opacity = current > 0.02 ? 0 : 1;

    /* fade the scene out at the very end into the playlists */
    const endFade = current > 0.93 ? 1 - (current - 0.93) / 0.07 : 1;
    const startFade = current < 0.02 ? 0.35 + (current / 0.02) * 0.65 : 1;
    canvas.style.opacity = (Math.min(endFade, startFade)).toFixed(3);

    renderer.render(scene, camera);
  }

  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }
  addEventListener('resize', resize);
  resize();

  /* region visibility drives the fixed canvas + ui */
  const io = new IntersectionObserver((es) => {
    inView = es[0].isIntersecting;
    const p = regionProgress();
    const showScene = inView && p < 1;
    canvas.style.display = showScene ? 'block' : 'none';
    ui.style.display = showScene ? 'block' : 'none';
    if (!inView) panels.forEach((pl) => { if (pl.video) pl.video.pause(); });
  }, { threshold: 0 });
  io.observe(region);
  document.addEventListener('visibilitychange', () => { if (document.hidden) panels.forEach((pl) => { if (pl.video) pl.video.pause(); }); });

  ui.querySelector('#corridor-skip').addEventListener('click', () => {
    const y = region.offsetTop + region.offsetHeight - innerHeight + 4;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });

  /* ---- boot ---- */
  const FALLBACK = [
    { title: 'ريل أثاث | المهندس علاء', description: 'مونتاج كامل: إيقاع، انتقالات، وألوان.', video_url: 'https://drive.google.com/file/d/1hMPFL4FP6bvHEjTy363dKyEVCwFp01yK/preview' },
    { title: 'مونتاجي — ريل 2', description: 'قطع سريع على البيت مع كابشن متزامن.', video_url: 'https://drive.google.com/file/d/1HficdsCKxcewqkemYcpuD048rxR2DNSz/preview' },
  ];

  async function boot() {
    let rows = null;
    try {
      const r = await fetch(SUPA + 'works?select=id,title,video_url,cover_url,description&order=sort_order.asc', { headers: { apikey: KEY } });
      if (r.ok) rows = await r.json();
    } catch { /* offline: fallback */ }
    const list = (rows && rows.length ? rows : FALLBACK).slice(0, 8);
    works = list.map((w) => {
      const id = w.id, did = driveId(w.video_url);
      const prev = id && PREVIEW[id];
      const local = did && LOCAL_BY_DRIVE[did];
      return {
        title: w.title || 'ريل',
        description: (w.description || '').trim(),
        mp4: (prev && prev[1]) || (local && local[0]) || null,
        poster: (prev && prev[0]) || (local && local[1]) || (did ? driveThumb(did) : (w.cover_url && w.cover_url.trim()) || null),
        posterTex: null,
      };
    });
    await document.fonts.ready;
    await Promise.all(works.map(async (w) => { w.posterTex = await posterTexture(w); }));
    works.forEach((w, i) => addPanel(w, i, works.length));
    region.style.height = Math.max(420, works.length * 70) + 'vh';
    frame();
  }
  boot();
})();
