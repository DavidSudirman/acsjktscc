/* ============================================================
   The script.

   One continuous camera move through one continuous world.
   Chapters declare how much scroll they occupy (in vh); their
   normalised [start, end] ranges are derived from that, so the
   DOM overlay and the 3D scene are always reading the same clock.
   ============================================================ */

export const CHAPTERS = [
  { id: "hero", vh: 190 },
  { id: "idea", vh: 170 },
  { id: "learn", vh: 90 },
  { id: "python", vh: 130 },
  { id: "robotics", vh: 130 },
  { id: "webai", vh: 130 },
  { id: "dsa", vh: 130 },
  { id: "build", vh: 90 },
  { id: "robot", vh: 150 },
  { id: "weather", vh: 150 },
  { id: "algo", vh: 150 },
  { id: "ecosystem", vh: 200 },
  { id: "experiment", vh: 180 },
  { id: "community", vh: 170 },
  { id: "join", vh: 150 },
];

export const TOTAL_VH = CHAPTERS.reduce((n, c) => n + c.vh, 0);

/** id -> { start, end } in global progress space (0..1). */
export const RANGE = (() => {
  const out = {};
  let acc = 0;
  for (const c of CHAPTERS) {
    out[c.id] = { start: acc / TOTAL_VH, end: (acc + c.vh) / TOTAL_VH };
    acc += c.vh;
  }
  return out;
})();

/** Global progress at local position `t` (0..1) inside a chapter. */
export const at = (id, t = 0) => {
  const r = RANGE[id];
  return r.start + (r.end - r.start) * t;
};

/* ---------- world anchors ----------
   Where each set piece physically lives. The camera path threads
   between them, so the journey has real geography. */
export const ANCHOR = {
  core: [0, 0, 0],
  python: [-13, -0.5, -15],
  robotics: [-2, 5.5, -25],
  webai: [10, 1.5, -31],
  dsa: [2, -4.5, -41],
  robot: [-7, -2.2, -58],
  weather: [3, 5, -72],
  algo: [10, -1.5, -84],
  ecosystem: [0, 0, -70],
  experiment: [0, 0, -104],
  community: [0, 0, -121],
  join: [0, 0, -136],
};

/* ---------- camera keyframes ----------
   [globalProgress, position, lookAt target]
   Interpolated piecewise with smootherstep, so timing stays
   locked to the chapters rather than drifting off a spline. */
export const KEYS = [
  // ── Hero: a long, slow approach out of near-emptiness
  [at("hero", 0.0), [0, 0.5, 21], [0, 0, 0]],
  [at("hero", 0.55), [0, 0.4, 13], [0, 0, 0]],
  [at("hero", 1.0), [0.4, 0.3, 7.2], [0, 0, 0]],

  // ── Idea: right up against it as it opens
  [at("idea", 0.4), [1.1, 0.5, 3.9], [0, 0, 0]],
  [at("idea", 1.0), [-1.4, 1.5, 3.6], [0, 0.1, 0]],

  // ── Learn: pull back to see the four branches leave the core
  [at("learn", 1.0), [0, 3.6, 10.5], [0, 0.4, -3]],

  // ── The four worlds
  [at("python", 0.25), [-9.5, 1.4, -6.5], [-13, -0.5, -15]],
  [at("python", 1.0), [-13.4, -0.3, -9.4], [-13, -0.5, -15]],

  [at("robotics", 0.3), [-7.5, 3.4, -18], [-2, 5.5, -25]],
  [at("robotics", 1.0), [-3.2, 5.6, -19.6], [-2, 5.5, -25]],

  [at("webai", 0.3), [6, 3.4, -24], [10, 1.5, -31]],
  [at("webai", 1.0), [10.6, 1.9, -25.4], [10, 1.5, -31]],

  [at("dsa", 0.3), [7, -2.4, -35], [2, -4.5, -41]],
  [at("dsa", 1.0), [2.6, -4.1, -35.4], [2, -4.5, -41]],

  // ── Build: drop back onto the main axis and press forward
  [at("build", 1.0), [-1.5, -1.2, -48], [-5, -2, -56]],

  // ── Project 1: run alongside the robot
  [at("robot", 0.35), [-10.5, -1.2, -55], [-7, -2.2, -58]],
  [at("robot", 1.0), [-3.5, -1.0, -60.5], [-7, -2.4, -59]],

  // ── Project 2: climb into weather
  [at("weather", 0.4), [1.5, 2.6, -66], [3, 5, -72]],
  [at("weather", 1.0), [4.4, 5.4, -67.5], [3, 5, -72]],

  // ── Project 3: descend into the graph
  [at("algo", 0.4), [8, 1.5, -78], [10, -1.5, -84]],
  [at("algo", 1.0), [11, -1.2, -78.8], [10, -1.5, -84]],

  // ── Ecosystem: retreat hard and look back over everything built
  [at("ecosystem", 0.55), [4, 6, -58], [2, 0, -76]],
  [at("ecosystem", 1.0), [0, 14, -34], [0, -1, -78]],

  // ── Experiment: back down into the churn
  [at("experiment", 0.3), [0, 2, -94], [0, 0, -104]],
  [at("experiment", 1.0), [2.4, 0.6, -98.5], [0, 0, -104]],

  // ── Community: the constellation assembles around us
  [at("community", 0.4), [0, 1.2, -113], [0, 0, -121]],
  [at("community", 1.0), [0, 0.4, -116.5], [0, 0, -121]],

  // ── Join: through the threshold
  [at("join", 0.5), [0, 0, -129], [0, 0, -137]],
  [at("join", 1.0), [0, 0, -134.2], [0, 0, -138]],
];
