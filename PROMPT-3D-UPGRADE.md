# Mission: VEX 3D Depth Upgrade (lab)

You are Claude Code working in `/home/sandbox/vex-portfolio-lab`, the LAB repo of VEX, the personal
portfolio of Hamza Sayed, a Cairo-based video editor ("مونتاج ريلز بإيقاع محسوب" - reels editing with
calculated rhythm). This repo deploys to https://vex-editor.github.io/vex-3d-portfolio-lab/ via GitHub Pages.
The production site is a separate repo: NEVER touch it. Everything here is lab-only.

Read `CLAUDE.md` first for project context. Then use the installed skill
`.claude/skills/ui-ux-pro-max/scripts/search.py` (run it with python3) for animation/UX grounding:
query `--domain gsap` for entrance/reveal presets and `--domain ux` for motion guidelines before you write
animation code. Cite what you applied in your final summary.

## Site purpose and brand (do not regress)

- Purpose: convert visitors to a WhatsApp conversation; showcase works (Supabase-backed coverflow),
  niche playlists (niche.html), stats, about. Arabic-first RTL with an AR/EN toggle that flips direction.
- Brand: OLED navy background #05060d, electric purple #8B3DFF (+ #b99aff bright, #6028bb deep),
  Readex Pro, glassmorphism cards, minimal glow. No prices anywhere. No emojis as icons.
- Current state: single-file `index.html` (Three.js via importmap, scene = VEX text + rings + orbs +
  particles behind a hero, works coverflow from Supabase, stats count-up, about cards, marquee,
  2s intro overlay, magnetic buttons, cursor glow, scroll progress).

## Reference motion language (Manova.graphics, from the owner's reference video)

- Staggered blur-in + fade-up hero entrance (headline first, then object, then chip CTA, ~0.12s apart).
- 3D coverflow: center card largest and forward-facing, side cards rotateY away and dim; drag with momentum.
- A floating, obviously-3D centerpiece object, purple-lit glossy, slow idle rotation, draggable;
  small glowing orbs orbit it.
- Sections fade + slide up on viewport entry (IntersectionObserver, ease-out ~0.5-0.7s).
- Ambient violet radial glow at top center, near-black background.

## The complaint to fix

The current intro and site read as "weak, not convincing, not 3D enough". The owner wants REAL DEPTH:
a scene that reacts to mouse, scroll and touch; 3D tilt cards; a hero object that is unmistakably 3D;
a scroll-driven camera. The intro must remain at most 2 seconds total including its exit.

## What to implement (exact technical spec)

### 1. WebGL intro dive (the 2s intro becomes genuinely 3D)
- Start the camera at z=46 (deep in the fog) and dive to z=9 with easeOutCubic, driven by a shared
  progress variable `window.__introP` (0→1) that `runIntro()` already owns: extend `runIntro` to set
  `window.__introP` each frame (1 when done/skipped/reduced-motion).
- During the dive, rings and orbs spin ~4x their idle speed, easing down to 1x as `__introP`→1.
- Make the intro overlay background translucent (radial gradient rgba ~0.82→0.94) so the WebGL dive
  is visible around/behind the DOM letters. Keep letters, progress bar, counter, click-to-skip, the
  4s inline fallback, and the hard 2.0s total (exit wipe starts 1.45s, gone at 2.0s).

### 2. An unmistakably 3D hero object
- Center the VEX 3D text inside a slowly rotating wireframe TorusKnot cage (opacity ~0.2),
  metallic material (metalness 0.9, roughness 0.18, emissive purple pulsing 0.3±0.12).
- Add a white point light orbiting the scene for moving metallic highlights.
- Two particle dust layers (far 1600 small, near 320 bigger/brighter) drifting in opposite directions.
- Raise canvas presence: `#scene` opacity 0.45→0.6 desktop, 0.25→0.35 mobile. Hero group scale 0.8
  desktop / 0.42 mobile, positioned slightly below center so the Arabic headline stays readable
  (it has strong text-shadow; keep it).

### 3. Scene reacts to mouse / touch / scroll
- Pointer parallax: hero object rotates toward the pointer (rotY ±0.45, rotX ±0.25, lerped 0.06),
  camera x/y follow slightly (±0.9 / ±0.5).
- Drag on canvas rotates the object with inertia (already exists; keep, add vertical drag clamped ±0.5).
- Scroll-driven camera: as the user scrolls, camera pulls back (z = 9 + scrollY*0.004), sinks
  (y = -scrollY*0.0025), dust layers parallax at different rates (scrollY*0.004 / *0.009),
  and hero group gets a slow extra yaw (scrollY*0.0006).

### 4. Stronger 3D tilt cards
- In `buildCoverflowCard` tilt: rotateY (px-0.5)*-20deg, rotateX (py-0.5)*16deg, translateY(-10px) scale(1.03).
- Layered depth on hover: `.cover-overlay` translateZ(50px), `.cover-play` translateZ(70px)
  (parent already has preserve-3d), with 0.3s transitions.

### 5. 3D section reveals
- In `initScrollAnimations`, enter with `perspective(900px) rotateX(6deg) translateY(36px)` → identity,
  opacity 0→1, keep stagger and the reduced-motion instant path.

## Hard constraints

- Single-file edit of `index.html` only (+ this file). Keep every Supabase URL/key/table/fetch call
  byte-identical (read-only publishable key). Keep niche.html and all other files untouched.
- Keep the AR/EN toggle, marquee, magnetic buttons, cursor glow, cover-first + click-to-play works
  cards, WhatsApp links, and the `prefers-reduced-motion` behavior fully working.
- No new dependencies, no frameworks, no external assets beyond the existing jsDelivr Three.js + font.
- Mobile must stay fast: fewer particles on `isMobile`, antialias off on mobile (already), no layout shift.

## Quality bar

- $100k-agency polish: no visual glitches, no z-fighting, no text unreadable over the scene, no console
  errors, no horizontal scroll at 390px or 1280px, 60fps target (no per-frame layout reads in hot loops).
- After editing, verify your work: extract the module script and run `node --check` on it, and re-read
  your full diff with `git diff` to confirm nothing unrelated changed.

## Workflow

1. Read CLAUDE.md, this file, and the current index.html scene + intro sections.
2. Run the ui-ux-pro-max searches (gsap + ux) and note what you apply.
3. Implement in small, safe edits (Edit tool, exact anchors). Do not rewrite the whole file.
4. `node --check` the module script, `git diff --stat`, then summarize: what changed, which skill
   results you applied, and anything you could not do.
