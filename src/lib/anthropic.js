import { buildRecommendationPrompt, parseRecommendationResponse } from "./recommendationPrompt";

const ANTHROPIC_MODEL = "claude-opus-5";

export async function getAnthropicRecommendations(promptContext, apiKey) {
  const prompt = buildRecommendationPrompt(promptContext);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1200,
      thinking: { type: "disabled" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.error?.message || `Anthropic API request failed (${res.status})`;
    throw new Error(message);
  }

  const data = await res.json();
  const textBlock = data.content?.find((c) => c.type === "text");
  return parseRecommendationResponse(textBlock?.text || "");
}
