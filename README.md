# Reel Log

A tracker for TV shows and movies — rate, tag genres, jot notes, log rewatches, and get "what to watch next" suggestions.

Built with Vite + React, deployable on Vercel.

## Features

- Log shows/movies with status, rating, genres, and notes (saved to `localStorage`)
- Poster art, synopsis, and genres are looked up automatically via [TMDB](https://www.themoviedb.org/), through a serverless function (`/api/tmdb`) that keeps the TMDB API key server-side
- "What to watch next" recommendations powered directly by the Anthropic API, called from your browser using your own API key (pasted into Settings, stored only in `localStorage` — never sent to any server but Anthropic's)

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
2. Set the `TMDB_API_KEY` environment variable in the Vercel project settings (get a free key at [themoviedb.org](https://www.themoviedb.org/settings/api)).
3. Deploy. `vercel.json` wires up the SPA rewrite and build output automatically.

Each visitor supplies their own Anthropic API key via the in-app Settings panel for the recommendations feature — no Anthropic key is configured on the server.
