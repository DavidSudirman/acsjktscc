import Lenis from "lenis";
import { clamp } from "./math.js";

/* A mutable singleton rather than React state: the camera and every
   overlay read this 60+ times a second, and re-rendering the tree on
   each frame would be the one thing guaranteed to make it stutter. */
export const scroll = {
  progress: 0, // 0..1 across the whole story
  velocity: 0,
  ready: false,
};

let lenis = null;
const listeners = new Set();

export const onScroll = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function initScroll() {
  if (lenis) return lenis;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  lenis = new Lenis({
    duration: reduced ? 0 : 1.15,
    smoothWheel: !reduced,
    // Native touch scrolling stays native — hijacking it on phones
    // is the fastest way to make a site feel broken.
    syncTouch: false,
    wheelMultiplier: 0.9,
  });

  lenis.on("scroll", ({ progress, velocity }) => {
    scroll.progress = clamp(progress || 0);
    scroll.velocity = velocity || 0;
    for (const fn of listeners) fn(scroll);
  });

  scroll.ready = true;
  return lenis;
}

export function raf(time) {
  lenis?.raf(time);
}

export function scrollTo(target, opts) {
  lenis?.scrollTo(target, opts);
}

export function stopScroll() {
  lenis?.stop();
}

export function startScroll() {
  lenis?.start();
}
