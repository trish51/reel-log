import { buildRecommendationPrompt, parseRecommendationResponse } from "./recommendationPrompt";

const GEMINI_MODEL = "gemini-2.5-flash";

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
