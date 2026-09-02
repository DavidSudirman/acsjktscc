import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { KEYS } from "../lib/chapters.js";
import { scroll } from "../lib/scroll.js";
import { smootherstep, damp } from "../lib/math.js";
import { completeStep } from "../lib/boot.js";

const _pos = new THREE.Vector3();
const _tgt = new THREE.Vector3();

/** Piecewise-interpolate the keyframe list at global progress `p`. */
function sample(p, outPos, outTgt) {
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1][0] < p) i++;

  const [t0, p0, g0] = KEYS[i];
  const [t1, p1, g1] = KEYS[i + 1];
  const k = smootherstep((p - t0) / (t1 - t0 || 1));

  outPos.set(
    p0[0] + (p1[0] - p0[0]) * k,
    p0[1] + (p1[1] - p0[1]) * k,
    p0[2] + (p1[2] - p0[2]) * k
  );
  outTgt.set(
    g0[0] + (g1[0] - g0[0]) * k,
    g0[1] + (g1[1] - g0[1]) * k,
    g0[2] + (g1[2] - g0[2]) * k
  );
}

export default function CameraRig() {
  const { camera, gl, scene } = useThree();
  const smooth = useRef({
    pos: new THREE.Vector3(0, 0.5, 21),
    tgt: new THREE.Vector3(0, 0, 0),
    drift: new THREE.Vector2(),
  });
  const pointer = useRef({ x: 0, y: 0 });
  const compiled = useRef(false);

  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    sample(scroll.progress, _pos, _tgt);

    const s = smooth.current;
    // Damping rather than a hard set: scroll input is spiky, and the
    // camera should feel like it has mass.
    s.pos.x = damp(s.pos.x, _pos.x, 6, d);
    s.pos.y = damp(s.pos.y, _pos.y, 6, d);
    s.pos.z = damp(s.pos.z, _pos.z, 6, d);
    s.tgt.x = damp(s.tgt.x, _tgt.x, 5, d);
    s.tgt.y = damp(s.tgt.y, _tgt.y, 5, d);
    s.tgt.z = damp(s.tgt.z, _tgt.z, 5, d);

    // A whisper of parallax on pointer move. Any more and it fights
    // the scroll for authorship of the shot.
    s.drift.x = damp(s.drift.x, pointer.current.x * 0.22, 3, d);
    s.drift.y = damp(s.drift.y, -pointer.current.y * 0.14, 3, d);

    camera.position.copy(s.pos);
    camera.position.x += s.drift.x;
    camera.position.y += s.drift.y;
    camera.lookAt(s.tgt);

    // Subtle roll into fast scrolling — reads as momentum, not a gimmick.
    camera.rotation.z += THREE.MathUtils.clamp(scroll.velocity * 0.00035, -0.03, 0.03);

    if (!compiled.current) {
      compiled.current = true;
      // Compile once the first real camera transform is in place, so the
      // shader warm-up matches what we're about to draw.
      try {
        gl.compile(scene, camera);
      } catch {
        /* non-fatal — the first frame will just compile lazily */
      }
      completeStep("shaders");
    }
  });

  return null;
}
