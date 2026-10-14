# SoDes Member Icons

English static asset library for eleven members. Change the global color, preview original/vector assets, and download SVG, transparent PNG, or the unmodified generated PNG. Zoe uses candidate B; Feixue uses the single-ponytail revision.

Original PNGs retain their generated gray backgrounds. Vector paths are traced outlines, not pixel-identical copies. The SVG root `color` controls `currentColor` path fills. PNG exports render those vector paths onto transparent canvas at 512, 1024, or 2048 pixels.

No source photographs, analytics, authentication, or remote dependencies. Lucide icons are bundled locally under the ISC license.

## Local Preview

Run `python3 -m http.server 8765 --bind 127.0.0.1` in this folder, then open `http://127.0.0.1:8765`.

Run model and asset checks with `npm test`.

## Hosting

GitHub Pages publishes this repository's `main` branch at `/`. All asset links are relative to support project Pages URLs.
