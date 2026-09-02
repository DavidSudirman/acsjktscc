import * as THREE from "three";
import { scroll } from "../lib/scroll.js";
import { RANGE } from "../lib/chapters.js";
import { clamp } from "../lib/math.js";

/** Where we are inside one chapter, and whether it's worth drawing. */
export function beat(id, pad = 0.1) {
  const r = RANGE[id];
  const span = r.end - r.start || 1;
  const raw = (scroll.progress - r.start) / span;
  return { raw, t: clamp(raw), active: raw > -pad && raw < 1 + pad };
}

/** Same, but spanning several chapters — for set pieces that persist. */
export function beatSpan(fromId, toId, pad = 0.1) {
  const a = RANGE[fromId].start;
  const b = RANGE[toId].end;
  const raw = (scroll.progress - a) / (b - a || 1);
  return { raw, t: clamp(raw), active: raw > -pad && raw < 1 + pad };
}

/** Deterministic pseudo-random, so layouts are stable across reloads. */
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

const _o = new THREE.Object3D();

/** Write one transform into an InstancedMesh. */
export function setInstance(mesh, i, pos, scale = 1, rot) {
  _o.position.set(pos[0], pos[1], pos[2]);
  if (rot) _o.rotation.set(rot[0], rot[1], rot[2]);
  else _o.rotation.set(0, 0, 0);
  if (Array.isArray(scale)) _o.scale.set(scale[0], scale[1], scale[2]);
  else _o.scale.setScalar(scale);
  _o.updateMatrix();
  mesh.setMatrixAt(i, _o.matrix);
}

/** BufferGeometry from a flat list of point pairs — cheap edge networks. */
export function linesGeometry(pairs) {
  const arr = new Float32Array(pairs.length * 6);
  pairs.forEach(([a, b], i) => {
    arr.set([a[0], a[1], a[2], b[0], b[1], b[2]], i * 6);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  return g;
}
