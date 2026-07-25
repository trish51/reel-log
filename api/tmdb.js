const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w342";

const MOVIE_GENRES = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const TV_GENRES = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "TMDB_API_KEY is not configured" });
    return;
  }

  const title = typeof req.query.title === "string" ? req.query.title.trim() : "";
  const requestedType = typeof req.query.type === "string" ? req.query.type : "tv";

  if (!title) {
    res.status(400).json({ error: "Missing required query param: title" });
    return;
  }

  const searchType = requestedType === "movie" ? "movie" : requestedType === "tv" ? "tv" : "multi";

  try {
    const searchUrl = new URL(`${TMDB_BASE}/search/${searchType}`);
    searchUrl.searchParams.set("api_key", apiKey);
    searchUrl.searchParams.set("query", title);
    searchUrl.searchParams.set("include_adult", "false");
    searchUrl.searchParams.set("language", "en-US");
    searchUrl.searchParams.set("page", "1");

    const tmdbRes = await fetch(searchUrl);
    if (!tmdbRes.ok) {
      res.status(502).json({ error: "TMDB request failed" });
      return;
    }

    const data = await tmdbRes.json();
    const results = Array.isArray(data.results) ? data.results : [];
    const match = results.find((r) => r.media_type !== "person") || results[0];

    if (!match) {
      res.status(404).json({ error: "No match found" });
      return;
    }

    const mediaType = match.media_type || searchType;
    const genreMap = mediaType === "movie" ? MOVIE_GENRES : TV_GENRES;
    const genres = (match.genre_ids || [])
      .map((id) => genreMap[id])
      .filter(Boolean)
      .slice(0, 3);

    res.status(200).json({
      title: match.title || match.name || title,
      posterUrl: match.poster_path ? `${IMG_BASE}${match.poster_path}` : null,
      synopsis: match.overview || "",
      genres,
    });
  } catch (err) {
    res.status(500).json({ error: "Unexpected error contacting TMDB" });
  }
}
