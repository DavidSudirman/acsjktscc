import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gridTexture, softSprite } from "../lib/textures.js";
import { scroll } from "../lib/scroll.js";
import { RANGE } from "../lib/chapters.js";
import { range, clamp } from "../lib/math.js";
import { rng } from "./util.js";

/** Reflections without a network fetch — three ships the room scene. */
function useRoomEnv(intensity = 1) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = env.texture;
    if ("environmentIntensity" in scene) scene.environmentIntensity = intensity;
    return () => {
      env.texture.dispose();
      pmrem.dispose();
      scene.environment = null;
    };
  }, [gl, scene, intensity]);
}

/** The floor exists only while the story is on the ground. */
function Ground() {
  const ref = useRef();
  const tex = useMemo(() => {
    const t = gridTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(60, 90);
    return t;
  }, []);

  useFrame(() => {
    const p = scroll.progress;
    const fadeIn = range(p, RANGE.learn.start, RANGE.python.start);
    const fadeOut = 1 - range(p, RANGE.experiment.end, RANGE.community.end);
    ref.current.material.opacity = 0.14 * fadeIn * fadeOut;
    ref.current.visible = ref.current.material.opacity > 0.002;
  });

  return (
    <mesh
      ref={ref}
      rotation-x={-Math.PI / 2}
      position={[0, -9, -60]}
      renderOrder={-1}
    >
      <planeGeometry args={[220, 260]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={0}
        depthWrite={false}
        color="#5e6a7d"
      />
    </mesh>
  );
}

/** Sparse motes. Enough to give the void a sense of scale, no more. */
function Dust({ count = 700 }) {
  const ref = useRef();

  const geo = useMemo(() => {
    const rand = rng(1337);
    const pos = new Float32Array(count * 3);
    const scale = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 60;
      pos[i * 3 + 1] = (rand() - 0.5) * 34;
      pos[i * 3 + 2] = -rand() * 150 + 10;
      scale[i] = 0.4 + rand() * 1.4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
    return g;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.material.uniforms.uTime.value = clock.elapsedTime;
  });

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uMap: { value: softSprite() },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          attribute float aScale;
          uniform float uTime;
          varying float vAlpha;
          void main() {
            vec3 p = position;
            p.y += sin(uTime * 0.18 + p.x * 0.6) * 0.4;
            p.x += cos(uTime * 0.14 + p.z * 0.4) * 0.3;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = aScale * 26.0 / -mv.z;
            vAlpha = clamp(1.0 + mv.z / 70.0, 0.0, 1.0) * 0.5;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D uMap;
          varying float vAlpha;
          void main() {
            float a = texture2D(uMap, gl_PointCoord).a;
            gl_FragColor = vec4(vec3(0.85, 0.87, 0.9), a * vAlpha * 0.55);
          }
        `,
      }),
    []
  );

  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />;
}

export default function SceneEnvironment() {
  const { scene } = useThree();
  useRoomEnv(0.32);

  useEffect(() => {
    scene.fog = new THREE.FogExp2("#06070a", 0.0135);
    scene.background = new THREE.Color("#06070a");
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  return (
    <>
      <ambientLight intensity={0.22} />
      {/* Key from high front-left, the way a product shot is lit. */}
      <directionalLight position={[6, 9, 6]} intensity={1.5} color="#dfe4ee" />
      {/* Cold rim from behind to separate silhouettes from the void. */}
      <directionalLight position={[-8, 3, -14]} intensity={0.9} color="#7d95c4" />
      <directionalLight position={[0, -6, 8]} intensity={0.25} color="#3a4152" />
      <Ground />
      <Dust />
    </>
  );
}
