# Reel Log

A tracker for TV shows and movies — rate, tag genres, jot notes, log rewatches, and get "what to watch next" suggestions.

Built with Vite + React, deployable on Vercel.

## Features

- Log shows/movies with status (required), rating, genres, and notes (saved to `localStorage`)
- Poster art, synopsis, and genres are looked up automatically the moment a show is saved, via [TMDB](https://www.themoviedb.org/), through a serverless function (`/api/tmdb`) that keeps the TMDB key server-side. The "retry poster & genre lookup" button on a card is just a fallback for when the automatic lookup fails to find a match.
- "What to watch next" recommendations, called directly from your browser using your own API key (pasted into Settings, stored only in `localStorage` — never sent to any server but the provider's). Google Gemini is the default (genuinely free tier, no card required); Anthropic Claude is available as an alternate provider in the same panel.

## Local development

```bash
npm install
cp .env.example .env.local   # add your TMDB_API_KEY
npm run dev
```

`npm run dev` runs the Vite dev server only — the `/api/tmdb` serverless function won't be available unless you run it through the Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

## Deploying to Vercel

1. Push this repo to GitHub and import it into Vercel (framework preset: Vite).
2. Set the `TMDB_API_KEY` environment variable in the Vercel project settings — either a v3 API key or a v4 Read Access Token works (get one at [themoviedb.org](https://www.themoviedb.org/settings/api)).
3. Deploy. `vercel.json` wires up the SPA rewrite and build output automatically.

Each visitor supplies their own Gemini or Anthropic API key via the in-app Settings panel for the recommendations feature — no AI provider key is configured on the server.
