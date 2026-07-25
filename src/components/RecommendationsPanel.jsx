import React, { useMemo, useState } from "react";
import { Sparkles, Loader2, ChevronDown, Plus, Check } from "lucide-react";
import { fetchTmdbInfo } from "../lib/tmdb";
import { getWatchNextRecommendations } from "../lib/ai";
import { PROVIDERS, getActiveProvider, hasActiveProviderKey } from "../lib/providers";
import { Poster, Stamp } from "./Poster";
import { ACCENT, BG, PANEL, PANEL_ALT, BORDER, TEXT, TEXT_MUTED, TEXT_DIM, TEXT_BODY, DANGER } from "../theme";

const MAX_GENRE_SCOPE_SHOWS = 25;
const MAX_SPECIFIC_PICKS = 10;

const SCOPE_MODES = [
  { id: "recent", label: "Last 5 Added" },
  { id: "genre", label: "By Genre" },
  { id: "specific", label: "Pick Specific Shows" },
];

function pillClass(active) {
  return `px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 active:scale-[0.97] ${active ? "hover:opacity-90" : "hover:bg-white/5"}`;
}

function pillStyle(active) {
  return {
    background: active ? ACCENT : "transparent",
    color: active ? BG : TEXT_MUTED,
    border: `1px solid ${active ? ACCENT : BORDER}`,
  };
}

function RecommendationCard({ rec, details, onAdd, added }) {
  const genres = details?.genres?.length ? details.genres : rec.genres || [];
  const posterUrl = details?.posterUrl || null;
  const synopsis = details?.synopsis || "";

  return (
    <div className="rounded-xl overflow-hidden flex" style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
      <Poster posterUrl={posterUrl} contentType="tv" loading={Boolean(details?.loading)} />
      <div className="flex-1 p-4 min-w-0">
        <h4
          className="font-bold truncate"
          style={{ color: TEXT, fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "0.5px" }}
          title={rec.title}
        >
          {rec.title}
        </h4>
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {genres.map((g) => (
              <span
                key={g}
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: PANEL_ALT, color: TEXT_MUTED, fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {g}
              </span>
            ))}
          </div>
        )}
        {synopsis && (
          <p className="text-sm mt-2 line-clamp-2" style={{ color: "#7C8493" }}>
            {synopsis}
          </p>
        )}
        <p className="text-sm mt-2 line-clamp-3" style={{ color: TEXT_BODY }}>
          {rec.reason}
        </p>
        <button
          type="button"
          onClick={() => onAdd(rec)}
          disabled={added}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold disabled:opacity-70 hover:opacity-90 active:scale-[0.97] transition-all duration-150"
          style={{
            background: added ? "transparent" : ACCENT,
            color: added ? TEXT_MUTED : BG,
            border: added ? `1px solid ${BORDER}` : "none",
          }}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" /> Added
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" /> Add to log
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function RecommendationsPanel({ shows, onAddToLog }) {
  const [scopeMode, setScopeMode] = useState("recent");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedShowIds, setSelectedShowIds] = useState([]);
  const [showRecentTitles, setShowRecentTitles] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState(null);
  const [recDetails, setRecDetails] = useState({});
  const [addedTitles, setAddedTitles] = useState(() => new Set());
  const [error, setError] = useState(null);

  const hasKey = hasActiveProviderKey();
  const providerLabel = PROVIDERS[getActiveProvider()].label;

  const recentFive = useMemo(() => {
    return [...shows]
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, 5);
  }, [shows]);

  const libraryGenres = useMemo(() => {
    const set = new Set();
    shows.forEach((s) => s.genres.forEach((g) => set.add(g)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [shows]);

  const lovedLikedFirst = useMemo(() => {
    const rank = { loved: 0, liked: 1 };
    return [...shows].sort((a, b) => (rank[a.rating] ?? 2) - (rank[b.rating] ?? 2));
  }, [shows]);

  const genreScopedShows = useMemo(() => {
    if (selectedGenres.length === 0) return [];
    return shows
      .filter((s) => (s.rating === "loved" || s.rating === "liked") && s.genres.some((g) => selectedGenres.includes(g)))
      .slice(0, MAX_GENRE_SCOPE_SHOWS);
  }, [shows, selectedGenres]);

  const specificScopedShows = useMemo(() => {
    return shows.filter((s) => selectedShowIds.includes(s.id));
  }, [shows, selectedShowIds]);

  const scopedReferenceShows = useMemo(() => {
    if (scopeMode === "genre") return genreScopedShows;
    if (scopeMode === "specific") return specificScopedShows;
    return recentFive;
  }, [scopeMode, genreScopedShows, specificScopedShows, recentFive]);

  const scopeLabel = useMemo(() => {
    if (scopeMode === "genre") {
      return selectedGenres.length > 0
        ? `shows they loved or liked in these genres: ${selectedGenres.join(", ")}`
        : "shows they loved or liked in a specific genre";
    }
    if (scopeMode === "specific") return "a hand-picked set of their shows";
    return "their 5 most recently added shows";
  }, [scopeMode, selectedGenres]);

  const emptyScopeReason = useMemo(() => {
    if (!hasKey) return null;
    if (scopeMode === "genre" && selectedGenres.length === 0) return "Pick at least one genre to scope suggestions.";
    if (scopeMode === "genre" && genreScopedShows.length === 0) return "No loved/liked shows match those genres yet.";
    if (scopeMode === "specific" && specificScopedShows.length === 0) return "Pick at least one show to scope suggestions.";
    if (scopeMode === "recent" && recentFive.length === 0) return "Add a show to your log first.";
    return null;
  }, [hasKey, scopeMode, selectedGenres, genreScopedShows, specificScopedShows, recentFive]);

  const canGetRecs = hasKey && !loading && scopedReferenceShows.length > 0;

  const toggleGenre = (g) => {
    setSelectedGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const toggleShowPick = (id) => {
    setSelectedShowIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SPECIFIC_PICKS) return prev;
      return [...prev, id];
    });
  };

  const enrichRecs = async (recommendations) => {
    const initial = {};
    recommendations.forEach((r) => {
      initial[r.title] = { loading: true, genres: r.genres || [] };
    });
    setRecDetails(initial);
    await Promise.all(
      recommendations.map(async (r) => {
        const info = await fetchTmdbInfo(r.title, "tv");
        setRecDetails((prev) => ({
          ...prev,
          [r.title]: {
            loading: false,
            posterUrl: info?.posterUrl || null,
            synopsis: info?.synopsis || "",
            genres: info?.genres?.length ? info.genres : r.genres || [],
          },
        }));
      })
    );
  };

  const getRecs = async () => {
    setLoading(true);
    setError(null);
    try {
      const recommendations = await getWatchNextRecommendations({
        referenceShows: scopedReferenceShows,
        excludeTitles: shows.map((s) => s.title),
        scopeLabel,
      });
      setRecs(recommendations);
      setAddedTitles(new Set());
      enrichRecs(recommendations);
    } catch (e) {
      setError(e.message || "Couldn't generate recommendations right now — try again in a moment.");
      setRecs(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (rec) => {
    const details = recDetails[rec.title] || {};
    onAddToLog({
      title: rec.title,
      genres: details.genres?.length ? details.genres : rec.genres || [],
      posterUrl: details.posterUrl || null,
      synopsis: details.synopsis || "",
    });
    setAddedTitles((prev) => new Set(prev).add(rec.title));
  };

  return (
    <div className="rounded-xl p-5" style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: ACCENT }} />
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: TEXT, letterSpacing: "0.5px" }}>
            What to watch next
          </h2>
        </div>
        <button
          onClick={getRecs}
          disabled={!canGetRecs}
          className="px-4 py-1.5 rounded-md text-sm font-semibold disabled:opacity-40 flex items-center gap-2 hover:opacity-90 active:scale-[0.97] transition-all duration-150"
          style={{ background: ACCENT, color: BG }}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {loading ? "Thinking..." : "Get suggestions"}
        </button>
      </div>

      {hasKey && (
        <div className="mt-4">
          <label className="text-xs uppercase tracking-wide" style={{ color: TEXT_MUTED }}>
            Base suggestions on
          </label>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {SCOPE_MODES.map((m) => (
              <React.Fragment key={m.id}>
                <button
                  type="button"
                  onClick={() => setScopeMode(m.id)}
                  className={pillClass(scopeMode === m.id)}
                  style={pillStyle(scopeMode === m.id)}
                >
                  {m.label}
                </button>
                {m.id === "recent" && (
                  <button
                    type="button"
                    onClick={() => setShowRecentTitles((v) => !v)}
                    className="p-1 rounded hover:bg-white/5 active:scale-90 transition-all duration-150"
                    title={showRecentTitles ? "Hide titles" : "Show titles"}
                  >
                    <ChevronDown
                      className="w-3.5 h-3.5 transition-transform duration-150"
                      style={{ color: TEXT_MUTED, transform: showRecentTitles ? "rotate(180deg)" : "none" }}
                    />
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {showRecentTitles && (
            <p className="text-xs mt-1.5" style={{ color: TEXT_DIM }}>
              {recentFive.length > 0 ? recentFive.map((s) => s.title).join(", ") : "Nothing logged yet."}
            </p>
          )}

          {scopeMode === "genre" && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {libraryGenres.length === 0 ? (
                <p className="text-xs" style={{ color: TEXT_DIM }}>
                  No genres in your library yet — add some shows first.
                </p>
              ) : (
                libraryGenres.map((g) => {
                  const active = selectedGenres.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 active:scale-95 ${active ? "hover:opacity-90" : "hover:bg-white/5"}`}
                      style={{
                        background: active ? ACCENT : "transparent",
                        color: active ? BG : TEXT_MUTED,
                        border: `1px solid ${active ? ACCENT : BORDER}`,
                      }}
                    >
                      {g}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {scopeMode === "specific" && (
            <div className="mt-2.5">
              <div className="max-h-56 overflow-y-auto rounded-md" style={{ border: `1px solid ${BORDER}` }}>
                {lovedLikedFirst.map((s, i) => {
                  const checked = selectedShowIds.includes(s.id);
                  const disabled = !checked && selectedShowIds.length >= MAX_SPECIFIC_PICKS;
                  return (
                    <label
                      key={s.id}
                      className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors duration-150 ${disabled ? "opacity-40" : "cursor-pointer hover:bg-white/5"}`}
                      style={{ color: TEXT, borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleShowPick(s.id)}
                        style={{ accentColor: ACCENT }}
                      />
                      <span className="truncate flex-1">{s.title}</span>
                      {s.rating && <Stamp ratingKey={s.rating} size="sm" />}
                    </label>
                  );
                })}
              </div>
              <p className="text-xs mt-1.5" style={{ color: TEXT_DIM }}>
                {selectedShowIds.length >= MAX_SPECIFIC_PICKS
                  ? `Max ${MAX_SPECIFIC_PICKS} shows selected.`
                  : `${selectedShowIds.length} of ${MAX_SPECIFIC_PICKS} selected.`}
              </p>
            </div>
          )}
        </div>
      )}

      {!hasKey && (
        <p className="text-sm mt-3" style={{ color: TEXT_MUTED }}>
          Add your {providerLabel} API key in Settings (top right) to enable recommendations.
        </p>
      )}
      {emptyScopeReason && <p className="text-sm mt-3" style={{ color: TEXT_MUTED }}>{emptyScopeReason}</p>}
      {error && <p className="text-sm mt-3" style={{ color: DANGER }}>{error}</p>}

      {recs && (
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          {recs.map((r, i) => (
            <RecommendationCard
              key={i}
              rec={r}
              details={recDetails[r.title]}
              onAdd={handleAdd}
              added={addedTitles.has(r.title)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
