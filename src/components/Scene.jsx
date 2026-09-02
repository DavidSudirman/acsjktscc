import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import SceneEnvironment from "../three/Environment.jsx";
import CameraRig from "../three/CameraRig.jsx";
import Core, { Branches } from "../three/Core.jsx";
import Tracks from "../three/Tracks.jsx";
import Builds from "../three/Builds.jsx";
import Ecosystem from "../three/Ecosystem.jsx";
import Experiment from "../three/Experiment.jsx";
import Community from "../three/Community.jsx";
import Threshold from "../three/Threshold.jsx";
import { completeStep } from "../lib/boot.js";

function Ready() {
  // Mounted once the whole graph is constructed — the geometry step
  // is genuinely finished at this point.
  useEffect(() => {
    const id = requestAnimationFrame(() => completeStep("geometry"));
    return () => cancelAnimationFrame(id);
  }, []);
  return null;
}

export default function Scene() {
  return (
    <Canvas
      id="stage-canvas"
      // Half-res on phones keeps this comfortably above 50fps.
      dpr={[1, Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1)]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
      }}
      camera={{ fov: 42, near: 0.1, far: 260, position: [0, 0.5, 21] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <Suspense fallback={null}>
        <SceneEnvironment />
        <CameraRig />
        <Core />
        <Branches />
        <Tracks />
        <Builds />
        <Ecosystem />
        <Experiment />
        <Community />
        <Threshold />
        <Ready />
      </Suspense>
    </Canvas>
  );
}
