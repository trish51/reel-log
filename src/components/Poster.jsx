import React from "react";
import { motion } from "framer-motion";
import { CONTENT_TYPE, RATINGS } from "../constants";
import { ACCENT, BG, BORDER } from "../theme";

export function Stamp({ ratingKey, size = "md" }) {
  if (!ratingKey || !RATINGS[ratingKey]) return null;
  const r = RATINGS[ratingKey];
  const Icon = r.Icon;
  const dims = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider"
      style={{
        color: r.color,
        border: `1.5px solid ${r.color}`,
        transform: "rotate(-3deg)",
        fontSize: size === "sm" ? "9px" : "11px",
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      <Icon className={dims} strokeWidth={2.2} />
      {r.label}
    </div>
  );
}

export function Poster({ posterUrl, contentType, rating, showRating, loading, variant = "thumbnail", layoutId }) {
  const Icon = CONTENT_TYPE[contentType || "tv"].Icon;
  const isFull = variant === "full";
  const isLockedHeight = variant === "lockedHeight";
  const isModalSmall = variant === "modalSmall";
  // "thumbnail" uses a fixed width with the height coming from flex stretch
  // (matching the sibling text column) — safe because width never depends
  // on content. "lockedHeight" derives width from height via aspect-ratio,
  // which is only safe when the card's height is itself an explicit,
  // content-independent value (see ShowCard's lockedHeight prop) — using it
  // where height is unbounded creates a circular width/height dependency.
  const sizeClass = isFull
    ? "w-full h-full"
    : isLockedHeight
    ? "h-full w-auto shrink-0 aspect-[2/3]"
    : isModalSmall
    ? "w-20 shrink-0 aspect-[2/3] rounded-md"
    : "w-32 sm:w-36 shrink-0 aspect-[2/3]";
  return (
    <motion.div
      layout
      layoutId={layoutId}
      className={`relative overflow-hidden ${sizeClass}`}
      style={{
        background: BG,
        border: isModalSmall ? `1px solid ${BORDER}` : undefined,
        borderRight: !isFull && !isModalSmall ? `1px solid ${BORDER}` : undefined,
      }}
    >
      {posterUrl ? (
        <img src={posterUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Icon className="w-8 h-8" style={{ color: BORDER }} />
        </div>
      )}
      {loading && (
        <div
          className="absolute inset-0 animate-shimmer"
          style={{
            backgroundImage: `linear-gradient(90deg, transparent, ${ACCENT}33, transparent)`,
            backgroundSize: "200% 100%",
          }}
        />
      )}
      {showRating && rating && (
        <div className="absolute top-2 left-2 rounded-sm px-0.5" style={{ background: "#0A0C0FCC" }}>
          <Stamp ratingKey={rating} size="sm" />
        </div>
      )}
    </motion.div>
  );
}
