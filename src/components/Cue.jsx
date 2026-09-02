import { createContext, useContext, useEffect, useRef } from "react";
import { scroll } from "../lib/scroll.js";
import { RANGE } from "../lib/chapters.js";
import { clamp, smootherstep } from "../lib/math.js";

export const ChapterContext = createContext("hero");

/* One rAF driver writes to every registered cue. Doing this outside
   React means the whole overlay animates without a single re-render. */
const registry = new Set();
let running = false;

function tick() {
  const p = scroll.progress;
  for (const cue of registry) {
    const r = RANGE[cue.chapter];
    if (!r) continue;
    const t = (p - r.start) / (r.end - r.start || 1);

    // An `initial` cue is already on screen when the story begins — its
    // entrance belongs to the loader hand-off, not to the scrollbar.
    const inAmt = cue.initial
      ? 1
      : smootherstep(clamp((t - cue.from) / cue.fade));
    const outAmt = 1 - smootherstep(clamp((t - (cue.to - cue.fade)) / cue.fade));
    const v = Math.min(inAmt, outAmt);

    const el = cue.el;
    if (!el) continue;
    // Write a custom property rather than `transform` outright — the
    // stylesheet owns the positioning transform and would be clobbered.
    const y = (1 - inAmt) * cue.rise - (1 - outAmt) * cue.rise * 0.7;
    el.style.opacity = v.toFixed(3);
    el.style.setProperty("--cue-y", `${y.toFixed(2)}px`);
    const vis = v > 0.002;
    if (el.style.visibility !== (vis ? "visible" : "hidden")) {
      el.style.visibility = vis ? "visible" : "hidden";
    }
  }
  requestAnimationFrame(tick);
}

function ensureRunning() {
  if (running) return;
  running = true;
  requestAnimationFrame(tick);
}

/**
 * Reveals its children across a slice of the current chapter's local
 * progress. `from`/`to` are 0..1 within that chapter. Pass `initial` for
 * the opening beat, which is on screen before the first scroll.
 */
export default function Cue({
  from = 0,
  to = 1,
  fade = 0.14,
  rise = 26,
  initial = false,
  as: Tag = "div",
  className = "",
  children,
  ...rest
}) {
  const chapter = useContext(ChapterContext);
  const ref = useRef(null);

  useEffect(() => {
    const entry = { el: ref.current, chapter, from, to, fade, rise, initial };
    registry.add(entry);
    ensureRunning();
    return () => registry.delete(entry);
  }, [chapter, from, to, fade, rise, initial]);

  return (
    <Tag ref={ref} className={`cue ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
