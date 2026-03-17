# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for a FullStack developer, built with vanilla HTML, CSS, and JavaScript. Deployed on GitHub Pages (see `CNAME`).

## Build Commands

```bash
# Minify both CSS and JS (run after any changes to styles.css or scripts.js)
bash minifica.sh

# Or individually:
npm run minify:css   # Outputs styles.min.css
npm run minify:js    # Outputs scripts.min.js
```

There are no tests or linters configured.

**Important:** `index.html` references the minified files (`styles.min.css`, `scripts.min.js`). Always run minification after editing source files before committing.

## Architecture

Single-page portfolio with three source files:

- **`index.html`** — Complete page structure; all sections live here (hero, tech stack, projects, hobbies, contact)
- **`styles.css`** → compiled to `styles.min.css` — Design system uses CSS custom properties (defined in `:root`). Dark glassmorphism theme with slate palette; primary `#3b82f6`, secondary `#8b5cf6`
- **`scripts.js`** → compiled to `scripts.min.js` — Smooth scroll + Intersection Observer for scroll-triggered fade-up animations

Project images go in `/images/`.
