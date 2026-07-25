import React, { useState } from "react";
import { X, KeyRound, Trash2 } from "lucide-react";
import { PROVIDERS, getActiveProvider, setActiveProvider, getProviderKey, setProviderKey } from "../lib/providers";
import { ACCENT, PANEL, PANEL_ALT, BORDER, TEXT, TEXT_MUTED, TEXT_DIM } from "../theme";

export default function SettingsPanel({ onClose }) {
  const [provider, setProvider] = useState(getActiveProvider());
  const [key, setKey] = useState(getProviderKey(getActiveProvider()));
  const [saved, setSaved] = useState(false);

  const switchProvider = (nextProvider) => {
    setProvider(nextProvider);
    setKey(getProviderKey(nextProvider));
    setSaved(false);
  };

  const save = () => {
    setActiveProvider(provider);
    setProviderKey(provider, key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const clear = () => {
    setProviderKey(provider, "");
    setKey("");
  };

  const meta = PROVIDERS[provider];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ background: "#0A0C0FBB" }}
    >
      <div
        className="w-full max-w-md rounded-xl p-6 space-y-4 animate-modalIn"
        style={{ background: PANEL, border: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" style={{ color: ACCENT }} />
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", color: TEXT, letterSpacing: "0.5px" }}>
              Settings
            </h2>
          </div>
          <button type="button" onClick={onClose}>
            <X className="w-5 h-5" style={{ color: TEXT_MUTED }} />
          </button>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide" style={{ color: TEXT_MUTED }}>
            Recommendations provider
          </label>
          <div className="flex gap-2 mt-1.5">
            {Object.values(PROVIDERS).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => switchProvider(p.id)}
                className="flex-1 text-left px-3 py-2 rounded-md transition-colors"
                style={{
                  border: `1px solid ${provider === p.id ? ACCENT : BORDER}`,
                  background: provider === p.id ? `${ACCENT}22` : "transparent",
                }}
              >
                <div className="text-sm font-semibold" style={{ color: provider === p.id ? ACCENT : TEXT }}>
                  {p.label}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: TEXT_DIM }}>
                  {p.tagline}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide" style={{ color: TEXT_MUTED }}>
            {meta.label} API key
          </label>
          <input
            type="password"
            autoComplete="off"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={meta.keyPlaceholder}
            className="w-full mt-1 px-3 py-2 rounded-md outline-none text-sm"
            style={{ background: "#14171C", color: TEXT, border: `1px solid ${BORDER}`, fontFamily: "'IBM Plex Mono', monospace" }}
          />
          <p className="text-xs mt-2 leading-relaxed" style={{ color: TEXT_DIM }}>
            Used only for the "What to watch next" recommendations. Stored in this browser's{" "}
            <code style={{ color: TEXT_MUTED }}>localStorage</code> and never sent anywhere except directly from
            your browser to {meta.label}'s API — it never touches Reel Log's servers. Get a key at{" "}
            <a href={meta.getKeyUrl} target="_blank" rel="noreferrer" style={{ color: ACCENT }}>
              {meta.getKeyLabel}
            </a>
            .
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            className="flex-1 py-2.5 rounded-md font-semibold transition-colors"
            style={{ background: ACCENT, color: "#14171C" }}
          >
            {saved ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={clear}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md font-semibold text-sm"
            style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>
    </div>
  );
}
