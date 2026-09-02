import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { materials } from "./materials.js";
import { beat, setInstance, rng } from "./util.js";
import Beat from "./Beat.jsx";
import { ANCHOR } from "../lib/chapters.js";
import { clamp, lerp, smootherstep } from "../lib/math.js";

const SHARDS = 130;

/* Build. Break. Learn. Build again.

   One set of parts, three arrangements: an ordered lattice, the
   scatter it becomes when it fails, and a second lattice that is
   deliberately not the first one. The scroll runs the cycle. */
export default function Experiment() {
  const shards = useRef();
  const group = useRef();
  const mats = materials();

  const forms = useMemo(() => {
    const rand = rng(31337);
    const built = [];
    const broken = [];
    const rebuilt = [];
    const size = [];
    const spin = [];

    for (let i = 0; i < SHARDS; i++) {
      // Form A: a tight cubic lattice — obviously deliberate.
      const gx = i % 5;
      const gy = Math.floor(i / 5) % 5;
      const gz = Math.floor(i / 25) % 6;
      built.push([(gx - 2) * 0.52, (gy - 2) * 0.52, (gz - 2.5) * 0.52]);

      // Form B: failure. Same parts, no order.
      broken.push([
        (rand() - 0.5) * 11,
        (rand() - 0.5) * 8,
        (rand() - 0.5) * 9,
      ]);

      // Form C: rebuilt as a shell — the same material, better arranged.
      const a = rand() * Math.PI * 2;
      const u = rand() * 2 - 1;
      const r = 2.1 + rand() * 0.25;
      rebuilt.push([
        Math.sqrt(1 - u * u) * Math.cos(a) * r,
        u * r * 0.85,
        Math.sqrt(1 - u * u) * Math.sin(a) * r,
      ]);

      size.push(0.1 + rand() * 0.15);
      spin.push([rand() * 6, rand() * 6, rand() * 6]);
    }
    return { built, broken, rebuilt, size, spin };
  }, []);

  useFrame(({ clock }) => {
    const b = beat("experiment", 0.4);
    if (!b.active || !group.current) return;
    const t = clock.elapsedTime;

    // Four beats, matching the four words on screen.
    const p = b.t;
    let from, to, k, chaos;
    if (p < 0.3) {
      from = forms.broken;
      to = forms.built;
      k = smootherstep(p / 0.3); // BUILD — order emerges
      chaos = 0;
    } else if (p < 0.52) {
      from = forms.built;
      to = forms.broken;
      k = smootherstep((p - 0.3) / 0.22); // BREAK — it comes apart
      chaos = k;
    } else if (p < 0.74) {
      from = forms.broken;
      to = forms.broken;
      k = 0; // LEARN — drifting, taking stock
      chaos = 1 - smootherstep((p - 0.52) / 0.22) * 0.5;
    } else {
      from = forms.broken;
      to = forms.rebuilt;
      k = smootherstep((p - 0.74) / 0.26); // BUILD AGAIN — new order
      chaos = 1 - smootherstep((p - 0.74) / 0.26);
    }

    for (let i = 0; i < SHARDS; i++) {
      // Staggering the interpolation stops it reading as one rigid morph.
      const stagger = clamp((k - (i / SHARDS) * 0.35) / 0.65);
      const e = smootherstep(stagger);
      const jitter = chaos * 0.14;
      setInstance(
        shards.current,
        i,
        [
          lerp(from[i][0], to[i][0], e) + Math.sin(t * 1.4 + i) * jitter,
          lerp(from[i][1], to[i][1], e) + Math.cos(t * 1.1 + i * 1.3) * jitter,
          lerp(from[i][2], to[i][2], e) + Math.sin(t * 0.9 + i * 0.7) * jitter,
        ],
        forms.size[i],
        [
          forms.spin[i][0] + t * (0.1 + chaos * 0.9),
          forms.spin[i][1] + t * (0.08 + chaos * 0.7),
          forms.spin[i][2],
        ]
      );
    }
    shards.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <Beat id="experiment" pad={0.4} ref={group} position={ANCHOR.experiment}>
      <pointLight position={[3, 3, 4]} intensity={16} distance={22} decay={2} color="#cfd8ea" />
      <pointLight position={[-4, -2, 2]} intensity={8} distance={18} decay={2} color="#e4572e" />
      <instancedMesh ref={shards} args={[undefined, undefined, SHARDS]} material={mats.shell}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
    </Beat>
  );
}
