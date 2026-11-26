# VEX Pro Max Upgrade (lab only)

Applied the ui-ux-pro-max skill (`.claude/skills/ui-ux-pro-max`) on top of the rebuild.
Skill queries used: `--design-system "dark immersive 3D portfolio video editor agency"` (Hero-Centric pattern,
Dark Mode OLED, glow + focus + reduced-motion checklist), `--domain gsap "cinematic intro reveal entrance"`
(stagger/easing guidance), `--domain ux "scroll reveal stagger timing"` (smooth scroll, motion tokens, no horizontal scroll).
Brand tokens (navy #05060d, purple #8B3DFF, Readex Pro, AR/EN RTL) kept over the generic palette on purpose.

## What changed
1. **2-second 3D intro**: fullscreen VEX letters land with 3D rotateX + blur stagger, progress bar 0-100%,
   WebGL camera dollies in from z=24 to z=9; exit wipe starts at 1450ms and the overlay is fully gone at 2000ms.
   Tap/click skips. `prefers-reduced-motion`: intro is removed entirely. Inline 4s fallback hides it if the module fails.
2. **Interactivity**: magnetic buttons, cursor glow follower (desktop, pointer:fine), coverflow depth scaling toward
   center + prev/next arrows, pointer-tracked glow on stat/about cards, scroll progress bar, nav condenses on scroll,
   animated kicker pill, marquee ticker strip, film grain overlay.
3. **UI/UX checklist**: 44px nav link targets, cursor:pointer on arrows, reduced-motion honored everywhere,
   varied transition durations, distinct SVG icons for works/playlists stats, fixed "(layer)" copy typo, dynamic footer year.

## Untouched
- Supabase usage stays read-only (publishable key, GET only): works, site_links, niches config.
- All content, WhatsApp CTAs, AR/EN toggle, niche.html, cover-first + click-to-play works cards.
