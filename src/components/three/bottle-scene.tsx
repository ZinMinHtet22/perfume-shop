"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  ContactShadows,
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Bottle() {
  const group = useRef<THREE.Group>(null);
  const reduced = useRef(false);
  // Pre-compensated hero background so refraction reads as the page backdrop
  // after ACES tone mapping.
  const transmissionBg = useMemo(() => new THREE.Color("#241d15"), []);

  useFrame((_, delta) => {
    if (reduced.current === false && typeof window !== "undefined") {
      reduced.current = prefersReducedMotion();
    }
    if (group.current && !reduced.current) {
      group.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.55}>
      <group ref={group} position={[0, 0.1, 0]}>
        <RoundedBox args={[1.7, 2.3, 0.95]} radius={0.2} smoothness={6} position={[0, 0.15, 0]}>
          <MeshTransmissionMaterial
            background={transmissionBg}
            samples={8}
            resolution={256}
            backside
            backsideThickness={0.4}
            thickness={0.55}
            ior={1.5}
            roughness={0.05}
            chromaticAberration={0.05}
            anisotropicBlur={0.05}
            distortion={0.06}
            distortionScale={0.25}
            temporalDistortion={0.03}
            attenuationColor="#e9d3a6"
            attenuationDistance={1.6}
            color="#f8f2e6"
            envMapIntensity={1.2}
          />
        </RoundedBox>

        <RoundedBox args={[1.54, 1.07, 0.79]} radius={0.12} smoothness={4} position={[0, -0.385, 0]}>
          <meshPhysicalMaterial
            color="#c07a1c"
            emissive="#4f2d06"
            emissiveIntensity={0.22}
            roughness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.15}
          />
        </RoundedBox>

        <RoundedBox args={[0.9, 0.55, 0.05]} radius={0.02} smoothness={4} position={[0, 0.35, 0.465]}>
          <meshStandardMaterial color="#f1e7d0" roughness={0.6} side={THREE.DoubleSide} />
        </RoundedBox>
        <mesh position={[0, 0.48, 0.494]}>
          <boxGeometry args={[0.5, 0.05, 0.01]} />
          <meshStandardMaterial color="#4a3a17" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.37, 0.494]}>
          <boxGeometry args={[0.44, 0.02, 0.01]} />
          <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.26, 0.494]}>
          <boxGeometry args={[0.34, 0.035, 0.01]} />
          <meshStandardMaterial color="#4a3a17" roughness={0.7} />
        </mesh>

        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.2, 0.24, 0.32, 32]} />
          <meshStandardMaterial
            color="#d8c191"
            metalness={0.9}
            roughness={0.3}
            envMapIntensity={1.2}
          />
        </mesh>

        <mesh position={[0, 1.82, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.55, 48]} />
          <meshStandardMaterial
            color="#c9a227"
            metalness={1}
            roughness={0.24}
            envMapIntensity={1.3}
          />
        </mesh>

        <mesh position={[0, -1.05, 0]}>
          <cylinderGeometry args={[0.72, 0.8, 0.1, 64]} />
          <meshStandardMaterial
            color="#c9a227"
            metalness={1}
            roughness={0.22}
            envMapIntensity={1.3}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function BottleScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 6.2], fov: 32 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 5]} intensity={1} color="#fff6e8" />
      <pointLight position={[-4, 2, -3]} intensity={0.6} color="#ffd27a" />
      <pointLight position={[0, -2, 4]} intensity={0.25} color="#8ab4ff" />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={4} color="#fff6e8" form="rect" position={[3.5, 3, 3]} scale={[4, 5, 1]} />
        <Lightformer intensity={2.5} color="#ffd9a0" form="rect" position={[-4, 1.5, -2]} scale={[3, 6, 1]} />
        <Lightformer intensity={3} color="#ffffff" form="rect" position={[0, 5, -2]} scale={[6, 2, 1]} />
        <Lightformer intensity={1.5} color="#8ab4ff" form="circle" position={[0, -3.5, 3]} scale={5} />
        <Lightformer intensity={2} color="#ffe9c4" form="rect" position={[0, 0.5, -6]} scale={[8, 8, 1]} />
      </Environment>
      <Bottle />
      <ContactShadows
        position={[0, -1.45, 0]}
        opacity={0.55}
        scale={8}
        blur={2.6}
        far={3}
        resolution={512}
      />
    </Canvas>
  );
}
