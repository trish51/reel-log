import React, { useEffect, useRef } from "react";

export function AmbientBackground() {
  const containerRef = useRef(null);
  const glowRef = useRef(null);

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

    const setGlowPosition = (x, y) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        glow.style.setProperty("--gx", `${x}px`);
        glow.style.setProperty("--gy", `${y}px`);
        glow.style.opacity = "1";
      });
    };

    const handlePointerMove = (e) => {
      if (e.pointerType === "touch") return;
      setGlowPosition(e.clientX, e.clientY);
    };

    const handlePointerDown = (e) => {
      setGlowPosition(e.clientX, e.clientY);
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
      <div className="ambient-blob ambient-blob--a" />
      <div className="ambient-blob ambient-blob--b" />
      <div ref={glowRef} className="ambient-pointer-glow" />
    </div>
  );
}
