import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { materials, signal, signalLine } from "./materials.js";
import { beat, setInstance, rng, linesGeometry } from "./util.js";
import Beat from "./Beat.jsx";
import { ANCHOR } from "../lib/chapters.js";
import { tracks } from "../data/content.js";
import { clamp, lerp, smootherstep, ease } from "../lib/math.js";

const byId = Object.fromEntries(tracks.map((t) => [t.id, t]));

/** Shared shell: each world exists only while its chapter is on screen. */
function Island({ id, children }) {
  return (
    <Beat id={id} pad={0.35} position={ANCHOR[id]}>
      <pointLight
        position={[2, 2.5, 3]}
        intensity={14}
        distance={18}
        decay={2}
        color={byId[id].color}
      />
      {children}
    </Beat>
  );
}

/* ══════════════════════════════════════════════════════════
   01 · PYTHON — a program writing itself into the dark
   ══════════════════════════════════════════════════════════ */
const CODE_LINES = 46;

function PythonWorld() {
  const lines = useRef();
  const caret = useRef();
  const color = byId.python.color;

  const layout = useMemo(() => {
    const rand = rng(21);
    // Indentation that behaves like real source: blocks open and close.
    let indent = 0;
    return Array.from({ length: CODE_LINES }, (_, i) => {
      const r = rand();
      if (r > 0.82 && indent < 3) indent++;
      else if (r < 0.16 && indent > 0) indent--;
      const width = 0.5 + rand() * (2.4 - indent * 0.35);
      return {
        indent,
        width,
        y: 3.4 - i * 0.155,
        z: (rand() - 0.5) * 0.5,
        accent: rand() > 0.78,
      };
    });
  }, []);

  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 }),
    [color]
  );
  const dim = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#8b93a2", transparent: true, opacity: 0.5 }),
    []
  );

  useFrame(({ clock }) => {
    const b = beat("python", 0.35);
    if (!b.active || !lines.current) return;
    const t = clock.elapsedTime;
    // Lines resolve top-to-bottom as the camera arrives.
    const written = ease.outCubic(clamp(b.t * 1.25)) * CODE_LINES;

    for (let i = 0; i < CODE_LINES; i++) {
      const l = layout[i];
      const on = clamp(written - i);
      const w = l.width * ease.outExpo(on);
      const drift = Math.sin(t * 0.5 + i * 0.3) * 0.02;
      setInstance(
        lines.current,
        i,
        [-1.6 + l.indent * 0.34 + w / 2, l.y + drift, l.z],
        [Math.max(0.0001, w), 0.036, 0.036]
      );
    }
    lines.current.instanceMatrix.needsUpdate = true;

    if (caret.current) {
      const idx = Math.min(CODE_LINES - 1, Math.floor(written));
      const l = layout[idx];
      caret.current.position.set(-1.6 + l.indent * 0.34 + l.width, l.y, l.z);
      caret.current.visible = b.t < 0.98 && Math.sin(t * 6) > -0.2;
    }
  });

  return (
    <group position={[0, -1.4, 0]}>
      <instancedMesh ref={lines} args={[undefined, undefined, CODE_LINES]} material={mat}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <mesh ref={caret} material={signal("#ffffff")}>
        <boxGeometry args={[0.05, 0.13, 0.04]} />
      </mesh>
      {/* The frame it's being written into. */}
      <lineSegments position={[0.1, 1.9, -0.5]}>
        <edgesGeometry args={[new THREE.BoxGeometry(4.6, 8, 1.6)]} />
        <primitive object={signalLine(color, 0.16)} attach="material" />
      </lineSegments>
      <mesh position={[0, 1.9, -1.35]} material={signal(color, 0.03)}>
        <planeGeometry args={[4.6, 8]} />
      </mesh>
      <primitive object={dim} />
    </group>
  );
}

/* ══════════════════════════════════════════════════════════
   02 · ROBOTICS — a mechanism that actually meshes
   ══════════════════════════════════════════════════════════ */
function Gear({ radius = 1, teeth = 18, thickness = 0.16, dir = 1, speed = 0.5, color }) {
  const ref = useRef();
  const mats = materials();

  const toothPositions = useMemo(
    () =>
      Array.from({ length: teeth }, (_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        return { a, x: Math.cos(a) * radius, y: Math.sin(a) * radius };
      }),
    [teeth, radius]
  );

  const inst = useRef();
  useFrame(({ clock }) => {
    const b = beat("robotics", 0.35);
    if (!b.active || !ref.current) return;
    // Gears turn with the scroll, plus a slow idle so it feels powered.
    ref.current.rotation.z = dir * (b.t * 5 + clock.elapsedTime * speed * 0.35);
    if (inst.current && !inst.current.userData.done) {
      toothPositions.forEach((p, i) =>
        setInstance(inst.current, i, [p.x, p.y, 0], [0.16, 0.2, thickness], [0, 0, p.a])
      );
      inst.current.instanceMatrix.needsUpdate = true;
      inst.current.userData.done = true;
    }
  });

  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={mats.shell}>
        <cylinderGeometry args={[radius, radius, thickness, 40]} />
      </mesh>
      <instancedMesh ref={inst} args={[undefined, undefined, teeth]} material={mats.shellLight}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={signal(color, 0.9)}>
        <cylinderGeometry args={[radius * 0.14, radius * 0.14, thickness * 1.3, 16]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, thickness * 0.51]}>
        <torusGeometry args={[radius * 0.55, 0.008, 6, 64]} />
        <primitive object={signalLine(color, 0.5)} attach="material" />
      </mesh>
    </group>
  );
}

function ServoArm({ color }) {
  const upper = useRef();
  const lower = useRef();
  const claw = useRef();
  const mats = materials();

  useFrame(({ clock }) => {
    const b = beat("robotics", 0.35);
    if (!b.active) return;
    const t = clock.elapsedTime;
    const swing = Math.sin(t * 0.8 + b.t * 3) * 0.5;
    if (upper.current) upper.current.rotation.z = -0.5 + swing * 0.4;
    if (lower.current) lower.current.rotation.z = 0.9 + Math.sin(t * 0.8 + 1.2) * 0.35;
    if (claw.current) {
      const grip = 0.18 + Math.abs(Math.sin(t * 0.8 + 2)) * 0.22;
      claw.current.children[0].position.y = grip;
      claw.current.children[1].position.y = -grip;
    }
  });

  return (
    <group position={[2.6, -1.2, 0.2]} scale={0.9}>
      <mesh material={mats.shell} position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.42, 0.5, 0.5, 24]} />
      </mesh>
      <group ref={upper}>
        <mesh material={mats.shellLight} position={[0.7, 0.1, 0]}>
          <boxGeometry args={[1.5, 0.2, 0.22]} />
        </mesh>
        <group ref={lower} position={[1.45, 0.1, 0]}>
          <mesh material={mats.shell} position={[0.55, 0, 0]}>
            <boxGeometry args={[1.15, 0.16, 0.18]} />
          </mesh>
          <mesh material={signal(color)} position={[0, 0, 0]}>
            <sphereGeometry args={[0.1, 12, 12]} />
          </mesh>
          <group ref={claw} position={[1.15, 0, 0]}>
            <mesh material={mats.shellLight} position={[0.16, 0.2, 0]}>
              <boxGeometry args={[0.36, 0.06, 0.12]} />
            </mesh>
            <mesh material={mats.shellLight} position={[0.16, -0.2, 0]}>
              <boxGeometry args={[0.36, 0.06, 0.12]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

function RoboticsWorld() {
  const color = byId.robotics.color;
  const mats = materials();
  return (
    <group>
      {/* Meshed pair — radii and tooth counts chosen so they'd actually run. */}
      <group position={[-1.2, 0.6, 0]}>
        <Gear radius={1.15} teeth={20} dir={1} speed={0.6} color={color} />
      </group>
      <group position={[1.32, 0.6, 0]}>
        <Gear radius={0.82} teeth={14} dir={-1} speed={0.6} color={color} />
      </group>
      <group position={[0.1, 2.35, -0.3]}>
        <Gear radius={0.55} teeth={10} dir={-1} speed={0.9} color={color} />
      </group>
      <ServoArm color={color} />
      {/* Chassis rail the whole assembly is bolted to. */}
      <mesh position={[0.6, -2.1, 0]} material={mats.shell}>
        <boxGeometry args={[7, 0.16, 0.9]} />
      </mesh>
      <mesh position={[0.6, -2.02, 0.46]} material={signal(color, 0.7)}>
        <boxGeometry args={[6.4, 0.014, 0.014]} />
      </mesh>
      <lineSegments position={[0.6, 0.2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(7.4, 5.2, 2.4)]} />
        <primitive object={signalLine(color, 0.14)} attach="material" />
      </lineSegments>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════
   03 · WEB / AI — interfaces in front, inference behind
   ══════════════════════════════════════════════════════════ */
const NET_LAYERS = [4, 6, 6, 3];

function WebAIWorld() {
  const color = byId.webai.color;
  const nodes = useRef();
  const edgeRef = useRef();
  const panels = useRef();

  const net = useMemo(() => {
    const pts = [];
    NET_LAYERS.forEach((n, li) => {
      for (let i = 0; i < n; i++) {
        pts.push({
          layer: li,
          pos: [
            -2.4 + li * 1.6,
            (i - (n - 1) / 2) * 0.62,
            -2.2 + Math.sin(li * 1.3 + i) * 0.25,
          ],
        });
      }
    });
    const pairs = [];
    pts.forEach((a, ai) =>
      pts.forEach((b, bi) => {
        if (b.layer === a.layer + 1 && (ai + bi) % 2 === 0)
          pairs.push([a.pos, b.pos]);
      })
    );
    return { pts, geometry: linesGeometry(pairs), pairCount: pairs.length };
  }, []);

  useFrame(({ clock }) => {
    const b = beat("webai", 0.35);
    if (!b.active) return;
    const t = clock.elapsedTime;

    if (nodes.current) {
      net.pts.forEach((p, i) => {
        // Activation sweeps left→right through the layers.
        const wave = Math.sin(t * 1.6 - p.layer * 0.9);
        const s = 0.055 + Math.max(0, wave) * 0.05 * clamp(b.t * 2);
        setInstance(nodes.current, i, p.pos, s);
      });
      nodes.current.instanceMatrix.needsUpdate = true;
    }

    if (edgeRef.current) {
      const shown = Math.floor(net.pairCount * 2 * ease.outCubic(clamp(b.t * 1.6)));
      edgeRef.current.geometry.setDrawRange(0, shown);
      edgeRef.current.material.opacity = 0.16 + Math.sin(t * 1.2) * 0.05;
    }

    if (panels.current) {
      panels.current.children.forEach((p, i) => {
        const on = clamp((b.t - i * 0.12) * 3);
        p.scale.setScalar(lerp(0.94, 1, ease.outCubic(on)));
        p.position.z = i * 0.55 + Math.sin(t * 0.4 + i) * 0.03;
      });
    }
  });

  return (
    <group>
      {/* Stacked interface frames — the surface of the work. */}
      <group ref={panels} position={[0.4, 0.4, 0.6]}>
        {[0, 1, 2].map((i) => (
          <group key={i}>
            <lineSegments>
              <edgesGeometry
                args={[new THREE.PlaneGeometry(3.4 - i * 0.45, 2.2 - i * 0.3)]}
              />
              <primitive object={signalLine(color, 0.45 - i * 0.1)} attach="material" />
            </lineSegments>
            <mesh material={signal(color, 0.05)}>
              <planeGeometry args={[3.4 - i * 0.45, 2.2 - i * 0.3]} />
            </mesh>
            {/* Window chrome — one bar and three dots, nothing more. */}
            <mesh
              position={[0, (2.2 - i * 0.3) / 2 - 0.13, 0.001]}
              material={signal(color, 0.22)}
            >
              <planeGeometry args={[3.4 - i * 0.45, 0.26]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* The model underneath it. */}
      <instancedMesh
        ref={nodes}
        args={[undefined, undefined, net.pts.length]}
        material={signal(color)}
      >
        <sphereGeometry args={[1, 12, 12]} />
      </instancedMesh>
      <lineSegments ref={edgeRef} geometry={net.geometry}>
        <primitive object={signalLine(color, 0.2)} attach="material" />
      </lineSegments>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════
   04 · DSA — a graph solved, and an array sorted
   ══════════════════════════════════════════════════════════ */
const GRAPH_N = 22;
const BARS = 26;

function DSAWorld() {
  const color = byId.dsa.color;
  const nodes = useRef();
  const edges = useRef();
  const bars = useRef();
  const walker = useRef();

  const graph = useMemo(() => {
    const rand = rng(99);
    const pts = Array.from({ length: GRAPH_N }, (_, i) => {
      const a = (i / GRAPH_N) * Math.PI * 2 * 1.6;
      const r = 0.8 + (i / GRAPH_N) * 2.1;
      return [
        Math.cos(a) * r + (rand() - 0.5) * 0.5,
        Math.sin(a) * r * 0.62 + (rand() - 0.5) * 0.4,
        (rand() - 0.5) * 1.4,
      ];
    });
    const pairs = [];
    for (let i = 0; i < GRAPH_N - 1; i++) {
      pairs.push([pts[i], pts[i + 1]]);
      const j = (i + 5 + Math.floor(rand() * 3)) % GRAPH_N;
      if (j !== i) pairs.push([pts[i], pts[j]]);
    }
    // The route the traversal takes — the "solution" through the graph.
    const path = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    return { pts, geometry: linesGeometry(pairs), path, pairCount: pairs.length };
  }, []);

  const barTargets = useMemo(() => {
    const rand = rng(404);
    const vals = Array.from({ length: BARS }, () => 0.25 + rand() * 2.4);
    return { start: vals, sorted: [...vals].sort((a, b) => a - b) };
  }, []);

  useFrame(({ clock }) => {
    const b = beat("dsa", 0.35);
    if (!b.active) return;
    const t = clock.elapsedTime;

    if (edges.current) {
      const shown = Math.floor(graph.pairCount * 2 * ease.outCubic(clamp(b.t * 1.5)));
      edges.current.geometry.setDrawRange(0, shown);
    }

    if (nodes.current) {
      graph.pts.forEach((p, i) => {
        const visited = clamp(b.t * GRAPH_N * 1.2 - i);
        const s = lerp(0.045, 0.1, visited) * (1 + Math.sin(t * 3 + i) * 0.08 * visited);
        setInstance(nodes.current, i, p, s);
      });
      nodes.current.instanceMatrix.needsUpdate = true;
    }

    // A traversal head running the route.
    if (walker.current) {
      const u = clamp(b.t * 1.1);
      graph.path.getPointAt(Math.min(0.999, u), walker.current.position);
      walker.current.visible = u > 0.01 && u < 0.995;
    }

    // Sorting: the array resolves as you scroll past it.
    if (bars.current) {
      const k = ease.inOutCubic ? ease.inOutCubic(clamp((b.t - 0.15) * 1.5)) : clamp(b.t);
      for (let i = 0; i < BARS; i++) {
        const from = barTargets.start[i];
        const to = barTargets.sorted[i];
        const h = lerp(from, to, k);
        setInstance(bars.current, i, [-2.6 + i * 0.2, -2.9 + h / 2, 1.4], [0.12, h, 0.12]);
      }
      bars.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh ref={nodes} args={[undefined, undefined, GRAPH_N]} material={signal(color)}>
        <sphereGeometry args={[1, 10, 10]} />
      </instancedMesh>
      <lineSegments ref={edges} geometry={graph.geometry}>
        <primitive object={signalLine(color, 0.3)} attach="material" />
      </lineSegments>
      <mesh ref={walker} material={signal("#ffffff")}>
        <sphereGeometry args={[0.075, 12, 12]} />
      </mesh>
      <instancedMesh ref={bars} args={[undefined, undefined, BARS]} material={signal(color, 0.75)}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
    </group>
  );
}

export default function Tracks() {
  return (
    <>
      <Island id="python">
        <PythonWorld />
      </Island>
      <Island id="robotics">
        <RoboticsWorld />
      </Island>
      <Island id="webai">
        <WebAIWorld />
      </Island>
      <Island id="dsa">
        <DSAWorld />
      </Island>
    </>
  );
}
