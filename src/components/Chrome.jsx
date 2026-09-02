import { useEffect, useRef } from "react";
import { onScroll } from "../lib/scroll.js";
import { CHAPTERS, RANGE } from "../lib/chapters.js";
import { club, nav } from "../data/content.js";

const LABEL = {
  hero: "Curiosity",
  idea: "Idea",
  learn: "Learn",
  python: "Python",
  robotics: "Robotics",
  webai: "Web / AI",
  dsa: "DSA",
  build: "Build",
  robot: "Build",
  weather: "Build",
  algo: "Build",
  ecosystem: "Scale",
  experiment: "Iterate",
  community: "Community",
  join: "Join",
};

export default function Chrome({ revealed }) {
  const fill = useRef(null);
  const idx = useRef(null);
  const last = useRef("");

  useEffect(
    () =>
      onScroll(({ progress }) => {
        if (fill.current) fill.current.style.width = `${(progress * 100).toFixed(2)}%`;

        const c = CHAPTERS.find((ch) => progress < RANGE[ch.id].end) ?? CHAPTERS.at(-1);
        const label = LABEL[c.id];
        if (label !== last.current && idx.current) {
          last.current = label;
          idx.current.textContent = label;
        }
      }),
    []
  );

  return (
    <>
      <header className="chrome" data-revealed={revealed}>
        <a className="brand" href="/index.html">
          <span className="mark">SCC</span>
          <span className="full">{club.name}</span>
        </a>
        <nav>
          <ul className="chrome-nav">
            {nav
              .filter((n) => n.label !== "Index")
              .map((n) => (
                <li key={n.href}>
                  <a href={n.href}>{n.label}</a>
                </li>
              ))}
          </ul>
        </nav>
      </header>

      <div className="readout" data-revealed={revealed}>
        <span className="idx" ref={idx}>
          Curiosity
        </span>
        <span className="progress-track">
          <span className="progress-fill" ref={fill} />
        </span>
      </div>
    </>
  );
}
