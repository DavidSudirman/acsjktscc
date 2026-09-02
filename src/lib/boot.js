/* ============================================================
   Boot pipeline.

   Every step below is real work that has to finish before the
   first frame can be honest — so the percentage on the loading
   screen is a genuine measure, not a timed animation.
   ============================================================ */

const STEPS = [
  { id: "fonts", weight: 22, label: "loading typefaces" },
  { id: "textures", weight: 20, label: "generating textures" },
  { id: "geometry", weight: 26, label: "assembling environment" },
  { id: "shaders", weight: 32, label: "compiling shaders" },
];

const TOTAL = STEPS.reduce((n, s) => n + s.weight, 0);

const done = new Set();
const listeners = new Set();

export const bootState = {
  progress: 0,
  label: STEPS[0].label,
  complete: false,
};

function emit() {
  const gained = STEPS.filter((s) => done.has(s.id)).reduce(
    (n, s) => n + s.weight,
    0
  );
  bootState.progress = gained / TOTAL;
  bootState.complete = gained >= TOTAL;
  const next = STEPS.find((s) => !done.has(s.id));
  bootState.label = next ? next.label : "ready";
  for (const fn of listeners) fn(bootState);
}

export const onBoot = (fn) => {
  listeners.add(fn);
  fn(bootState);
  return () => listeners.delete(fn);
};

export function completeStep(id) {
  if (done.has(id)) return;
  done.add(id);
  emit();
}

/** Fonts are a real gate: swapping them in later would reflow the story. */
export async function loadFonts() {
  try {
    if (document.fonts) {
      await Promise.race([
        document.fonts.ready,
        new Promise((r) => setTimeout(r, 4000)),
      ]);
    }
  } catch {
    /* a missing Font Loading API shouldn't strand the loader */
  }
  completeStep("fonts");
}
