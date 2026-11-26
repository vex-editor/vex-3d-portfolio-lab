# VEX Lab Rebuild Plan

**Design Direction (ui-ux-pro-max):** Hero-Centric pattern + Dark Mode (OLED). Keep VEX brand: navy #06070F, electric purple #8B3DFF, Readex Pro font. Minimal glow, dark-to-light transitions. One primary CTA in hero. Respects reduced-motion.

**Section-by-Section Plan for index.html:**

1. **Three.js Intro (rewritten)** — Orbiting rings around "VEX" wordmark, shorter duration, smoother easing, respect prefers-reduced-motion.
2. **Nav** — Sticky glassmorphism bar, logo + lang toggle (AR/EN, RTL flip), WhatsApp CTA.
3. **Hero** — Full-bleed, centered headline "مونتاج ريلز بإيقاع محسوب", sub-copy, single primary CTA (WhatsApp), subtle scroll cue.
4. **Value Prop Strip** — One-line: "مش مجرد فيديو، دي تجربة" with purple accent.
5. **Playlists/Works Grid** — Folder-style cards (from niches.css), hover preview, loads from Supabase `works` + `site_links` (niches_config_v1).
6. **About/Process** — 3 icon-less points, glass cards, no numbered markers.
7. **Footer** — Minimal: social links (if configured), version, copyright.

**Constraints:** Keep all Supabase URLs, keys, table names, fetch wiring byte-identical. No prices. Mobile-first, excellent touch targets. Video player controls small, bottom, hide on tap (vex-player.js). Arabic-first, RTL.

PLAN-READY
## VISUAL REFERENCE (Hamza, 3:49): Manova.graphics portfolio — replicate closely
- Overall: OLED near-black background with deep violet/purple glow gradients (top center glow), Arabic RTL, very bold large Arabic headlines.
- Hero: huge headline (e.g. "خلّي إبداعك يتكلم."), small chip/badge, portrait cutout of the person right side (for VEX: use his logo mark instead), top nav: section links + CTA button (whatsapp).
- Works section ("أعمالي"): horizontal coverflow — project cards in 3D perspective tilt, center card largest, hover to preview video.
- Centerpiece: a draggable 3D object floating with small purple orbs (Manova uses an open book; VEX keeps rings orbiting the VEX word — style them like the reference: glossy, purple-lit).
- Stats strip: big numbers with purple icon chips (for VEX: works count, playlists, years).
- About section: text + photo/card layout.
- Client logo strip: SKIP (VEX has none).

## ANIMATIONS/INTERACTIONS from Manova video (frame-by-frame, 47 frames @2fps) — replicate each:
1. HERO ENTRANCE: staggered blur-in + fade-up. Headline first (blur→sharp), then portrait/logo, then the small chip CTA. ~0.6s apart.
2. WORKS COVERFLOW: draggable 3D carousel. Cards in perspective: center card scales up and faces forward, side cards rotateY-tilt away and shrink/dim. Drag with momentum glide; fast drag makes cards fly/flip through the carousel. Hover on center card plays video preview (existing vex-player behavior).
3. 3D CENTERPIECE: floating object (VEX: rings orbiting the VEX word, purple-lit glossy) with slow idle rotation + drag-to-rotate; small purple glowing orbs orbit around it.
4. SCROLL TRANSITIONS: each section (about, stats) fades + slides up when it enters the viewport (IntersectionObserver, translateY(30px)→0, opacity 0→1, ease-out ~0.7s).
5. STATS COUNT-UP: three cards with purple icon chips pop in staggered; numbers count up from 0 to final (e.g. +10/+800/+1000 style) when scrolled into view.
6. AMBIENT GLOW: fixed violet radial glow at top center of viewport, subtle slow pulse; page background near-black #05060d.
7. NAV: sticky top bar, section links + WhatsApp CTA chip.
NOT VISIBLE IN VIDEO (say plainly if asked): exact easing/timing values (360p recording, approximated), any custom cursor (not discernible), the 3D open-book model itself (VEX keeps its rings instead).
