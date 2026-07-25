import { PROVIDERS, getActiveProvider, getProviderKey } from "./providers";
import { getGeminiRecommendations } from "./gemini";
import { getAnthropicRecommendations } from "./anthropic";

export async function getWatchNextRecommendations(promptContext) {
  const provider = getActiveProvider();
  const apiKey = getProviderKey(provider);
  if (!apiKey) {
    throw new Error(`No ${PROVIDERS[provider].label} API key set. Add one in Settings.`);
  }
  if (provider === "gemini") return getGeminiRecommendations(promptContext, apiKey);
  return getAnthropicRecommendations(promptContext, apiKey);
}
