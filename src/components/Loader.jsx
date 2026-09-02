import { useEffect, useState } from "react";
import { onBoot } from "../lib/boot.js";
import { club } from "../data/content.js";

const CELLS = 22;

export default function Loader({ done }) {
  const [{ progress, label }, set] = useState({ progress: 0, label: "" });

  useEffect(() => onBoot((s) => set({ progress: s.progress, label: s.label })), []);

  const filled = Math.round(progress * CELLS);
  const pct = Math.round(progress * 100);

  return (
    <div className="loader" data-done={done} aria-hidden={done}>
      <div className="loader-inner">
        <div className="loader-brand">{club.short}</div>
        <div className="loader-rule" />
        <div className="loader-title">Initializing system</div>
        <div className="loader-bar">
          <span className="loader-cells">
            <b>{"█".repeat(filled)}</b>
            {"░".repeat(CELLS - filled)}
          </span>
          <span className="loader-pct">{pct}%</span>
        </div>
        <div className="loader-step">{done ? "ready" : label}</div>
      </div>
    </div>
  );
}
