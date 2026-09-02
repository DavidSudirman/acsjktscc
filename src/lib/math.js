export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export const lerp = (a, b, t) => a + (b - a) * t;

/** Frame-rate independent damping. */
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));

export const smoothstep = (t) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};

export const smootherstep = (t) => {
  t = clamp(t);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/** Normalise `v` from [a,b] into [0,1]. */
export const range = (v, a, b) => clamp((v - a) / (b - a || 1));

/** 0 at the edges of [a,b], 1 across the middle — for "hold" beats. */
export const band = (v, a, b, fade = 0.15) => {
  const t = range(v, a, b);
  return Math.min(smoothstep(t / fade), smoothstep((1 - t) / fade));
};

export const ease = {
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  outBack: (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
};
