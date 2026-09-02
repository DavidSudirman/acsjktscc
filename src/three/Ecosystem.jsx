import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { materials } from "./materials.js";
import { beat, setInstance, rng, linesGeometry } from "./util.js";
import Beat from "./Beat.jsx";
import { tracks, projects } from "../data/content.js";
import { clamp, ease } from "../lib/math.js";
import { signalLine } from "./materials.js";

/* The 15+ statistic, told as geography rather than a number in a box.
   Small builds accumulate through the corridor the camera has already
   travelled, so when it finally retreats you're looking back at a
   place you've been — and it turns out to have been full. */
const COUNT = 46;

export default function Ecosystem() {
  const shells = useRef();
  const cores = useRef();
  const web = useRef();
  const group = useRef();
  const mats = materials();

  const layout = useMemo(() => {
    const rand = rng(2024);
    const items = Array.from({ length: COUNT }, (_, i) => {
      const along = i / COUNT;
      // Scattered along the route from the first track to the last build.
      const z = -18 - along * 74 + (rand() - 0.5) * 8;
      const spread = 6 + along * 12;
      return {
        pos: [
          (rand() - 0.5) * spread * 2,
          (rand() - 0.5) * spread * 0.9 - 1,
          z,
        ],
        scale: 0.16 + rand() * 0.4,
        color: tracks[Math.floor(rand() * tracks.length)].color,
        rot: [rand() * 6, rand() * 6, rand() * 6],
        order: rand(),
      };
    });

    // A loose mesh between near neighbours — an ecosystem, not a scatter.
    const pairs = [];
    items.forEach((a, i) => {
      let best = -1;
      let bestD = Infinity;
      items.forEach((b, j) => {
        if (i === j) return;
        const d =
          (a.pos[0] - b.pos[0]) ** 2 +
          (a.pos[1] - b.pos[1]) ** 2 +
          (a.pos[2] - b.pos[2]) ** 2;
        if (d < bestD) {
          bestD = d;
          best = j;
        }
      });
      if (best >= 0 && bestD < 260) pairs.push([a.pos, items[best].pos]);
    });

    return { items, geometry: linesGeometry(pairs), pairCount: pairs.length };
  }, []);

  useFrame(({ clock }) => {
    const b = beat("ecosystem", 0.45);
    if (!b.active || !group.current) return;
    const t = clock.elapsedTime;
    // They fade up early, so the pull-back finds them already there.
    const on = ease.outCubic(clamp(b.raw * 1.6 + 0.25));

    for (let i = 0; i < COUNT; i++) {
      const it = layout.items[i];
      const appear = clamp((on - it.order * 0.55) * 3);
      const s = it.scale * ease.outBack(appear) * (appear > 0 ? 1 : 0);
      const bob = Math.sin(t * 0.5 + i) * 0.08;
      setInstance(
        shells.current,
        i,
        [it.pos[0], it.pos[1] + bob, it.pos[2]],
        Math.max(0.0001, s),
        [it.rot[0] + t * 0.08, it.rot[1] + t * 0.1, it.rot[2]]
      );
      setInstance(
        cores.current,
        i,
        [it.pos[0], it.pos[1] + bob, it.pos[2]],
        Math.max(0.0001, s * 0.3)
      );
    }
    shells.current.instanceMatrix.needsUpdate = true;
    cores.current.instanceMatrix.needsUpdate = true;

    if (web.current) {
      web.current.geometry.setDrawRange(
        0,
        Math.floor(layout.pairCount * 2 * clamp(on * 1.2))
      );
      web.current.material.opacity = 0.08 * clamp(b.t * 2);
    }
  });

  return (
    <Beat id="ecosystem" pad={0.45} ref={group}>
      <instancedMesh ref={shells} args={[undefined, undefined, COUNT]} material={mats.shellLight}>
        <icosahedronGeometry args={[1, 0]} />
      </instancedMesh>
      <instancedMesh ref={cores} args={[undefined, undefined, COUNT]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#cdd4e2" />
      </instancedMesh>
      <lineSegments ref={web} geometry={layout.geometry}>
        <primitive object={signalLine("#8f97a5", 0.08)} attach="material" />
      </lineSegments>
    </Beat>
  );
}
