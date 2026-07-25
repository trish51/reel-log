import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Film, Plus, X, Search, Sparkles, RotateCcw, Trash2, Heart, ThumbsUp, Meh, ThumbsDown, Loader2, ChevronDown, Tag, Tv, Clapperboard, MoreHorizontal } from "lucide-react";

const STATUS = {
  want: { label: "Want to Watch", color: "#F2A93B" },
  watching: { label: "Watching", color: "#4FA8A0" },
  watched: { label: "Watched", color: "#8A93A3" },
};

const CONTENT_TYPE = {
  tv: { label: "TV Show", short: "TV", Icon: Tv },
  movie: { label: "Movie", short: "Movie", Icon: Clapperboard },
  other: { label: "Other", short: "Other", Icon: MoreHorizontal },
};

const RATINGS = {
  loved: { label: "Loved", color: "#E8546E", Icon: Heart },
  liked: { label: "Liked", color: "#5FB88F", Icon: ThumbsUp },
  meh: { label: "Meh", color: "#C9A44E", Icon: Meh },
  disliked: { label: "Disliked", color: "#6B7280", Icon: ThumbsDown },
};

const STORAGE_KEY = "reel-log:shows";
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

async function detectGenres(title, contentType = "tv") {
  const typeLabel = CONTENT_TYPE[contentType]?.label || "title";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: `Give up to 3 concise genre/category tags for the ${typeLabel} titled "${title}". Respond with ONLY raw JSON, no markdown fences, no preamble: {"genres": ["Tag1","Tag2","Tag3"]}. If you don't recognize the exact title, make a reasonable guess from the name and context rather than returning an empty list.`,
          },
        ],
      }),
    });
    const data = await res.json();
    const textBlock = data.content.find((c) => c.type === "text");
    const clean = (textBlock?.text || "").replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed.genres) ? parsed.genres.slice(0, 3) : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

function useShows() {
  const [shows, setShows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        setShows(res ? JSON.parse(res.value) : []);
      } catch {
        setShows([]);
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setShows(next);
    try {
      const res = await window.storage.set(STORAGE_KEY, JSON.stringify(next), false);
      if (!res) setError("Couldn't save — try again.");
      else setError(null);
    } catch {
      setError("Couldn't save — try again.");
    }
  }, []);

  return { shows, persist, error };
}

function Stamp({ ratingKey, size = "md" }) {
  if (!ratingKey || !RATINGS[ratingKey]) return null;
  const r = RATINGS[ratingKey];
  const Icon = r.Icon;
  const dims = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-semibold uppercase tracking-wider"
      style={{
        color: r.color,
        border: `1.5px solid ${r.color}`,
        transform: "rotate(-3deg)",
        fontSize: size === "sm" ? "10px" : "11px",
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      <Icon className={dims} strokeWidth={2.2} />
      {r.label}
    </div>
  );
}

function ShowCard({ show, onEdit, onDelete, onRewatch, onDetectGenres }) {
  const status = STATUS[show.status];
  const [detecting, setDetecting] = useState(false);

  const runDetect = async () => {
    setDetecting(true);
    await onDetectGenres(show.id, show.contentType);
    setDetecting(false);
  };

  return (
    <div
      className="relative rounded-lg overflow-hidden flex"
      style={{ background: "#1C2129", border: `1px solid ${status.color}33` }}
    >
      <div className="flex-1 p-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-lg font-bold leading-tight truncate"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.5px", color: "#F0EDE6" }}
            title={show.title}
          >
            {show.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <span
              className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full"
              style={{ color: "#9AA1AC", border: "1px solid #333944" }}
            >
              {React.createElement(CONTENT_TYPE[show.contentType || "tv"].Icon, { className: "w-3 h-3" })}
              {CONTENT_TYPE[show.contentType || "tv"].short}
            </span>
            <span
              className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full"
              style={{ color: status.color, border: `1px solid ${status.color}` }}
            >
              {status.label}
            </span>
          </div>
        </div>

        {show.genres?.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {show.genres.map((g) => (
              <span
                key={g}
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: "#232935", color: "#9AA1AC", fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {g}
              </span>
            ))}
          </div>
        ) : (
          <button
            onClick={runDetect}
            disabled={detecting}
            className="mt-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded disabled:opacity-50"
            style={{ background: "#232935", color: "#F2A93B", fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {detecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {detecting ? "detecting..." : "detect genre"}
          </button>
        )}

        {show.notes && (
          <p className="text-sm mt-2 line-clamp-3" style={{ color: "#B7BEC8" }}>
            {show.notes}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {show.status === "watched" && <Stamp ratingKey={show.rating} size="sm" />}
            {show.rewatchCount > 0 && (
              <span
                className="inline-flex items-center gap-1 text-[10px]"
                style={{ color: "#9AA1AC", fontFamily: "'IBM Plex Mono', monospace" }}
              >
                <RotateCcw className="w-3 h-3" /> {show.rewatchCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {show.status === "watched" && (
              <button
                onClick={() => onRewatch(show.id)}
                className="p-1.5 rounded hover:bg-white/5 transition-colors"
                title="Log a rewatch"
              >
                <RotateCcw className="w-3.5 h-3.5" style={{ color: "#9AA1AC" }} />
              </button>
            )}
            <button onClick={() => onEdit(show)} className="p-1.5 rounded hover:bg-white/5 transition-colors" title="Edit">
              <Tag className="w-3.5 h-3.5" style={{ color: "#9AA1AC" }} />
            </button>
            <button onClick={() => onDelete(show.id)} className="p-1.5 rounded hover:bg-white/5 transition-colors" title="Remove">
              <Trash2 className="w-3.5 h-3.5" style={{ color: "#9AA1AC" }} />
            </button>
          </div>
        </div>
      </div>
      <div
        className="w-3 shrink-0"
        style={{
          backgroundImage: "radial-gradient(circle, #14171C 2.5px, transparent 2.5px)",
          backgroundSize: "12px 12px",
          backgroundPosition: "center",
          borderLeft: "1px dashed #33394450",
        }}
      />
    </div>
  );
}

function ShowForm({ initial, onSave, onClose }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [contentType, setContentType] = useState(initial?.contentType || "tv");
  const [status, setStatus] = useState(initial?.status || "want");
  const [genres, setGenres] = useState(initial?.genres || []);
  const [genresTouched, setGenresTouched] = useState(false);
  const [rating, setRating] = useState(initial?.rating || null);
  const [notes, setNotes] = useState(initial?.notes || "");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const pickRating = (key) => {
    setRating(key);
    setStatus("watched");
  };

  const pickStatus = (key) => {
    setStatus(key);
    if (key !== "watched") setRating(null);
  };

  const submit = () => {
    if (!title.trim()) return;

    const titleOrTypeChanged = !initial || initial.title.trim().toLowerCase() !== title.trim().toLowerCase() || initial.contentType !== contentType;
    const finalGenres = genresTouched ? genres : titleOrTypeChanged ? [] : genres;

    onSave({
      id: initial?.id || uid(),
      title: title.trim(),
      contentType,
      status,
      genres: finalGenres,
      rating: status === "watched" ? rating : null,
      notes: notes.trim(),
      rewatchCount: initial?.rewatchCount || 0,
      dateAdded: initial?.dateAdded || new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#0A0C0FBB" }}>
      <div
        className="w-full max-w-md rounded-xl p-6 space-y-4"
        style={{ background: "#1C2129", border: "1px solid #333944" }}
      >
        <div className="flex items-center justify-between">
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", color: "#F0EDE6", letterSpacing: "0.5px" }}>
            {initial ? "Edit entry" : "Add a show"}
          </h2>
          <button type="button" onClick={onClose}>
            <X className="w-5 h-5" style={{ color: "#9AA1AC" }} />
          </button>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide" style={{ color: "#9AA1AC" }}>Title</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="e.g. Severance"
            className="w-full mt-1 px-3 py-2 rounded-md outline-none"
            style={{ background: "#14171C", color: "#F0EDE6", border: "1px solid #333944" }}
          />
          <div className="flex gap-2 mt-2">
            {Object.entries(CONTENT_TYPE).map(([key, t]) => {
              const Icon = t.Icon;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setContentType(key)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-colors"
                  style={{
                    border: `1px solid ${contentType === key ? "#F0EDE6" : "#333944"}`,
                    color: contentType === key ? "#14171C" : "#9AA1AC",
                    background: contentType === key ? "#F0EDE6" : "transparent",
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs mt-1" style={{ color: "#666D78" }}>
            Helps tell apart titles shared by a movie and a show.
          </p>
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {genres.map((g) => (
                <span key={g} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#232935", color: "#9AA1AC" }}>
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide" style={{ color: "#9AA1AC" }}>Did you like it?</label>
          <div className="flex gap-2 mt-1">
            {Object.entries(RATINGS).map(([key, r]) => {
              const Icon = r.Icon;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => pickRating(key)}
                  className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-md transition-colors"
                  style={{
                    border: `1px solid ${r.color}`,
                    background: rating === key ? `${r.color}22` : "transparent",
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: r.color }} />
                  <span style={{ fontSize: "9px", color: r.color, fontFamily: "'IBM Plex Mono', monospace" }}>{r.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs mt-1.5" style={{ color: "#666D78" }}>
            Haven't watched it yet? Skip this — use "More details" below to mark it as want-to-watch or watching.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide"
          style={{ color: "#9AA1AC" }}
        >
          <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: showAdvanced ? "rotate(180deg)" : "none" }} />
          More details
        </button>

        {showAdvanced && (
          <div className="space-y-4 pt-1">
            <div>
              <label className="text-xs uppercase tracking-wide" style={{ color: "#9AA1AC" }}>Status</label>
              <div className="flex gap-2 mt-1">
                {Object.entries(STATUS).map(([key, s]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => pickStatus(key)}
                    className="flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors"
                    style={{
                      border: `1px solid ${s.color}`,
                      color: status === key ? "#14171C" : s.color,
                      background: status === key ? s.color : "transparent",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide" style={{ color: "#9AA1AC" }}>
                Genres <span style={{ color: "#666D78" }}>(auto-detected on save — edit if it's off)</span>
              </label>
              <input
                value={genres.join(", ")}
                onChange={(e) => {
                  setGenresTouched(true);
                  setGenres(e.target.value.split(",").map((g) => g.trim()).filter(Boolean));
                }}
                placeholder="detected automatically from the title"
                className="w-full mt-1 px-3 py-2 rounded-md outline-none text-sm"
                style={{ background: "#14171C", color: "#F0EDE6", border: "1px solid #333944" }}
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide" style={{ color: "#9AA1AC" }}>
                Notes <span style={{ color: "#666D78" }}>(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="The pacing, the lead performance, the twist ending..."
                className="w-full mt-1 px-3 py-2 rounded-md outline-none resize-none text-sm"
                style={{ background: "#14171C", color: "#F0EDE6", border: "1px solid #333944" }}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          className="w-full py-2.5 rounded-md font-semibold"
          style={{ background: "#F2A93B", color: "#14171C" }}
        >
          {initial ? "Save changes" : "Add to log"}
        </button>
      </div>
    </div>
  );
}

function Recommendations({ shows }) {
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState(null);
  const [error, setError] = useState(null);

  const getRecs = async () => {
    setLoading(true);
    setError(null);
    setRecs(null);
    try {
      const loved = shows.filter((s) => s.rating === "loved").map((s) => `${s.title} (${s.genres.join("/")}) — ${s.notes || "no notes"}`);
      const liked = shows.filter((s) => s.rating === "liked").map((s) => s.title);
      const disliked = shows.filter((s) => s.rating === "disliked" || s.rating === "meh").map((s) => s.title);
      const owned = shows.map((s) => s.title.toLowerCase());

      const prompt = `You are a sharp, well-read TV recommendation engine. Based on this person's viewing history, suggest 5 TV shows they have not seen yet.

LOVED (weight heavily, pay attention to the notes on what specifically they liked):
${loved.join("\n") || "none yet"}

LIKED:
${liked.join(", ") || "none yet"}

DISLIKED / MEH (avoid shows too similar to these):
${disliked.join(", ") || "none yet"}

Do not suggest any show already in this list: ${owned.join(", ")}

Respond with ONLY raw JSON, no markdown fences, no preamble, in exactly this shape:
{"recommendations":[{"title":"...","genres":["...","..."],"reason":"one or two sentences on why this fits their taste specifically"}]}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const textBlock = data.content.find((c) => c.type === "text");
      const clean = (textBlock?.text || "").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setRecs(parsed.recommendations || []);
    } catch (e) {
      setError("Couldn't generate recommendations right now — try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const ratedCount = shows.filter((s) => s.rating).length;

  return (
    <div className="rounded-xl p-5" style={{ background: "#1C2129", border: "1px solid #333944" }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: "#F2A93B" }} />
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: "#F0EDE6", letterSpacing: "0.5px" }}>
            What to watch next
          </h2>
        </div>
        <button
          onClick={getRecs}
          disabled={loading || ratedCount === 0}
          className="px-4 py-1.5 rounded-md text-sm font-semibold disabled:opacity-40 flex items-center gap-2"
          style={{ background: "#F2A93B", color: "#14171C" }}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {loading ? "Thinking..." : "Get suggestions"}
        </button>
      </div>

      {ratedCount === 0 && (
        <p className="text-sm mt-3" style={{ color: "#9AA1AC" }}>
          Rate a few shows as watched first — the more notes you leave, the sharper these get.
        </p>
      )}
      {error && <p className="text-sm mt-3" style={{ color: "#E8546E" }}>{error}</p>}

      {recs && (
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          {recs.map((r, i) => (
            <div key={i} className="p-3 rounded-lg" style={{ background: "#232935", border: "1px solid #333944" }}>
              <h4 className="font-bold" style={{ color: "#F0EDE6", fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px" }}>
                {r.title}
              </h4>
              {r.genres?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {r.genres.map((g) => (
                    <span key={g} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#14171C", color: "#9AA1AC" }}>
                      {g}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm mt-1.5" style={{ color: "#B7BEC8" }}>{r.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReelLog() {
  const { shows, persist, error } = useShows();
  const showsRef = useRef(shows);
  useEffect(() => { showsRef.current = shows; }, [shows]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("log");

  const saveShow = (show) => {
    const list = showsRef.current || [];
    const exists = list.some((s) => s.id === show.id);
    const next = exists ? list.map((s) => (s.id === show.id ? show : s)) : [show, ...list];
    showsRef.current = next;
    persist(next);
    setShowForm(false);
    setEditing(null);
    if (show.genres.length === 0) {
      // Save is already done — genre detection runs quietly in the background.
      detectGenresForShow(show.id, show.contentType, show.title);
    }
  };

  const deleteShow = (id) => {
    persist((shows || []).filter((s) => s.id !== id));
  };

  const rewatch = (id) => {
    persist((shows || []).map((s) => (s.id === id ? { ...s, rewatchCount: (s.rewatchCount || 0) + 1 } : s)));
  };

  const detectGenresForShow = async (id, contentType, titleOverride) => {
    const existing = (showsRef.current || []).find((s) => s.id === id);
    const title = titleOverride || existing?.title;
    if (!title) return;
    const genres = await detectGenres(title, contentType || existing?.contentType || "tv");
    const latest = showsRef.current || [];
    const next = latest.map((s) => (s.id === id ? { ...s, genres } : s));
    showsRef.current = next;
    persist(next);
  };

  const filtered = useMemo(() => {
    if (!shows) return [];
    return shows.filter((s) => {
      const matchStatus = filterStatus === "all" || s.status === filterStatus;
      const matchType = filterType === "all" || (s.contentType || "tv") === filterType;
      const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.genres.some((g) => g.toLowerCase().includes(search.toLowerCase()));
      return matchStatus && matchType && matchSearch;
    });
  }, [shows, filterStatus, filterType, search]);

  const stats = useMemo(() => {
    if (!shows) return null;
    const genreCounts = {};
    shows.forEach((s) => s.genres.forEach((g) => (genreCounts[g] = (genreCounts[g] || 0) + 1)));
    const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const ratingCounts = { loved: 0, liked: 0, meh: 0, disliked: 0 };
    shows.forEach((s) => s.rating && ratingCounts[s.rating]++);
    return {
      total: shows.length,
      watched: shows.filter((s) => s.status === "watched").length,
      watching: shows.filter((s) => s.status === "watching").length,
      want: shows.filter((s) => s.status === "want").length,
      topGenres,
      ratingCounts,
    };
  }, [shows]);

  return (
    <div className="min-h-screen" style={{ background: "#14171C" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      <div
        className="px-6 py-8 border-b"
        style={{ borderColor: "#232935", background: "linear-gradient(180deg, #1A1E25 0%, #14171C 100%)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: "#F2A93B22", border: "1px solid #F2A93B" }}>
              <Film className="w-6 h-6" style={{ color: "#F2A93B" }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "36px", color: "#F0EDE6", letterSpacing: "1px", lineHeight: 1 }}>
                REEL LOG
              </h1>
              <p style={{ color: "#9AA1AC", fontSize: "13px" }}>Your running record of everything watched.</p>
            </div>
          </div>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold"
            style={{ background: "#F2A93B", color: "#14171C" }}
          >
            <Plus className="w-4 h-4" /> Add show
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {error && (
          <div className="mb-4 px-4 py-2 rounded-md text-sm" style={{ background: "#E8546E22", color: "#E8546E", border: "1px solid #E8546E" }}>
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-6">
          {["log", "insights"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-md text-sm font-semibold uppercase tracking-wide"
              style={{
                background: tab === t ? "#F2A93B" : "transparent",
                color: tab === t ? "#14171C" : "#9AA1AC",
                border: `1px solid ${tab === t ? "#F2A93B" : "#333944"}`,
              }}
            >
              {t === "log" ? "The Log" : "Insights & Recs"}
            </button>
          ))}
        </div>

        {shows === null && <p style={{ color: "#9AA1AC" }}>Loading your log...</p>}

        {shows !== null && tab === "log" && (
          <>
            <div className="flex flex-wrap gap-2 mb-5 items-center">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9AA1AC" }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title or genre..."
                  className="w-full pl-9 pr-3 py-2 rounded-md outline-none text-sm"
                  style={{ background: "#1C2129", color: "#F0EDE6", border: "1px solid #333944" }}
                />
              </div>
              {["all", "want", "watching", "watched"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className="px-3 py-2 rounded-md text-xs font-semibold uppercase"
                  style={{
                    background: filterStatus === s ? "#F0EDE6" : "transparent",
                    color: filterStatus === s ? "#14171C" : "#9AA1AC",
                    border: `1px solid ${filterStatus === s ? "#F0EDE6" : "#333944"}`,
                  }}
                >
                  {s === "all" ? "All" : STATUS[s].label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {["all", ...Object.keys(CONTENT_TYPE)].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold"
                  style={{
                    background: filterType === t ? "#F2A93B" : "transparent",
                    color: filterType === t ? "#14171C" : "#9AA1AC",
                    border: `1px solid ${filterType === t ? "#F2A93B" : "#333944"}`,
                  }}
                >
                  {t !== "all" && React.createElement(CONTENT_TYPE[t].Icon, { className: "w-3 h-3" })}
                  {t === "all" ? "All Types" : CONTENT_TYPE[t].label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 rounded-xl" style={{ border: "1px dashed #333944" }}>
                <Film className="w-8 h-8 mx-auto mb-2" style={{ color: "#333944" }} />
                <p style={{ color: "#9AA1AC" }}>
                  {shows.length === 0 ? "Nothing logged yet — add your first show." : "No shows match this filter."}
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((show) => (
                  <ShowCard
                    key={show.id}
                    show={show}
                    onEdit={(s) => { setEditing(s); setShowForm(true); }}
                    onDelete={deleteShow}
                    onRewatch={rewatch}
                    onDetectGenres={detectGenresForShow}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {shows !== null && tab === "insights" && stats && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ["Total logged", stats.total, "#F0EDE6"],
                ["Watched", stats.watched, "#8A93A3"],
                ["Watching", stats.watching, "#4FA8A0"],
                ["Want to watch", stats.want, "#F2A93B"],
              ].map(([label, val, color]) => (
                <div key={label} className="rounded-xl p-4" style={{ background: "#1C2129", border: "1px solid #333944" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", color }}>{val}</div>
                  <div className="text-xs" style={{ color: "#9AA1AC" }}>{label}</div>
                </div>
              ))}
            </div>

            {stats.topGenres.length > 0 && (
              <div className="rounded-xl p-5" style={{ background: "#1C2129", border: "1px solid #333944" }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: "#F0EDE6", letterSpacing: "0.5px" }}>
                  Your genres
                </h2>
                <div className="space-y-2 mt-3">
                  {stats.topGenres.map(([g, count]) => (
                    <div key={g} className="flex items-center gap-3">
                      <span className="text-sm w-28 truncate" style={{ color: "#B7BEC8" }}>{g}</span>
                      <div className="flex-1 h-2 rounded-full" style={{ background: "#232935" }}>
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${(count / stats.topGenres[0][1]) * 100}%`, background: "#F2A93B" }}
                        />
                      </div>
                      <span className="text-xs w-5 text-right" style={{ color: "#9AA1AC" }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl p-5" style={{ background: "#1C2129", border: "1px solid #333944" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: "#F0EDE6", letterSpacing: "0.5px" }}>
                Rating breakdown
              </h2>
              <div className="flex gap-3 mt-3 flex-wrap">
                {Object.entries(RATINGS).map(([key, r]) => (
                  <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ border: `1px solid ${r.color}44` }}>
                    <r.Icon className="w-4 h-4" style={{ color: r.color }} />
                    <span className="text-sm" style={{ color: "#F0EDE6" }}>{stats.ratingCounts[key]}</span>
                    <span className="text-xs" style={{ color: "#9AA1AC" }}>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Recommendations shows={shows} />
          </div>
        )}
      </div>

      {showForm && (
        <ShowForm
          initial={editing}
          onSave={saveShow}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
