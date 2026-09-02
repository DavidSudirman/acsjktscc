import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { materials, signal, signalLine } from "./materials.js";
import { beat, setInstance, rng } from "./util.js";
import Beat from "./Beat.jsx";
import { ANCHOR } from "../lib/chapters.js";
import { clamp, lerp, ease, smootherstep } from "../lib/math.js";
import { softSprite } from "../lib/textures.js";

/* ══════════════════════════════════════════════════════════
   01 · LINE-FOLLOWING ROBOT
   A real track, and a robot that actually steers along it —
   the whole point of the build was that it follows the line.
   ══════════════════════════════════════════════════════════ */
function LineRobot() {
  const bot = useRef();
  const wheels = useRef([]);
  const mats = materials();

  const track = useMemo(() => {
    const pts = [
      [-9, 0, 3.4],
      [-5.5, 0, 1.2],
      [-2.5, 0, 2.6],
      [0.6, 0, 0.4],
      [3.4, 0, -1.8],
      [6.2, 0, -0.4],
      [9, 0, -2.6],
    ].map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(pts);
    return {
      curve,
      geometry: new THREE.TubeGeometry(curve, 220, 0.035, 6, false),
    };
  }, []);

  const tmp = useMemo(
    () => ({ pos: new THREE.Vector3(), ahead: new THREE.Vector3() }),
    []
  );

  useFrame(({ clock }) => {
    const b = beat("robot", 0.3);
    if (!b.active || !bot.current) return;

    const u = clamp(ease.inOutCubic(clamp(b.t * 1.05)) * 0.97 + 0.015);
    track.curve.getPointAt(u, tmp.pos);
    track.curve.getPointAt(Math.min(0.999, u + 0.012), tmp.ahead);

    bot.current.position.copy(tmp.pos);
    bot.current.position.y += 0.24;
    bot.current.lookAt(tmp.ahead.x, tmp.pos.y + 0.24, tmp.ahead.z);

    const spin = clock.elapsedTime * 6;
    wheels.current.forEach((w) => w && (w.rotation.x = spin));
  });

  return (
    <Beat id="robot" position={ANCHOR.robot}>
      <pointLight position={[0, 3, 3]} intensity={14} distance={22} decay={2} color="#e4572e" />

      {/* The floor, and the line on it. */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
        <planeGeometry args={[26, 16]} />
        <meshStandardMaterial color="#0c0e13" roughness={0.95} metalness={0} />
      </mesh>
      <mesh geometry={track.geometry} material={signal("#e8e5de", 0.85)} />

      <group ref={bot}>
        <mesh material={mats.shell} position={[0, 0.02, 0]}>
          <boxGeometry args={[0.62, 0.16, 0.82]} />
        </mesh>
        <mesh material={mats.shellLight} position={[0, 0.14, -0.06]}>
          <boxGeometry args={[0.44, 0.1, 0.5]} />
        </mesh>
        {/* IR pair, out front, pointed down at the line. */}
        {[-0.13, 0.13].map((x) => (
          <mesh key={x} material={signal("#e4572e")} position={[x, -0.05, 0.44]}>
            <sphereGeometry args={[0.036, 8, 8]} />
          </mesh>
        ))}
        <mesh material={signal("#9fd356")} position={[0, 0.21, -0.12]}>
          <boxGeometry args={[0.05, 0.02, 0.05]} />
        </mesh>
        {[
          [-0.34, -0.04, 0.24],
          [0.34, -0.04, 0.24],
          [-0.34, -0.04, -0.24],
          [0.34, -0.04, -0.24],
        ].map((p, i) => (
          <mesh
            key={i}
            ref={(el) => (wheels.current[i] = el)}
            position={p}
            rotation={[0, 0, Math.PI / 2]}
            material={mats.shellLight}
          >
            <cylinderGeometry args={[0.15, 0.15, 0.08, 18]} />
          </mesh>
        ))}
      </group>
    </Beat>
  );
}

/* ══════════════════════════════════════════════════════════
   02 · WEATHER DASHBOARD
   Weather above, the readout that describes it below.
   ══════════════════════════════════════════════════════════ */
const DROPS = 280;
const PUFFS = 90;

function WeatherDash() {
  const rain = useRef();
  const puffs = useRef();
  const bars = useRef();
  const color = "#5ac8de";

  const drops = useMemo(() => {
    const rand = rng(55);
    return Array.from({ length: DROPS }, () => ({
      x: (rand() - 0.5) * 9,
      z: (rand() - 0.5) * 6,
      y: rand() * 7,
      speed: 2.4 + rand() * 3.4,
      len: 0.16 + rand() * 0.3,
    }));
  }, []);

  const cloud = useMemo(() => {
    const rand = rng(88);
    return Array.from({ length: PUFFS }, () => {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.6) * 3.4;
      return {
        pos: [Math.cos(a) * r, 3.1 + (rand() - 0.5) * 0.9, Math.sin(a) * r * 0.55],
        scale: 0.7 + rand() * 1.5,
      };
    });
  }, []);

  const series = useMemo(() => {
    const rand = rng(120);
    return Array.from({ length: 24 }, () => 0.2 + rand() * 1.5);
  }, []);

  useFrame(({ clock }) => {
    const b = beat("weather", 0.3);
    if (!b.active) return;
    const t = clock.elapsedTime;
    const on = ease.outCubic(clamp(b.t * 1.5));

    if (puffs.current) {
      cloud.forEach((c, i) => {
        const drift = Math.sin(t * 0.2 + i) * 0.12;
        setInstance(puffs.current, i, [c.pos[0] + drift, c.pos[1], c.pos[2]], c.scale * on);
      });
      puffs.current.instanceMatrix.needsUpdate = true;
    }

    if (rain.current) {
      drops.forEach((d, i) => {
        const y = ((d.y - t * d.speed) % 7 + 7) % 7;
        setInstance(rain.current, i, [d.x, y - 1.2, d.z], [0.006, d.len * on, 0.006]);
      });
      rain.current.instanceMatrix.needsUpdate = true;
    }

    // Live-looking readout: values settle as the panel resolves.
    if (bars.current) {
      series.forEach((v, i) => {
        const h = v * on * (0.85 + Math.sin(t * 1.1 + i * 0.5) * 0.15);
        setInstance(bars.current, i, [-2.3 + i * 0.2, -2.6 + h / 2, 0.02], [0.09, Math.max(0.01, h), 0.02]);
      });
      bars.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <Beat id="weather" position={ANCHOR.weather}>
      <pointLight position={[0, 2, 4]} intensity={12} distance={20} decay={2} color={color} />

      <instancedMesh ref={puffs} args={[undefined, undefined, PUFFS]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={softSprite()}
          transparent
          opacity={0.09}
          depthWrite={false}
          color="#9fb4d0"
        />
      </instancedMesh>

      <instancedMesh
        ref={rain}
        args={[undefined, undefined, DROPS]}
        material={signal(color, 0.5)}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>

      {/* The dashboard the data lands in. */}
      <group position={[0, -1.4, 0.6]}>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(5.4, 3.2)]} />
          <primitive object={signalLine(color, 0.4)} attach="material" />
        </lineSegments>
        <mesh material={signal(color, 0.045)}>
          <planeGeometry args={[5.4, 3.2]} />
        </mesh>
        <mesh position={[0, 1.42, 0.001]} material={signal(color, 0.2)}>
          <planeGeometry args={[5.4, 0.34]} />
        </mesh>
        <instancedMesh
          ref={bars}
          args={[undefined, undefined, 24]}
          material={signal(color, 0.85)}
          position={[0, 1.4, 0]}
        >
          <boxGeometry args={[1, 1, 1]} />
        </instancedMesh>
      </group>
    </Beat>
  );
}

/* ══════════════════════════════════════════════════════════
   03 · ALGORITHM VISUALIZER
   Sorting on one side, pathfinding on the other.
   ══════════════════════════════════════════════════════════ */
const N = 40;

function AlgoViz() {
  const bars = useRef();
  const cursor = useRef();
  const grid = useRef();
  const color = "#9fd356";

  const values = useMemo(() => {
    const rand = rng(7);
    const v = Array.from({ length: N }, () => 0.2 + rand() * 3);
    return { start: v, sorted: [...v].sort((a, b) => a - b) };
  }, []);

  // A grid the path search will sweep across.
  const cells = useMemo(() => {
    const out = [];
    for (let x = 0; x < 14; x++)
      for (let y = 0; y < 9; y++) out.push({ x, y, d: (x + y) / 22 });
    return out;
  }, []);

  useFrame(({ clock }) => {
    const b = beat("algo", 0.3);
    if (!b.active) return;
    const t = clock.elapsedTime;

    if (bars.current) {
      // Pass index sweeps repeatedly while the array converges.
      const k = ease.inOutCubic(clamp((b.t - 0.1) * 1.4));
      const head = (b.t * 3 % 1) * N;
      for (let i = 0; i < N; i++) {
        const h = lerp(values.start[i], values.sorted[i], k);
        const hit = Math.abs(i - head) < 1.2 ? 1 : 0;
        setInstance(
          bars.current,
          i,
          [-3.9 + i * 0.2, h / 2, 0],
          [0.13, Math.max(0.02, h), 0.13 + hit * 0.05]
        );
      }
      bars.current.instanceMatrix.needsUpdate = true;
      if (cursor.current) {
        cursor.current.position.x = -3.9 + head * 0.2;
        cursor.current.visible = k < 0.99;
      }
    }

    // Flood fill spreading out from a corner.
    if (grid.current) {
      const front = clamp(b.t * 1.4) * 1.15;
      cells.forEach((c, i) => {
        const reached = clamp((front - c.d) * 6);
        const s = 0.03 + reached * 0.05;
        const pulse = 1 + Math.sin(t * 3 - c.d * 10) * 0.15 * reached;
        setInstance(grid.current, i, [c.x * 0.34 - 2.2, c.y * 0.34 - 1.4, -3.2], s * pulse);
      });
      grid.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <Beat id="algo" position={ANCHOR.algo}>
      <pointLight position={[0, 3, 4]} intensity={13} distance={20} decay={2} color={color} />
      <instancedMesh ref={bars} args={[undefined, undefined, N]} material={signal(color, 0.9)}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <mesh ref={cursor} position={[0, -0.18, 0]} material={signal("#ffffff")}>
        <boxGeometry args={[0.02, 0.24, 0.02]} />
      </mesh>
      <instancedMesh
        ref={grid}
        args={[undefined, undefined, 14 * 9]}
        material={signal(color, 0.7)}
      >
        <sphereGeometry args={[1, 8, 8]} />
      </instancedMesh>
      <lineSegments position={[0, 1.6, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(9, 5.6, 7.4)]} />
        <primitive object={signalLine(color, 0.12)} attach="material" />
      </lineSegments>
    </Beat>
  );
}

export default function Builds() {
  return (
    <>
      <LineRobot />
      <WeatherDash />
      <AlgoViz />
    </>
  );
}
