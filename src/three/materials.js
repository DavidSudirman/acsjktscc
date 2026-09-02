import * as THREE from "three";
import { noiseTexture } from "../lib/textures.js";

let built = null;

/** One shared set of materials — built once, reused by every chapter. */
export function materials() {
  if (built) return built;

  const noise = noiseTexture();
  noise.repeat.set(3, 3);

  built = {
    // Machined dark metal. High metalness with a broken-up roughness map
    // is what keeps it from reading as generic shiny CG.
    shell: new THREE.MeshStandardMaterial({
      color: "#191d26",
      metalness: 0.92,
      roughness: 0.44,
      roughnessMap: noise,
      envMapIntensity: 0.9,
    }),
    shellLight: new THREE.MeshStandardMaterial({
      color: "#2b313d",
      metalness: 0.75,
      roughness: 0.52,
      roughnessMap: noise,
    }),
    // Unlit and thin, so highlights read as filament rather than glow.
    filament: new THREE.MeshBasicMaterial({ color: "#eae7e0" }),
    edge: new THREE.LineBasicMaterial({
      color: "#8f97a5",
      transparent: true,
      opacity: 0.35,
    }),
    ghost: new THREE.MeshBasicMaterial({
      color: "#eae7e0",
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    }),
  };

  return built;
}

/** A per-track signal material, cached by colour. */
const signals = new Map();
export function signal(color, opacity = 1) {
  const key = `${color}:${opacity}`;
  if (!signals.has(key)) {
    signals.set(
      key,
      new THREE.MeshBasicMaterial({
        color,
        transparent: opacity < 1,
        opacity,
      })
    );
  }
  return signals.get(key);
}

const lineSignals = new Map();
export function signalLine(color, opacity = 0.6) {
  const key = `${color}:${opacity}`;
  if (!lineSignals.has(key)) {
    lineSignals.set(
      key,
      new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    );
  }
  return lineSignals.get(key);
}
