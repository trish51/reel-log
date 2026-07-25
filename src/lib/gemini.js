import { buildRecommendationPrompt, parseRecommendationResponse } from "./recommendationPrompt";

// gemini-2.5-flash was deprecated/retired ahead of its announced shutdown
// date; gemini-3.6-flash is the current GA flash-tier model. Stay on the
// classic generateContent endpoint (not the newer Interactions API) — the
// Interactions API requires an Api-Revision header that fails CORS
// preflight for direct-from-browser calls like this one.
const GEMINI_MODEL = "gemini-3.6-flash";

export async function getGeminiRecommendations(shows, apiKey) {
  const prompt = buildRecommendationPrompt(shows);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.error?.message || `Gemini API request failed (${res.status})`;
    throw new Error(message);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return parseRecommendationResponse(text);
}
