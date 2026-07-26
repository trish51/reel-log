import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Film,
  Plus,
  X,
  Search,
  RotateCcw,
  Trash2,
  Loader2,
  ChevronDown,
  Tag,
  Settings,
  RefreshCw,
} from "lucide-react";
import { fetchTmdbInfo } from "./lib/tmdb";
import SettingsPanel from "./components/SettingsPanel";
import RecommendationsPanel from "./components/RecommendationsPanel";
import { Poster } from "./components/Poster";
import { STATUS, CONTENT_TYPE, RATINGS } from "./constants";
import { ACCENT, BG, PANEL, PANEL_ALT, BORDER, TEXT, TEXT_MUTED, TEXT_DIM, TEXT_BODY, DANGER } from "./theme";

const STORAGE_KEY = "reel-log:shows";
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function useShows() {
  const [shows, setShows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setShows(raw ? JSON.parse(raw) : []);
    } catch {
      setShows([]);
    }
  }, []);

  const persist = useCallback((next) => {
    setShows(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setError(null);
    } catch {
      setError("Couldn't save — try again.");
    }
  }, []);

  return { shows, persist, error };
}

function ShowCard({ show, onEdit, onDelete, onRewatch, onFetchDetails, fetching, onCollapse, posterLayoutId }) {
  const status = STATUS[show.status];

  const runFetch = (e) => {
    e.stopPropagation();
    onFetchDetails(show.id, show.contentType);
  };

  const Content = onCollapse ? motion.div : "div";
  const contentAnimProps = onCollapse
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2, delay: 0.15 } }
    : {};

  return (
    <div
      onClick={onCollapse}
      className={`relative rounded-xl overflow-hidden flex transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-8px_rgba(157,124,242,0.3)] ${onCollapse ? "cursor-pointer" : ""}`}
      style={{ background: PANEL, border: `1px solid ${status.color}33` }}
    >
      <Poster
        posterUrl={show.posterUrl}
        contentType={show.contentType}
        rating={show.rating}
        showRating={show.status === "watched"}
        loading={fetching}
        layoutId={posterLayoutId}
      />

      <Content className="flex-1 p-5 min-w-0" {...contentAnimProps}>
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-xl font-bold leading-tight truncate min-w-0"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.5px", color: TEXT }}
            title={show.title}
          >
            {show.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <span
              className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full"
              style={{ color: TEXT_MUTED, border: `1px solid ${BORDER}` }}
            >
              {React.createElement(CONTENT_TYPE[show.contentType || "tv"].Icon, { className: "w-3 h-3" })}
              {CONTENT_TYPE[show.contentType || "tv"].short}
            </span>
            <span
              className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{ color: status.color, border: `1px solid ${status.color}` }}
              title={status.label}
            >
              {status.short}
            </span>
          </div>
        </div>

        {show.genres?.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {show.genres.map((g) => (
              <span
                key={g}
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: PANEL_ALT, color: TEXT_MUTED, fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {g}
              </span>
            ))}
          </div>
        ) : (
          <>
            <button
              onClick={runFetch}
              disabled={fetching}
              className="mt-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded disabled:opacity-50 hover:brightness-125 active:scale-95 transition-all duration-150"
              style={{ background: PANEL_ALT, color: ACCENT, fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {fetching ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              {fetching ? "looking up..." : "retry poster & genre lookup"}
            </button>
            {show.tmdbUnmatched && !fetching && (
              <p className="text-[10px] mt-1" style={{ color: DANGER }}>
                Not found — double check the spelling and try again.
              </p>
            )}
          </>
        )}

        {show.synopsis && !show.notes && (
          <p className="text-sm mt-2 line-clamp-3" style={{ color: "#7C8493" }}>
            {show.synopsis}
          </p>
        )}
        {show.notes && (
          <p className="text-sm mt-2 line-clamp-3" style={{ color: TEXT_BODY }}>
            {show.notes}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {show.rewatchCount > 0 && (
              <span
                className="inline-flex items-center gap-1 text-[10px]"
                style={{ color: TEXT_MUTED, fontFamily: "'IBM Plex Mono', monospace" }}
              >
                <RotateCcw className="w-3 h-3" /> {show.rewatchCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {show.status === "watched" && (
              <button
                onClick={(e) => { e.stopPropagation(); onRewatch(show.id); }}
                className="p-1.5 rounded hover:bg-white/5 active:scale-90 transition-all duration-150"
                title="Log a rewatch"
              >
                <RotateCcw className="w-3.5 h-3.5" style={{ color: TEXT_MUTED }} />
              </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); onEdit(show); }} className="p-1.5 rounded hover:bg-white/5 active:scale-90 transition-all duration-150" title="Edit">
              <Tag className="w-3.5 h-3.5" style={{ color: TEXT_MUTED }} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(show.id); }} className="p-1.5 rounded hover:bg-white/5 active:scale-90 transition-all duration-150" title="Remove">
              <Trash2 className="w-3.5 h-3.5" style={{ color: TEXT_MUTED }} />
            </button>
          </div>
        </div>
      </Content>
    </div>
  );
}

function CompactShowCard({ show, onExpand }) {
  const status = STATUS[show.status];
  return (
    <div
      onClick={onExpand}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onExpand(); }}
      className="rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_24px_-8px_rgba(157,124,242,0.4)] h-[220px] aspect-[2/3]"
      style={{ background: PANEL, border: `1px solid ${status.color}33` }}
      title={show.title}
    >
      <Poster
        posterUrl={show.posterUrl}
        contentType={show.contentType}
        rating={show.rating}
        showRating={show.status === "watched"}
        variant="full"
        layoutId={`poster-${show.id}`}
      />
    </div>
  );
}

const MODAL_CLOSE_MS = 180;

function ShowForm({ initial, onSave, onClose }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [contentType, setContentType] = useState(initial?.contentType || "tv");
  const [status, setStatus] = useState(initial?.status || "want");
  const [genres, setGenres] = useState(initial?.genres || []);
  const [genresTouched, setGenresTouched] = useState(false);
  const [rating, setRating] = useState(initial?.rating || null);
  const [notes, setNotes] = useState(initial?.notes || "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [closing, setClosing] = useState(false);

  const requestClose = () => {
    setClosing(true);
    setTimeout(onClose, MODAL_CLOSE_MS);
  };

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
      posterUrl: titleOrTypeChanged ? null : initial?.posterUrl || null,
      synopsis: titleOrTypeChanged ? "" : initial?.synopsis || "",
      rating: status === "watched" ? rating : null,
      notes: notes.trim(),
      rewatchCount: initial?.rewatchCount || 0,
      dateAdded: initial?.dateAdded || new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
    });
    requestClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${closing ? "animate-fadeOut" : "animate-fadeIn"}`}
      style={{ background: "#0A0C0FBB" }}
    >
      <div
        className={`w-full max-w-md rounded-xl flex flex-col ${closing ? "animate-modalOut" : "animate-modalIn"}`}
        style={{ background: PANEL, border: `1px solid ${BORDER}`, maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", color: TEXT, letterSpacing: "0.5px" }}>
            {initial ? "Edit entry" : "Add a title"}
          </h2>
          <button
            type="button"
            onClick={requestClose}
            className="hover:opacity-70 active:scale-90 transition-all duration-150"
          >
            <X className="w-5 h-5" style={{ color: TEXT_MUTED }} />
          </button>
        </div>

        <div className="px-6 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: TEXT_MUTED }}>Title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              placeholder="e.g. Severance"
              className="w-full mt-1 px-3 py-2 rounded-md outline-none"
              style={{ background: BG, color: TEXT, border: `1px solid ${BORDER}` }}
            />
            <div className="flex gap-2 mt-2">
              {Object.entries(CONTENT_TYPE).map(([key, t]) => {
                const Icon = t.Icon;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setContentType(key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 active:scale-[0.97] ${contentType === key ? "hover:opacity-90" : "hover:bg-white/5"}`}
                    style={{
                      border: `1px solid ${contentType === key ? TEXT : BORDER}`,
                      color: contentType === key ? BG : TEXT_MUTED,
                      background: contentType === key ? TEXT : "transparent",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs mt-1" style={{ color: TEXT_DIM }}>
              Helps tell apart titles shared by a movie and a show.
            </p>
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {genres.map((g) => (
                  <span key={g} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: PANEL_ALT, color: TEXT_MUTED }}>
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: TEXT_MUTED }}>
              Status <span style={{ color: DANGER }}>*</span>
            </label>
            <div className="flex gap-2 mt-1">
              {Object.entries(STATUS).map(([key, s]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => pickStatus(key)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 active:scale-[0.97] ${status === key ? "hover:opacity-90" : "hover:bg-white/5"}`}
                  style={{
                    border: `1px solid ${s.color}`,
                    color: status === key ? BG : s.color,
                    background: status === key ? s.color : "transparent",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: TEXT_MUTED }}>Did you like it?</label>
            <div className="flex gap-2 mt-1">
              {Object.entries(RATINGS).map(([key, r]) => {
                const Icon = r.Icon;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => pickRating(key)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-md transition-all duration-150 active:scale-[0.97] ${rating === key ? "hover:opacity-80" : "hover:bg-white/5"}`}
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
            <p className="text-xs mt-1.5" style={{ color: TEXT_DIM }}>
              Haven't watched it yet? Leave this blank — status above already covers want-to-watch or watching.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide hover:opacity-80 active:scale-[0.97] transition-all duration-150"
            style={{ color: TEXT_MUTED }}
          >
            <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: showAdvanced ? "rotate(180deg)" : "none" }} />
            More details
          </button>

          {showAdvanced && (
            <div className="space-y-4 pt-1">
              <div>
                <label className="text-xs uppercase tracking-wide" style={{ color: TEXT_MUTED }}>
                  Genres <span style={{ color: TEXT_DIM }}>(auto-detected via TMDB — edit if it's off)</span>
                </label>
                <input
                  value={genres.join(", ")}
                  onChange={(e) => {
                    setGenresTouched(true);
                    setGenres(e.target.value.split(",").map((g) => g.trim()).filter(Boolean));
                  }}
                  placeholder="detected automatically from the title"
                  className="w-full mt-1 px-3 py-2 rounded-md outline-none text-sm"
                  style={{ background: BG, color: TEXT, border: `1px solid ${BORDER}` }}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide" style={{ color: TEXT_MUTED }}>
                  Notes <span style={{ color: TEXT_DIM }}>(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="The pacing, the lead performance, the twist ending..."
                  className="w-full mt-1 px-3 py-2 rounded-md outline-none resize-none text-sm"
                  style={{ background: BG, color: TEXT, border: `1px solid ${BORDER}` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pt-4 pb-6 shrink-0">
          <button
            type="button"
            onClick={submit}
            className="w-full py-2.5 rounded-md font-semibold hover:opacity-90 active:scale-[0.97] transition-all duration-150"
            style={{ background: ACCENT, color: BG }}
          >
            {initial ? "Save changes" : "Add to log"}
          </button>
        </div>
      </div>
    </div>
  );
}


export default function ReelLog() {
  const { shows, persist, error } = useShows();
  const showsRef = useRef(shows);
  useEffect(() => { showsRef.current = shows; }, [shows]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("log");
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem("reel-log:view-mode") || "default";
    } catch {
      return "default";
    }
  });
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem("reel-log:view-mode", viewMode);
    } catch {}
    if (viewMode !== "compact") setExpandedId(null);
  }, [viewMode]);

  const fetchDetailsForShow = useCallback(async (id, contentType, titleOverride) => {
    setPendingIds((prev) => new Set(prev).add(id));
    try {
      const existing = (showsRef.current || []).find((s) => s.id === id);
      const title = titleOverride || existing?.title;
      if (!title) return;
      const info = await fetchTmdbInfo(title, contentType || existing?.contentType || "tv");
      const latest = showsRef.current || [];
      const next = latest.map((s) =>
        s.id === id
          ? {
              ...s,
              title: info?.title || s.title,
              genres: s.genres.length > 0 ? s.genres : info?.genres || s.genres,
              posterUrl: s.posterUrl || info?.posterUrl || null,
              synopsis: s.synopsis || info?.synopsis || "",
              tmdbUnmatched: !info,
            }
          : s
      );
      showsRef.current = next;
      persist(next);
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [persist]);

  const saveShow = (show) => {
    const list = showsRef.current || [];
    const exists = list.some((s) => s.id === show.id);
    const next = exists ? list.map((s) => (s.id === show.id ? show : s)) : [show, ...list];
    showsRef.current = next;
    persist(next);
    if (show.genres.length === 0 || !show.posterUrl) {
      // Save is already done — TMDB lookup runs immediately in the
      // background. The "retry" button on the card is only a fallback for
      // when this lookup fails to find a match.
      fetchDetailsForShow(show.id, show.contentType, show.title);
    }
  };

  const addRecommendationToLog = (rec) => {
    saveShow({
      id: uid(),
      title: rec.title,
      contentType: "tv",
      status: "want",
      genres: rec.genres || [],
      posterUrl: rec.posterUrl || null,
      synopsis: rec.synopsis || "",
      rating: null,
      notes: "",
      rewatchCount: 0,
      dateAdded: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
    });
  };

  const deleteShow = (id) => {
    persist((shows || []).filter((s) => s.id !== id));
    setExpandedId((prev) => (prev === id ? null : prev));
  };

  const rewatch = (id) => {
    persist((shows || []).map((s) => (s.id === id ? { ...s, rewatchCount: (s.rewatchCount || 0) + 1 } : s)));
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
    <div className="min-h-screen" style={{ background: BG }}>
      <div
        className="px-6 py-8 border-b"
        style={{ borderColor: PANEL_ALT, background: "linear-gradient(180deg, #1A1E25 0%, #14171C 100%)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: `${ACCENT}22`, border: `1px solid ${ACCENT}` }}>
              <Film className="w-6 h-6" style={{ color: ACCENT }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "36px", color: TEXT, letterSpacing: "1px", lineHeight: 1 }}>
                REEL LOG
              </h1>
              <p style={{ color: TEXT_MUTED, fontSize: "13px" }}>Your running record of everything watched.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 rounded-md hover:bg-white/5 active:scale-90 transition-all duration-150"
              style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setEditing(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold hover:opacity-90 active:scale-[0.97] transition-all duration-150"
              style={{ background: ACCENT, color: BG }}
            >
              <Plus className="w-4 h-4" /> Add Title
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {error && (
          <div className="mb-4 px-4 py-2 rounded-md text-sm" style={{ background: `${DANGER}22`, color: DANGER, border: `1px solid ${DANGER}` }}>
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-6">
          {["log", "insights"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold uppercase tracking-wide transition-all duration-150 active:scale-[0.97] ${tab === t ? "hover:opacity-90" : "hover:bg-white/5"}`}
              style={{
                background: tab === t ? ACCENT : "transparent",
                color: tab === t ? BG : TEXT_MUTED,
                border: `1px solid ${tab === t ? ACCENT : BORDER}`,
              }}
            >
              {t === "log" ? "The Log" : "Insights & Recs"}
            </button>
          ))}
        </div>

        {shows === null && <p style={{ color: TEXT_MUTED }}>Loading your log...</p>}

        {shows !== null && tab === "log" && (
          <div className="animate-tabIn">
            <div className="flex flex-wrap gap-2 mb-5 items-center">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: TEXT_MUTED }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title or genre..."
                  className="w-full pl-9 pr-3 py-2 rounded-md outline-none text-sm"
                  style={{ background: PANEL, color: TEXT, border: `1px solid ${BORDER}` }}
                />
              </div>
              {["all", "want", "watching", "watched"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-2 rounded-md text-xs font-semibold uppercase transition-all duration-150 active:scale-[0.97] ${filterStatus === s ? "hover:opacity-90" : "hover:bg-white/5"}`}
                  style={{
                    background: filterStatus === s ? TEXT : "transparent",
                    color: filterStatus === s ? BG : TEXT_MUTED,
                    border: `1px solid ${filterStatus === s ? TEXT : BORDER}`,
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
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 active:scale-[0.97] ${filterType === t ? "hover:opacity-90" : "hover:bg-white/5"}`}
                  style={{
                    background: filterType === t ? ACCENT : "transparent",
                    color: filterType === t ? BG : TEXT_MUTED,
                    border: `1px solid ${filterType === t ? ACCENT : BORDER}`,
                  }}
                >
                  {t !== "all" && React.createElement(CONTENT_TYPE[t].Icon, { className: "w-3 h-3" })}
                  {t === "all" ? "All Types" : CONTENT_TYPE[t].label}
                </button>
              ))}
              <div className="flex items-center gap-1 ml-auto rounded-md p-0.5" style={{ border: `1px solid ${BORDER}` }}>
                {["default", "compact"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setViewMode(m)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wide transition-all duration-150 active:scale-[0.97] ${viewMode === m ? "hover:opacity-90" : "hover:bg-white/5"}`}
                    style={{
                      background: viewMode === m ? ACCENT : "transparent",
                      color: viewMode === m ? BG : TEXT_MUTED,
                    }}
                  >
                    {m === "default" ? "Default" : "Compact"}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 rounded-xl" style={{ border: `1px dashed ${BORDER}` }}>
                <Film className="w-8 h-8 mx-auto mb-2" style={{ color: BORDER }} />
                <p style={{ color: TEXT_MUTED }}>
                  {shows.length === 0 ? "Nothing logged yet — add your first show." : "No shows match this filter."}
                </p>
              </div>
            ) : viewMode === "compact" ? (
              <div className="grid grid-cols-[repeat(auto-fill,147px)] grid-flow-dense gap-3">
                {filtered.map((show) => {
                  const isExpanded = expandedId === show.id;
                  return (
                    <motion.div key={show.id} layout className={isExpanded ? "col-span-3" : ""}>
                      {isExpanded ? (
                        <ShowCard
                          show={show}
                          onEdit={(s) => { setEditing(s); setShowForm(true); }}
                          onDelete={deleteShow}
                          onRewatch={rewatch}
                          onFetchDetails={fetchDetailsForShow}
                          fetching={pendingIds.has(show.id)}
                          onCollapse={() => setExpandedId(null)}
                          posterLayoutId={`poster-${show.id}`}
                        />
                      ) : (
                        <CompactShowCard show={show} onExpand={() => setExpandedId(show.id)} />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-4">
                {filtered.map((show) => (
                  <ShowCard
                    key={show.id}
                    show={show}
                    onEdit={(s) => { setEditing(s); setShowForm(true); }}
                    onDelete={deleteShow}
                    onRewatch={rewatch}
                    onFetchDetails={fetchDetailsForShow}
                    fetching={pendingIds.has(show.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {shows !== null && tab === "insights" && stats && (
          <div className="space-y-5 animate-tabIn">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ["Total logged", stats.total, TEXT],
                ["Watched", stats.watched, "#8A93A3"],
                ["Watching", stats.watching, "#4FA8A0"],
                ["Want to watch", stats.want, ACCENT],
              ].map(([label, val, color]) => (
                <div key={label} className="rounded-xl p-4" style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", color }}>{val}</div>
                  <div className="text-xs" style={{ color: TEXT_MUTED }}>{label}</div>
                </div>
              ))}
            </div>

            {stats.topGenres.length > 0 && (
              <div className="rounded-xl p-5" style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: TEXT, letterSpacing: "0.5px" }}>
                  Your genres
                </h2>
                <div className="space-y-2 mt-3">
                  {stats.topGenres.map(([g, count]) => (
                    <div key={g} className="flex items-center gap-3">
                      <span className="text-sm w-28 truncate" style={{ color: TEXT_BODY }}>{g}</span>
                      <div className="flex-1 h-2 rounded-full" style={{ background: PANEL_ALT }}>
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${(count / stats.topGenres[0][1]) * 100}%`, background: ACCENT }}
                        />
                      </div>
                      <span className="text-xs w-5 text-right" style={{ color: TEXT_MUTED }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl p-5" style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: TEXT, letterSpacing: "0.5px" }}>
                Rating breakdown
              </h2>
              <div className="flex gap-3 mt-3 flex-wrap">
                {Object.entries(RATINGS).map(([key, r]) => (
                  <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ border: `1px solid ${r.color}44` }}>
                    <r.Icon className="w-4 h-4" style={{ color: r.color }} />
                    <span className="text-sm" style={{ color: TEXT }}>{stats.ratingCounts[key]}</span>
                    <span className="text-xs" style={{ color: TEXT_MUTED }}>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <RecommendationsPanel shows={shows} onAddToLog={addRecommendationToLog} />
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

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
