import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { beat } from "./util.js";

const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

/** Collapse every instance before the first update writes real ones —
 *  otherwise identity matrices pile a full set of unit cubes on the origin. */
function collapseInstances(root) {
  root.traverse((o) => {
    if (o.isInstancedMesh) {
      for (let i = 0; i < o.count; i++) o.setMatrixAt(i, ZERO);
      o.instanceMatrix.needsUpdate = true;
      o.frustumCulled = false;
    }
  });
}

/**
 * Wraps a set piece so it only exists while its chapter is on screen.
 * Without this, distant chapters float through the opening shot.
 */
const Beat = forwardRef(function Beat({ id, pad = 0.3, children, ...props }, ref) {
  const inner = useRef();
  useImperativeHandle(ref, () => inner.current, []);

  useLayoutEffect(() => {
    if (!inner.current) return;
    collapseInstances(inner.current);
    inner.current.visible = false;
  }, []);

  useFrame(() => {
    const b = beat(id, pad);
    if (inner.current) inner.current.visible = b.active;
  });

  return (
    <group ref={inner} {...props}>
      {children}
    </group>
  );
});

export default Beat;
