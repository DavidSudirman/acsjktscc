import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { materials, signal } from "./materials.js";
import { beat, setInstance, rng } from "./util.js";
import { ANCHOR } from "../lib/chapters.js";
import { tracks } from "../data/content.js";
import { clamp, lerp, smootherstep, ease } from "../lib/math.js";

const DISCS = 26;
const R = 1.25;

/* The object is a stack of machined discs whose radii trace a sphere.
   Closed, it reads as one solid milled body. Opened, the stack spreads
   along its axis and the filament that was always inside becomes
   visible — the question, and the idea that was in it the whole time. */
function discProfile(i) {
  const y = (i / (DISCS - 1)) * 2 - 1; // -1..1
  const radius = Math.sqrt(Math.max(0.0001, 1 - y * y)) * R;
  return { y: y * R * 0.92, radius };
}

export default function Core() {
  const group = useRef();
  const discs = useRef();
  const filament = useRef();
  const seed = useRef();
  const cage = useRef();
  const keyLight = useRef();
  const mats = materials();

  const profile = useMemo(
    () => Array.from({ length: DISCS }, (_, i) => discProfile(i)),
    []
  );
  const spin = useMemo(() => {
    const rand = rng(7);
    return profile.map(() => (rand() - 0.5) * 2);
  }, [profile]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const hero = beat("hero");
    const idea = beat("idea");
    const learn = beat("learn");

    // How far the body has opened: closed through the hero, opening
    // across IDEA, and held open once the tracks branch out.
    const open = idea.active || learn.active || learn.raw > 1
      ? smootherstep(clamp(idea.raw * 1.15))
      : 0;
    const held = clamp(learn.raw > 0 ? 1 : open);
    const o = Math.max(open, learn.raw > 0 ? 1 : 0);

    // Reveal: the object emerges from the dark rather than cutting in.
    const emerge = hero.active ? smootherstep(clamp(hero.raw * 1.4)) : 1;
    if (keyLight.current) keyLight.current.intensity = 6 * emerge + o * 4;

    if (group.current) {
      group.current.rotation.y = t * 0.055 + o * 0.6;
      group.current.rotation.x = Math.sin(t * 0.16) * 0.05;
      const s = lerp(0.86, 1, emerge);
      group.current.scale.setScalar(s);
    }

    // Discs: spread along the axis, fan open, and counter-rotate.
    if (discs.current) {
      for (let i = 0; i < DISCS; i++) {
        const { y, radius } = profile[i];
        const spread = 1 + o * 1.5;
        const wobble = Math.sin(t * 0.7 + i * 0.45) * 0.012 * (1 - o * 0.4);
        const rot = spin[i] * o * 0.9 + t * 0.05 * spin[i] * o;
        setInstance(
          discs.current,
          i,
          [0, y * spread + wobble, 0],
          [radius, 0.052 + 0.012 * (1 - Math.abs(y)), radius],
          [o * spin[i] * 0.06, rot, o * spin[i] * 0.05]
        );
      }
      discs.current.instanceMatrix.needsUpdate = true;
    }

    // Filament: hidden inside the closed body, exposed as it opens.
    if (filament.current) {
      filament.current.scale.y = lerp(0.7, 1.25, o);
      filament.current.material.opacity = clamp(o * 1.4);
      filament.current.visible = o > 0.01;
    }
    if (seed.current) {
      const pulse = 1 + Math.sin(t * 2.2) * 0.06 * o;
      seed.current.scale.setScalar(lerp(0.05, 0.2, o) * pulse);
      seed.current.visible = o > 0.02;
    }

    if (cage.current) {
      cage.current.rotation.y = -t * 0.09;
      cage.current.rotation.z = t * 0.06;
      cage.current.children.forEach((c, i) => {
        c.scale.setScalar(lerp(1, 1.5 + i * 0.12, o));
      });
      cage.current.visible = emerge > 0.15;
    }
  });

  return (
    <group ref={group} position={ANCHOR.core}>
      <pointLight ref={keyLight} position={[1.6, 2, 2.4]} distance={16} decay={2} color="#cfd8ea" />

      <instancedMesh
        ref={discs}
        args={[undefined, undefined, DISCS]}
        material={mats.shell}
        castShadow={false}
      >
        <cylinderGeometry args={[1, 1, 1, 56, 1, false]} />
      </instancedMesh>

      {/* The idea itself: a filament that was always in there. */}
      <mesh ref={filament}>
        <cylinderGeometry args={[0.012, 0.012, 2.3, 8]} />
        <meshBasicMaterial color="#fff8e8" transparent opacity={0} />
      </mesh>
      <mesh ref={seed} material={signal("#ffeccc")}>
        <icosahedronGeometry args={[1, 2]} />
      </mesh>

      {/* Thin instrument rings — the object reads as a mechanism. */}
      <group ref={cage}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[R * 1.28, 0.006, 6, 128]} />
          <primitive object={mats.filament} attach="material" />
        </mesh>
        <mesh rotation={[Math.PI / 2.4, 0.4, 0]}>
          <torusGeometry args={[R * 1.42, 0.005, 6, 128]} />
          <primitive object={mats.filament} attach="material" />
        </mesh>
        <mesh rotation={[Math.PI / 1.7, -0.5, 0.3]}>
          <torusGeometry args={[R * 1.55, 0.004, 6, 128]} />
          <primitive object={mats.filament} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------
   Branches — four rails leaving the opened core for the four worlds.
   They draw outward as LEARN begins, so the tracks feel like they
   grow out of the same idea rather than sitting in a grid.
   ------------------------------------------------------------------ */
export function Branches() {
  const group = useRef();

  const rails = useMemo(
    () =>
      tracks.map((tr) => {
        const to = ANCHOR[tr.id];
        const from = ANCHOR.core;
        const mid = [
          (from[0] + to[0]) / 2 + (to[0] > 0 ? 1.6 : -1.6),
          (from[1] + to[1]) / 2 + 1.4,
          (from[2] + to[2]) / 2,
        ];
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(...from),
          new THREE.Vector3(...mid),
          new THREE.Vector3(...to),
        ]);
        return {
          id: tr.id,
          color: tr.color,
          geometry: new THREE.TubeGeometry(curve, 64, 0.014, 6, false),
        };
      }),
    []
  );

  useFrame(() => {
    const learn = beat("learn", 0.5);
    const grown = clamp((learn.raw + 0.15) / 0.9);
    if (!group.current) return;
    group.current.visible = grown > 0.01;
    group.current.children.forEach((child, i) => {
      const local = clamp((grown - i * 0.06) / 0.7);
      const g = child.geometry;
      // Draw the rail on by revealing its index range.
      g.setDrawRange(0, Math.floor(g.index.count * ease.outCubic(local)));
      child.material.opacity = 0.5 * clamp(local * 2);
    });
  });

  return (
    <group ref={group}>
      {rails.map((r) => (
        <mesh key={r.id} geometry={r.geometry}>
          <meshBasicMaterial color={r.color} transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}
