"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  ContactShadows,
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
  RoundedBox,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const FOG_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FOG_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(17.0, 9.0);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float n1 = fbm(uv * 3.0 + vec2(uTime * 0.045, uTime * 0.022));
    float n2 = fbm(uv * 5.5 - vec2(uTime * 0.03, uTime * 0.012));
    float fog = smoothstep(0.28, 0.92, n1 * 0.62 + n2 * 0.38);
    float radial = smoothstep(1.0, 0.12, distance(uv, vec2(0.5, 0.45)));
    vec3 deep = vec3(0.07, 0.045, 0.02);
    vec3 gold = vec3(0.62, 0.42, 0.13);
    vec3 col = mix(deep, gold, fog);
    float alpha = fog * radial * 0.55;
    gl_FragColor = vec4(col * alpha, alpha);
  }
`;

function CinematicFog({ reduced }: { reduced: boolean }) {
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  useFrame((_, delta) => {
    if (!reduced && matRef.current) {
      matRef.current.uniforms.uTime.value += delta;
    }
  });
  return (
    <mesh position={[0, 0.45, -2.4]} renderOrder={-1}>
      <planeGeometry args={[10, 7]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={FOG_VERT}
        fragmentShader={FOG_FRAG}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function CameraRig({ reduced }: { reduced: boolean }) {
  useFrame((state, delta) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    // Slow commercial-style arc: yaw sweep, subtle dolly + crane bob
    const angle = Math.sin(t * 0.11) * 0.5;
    const radius = 6.2 + Math.sin(t * 0.07) * 0.35;
    const height = 0.5 + Math.sin(t * 0.15) * 0.2;
    const cam = state.camera;
    const damping = 1.6;
    cam.position.x = THREE.MathUtils.damp(
      cam.position.x,
      Math.sin(angle) * radius,
      damping,
      delta,
    );
    cam.position.z = THREE.MathUtils.damp(
      cam.position.z,
      Math.cos(angle) * radius,
      damping,
      delta,
    );
    cam.position.y = THREE.MathUtils.damp(cam.position.y, height, damping, delta);
    cam.lookAt(0, 0.15, 0);
  });
  return null;
}

function Bottle({ reduced }: { reduced: boolean }) {
  const gl = useThree((state) => state.gl);
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const drag = useRef({ active: false, lastX: 0 });
  const spinVel = useRef(0);
  // Pre-compensated hero background so refraction reads as the page backdrop
  // after ACES tone mapping.
  const transmissionBg = useMemo(() => new THREE.Color("#241d15"), []);

  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      drag.current.active = true;
      drag.current.lastX = e.clientX;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.lastX;
      drag.current.lastX = e.clientX;
      if (spin.current) spin.current.rotation.y += dx * 0.01;
      spinVel.current = dx * 0.65;
    };
    const up = (e: PointerEvent) => {
      drag.current.active = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // pointer already released
      }
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (!drag.current.active) {
      spinVel.current = THREE.MathUtils.damp(spinVel.current, 0, 1.7, delta);
      const base = reduced ? 0 : 0.3;
      if (spin.current) {
        spin.current.rotation.y += (base + spinVel.current) * delta;
      }
    }

    if (reduced) return;

    if (tilt.current) {
      tilt.current.rotation.y = THREE.MathUtils.damp(
        tilt.current.rotation.y,
        state.pointer.x * 0.45,
        3,
        delta,
      );
      tilt.current.rotation.x = THREE.MathUtils.damp(
        tilt.current.rotation.x,
        -state.pointer.y * 0.22,
        3,
        delta,
      );
    }

    if (key.current) {
      key.current.intensity = 1 + Math.sin(t * 0.8) * 0.09;
    }
  });

  return (
    <group ref={tilt}>
      <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.55}>
        <group ref={spin} position={[0, 0.1, 0]}>
          <RoundedBox
            args={[1.7, 2.3, 0.95]}
            radius={0.2}
            smoothness={6}
            position={[0, 0.15, 0]}
          >
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

          <group position={[0, -0.405, 0]}>
            <RoundedBox args={[1.54, 1.03, 0.79]} radius={0.12} smoothness={4}>
              <meshPhysicalMaterial
                color="#c07a1c"
                emissive="#4f2d06"
                emissiveIntensity={0.22}
                roughness={0.15}
                clearcoat={0.5}
                clearcoatRoughness={0.2}
                transmission={0.12}
                attenuationColor="#c07a1c"
                attenuationDistance={2}
              />
            </RoundedBox>
          </group>

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
              color="#c6a664"
              metalness={1}
              roughness={0.2}
              envMapIntensity={1.3}
            />
          </mesh>

          <mesh position={[0, -1.05, 0]}>
            <cylinderGeometry args={[0.72, 0.8, 0.1, 64]} />
            <meshStandardMaterial
              color="#c6a664"
              metalness={1}
              roughness={0.22}
              envMapIntensity={1.3}
            />
          </mesh>
        </group>
      </Float>

      {!reduced && (
        <>
          <Sparkles
            count={70}
            scale={[3.6, 4.4, 2.4]}
            size={2.2}
            speed={0.35}
            opacity={0.35}
            color="#e8d5a3"
            position={[0, 0.4, 0]}
          />
          <Sparkles
            count={40}
            scale={[6.5, 5.5, 3]}
            size={6}
            speed={0.12}
            opacity={0.12}
            color="#c6a664"
            position={[0, 0.6, 0]}
          />
        </>
      )}

      <directionalLight ref={key} position={[4, 6, 5]} intensity={1} color="#fff6e8" />
    </group>
  );
}

export default function BottleScene() {
  const [reduced] = useState(prefersReducedMotion);

  return (
    <Canvas
      camera={{ position: [0, 0.5, 6.2], fov: 32 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.25} />
      <pointLight position={[-4, 2, -3]} intensity={0.6} color="#ffd27a" />
      <pointLight position={[0, -2, 4]} intensity={0.2} color="#8fa6c4" />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={4} color="#fff6e8" form="rect" position={[3.5, 3, 3]} scale={[4, 5, 1]} />
        <Lightformer intensity={2.5} color="#ffd9a0" form="rect" position={[-4, 1.5, -2]} scale={[3, 6, 1]} />
        <Lightformer intensity={3} color="#ffffff" form="rect" position={[0, 5, -2]} scale={[6, 2, 1]} />
        <Lightformer intensity={1.5} color="#8ab4ff" form="circle" position={[0, -3.5, 3]} scale={5} />
        <Lightformer intensity={2} color="#ffe9c4" form="rect" position={[0, 0.5, -6]} scale={[8, 8, 1]} />
      </Environment>
      <CinematicFog reduced={reduced} />
      <CameraRig reduced={reduced} />
      <Bottle reduced={reduced} />
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
