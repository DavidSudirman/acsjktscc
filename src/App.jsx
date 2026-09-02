import { useEffect, useRef, useState } from "react";
import Scene from "./components/Scene.jsx";
import Story from "./components/Story.jsx";
import Chrome from "./components/Chrome.jsx";
import Loader from "./components/Loader.jsx";
import {
  initScroll,
  raf,
  stopScroll,
  startScroll,
  scroll,
  scrollTo,
} from "./lib/scroll.js";
import { at as chapterAt } from "./lib/chapters.js";
import { onBoot, loadFonts, completeStep } from "./lib/boot.js";
import { warmTextures } from "./lib/textures.js";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export default function App() {
  const [gl] = useState(hasWebGL);
  const [phase, setPhase] = useState("boot"); // boot → reveal → live
  const stage = useRef(null);

  // Scroll engine + its rAF pump. Runs outside the canvas so the page
  // still scrolls if WebGL is unavailable.
  useEffect(() => {
    initScroll();
    stopScroll();
    if (import.meta.env.DEV) window.__story = { scroll, chapterAt, scrollTo };
    let id;
    const loop = (t) => {
      raf(t);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  // Real boot work.
  useEffect(() => {
    loadFonts();
    // Texture generation is synchronous canvas work — yield first so the
    // loader gets a chance to paint before we block.
    const id = setTimeout(() => {
      warmTextures();
      completeStep("textures");
    }, 60);
    if (!gl) {
      completeStep("geometry");
      completeStep("shaders");
    }
    return () => clearTimeout(id);
  }, [gl]);

  // Hand off from the loader once the work is genuinely finished.
  useEffect(
    () =>
      onBoot((s) => {
        if (!s.complete || phase !== "boot") return;
        // A held beat at 100% before the cut — the loader shouldn't
        // vanish the instant the last byte lands.
        setTimeout(() => {
          setPhase("reveal");
          window.scrollTo(0, 0);
          startScroll();
          setTimeout(() => setPhase("live"), 1800);
        }, 420);
      }),
    [phase]
  );

  const revealed = phase !== "boot";

  return (
    <>
      {gl ? (
        <div id="stage" ref={stage} data-revealed={revealed}>
          <Scene />
        </div>
      ) : (
        <div className="nogl" />
      )}

      <Chrome revealed={revealed} />
      <Story revealed={revealed} />

      <div className="vignette" />
      <div className="grain" />

      <Loader done={phase !== "boot"} />
    </>
  );
}
