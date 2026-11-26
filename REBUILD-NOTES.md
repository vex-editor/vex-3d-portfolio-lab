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
