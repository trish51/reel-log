export function buildRecommendationPrompt(shows) {
  const loved = shows
    .filter((s) => s.rating === "loved")
    .map((s) => `${s.title} (${s.genres.join("/")}) — ${s.notes || "no notes"}`);
  const liked = shows.filter((s) => s.rating === "liked").map((s) => s.title);
  const disliked = shows
    .filter((s) => s.rating === "disliked" || s.rating === "meh")
    .map((s) => s.title);
  const owned = shows.map((s) => s.title.toLowerCase());

  return `You are a sharp, well-read TV recommendation engine. Based on this person's viewing history, suggest 5 TV shows they have not seen yet.

LOVED (weight heavily, pay attention to the notes on what specifically they liked):
${loved.join("\n") || "none yet"}

LIKED:
${liked.join(", ") || "none yet"}

DISLIKED / MEH (avoid shows too similar to these):
${disliked.join(", ") || "none yet"}

Do not suggest any show already in this list: ${owned.join(", ")}

Respond with ONLY raw JSON, no markdown fences, no preamble, in exactly this shape:
{"recommendations":[{"title":"...","genres":["...","..."],"reason":"one or two sentences on why this fits their taste specifically"}]}`;
}

export function parseRecommendationResponse(rawText) {
  const clean = (rawText || "").replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  return Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
}
