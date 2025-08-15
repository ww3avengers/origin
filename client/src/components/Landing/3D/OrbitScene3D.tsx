import { Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { Float, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export type OrbitIcon = {
  id: string;
  color?: string;
  radius?: number; // object size
  orbit?: number; // orbit radius
  speed?: number; // angular speed
  type?: 'agent' | 'tool' | 'service';
};

interface OrbitScene3DProps {
  className?: string;
  height?: number;
  density?: number; // number of particles
  icons?: OrbitIcon[];
  glowIntensity?: number; // bloom intensity
  interactive?: boolean;
}

function CoreGlow() {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#5b7fff'),
        emissive: new THREE.Color('#3a57ff'),
        emissiveIntensity: 1.6,
        roughness: 0.35,
        metalness: 0.2,
      }),
    [],
  );
  return (
    <Float rotationIntensity={0.2} floatIntensity={0.6} speed={1.2}>
      <mesh material={mat}>
        <icosahedronGeometry args={[0.6, 1]} />
      </mesh>
    </Float>
  );
}

function OrbitRing({
  r = 3.2,
  dashed = true,
  color = '#314b93',
  segments = 96,
}: {
  r?: number;
  dashed?: boolean;
  color?: string;
  segments?: number;
}) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    return pts;
  }, [r, segments]);
  return (
    <line>
      <bufferGeometry attach="geometry" setFromPoints={points as any} />
      {dashed ? (
        // dashed look via transparent line + alpha map simulated by low opacity
        <lineBasicMaterial color={color} opacity={0.6} transparent linewidth={1} />
      ) : (
        <lineBasicMaterial color={color} linewidth={1} />
      )}
    </line>
  );
}

function OrbitingIcon({ icon, phase = 0 }: { icon: OrbitIcon; phase?: number }) {
  const group = useMemo(() => new THREE.Group(), []);
  const r = icon.orbit ?? 3.2;
  const w = icon.speed ?? 0.35;
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const a = t * w + phase;
    group.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    group.rotation.y = -a + Math.PI / 2;
  });

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(icon.color ?? '#9bd7ff'),
        emissive: new THREE.Color(icon.color ?? '#9bd7ff'),
        emissiveIntensity: 1.4,
        roughness: 0.25,
        metalness: 0.1,
      }),
    [icon.color],
  );

  return (
    <group ref={(ref) => ref && group.copy(ref)}>
      <Float rotationIntensity={0.3} floatIntensity={0.5} speed={1.2}>
        <mesh material={mat}>
          <icosahedronGeometry args={[icon.radius ?? 0.28, 0]} />
        </mesh>
      </Float>
    </group>
  );
}

function Stars({ count = 1200 }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 8 + Math.random() * 16;
      const a = Math.random() * Math.PI * 2;
      const h = (Math.random() - 0.5) * 3.2;
      pos[i * 3 + 0] = Math.cos(a) * r;
      pos[i * 3 + 1] = h;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    return pos;
  }, [count]);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#7aa2ff"
        sizeAttenuation
        transparent
        opacity={0.25}
        depthWrite={false}
      />
    </points>
  );
}

export function OrbitScene3D({
  className,
  height = 420,
  icons,
  density = 600,
  glowIntensity = 1.2,
  interactive = false,
}: OrbitScene3DProps) {
  const items: OrbitIcon[] = useMemo(
    () =>
      icons && icons.length > 0
        ? icons
        : [
            {
              id: 'agent-1',
              type: 'agent',
              color: '#7dd3fc',
              orbit: 2.2,
              speed: 0.42,
              radius: 0.22,
            },
            {
              id: 'agent-2',
              type: 'agent',
              color: '#60a5fa',
              orbit: 2.2,
              speed: 0.42,
              radius: 0.22,
            },
            { id: 'tool-1', type: 'tool', color: '#34d399', orbit: 3.2, speed: 0.26, radius: 0.26 },
            { id: 'tool-2', type: 'tool', color: '#60a5fa', orbit: 3.2, speed: 0.26, radius: 0.26 },
            {
              id: 'svc-1',
              type: 'service',
              color: '#f472b6',
              orbit: 4.2,
              speed: 0.18,
              radius: 0.28,
            },
            {
              id: 'svc-2',
              type: 'service',
              color: '#f59e0b',
              orbit: 4.2,
              speed: 0.18,
              radius: 0.28,
            },
          ],
    [icons],
  );

  return (
    <div className={className} style={{ height }}>
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 2.2, 6.4], fov: 42 }}
      >
        <color attach="background" args={[0x000000]} />
        <fog attach="fog" args={[0x000000, 12, 24]} />

        {/* Lights */}
        <ambientLight intensity={0.35} />
        <pointLight position={[0, 0, 0]} color={'#5b7fff'} intensity={2.2} distance={8} />
        <pointLight position={[3, 2, 2]} color={'#93c5fd'} intensity={0.9} distance={16} />

        <Suspense
          fallback={
            <Html center style={{ color: '#9fb3ff', fontSize: 12 }}>
              Loading…
            </Html>
          }
        >
          <Stars count={density} />
          <group position={[0, 0.12, 0]}>
            <CoreGlow />
            <group rotation={[-Math.PI / 2, 0, 0]}>
              <OrbitRing r={2.2} />
              <OrbitRing r={3.2} color="#2a3a71" />
              <OrbitRing r={4.2} color="#1e2b56" />
            </group>

            {items.map((it, i) => (
              <OrbitingIcon key={it.id} icon={it} phase={(i / items.length) * Math.PI * 2} />
            ))}
          </group>
        </Suspense>

        <EffectComposer>
          <Bloom
            intensity={glowIntensity}
            mipmapBlur
            luminanceThreshold={0.05}
            luminanceSmoothing={0.2}
          />
          <Noise opacity={0.04} />
          <Vignette eskil offset={0.1} darkness={0.8} />
        </EffectComposer>

        {interactive && (
          <OrbitControls
            enablePan={false}
            maxDistance={10}
            minDistance={4}
            enableDamping
            dampingFactor={0.08}
          />
        )}
      </Canvas>
    </div>
  );
}

export default OrbitScene3D;
