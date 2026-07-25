const PROVIDER_STORAGE_KEY = "reel-log:ai-provider";

export const PROVIDERS = {
  gemini: {
    id: "gemini",
    label: "Google Gemini",
    tagline: "Free tier, no card required",
    keyStorageKey: "reel-log:gemini-key",
    keyPlaceholder: "AIza...",
    getKeyUrl: "https://aistudio.google.com/apikey",
    getKeyLabel: "aistudio.google.com",
  },
  anthropic: {
    id: "anthropic",
    label: "Anthropic Claude",
    tagline: "Bring your own Claude API key",
    keyStorageKey: "reel-log:anthropic-key",
    keyPlaceholder: "sk-ant-...",
    getKeyUrl: "https://console.anthropic.com/settings/keys",
    getKeyLabel: "console.anthropic.com",
  },
};

export const DEFAULT_PROVIDER = "gemini";

export function getActiveProvider() {
  try {
    const stored = localStorage.getItem(PROVIDER_STORAGE_KEY);
    return stored && PROVIDERS[stored] ? stored : DEFAULT_PROVIDER;
  } catch {
    return DEFAULT_PROVIDER;
  }
}

export function setActiveProvider(provider) {
  if (!PROVIDERS[provider]) return;
  try {
    localStorage.setItem(PROVIDER_STORAGE_KEY, provider);
  } catch {
    // localStorage unavailable — silently no-op
  }
}

export function getProviderKey(provider) {
  const meta = PROVIDERS[provider];
  if (!meta) return "";
  try {
    return localStorage.getItem(meta.keyStorageKey) || "";
  } catch {
    return "";
  }
}

export function setProviderKey(provider, key) {
  const meta = PROVIDERS[provider];
  if (!meta) return;
  try {
    if (key) localStorage.setItem(meta.keyStorageKey, key);
    else localStorage.removeItem(meta.keyStorageKey);
  } catch {
    // localStorage unavailable — silently no-op
  }
}

export function hasActiveProviderKey() {
  return Boolean(getProviderKey(getActiveProvider()));
}
