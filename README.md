# Jargon Buster

A satirical corporate utility that translates real, machine-generated buzzword
phrases into blunt plain English. Built to sit on [The Shelf](https://apps.suvadipchakraborty.workers.dev/).

No logins, no build step, no framework — vanilla HTML/CSS/JS served by a
single Cloudflare Worker.

## How it works

- The **Home** tab calls a small in-house translation engine
  (`public/js/dictionary.js`) that parses the upstream buzzword phrase into
  its four parts (adverb / verb / adjective / noun phrase — that's the fixed
  shape the generator always produces) and reassembles a plain-English
  sentence from a hand-built jargon-to-plain dictionary.
- `src/worker.js` proxies `/api/jargon` to the upstream
  [Corporate BS Generator](https://corporatebs-generator.sameerkumar.website/)
  API server-side. The upstream only returns `{ "phrase": "..." }` — no
  meaning — which is exactly why the translation engine exists.
- Everything else (`env.ASSETS.fetch`) is served straight from `./public`.

## Project structure

```
jargon-buster/
├── public/                  # static site (served via ASSETS binding)
│   ├── index.html
│   ├── manifest.webmanifest
│   ├── sw.js
│   ├── robots.txt
│   ├── css/styles.css
│   ├── js/app.js
│   ├── js/dictionary.js
│   └── assets/
│       ├── og-image.png     # 1200x630 social preview
│       ├── icon-192.png
│       ├── icon-512.png
│       ├── apple-touch-icon.png
│       └── favicon.png
├── src/worker.js             # Worker: serves assets + proxies the API
├── wrangler.toml
└── README.md
```

## Local development

```bash
npm install -g wrangler   # if you don't have it already
wrangler dev
```

This serves the Worker (and the static assets it proxies to) at
`http://localhost:8787`.

## Deploy via GitHub sync (recommended)

1. Push this repo to GitHub.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Connect to Git**.
3. Pick the repo. Cloudflare reads `wrangler.toml` automatically —
   no build command is needed (this is a static + Worker project, not a
   framework build).
4. Deploy. Every push to your default branch redeploys automatically.

## Deploy via CLI

```bash
wrangler deploy
```

## Before you ship

- The app assumes it will live at `https://jargon-buster.suvadipchakraborty.workers.dev/`
  (used in Open Graph tags, the manifest, and the share text). If your final
  URL differs, update the absolute URLs in `public/index.html`.
- `public/assets/og-image.png` and the app icons are placeholders generated
  to match the app's visual identity (ledger paper + rubber stamp). Swap them
  for final art any time — same filenames, same dimensions (1200×630 for the
  OG image; 192×192 / 512×512 for icons).
- Add this app's card to [The Shelf](https://apps.suvadipchakraborty.workers.dev/)
  once it's live.
