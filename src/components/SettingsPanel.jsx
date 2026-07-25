import React, { useState } from "react";
import { X, KeyRound, Trash2 } from "lucide-react";
import { getAnthropicKey, setAnthropicKey } from "../lib/anthropic";

export default function SettingsPanel({ onClose }) {
  const [key, setKey] = useState(getAnthropicKey());
  const [saved, setSaved] = useState(false);

  const save = () => {
    setAnthropicKey(key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const clear = () => {
    setAnthropicKey("");
    setKey("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#0A0C0FBB" }}>
      <div
        className="w-full max-w-md rounded-xl p-6 space-y-4"
        style={{ background: "#1C2129", border: "1px solid #333944" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" style={{ color: "#F2A93B" }} />
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", color: "#F0EDE6", letterSpacing: "0.5px" }}>
              Settings
            </h2>
          </div>
          <button type="button" onClick={onClose}>
            <X className="w-5 h-5" style={{ color: "#9AA1AC" }} />
          </button>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide" style={{ color: "#9AA1AC" }}>
            Anthropic API key
          </label>
          <input
            type="password"
            autoComplete="off"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full mt-1 px-3 py-2 rounded-md outline-none text-sm"
            style={{ background: "#14171C", color: "#F0EDE6", border: "1px solid #333944", fontFamily: "'IBM Plex Mono', monospace" }}
          />
          <p className="text-xs mt-2 leading-relaxed" style={{ color: "#666D78" }}>
            Used only for the "What to watch next" recommendations. Stored in this browser's{" "}
            <code style={{ color: "#9AA1AC" }}>localStorage</code> and never sent anywhere except directly from
            your browser to Anthropic's API — it never touches Reel Log's servers. Get a key at{" "}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#F2A93B" }}
            >
              console.anthropic.com
            </a>
            .
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            className="flex-1 py-2.5 rounded-md font-semibold"
            style={{ background: "#F2A93B", color: "#14171C" }}
          >
            {saved ? "Saved" : "Save key"}
          </button>
          <button
            type="button"
            onClick={clear}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md font-semibold text-sm"
            style={{ border: "1px solid #333944", color: "#9AA1AC" }}
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>
    </div>
  );
}
