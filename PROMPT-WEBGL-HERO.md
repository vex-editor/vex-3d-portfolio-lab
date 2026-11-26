# Brief: WebGL hero for the VEX portfolio (lab)

You are working in a static site (no build step) that deploys to GitHub Pages as-is.
Everything must keep working after your change: all sections, the AR/EN language
toggle, the works grid (Supabase), the niche pages. This is a lab preview — the
live site is a different repo and must not be touched.

## Brand

- VEX: a video editor's portfolio. Arabic-first (RTL), English toggle.
- Colors: navy `#06070F` background, purple `#8B3DFF` accent, foreground `#f3f2fa`.
- Font: Readex Pro (already loaded). Glassmorphism panels, purple glow accents.

## Reference level (what the owner asked to match)

The owner sent a reel of the "MORI MOCHI" concept site and wants this level of
interaction and 3D. Its traits:
1. One persistent photoreal 3D object is the site's character, present everywhere.
2. Scroll-driven scenes: full-screen chapters, background color shifts, camera moves.
3. Soft-body look: the object squishes, wobbles, floats with real weight.
4. Editorial typography with giant outline ghost words behind scenes.
5. Minimal chrome: content and the 3D object carry the page.

## What to build

A real WebGL hero (Three.js), replacing the current 2D canvas background effect in
the hero ONLY. Keep the DOM headline and all hero content on top of it.

### Hard constraints (do not break these)

- The hero headline (`#hero-title`, `.grad`) is pixel-faithful to the original site
  and must stay EXACTLY as it is: markup, CSS, colors, halo. Never add transforms,
  opaque text-shadows, filters, or 3D context to it or its ancestors — Chrome stops
  painting `background-clip:text` faces if you do. The existing
  `initHeadlineInteractive()` (gradient pan + halo shift on pointer) stays.
- The AR/EN toggle (`updateDynamicText`, `headlineMarkup()`) must keep working.
- No build tools, no npm. Vendor libraries as plain files under `vendor/` and load
  them with an import map or a plain `<script>` tag.
- All animation progress must be driven by `performance.now()` deltas, not rAF
  timestamps, and clamped to [0,1] where applicable (this browser lags rAF).
- Respect the existing `reducedMotion` flag: with it, render one static frame.

### The scene

1. **Hero object**: a glossy 3D play-button prism — a rounded triangle extruded with
   beveled edges, purple physical material (clearcoat ~1, roughness ~0.25), subtle
   emissive purple rim. Build the geometry in code (Shape + ExtrudeGeometry with
   bevel, or RoundedBoxGeometry from examples) — no external model files.
   Alternative if simpler: a torus knot with the same material. Pick the play prism
   unless it fights you.
2. **Lighting**: soft key light (white, slightly warm), strong purple rim light from
   behind-left, dim blue fill, and a soft fake contact shadow (a radial-gradient
   texture on a plane under the object, or a blurred shadow mesh). Environment:
   RoomEnvironment from three examples for reflections.
3. **Motion**:
   - Idle: slow float (sin on Y ±0.15) and very slow rotation.
   - Pointer: the object eases toward the pointer (rotation follows, lerped ~0.06),
     like it is looking at the hand. Works with touch drag (pointermove).
   - Scroll: as the user scrolls from hero to works, the camera dollies back and the
     object rotates away and shrinks into the background; it should feel like the
     object leaves with the hero.
4. **Renderer**: transparent canvas (alpha), positioned fixed/absolute behind hero
   content, DPR capped at 1.75, antialias on desktop only. Pause rendering when the
   tab is hidden or the hero is scrolled far out of view (IntersectionObserver).
5. **Mobile fallback** (width < 768px or `navigator.hardwareConcurrency <= 4`):
   same scene but no shadows, DPR cap 1.5, reduced float; if WebGL context creation
   fails, hide the canvas silently (current background stays).

### Files

- `vendor/three.module.js` (+ any addons you use, imported via import map).
  Download from a pinned CDN version (e.g. three@0.180.0) into the repo.
- `hero-3d.js` as a module with an init function, called on DOMContentLoaded.
- Minimal CSS additions in the existing inline `<style>` in `index.html` (the
  external styles.css only serves niche.html — do not rely on it for index).
- Keep the existing particle/star background if it composes well under the new
  canvas; otherwise disable it in the hero only and say so in your summary.

## Acceptance criteria

- Desktop 1280px and mobile 390px: hero renders the object with lighting and
  shadows, headline on top unchanged, no console errors.
- Pointer over the hero visibly steers the object; scrolling pulls the camera back.
- AR and EN both fine; RTL layout unaffected.
- `index.html` still validates as a static file; no external runtime dependencies
  beyond the vendored files and the fonts/Supabase already in use.

## How to verify before finishing

Serve locally (e.g. `python3 -m http.server`) and check the console output with a
headless browser if available; otherwise review the code paths for the failure
modes above. List what you verified and what you could not in your final summary.
