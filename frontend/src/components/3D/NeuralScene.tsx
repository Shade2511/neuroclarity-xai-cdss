import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Synaptic Nodes Cluster (Light Clinical Theme)
function SynapticNetwork({ count = 46 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Generate nodes in neurological distribution
  const { positions, colors, linePositions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const rawNodes: THREE.Vector3[] = [];

    // Calm Clinical color palette: Medical Teal, Blue, Slate
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

    // Connect nearby nodes with subtle filaments
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
      {/* Synaptic Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          opacity={0.85}
        />
      </points>

      {/* Axon Filaments */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#94A3B8"
          transparent
          opacity={0.35}
        />
      </lineSegments>
    </group>
  );
}

// Central Core: Transparent Medical Resonance Orb
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
      {/* Inner Icosahedron */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshStandardMaterial
          color="#0F766E"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Concentric Ring */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[1.65, 0.015, 16, 80]} />
        <meshStandardMaterial
          color="#0284C7"
          transparent
          opacity={0.4}
        />
      </mesh>
    </Float>
  );
}

export const NeuralScene: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full h-full min-h-[300px] relative pointer-events-auto select-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
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
  );
};
