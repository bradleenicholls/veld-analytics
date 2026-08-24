# Veld Analytics

Source for [veldanalytics.com](https://veldanalytics.com) — a static site (HTML, CSS, vanilla JS, no build step, no frameworks).

## Structure

- `index.html`, `services.html`, `work.html`, `approach.html`, `about.html`, `contact.html` — pages
- `css/style.css` — styles
- `js/main.js` — shared site behaviour (nav, reveal animations, etc.)
- `js/demo-dashboard.js` — the interactive live dashboard demo on the Work page
- `js/aurora.js`, `js/beams.js`, `js/ferrofluid.js`, `js/galaxy.js`, `js/topography.js` — background visual effects
- `assets/` — favicon and logo SVGs

## Deploy

Hosted via GitHub Pages, with the custom domain configured through the `CNAME` file and DNS records on Cloudflare.
