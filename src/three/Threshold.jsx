import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { materials, signalLine } from "./materials.js";
import { beat } from "./util.js";
import Beat from "./Beat.jsx";
import { ANCHOR } from "../lib/chapters.js";
import { clamp, ease } from "../lib/math.js";
import { softSprite } from "../lib/textures.js";

/* The last shot: a doorway with light on the far side, and the
   camera moving toward it. The story ends on an opening, not a wall. */
export default function Threshold() {
  const group = useRef();
  const glow = useRef();
  const frame = useRef();
  const mats = materials();
  const opening = useMemo(() => new THREE.PlaneGeometry(4.8, 6.4), []);

  useFrame(({ clock }) => {
    const b = beat("join", 0.5);
    if (!b.active || !group.current) return;
    const t = clock.elapsedTime;
    const on = ease.outCubic(clamp((b.raw + 0.4) / 1.1));

    if (glow.current) {
      glow.current.material.opacity = 0.5 * on;
      glow.current.scale.setScalar(1 + Math.sin(t * 0.6) * 0.03);
    }
    if (frame.current) frame.current.material.opacity = 0.5 * on;
  });

  return (
    <Beat id="join" pad={0.5} ref={group} position={ANCHOR.join}>
      <pointLight position={[0, 0, 3]} intensity={20} distance={26} decay={2} color="#fff4e2" />

      {/* Light beyond the opening. */}
      <mesh ref={glow} position={[0, 0, -3]}>
        <planeGeometry args={[16, 16]} />
        <meshBasicMaterial
          map={softSprite()}
          transparent
          opacity={0}
          depthWrite={false}
          color="#f4ead8"
        />
      </mesh>

      {/* The frame itself — machined, not mystical. */}
      <group>
        {[
          [-2.4, 0, 0, 0.16, 6.4, 0.4],
          [2.4, 0, 0, 0.16, 6.4, 0.4],
          [0, 3.2, 0, 4.96, 0.16, 0.4],
          [0, -3.2, 0, 4.96, 0.16, 0.4],
        ].map((d, i) => (
          <mesh key={i} position={[d[0], d[1], d[2]]} material={mats.shell}>
            <boxGeometry args={[d[3], d[4], d[5]]} />
          </mesh>
        ))}
      </group>

      <lineSegments ref={frame} position={[0, 0, 0.24]}>
        <edgesGeometry args={[opening]} />
        <primitive object={signalLine("#eae7e0", 0.5)} attach="material" />
      </lineSegments>
    </Beat>
  );
}
