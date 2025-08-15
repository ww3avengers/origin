'use client';
import React, { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Environment,
  Float,
  Html,
  OrbitControls,
  SoftShadows,
  useDetectGPU,
  RoundedBox,
} from '@react-three/drei';
import { EffectComposer, Bloom, SMAA, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Bot, ShieldCheck, Database, BookOpen, Cloud, FileText } from 'lucide-react';
import { useT } from '~/utils/i18n';

type ToolIconKey = 'db' | 'cloud' | 'book' | 'shield' | 'file';
type ToolSpec = { icon: ToolIconKey; color?: string };
type Agent3DSceneProps = {
  active?: boolean;
  reducedMotion?: boolean;
  className?: string;
  tools?: ToolSpec[];
  agentColor?: string;
  /** Erweiterte ASM mit Mikro-Phasen */
  asmExtended?: boolean;
};

// Simple 3D token (rounded box) with soft-shadow material
// A thin rounded panel that will carry a tool icon
function ToolPanel({
  color = '#5da0ff',
  position = [0, 0, 0],
  rotation = [0, 0, 0] as any,
  children,
}: {
  color?: string;
  position?: any;
  rotation?: any;
  children?: React.ReactNode;
}) {
  const materialProps = useMemo(
    () => ({
      color,
      roughness: 0.35,
      metalness: 0.25,
      emissive: new THREE.Color(color).multiplyScalar(0.02),
      envMapIntensity: 1.0,
    }),
    [color],
  );
  return (
    <group position={position as any} rotation={rotation as any}>
      <RoundedBox args={[0.96, 0.62, 0.08]} radius={0.08} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial {...(materialProps as any)} />
      </RoundedBox>
      {/* Icon overlay */}
      <Html center transform distanceFactor={1.2} zIndexRange={[1, 1]}>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/25 shadow-lg shadow-black/40 ring-1 ring-white/10 backdrop-blur-sm">
          {children}
        </div>
      </Html>
    </group>
  );
}

// Central agent badge: compact rounded cube with Bot icon
function AgentCore() {
  return (
    <group>
      <RoundedBox args={[0.7, 0.7, 0.2]} radius={0.12} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial
          color="#9bc0ff"
          metalness={0.5}
          roughness={0.28}
          envMapIntensity={1.0}
        />
      </RoundedBox>
      <Html center transform distanceFactor={1.2} zIndexRange={[2, 2]}>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 shadow-lg shadow-black/40 ring-1 ring-white/15 backdrop-blur-sm">
          <Bot className="h-7 w-7 text-cyan-200" />
        </div>
      </Html>
    </group>
  );
}

function Ground() {
  // vollständig deaktiviert – kein Schattenempfänger, keine Abdunklung
  return null;
}

function SceneContent({
  reducedMotion = false,
  cursor = { x: 0, y: 0 } as { x: number; y: number },
  tools = [] as ToolSpec[],
  agentColor = '#9bc0ff',
  active = true,
  asmEnabled = true,
  asmExtended = false,
}: {
  reducedMotion?: boolean;
  cursor?: { x: number; y: number };
  tools?: ToolSpec[];
  agentColor?: string;
  active?: boolean;
  asmEnabled?: boolean;
  asmExtended?: boolean;
}) {
  const rig = useRef<THREE.Group>(null);
  const follow = useRef(new THREE.Vector3(0, 0, 0));
  const spot = useRef<THREE.SpotLight>(null);
  const t = useT();
  // ASM badge rotation (Basis oder erweitert)
  const asmKeys = useMemo(() => {
    const base = ['perception', 'plan', 'act', 'review', 'learn'] as const;
    if (!asmExtended) return base;
    return [
      'perception',
      'observe',
      'analyze',
      'plan',
      'act',
      'execute',
      'review',
      'validate',
      'optimize',
      'learn',
    ] as const;
  }, [asmExtended]);
  const [asmIndex, setAsmIndex] = useState(0);
  // Safe label resolver with landing → non-prefixed fallback
  const currentKey = asmKeys[asmIndex] as string;
  const asmLabel = t(`landing.agentDemo.asm.${currentKey}`, {
    defaultValue: t(`agentDemo.asm.${currentKey}`, { defaultValue: currentKey } as any) as any,
  } as any);
  React.useEffect(() => {
    if (!asmEnabled || !active) return;
    let stop = false;
    const tick = () => {
      if (stop) return;
      setAsmIndex((i) => (i + 1) % asmKeys.length);
      window.setTimeout(tick, reducedMotion ? 1200 : 1600);
    };
    const id = window.setTimeout(tick, reducedMotion ? 600 : 900);
    return () => {
      stop = true;
      window.clearTimeout(id);
    };
  }, [asmEnabled, active, asmKeys.length, reducedMotion]);
  useFrame((_, dt) => {
    // Gentle parallax
    if (rig.current) {
      const targetRotX = THREE.MathUtils.degToRad((cursor.y - 0.5) * (reducedMotion ? 1 : 4));
      const targetRotY = THREE.MathUtils.degToRad((cursor.x - 0.5) * (reducedMotion ? 2 : 8));
      rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, targetRotX, 4, dt);
      rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, targetRotY, 4, dt);
    }
    // Light follow
    if (spot.current) {
      follow.current.lerp(
        new THREE.Vector3((cursor.x - 0.5) * 2.2, 1.5 + (0.5 - cursor.y) * 0.6, 0.6),
        0.06,
      );
      spot.current.position.set(follow.current.x, follow.current.y, follow.current.z);
    }
  });

  return (
    <group ref={rig}>
      {/* Key lights */}
      <ambientLight intensity={0.28} />
      <directionalLight
        position={[3.2, 4.0, 2.2]}
        intensity={1.15}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <spotLight
        ref={spot}
        position={[-1.2, 1.8, 0.6]}
        intensity={0.95}
        angle={0.85}
        penumbra={0.6}
        castShadow
        color="#6bc7ff"
      />

      <Float
        speed={reducedMotion ? 0.45 : 0.95}
        rotationIntensity={reducedMotion ? 0.04 : 0.22}
        floatIntensity={reducedMotion ? 0.18 : 0.6}
      >
        <group>
          <RoundedBox args={[0.7, 0.7, 0.2]} radius={0.12} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial
              color={agentColor}
              metalness={0.5}
              roughness={0.28}
              envMapIntensity={1.0}
            />
          </RoundedBox>
          <Html center transform distanceFactor={1.2} zIndexRange={[2, 2]}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 shadow-lg shadow-black/40 ring-1 ring-white/15 backdrop-blur-sm">
              <Bot className="h-7 w-7 text-cyan-200" />
            </div>
          </Html>
          {/* Badge-Label unter dem runden Agent-Icon (lokalisiert, dynamische ASM-Phase) */}
          <group position={[0, -0.48, 0]}>
            <Html center transform distanceFactor={1.2} zIndexRange={[5, 5]}>
              <div
                className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] leading-none text-white shadow-md shadow-black/30 ring-1 ring-white/20 backdrop-blur-sm"
                aria-label={asmLabel}
              >
                {asmLabel}
              </div>
            </Html>
          </group>
        </group>
      </Float>

      {/* Tool panels around the agent */}
      <Float
        speed={reducedMotion ? 0.35 : 0.9}
        rotationIntensity={reducedMotion ? 0.03 : 0.18}
        floatIntensity={reducedMotion ? 0.12 : 0.55}
      >
        {tools.map((t, idx) => {
          const iconMap: Record<ToolIconKey, React.ReactNode> = {
            db: <Database className="h-6 w-6 text-cyan-200" />,
            cloud: <Cloud className="h-6 w-6 text-cyan-200" />,
            book: <BookOpen className="h-6 w-6 text-emerald-100" />,
            shield: <ShieldCheck className="h-6 w-6 text-indigo-200" />,
            file: <FileText className="h-6 w-6 text-amber-100" />,
          };
          const R = 1.35; // ring radius
          const angle = (idx / Math.max(1, tools.length)) * Math.PI * 2;
          const x = Math.cos(angle) * R;
          const z = Math.sin(angle) * R;
          const y = 0.05 * Math.sin(angle * 1.3);
          const rot: [number, number, number] = [0.06, angle + Math.PI / 2, 0.04];
          return (
            <ToolPanel key={idx} color={t.color ?? '#5da0ff'} position={[x, y, z]} rotation={rot}>
              {iconMap[t.icon]}
            </ToolPanel>
          );
        })}
      </Float>

      <Ground />
    </group>
  );
}

export const Agent3DScene: React.FC<Agent3DSceneProps> = ({
  active = true,
  reducedMotion = false,
  className,
  asmExtended = true,
}) => {
  const GpuDetector = useDetectGPU();
  // Heuristik: auf schwachen GPUs reduzieren wir Effekte
  const lowPower = (GpuDetector?.tier ?? 0) <= 2;
  const dpr = lowPower ? [1, 1.5] : [1, 2];
  const [cursor, setCursor] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

  return (
    <div
      className={className ?? 'h-full w-full'}
      onPointerMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setCursor({ x, y });
      }}
    >
      <Canvas
        className="bg-transparent"
        style={{ background: 'transparent' }}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: lowPower ? 'low-power' : 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearAlpha(0);
        }}
        dpr={dpr as any}
        camera={{ position: [0.8, 0.95, 2.3], fov: 45 }}
      >
        <Suspense
          fallback={
            <Html center className="text-xs text-zinc-300">
              Loading 3D…
            </Html>
          }
        >
          <SoftShadows size={40} samples={16} focus={0.9} />
          <SceneContent
            reducedMotion={reducedMotion}
            cursor={cursor}
            active={active}
            asmExtended={asmExtended}
          />
          <OrbitControls
            enabled={!reducedMotion}
            enablePan={false}
            minDistance={1.8}
            maxDistance={3.2}
            maxPolarAngle={Math.PI * 0.58}
          />
          <Environment preset="city" background={false} />
          {!lowPower && (
            <EffectComposer multisampling={0}>
              <SMAA />
              <Bloom intensity={0.6} luminanceThreshold={0.22} luminanceSmoothing={0.42} />
              <DepthOfField
                focusDistance={0.015}
                focalLength={0.028}
                bokehScale={1.7}
                height={480}
              />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Agent3DScene;
