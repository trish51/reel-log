import { PROVIDERS, getActiveProvider, getProviderKey } from "./providers";
import { getGeminiRecommendations } from "./gemini";
import { getAnthropicRecommendations } from "./anthropic";

export async function getWatchNextRecommendations(shows) {
  const provider = getActiveProvider();
  const apiKey = getProviderKey(provider);
  if (!apiKey) {
    throw new Error(`No ${PROVIDERS[provider].label} API key set. Add one in Settings.`);
  }
  if (provider === "gemini") return getGeminiRecommendations(shows, apiKey);
  return getAnthropicRecommendations(shows, apiKey);
}
