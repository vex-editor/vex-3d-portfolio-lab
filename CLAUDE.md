# VEX 3D Portfolio - project context

You are working on VEX, the personal 3D portfolio site of Hamza Sayed ("VEX"), a video editor.
Built as a static site (no framework): index.html, niche.html, admin.html, ai.html, main.js,
niches.js, admin-niches.js, vex-player.js, styles.css, brand.css, niches.css. Three.js powers
the intro (rings orbiting the word VEX). Hosted on GitHub Pages.

## URLs
- Live site:  https://vex-editor.github.io/vex-3d-portfolio/
- Owner admin panel: https://vex-editor.github.io/vex-3d-portfolio/admin.html
- AI (limited) panel: https://vex-editor.github.io/vex-3d-portfolio/ai.html
- Repo: https://github.com/vex-editor/vex-3d-portfolio

## Backend: Supabase (free tier)
- Project: https://aoabbtazodqpkkriitfj.supabase.co
- Publishable (public, client-side) key is SUPA_KEY in main.js / index.html / admin.html / ai.html:
  sb_publishable_PKo1mx_pBxg16R8y2_6y6Q_aGRWWDU4
- REST usage examples are in main.js: table `works` (select=*), table `site_links`
  (keys, urls incl. niches_config_v1), RPC `vex_count`, storage bucket `covers` (public).
- The service-role/secret key is NOT here and must never be added to the repo. Dashboard
  changes happen through the owner's browser session, not from code.

## Design system (do not regress)
- Colors: navy background #06070F, electric purple accent #8B3DFF (matches the VEX logo).
  Rejected: beige ("cheap"), teal/green (not in logo).
- Font: Readex Pro. Bilingual Arabic/English toggle (RTL matters).
- Playlists render as folder-style cards (corner tab, thin light type, purple glow).
- No prices anywhere on the site. Works live in niche playlists only, no loose videos.
- Glass video cards, video hover preview, custom cursor (desktop only), draggable 3D objects,
  "VEX GUIDE" helper (preset choices, not an AI chat), cookie notice (Accept all / Reject all).
- Analytics: only consenting visitors' page/playlist opens and WhatsApp clicks.

## Workflow rules
- Owner reviews screenshots first; publish to GitHub Pages ONLY when Hamza says "نزل".
- Must work well on every device. Known open bug: on phones the video player controls are too
  big and cover the video; they should be small, bottom, hide on tap.
- The AI panel (ai.html) may add/edit works and playlists; deleting, link changes and clearing
  the activity log are blocked server-side on purpose.

## Installed skills (.claude/skills)
- ui-ux-pro-max: local design-intelligence search (styles, palettes, typography, UX rules,
  GSAP presets, stacks incl. threejs). Run its search.py per its SKILL.md.
- ig-* (13 skills): Instagram content skills (plan, reel, caption, carousel, story, comment,
  reply, dm, profile, audit, viral, repurpose, humanize). They write content only; a human
  posts. Never scrape Instagram or auto-post.

## Tools
- hyperframes CLI (npm, global): HTML motion-graphics video compositions; render to MP4
  (ffmpeg installed). Use `npx hyperframes init/preview/render`.

## Model reality
You are running on free-tier models routed by FreeLLMAPI (localhost:3001), not real Claude.
Be honest about quality limits; keep answers and diffs tight.
