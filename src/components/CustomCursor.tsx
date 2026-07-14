"use client";

import { useEffect, useRef, useState } from "react";
import { CursorBee } from "./CursorBee";

/**
 * Replaces the pointer with a little bee that chases the cursor with a
 * touch of lag, like it's darting after it. Desktop-with-a-mouse only:
 * gated on `(pointer: fine)` and off under `prefers-reduced-motion`, so
 * touch users and motion-sensitive users keep the native cursor untouched.
 * Purely decorative (`pointer-events: none`, `aria-hidden`) — hit-testing
 * and keyboard navigation are entirely unaffected.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setEnabled(fine.matches && !reduced.matches);
    update();

    fine.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("bee-cursor-active");

    const el = wrapRef.current;
    if (!el) return;

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;
    let visible = false;

    function setVisible(next: boolean) {
      if (visible === next || !el) return;
      visible = next;
      el.style.opacity = next ? "1" : "0";
    }

    function onMove(e: PointerEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
      setVisible(true);
    }
    function onLeave() {
      setVisible(false);
    }

    function loop() {
      x += (targetX - x) * 0.32;
      y += (targetY - y) * 0.32;
      if (el) {
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("pointermove", onMove);
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      document.documentElement.classList.remove("bee-cursor-active");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[999] opacity-0 transition-opacity duration-200"
      style={{ willChange: "transform" }}
    >
      <div className="animate-cursor-bob -translate-x-1/2 -translate-y-1/2">
        <CursorBee className="h-8 w-8 drop-shadow-[0_4px_6px_rgba(108,74,45,0.28)]" />
      </div>
    </div>
  );
}
