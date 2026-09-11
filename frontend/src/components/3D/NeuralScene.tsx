import React, { Component, ErrorInfo, ReactNode, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ── WebGL support detection (safe for all browsers/mobile) ──────────────────
function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const ctx =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return !!ctx;
  } catch {
    return false;
  }
}

// ── Error boundary that catches Three.js / R3F render errors ─────────────────
interface EBState { hasError: boolean }
class WebGLErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError(): EBState { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[NeuralScene] WebGL render error (graceful degradation):', error.message, info.componentStack);
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

// ── Synaptic Nodes Cluster (Light Clinical Theme) ────────────────────────────
function SynapticNetwork({ count = 46 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const { positions, colors, linePositions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const rawNodes: THREE.Vector3[] = [];

    const colorChoices = [
      new THREE.Color('#0F766E'),
      new THREE.Color('#0284C7'),
      new THREE.Color('#2563EB'),
      new THREE.Color('#0D9488'),
      new THREE.Color('#64748B'),
    ];

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.0 + Math.random() * 1.3;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const c = colorChoices[i % colorChoices.length];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      rawNodes.push(new THREE.Vector3(x, y, z));
    }

    const lineCoords: number[] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dist = rawNodes[i].distanceTo(rawNodes[j]);
        if (dist < 1.5) {
          lineCoords.push(rawNodes[i].x, rawNodes[i].y, rawNodes[i].z);
          lineCoords.push(rawNodes[j].x, rawNodes[j].y, rawNodes[j].z);
        }
      }
    }

    return {
      positions: pos,
      colors: col,
      linePositions: new Float32Array(lineCoords),
    };
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.05;
      pointsRef.current.rotation.x = Math.sin(t * 0.03) * 0.04;
    }
    if (linesRef.current) {
      linesRef.current.rotation.y = t * 0.05;
      linesRef.current.rotation.x = Math.sin(t * 0.03) * 0.04;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.12} vertexColors transparent opacity={0.85} />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#94A3B8" transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}

function MedicalCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.08;
      meshRef.current.rotation.z = Math.sin(t * 0.05) * 0.05;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.x = t * 0.12;
      ringRef1.current.rotation.y = t * 0.09;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshStandardMaterial color="#0F766E" wireframe transparent opacity={0.3} />
      </mesh>
      <mesh ref={ringRef1}>
        <torusGeometry args={[1.65, 0.015, 16, 80]} />
        <meshStandardMaterial color="#0284C7" transparent opacity={0.4} />
      </mesh>
    </Float>
  );
}

// ── Lightweight CSS-only fallback for devices without WebGL ──────────────────
const NeuralSceneFallback: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`w-full h-full min-h-[300px] relative overflow-hidden rounded-xl bg-gradient-to-br from-[#F0FDFA] to-[#F0F9FF] flex items-center justify-center ${className}`}
    aria-hidden="true"
  >
    {/* Static decorative SVG — no WebGL required */}
    <svg
      viewBox="0 0 300 300"
      className="w-48 h-48 opacity-30"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="150" cy="150" r="80" stroke="#0F766E" strokeWidth="1" fill="none" />
      <circle cx="150" cy="150" r="50" stroke="#0284C7" strokeWidth="0.8" fill="none" />
      <circle cx="150" cy="150" r="20" stroke="#0F766E" strokeWidth="1.5" fill="none" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 150 + Math.cos(rad) * 25;
        const y1 = 150 + Math.sin(rad) * 25;
        const x2 = 150 + Math.cos(rad) * 75;
        const y2 = 150 + Math.sin(rad) * 75;
        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748B" strokeWidth="0.5" opacity="0.6" />;
      })}
    </svg>
  </div>
);

// ── Public export with full protection ───────────────────────────────────────
export const NeuralScene: React.FC<{ className?: string }> = ({ className = '' }) => {
  // Check WebGL support before mounting Canvas (prevents crash on mobile Safari)
  const webGLSupported = React.useMemo(() => isWebGLSupported(), []);

  if (!webGLSupported) {
    return <NeuralSceneFallback className={className} />;
  }

  return (
    <WebGLErrorBoundary fallback={<NeuralSceneFallback className={className} />}>
      <div className={`w-full h-full min-h-[300px] relative pointer-events-auto select-none ${className}`}>
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 42 }}
          gl={{ antialias: true, alpha: true, failIfMajorPerformanceCaveat: false }}
          onCreated={({ gl }) => {
            // Explicit error handling for context loss on mobile
            const canvas = gl.domElement;
            canvas.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              console.warn('[NeuralScene] WebGL context lost — scene paused.');
            }, false);
          }}
        >
          <ambientLight intensity={0.9} />
          <directionalLight position={[5, 8, 5]} intensity={1.0} color="#FFFFFF" />
          <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#E2E8F0" />

          <MedicalCore />
          <SynapticNetwork count={48} />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.4}
            maxPolarAngle={Math.PI / 1.7}
            minPolarAngle={Math.PI / 2.5}
          />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
};
