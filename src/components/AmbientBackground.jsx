import React, { useEffect, useRef } from "react";

const MAX_BLOB_SHIFT = 32;

export function AmbientBackground() {
  const containerRef = useRef(null);
  const glowRef = useRef(null);
  const blobARef = useRef(null);
  const blobBRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const glow = glowRef.current;
    if (!container || !glow) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      container.classList.add("ambient-bg--static");
      return;
    }

    let raf = null;

    const setPositions = (x, y) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        glow.style.setProperty("--gx", `${x}px`);
        glow.style.setProperty("--gy", `${y}px`);
        glow.style.opacity = "1";

        const nx = x / window.innerWidth - 0.5;
        const ny = y / window.innerHeight - 0.5;
        blobARef.current?.style.setProperty("--mx", `${nx * MAX_BLOB_SHIFT}px`);
        blobARef.current?.style.setProperty("--my", `${ny * MAX_BLOB_SHIFT}px`);
        blobBRef.current?.style.setProperty("--mx", `${-nx * MAX_BLOB_SHIFT}px`);
        blobBRef.current?.style.setProperty("--my", `${-ny * MAX_BLOB_SHIFT}px`);
      });
    };

    const handlePointerMove = (e) => {
      if (e.pointerType === "touch") return;
      setPositions(e.clientX, e.clientY);
    };

    const handlePointerDown = (e) => {
      setPositions(e.clientX, e.clientY);
      const ripple = document.createElement("div");
      ripple.className = "ambient-ripple";
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      container.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={containerRef} className="ambient-bg" aria-hidden="true">
      <div ref={blobARef} className="ambient-blob-shift ambient-blob-shift--a">
        <div className="ambient-blob ambient-blob--a" />
      </div>
      <div ref={blobBRef} className="ambient-blob-shift ambient-blob-shift--b">
        <div className="ambient-blob ambient-blob--b" />
      </div>
      <div ref={glowRef} className="ambient-pointer-glow" />
    </div>
  );
}
