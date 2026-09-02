import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { beat, setInstance, rng, linesGeometry } from "./util.js";
import Beat from "./Beat.jsx";
import { signalLine } from "./materials.js";
import { ANCHOR } from "../lib/chapters.js";
import { clamp, ease, smootherstep } from "../lib/math.js";

/* Forty-odd people, and the edges between them. The camera sits
   inside the constellation rather than in front of it — you are
   in the room, not looking at a diagram of the room. */
const MEMBERS = 44;

export default function Community() {
  const nodes = useRef();
  const links = useRef();
  const group = useRef();

  const net = useMemo(() => {
    const rand = rng(4040);
    const pts = Array.from({ length: MEMBERS }, (_, i) => {
      // Fibonacci sphere — even spacing, no clumping artefacts.
      const y = 1 - (i / (MEMBERS - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * 2.399963;
      const R = 5.2 + rand() * 1.8;
      return [
        Math.cos(theta) * r * R,
        y * R * 0.72,
        Math.sin(theta) * r * R - 1,
      ];
    });

    const pairs = [];
    pts.forEach((a, i) => {
      pts.forEach((b, j) => {
        if (j <= i) return;
        const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
        if (d < 4.2) pairs.push([a, b]);
      });
    });

    return { pts, geometry: linesGeometry(pairs), pairCount: pairs.length };
  }, []);

  useFrame(({ clock }) => {
    const b = beat("community", 0.4);
    if (!b.active || !group.current) return;
    const t = clock.elapsedTime;
    group.current.rotation.y = t * 0.035 + b.t * 0.4;

    const on = ease.outCubic(clamp(b.t * 1.4));

    for (let i = 0; i < MEMBERS; i++) {
      const p = net.pts[i];
      const appear = clamp((on * MEMBERS * 1.3 - i) / 3);
      const pulse = 1 + Math.sin(t * 1.6 + i * 0.8) * 0.18;
      setInstance(
        nodes.current,
        i,
        [
          p[0] + Math.sin(t * 0.3 + i) * 0.06,
          p[1] + Math.cos(t * 0.26 + i) * 0.06,
          p[2],
        ],
        Math.max(0.0001, 0.058 * ease.outBack(appear) * pulse)
      );
    }
    nodes.current.instanceMatrix.needsUpdate = true;

    if (links.current) {
      links.current.geometry.setDrawRange(
        0,
        Math.floor(net.pairCount * 2 * smootherstep(clamp((b.t - 0.15) * 1.6)))
      );
      links.current.material.opacity = 0.13 * on;
    }
  });

  return (
    <Beat id="community" pad={0.4} ref={group} position={ANCHOR.community}>
      <pointLight position={[0, 0, 2]} intensity={10} distance={16} decay={2} color="#dfe4ee" />
      <instancedMesh ref={nodes} args={[undefined, undefined, MEMBERS]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="#eae7e0" />
      </instancedMesh>
      <lineSegments ref={links} geometry={net.geometry}>
        <primitive object={signalLine("#c8cfdd", 0.12)} attach="material" />
      </lineSegments>
    </Beat>
  );
}
