const RATING_TASTE_LABEL = {
  loved: "loved it",
  liked: "liked it",
  meh: "had mixed feelings about it",
  disliked: "disliked it",
};

export function buildRecommendationPrompt({ referenceShows, excludeTitles, scopeLabel }) {
  const lines = referenceShows.map((s) => {
    const genres = s.genres?.length ? s.genres.join("/") : "genre unknown";
    const taste = s.rating ? RATING_TASTE_LABEL[s.rating] : "not rated yet";
    const notes = s.notes ? ` — notes: ${s.notes}` : "";
    return `${s.title} (${genres}) [${taste}]${notes}`;
  });

  return `You are a sharp, well-read TV recommendation engine. Base your suggestions specifically on ${scopeLabel}, not the person's entire viewing history.

REFERENCE SHOWS:
${lines.join("\n") || "none"}

Weight shows marked "loved it" most heavily, especially any attached notes on what specifically they liked. Treat "liked it" as a positive but lighter signal. Avoid suggesting anything too similar to shows marked "disliked it" or "had mixed feelings about it". For shows marked "not rated yet", use their genre alone as a signal of interest.

Suggest 5 TV shows the person has not seen yet. Do not suggest any show already in this list: ${excludeTitles.join(", ") || "none"}

Respond with ONLY raw JSON, no markdown fences, no preamble, in exactly this shape:
{"recommendations":[{"title":"...","genres":["...","..."],"reason":"one or two sentences on why this fits their taste specifically"}]}`;
}

export function parseRecommendationResponse(rawText) {
  const clean = (rawText || "").replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  return Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
}
