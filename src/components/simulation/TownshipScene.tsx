'use client';
import {
  sage as radixSage,
  jade as radixJade,
  teal as radixTeal,
  grass as radixGrass,
  sand as radixSand,
  bronze as radixBronze,
} from '@radix-ui/colors';

import {
  Component,
  ErrorInfo,
  ReactNode,
  Suspense,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  Html,
  OrbitControls,
  useGLTF,
  useTexture,
} from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import {
  CloudRain,
  Eye,
  Focus,
  Layers3,
  Maximize2,
  RotateCcw,
  Sun,
  X,
} from 'lucide-react';
import { canalHeadroom, percent } from '@/lib/simulation';
import { sceneWeather } from '@/lib/weather';
import { number, useBlueLoop } from '@/components/workspace/BlueLoopProvider';
import { WeatherEffects } from './WeatherEffects';

export type AssetId = 'pond' | 'tank' | 'pump' | 'canal' | 'irrigation';
type ViewId = 'site' | AssetId;
const ASSETS: { id: AssetId; name: string; code: string }[] = [
  { id: 'pond', name: 'Retention pond', code: 'DEMO-01' },
  { id: 'tank', name: 'Reuse storage', code: 'TK-01 / 02' },
  { id: 'pump', name: 'Pump station', code: 'PS-01' },
  { id: 'canal', name: 'Release gate', code: 'GV-01' },
  { id: 'irrigation', name: 'Landscape', code: 'IR-01' },
];
const targets: Record<
  ViewId,
  { at: [number, number, number]; from: [number, number, number] }
> = {
  site: { at: [0, 0, 0], from: [51, 47, 57] },
  pond: { at: [-12, 0, 1], from: [10, 25, 32] },
  tank: { at: [16, 3, -6], from: [31, 15, 14] },
  pump: { at: [5, 1.5, -4], from: [17, 11, 12] },
  canal: { at: [20, 0, 13], from: [35, 16, 28] },
  irrigation: { at: [13, 1, -17], from: [34, 24, 2] },
};
const pondCenter = new THREE.Vector2(-13, 0);
function shore(t: number, scale = 1) {
  const r = 1 + Math.sin(t * 3 + 0.8) * 0.075 + Math.cos(t * 5) * 0.035;
  return new THREE.Vector2(
    pondCenter.x + Math.cos(t) * 14 * r * scale,
    pondCenter.y + Math.sin(t) * 9 * r * scale
  );
}
function pondShape(scale = 1) {
  const shape = new THREE.Shape();
  for (let i = 0; i <= 96; i++) {
    const p = shore((i / 96) * Math.PI * 2, scale);
    if (i === 0) shape.moveTo(p.x, p.y);
    else shape.lineTo(p.x, p.y);
  }
  return shape;
}
function surfaceMaterial(
  map: THREE.Texture,
  normalMap: THREE.Texture,
  roughnessMap: THREE.Texture,
  repeat: number
) {
  const textures = [map, normalMap, roughnessMap].map((t) => {
    const c = t.clone();
    c.wrapS = c.wrapT = THREE.RepeatWrapping;
    c.repeat.set(repeat, repeat);
    c.anisotropy = 8;
    c.needsUpdate = true;
    return c;
  });
  textures[0].colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({
    map: textures[0],
    normalMap: textures[1],
    roughnessMap: textures[2],
    roughness: 0.95,
    normalScale: new THREE.Vector2(0.6, 0.6),
  });
}
function useSurfaces(wetness: number) {
  const t = useTexture([
    '/scene/grass_ground-diff.jpg',
    '/scene/grass_ground-normal.jpg',
    '/scene/grass_ground-rough.jpg',
    '/scene/concrete_floor_worn_001-diff.jpg',
    '/scene/concrete_floor_worn_001-normal.jpg',
    '/scene/concrete_floor_worn_001-rough.jpg',
  ]);
  const materials = useMemo(() => {
    const grass = surfaceMaterial(t[0], t[1], t[2], 0.16);
    grass.color.set(radixGrass.grass8);
    return { grass, concrete: surfaceMaterial(t[3], t[4], t[5], 2) };
  }, [t]);
  materials.grass.color
    .set(radixGrass.grass8)
    .lerp(new THREE.Color(radixGrass.grass11), wetness * 0.48);
  materials.grass.roughness = 0.95 - wetness * 0.24;
  materials.concrete.color
    .set(radixSage.sage1)
    .lerp(new THREE.Color(radixSage.sage9), wetness * 0.5);
  materials.concrete.roughness = 0.95 - wetness * 0.67;
  materials.concrete.envMapIntensity = 0.65 + wetness * 0.55;
  useEffect(
    () => () =>
      Object.values(materials).forEach((m) => {
        m.map?.dispose();
        m.normalMap?.dispose();
        m.roughnessMap?.dispose();
        m.dispose();
      }),
    [materials]
  );
  return materials;
}
const Box = ({
  at,
  size,
  color = radixSand.sand8,
  material,
  rotation,
}: {
  at: [number, number, number];
  size: [number, number, number];
  color?: string;
  material?: THREE.Material;
  rotation?: [number, number, number];
}) => (
  <mesh
    position={at}
    rotation={rotation}
    castShadow
    receiveShadow
    material={material}
  >
    <boxGeometry args={size} />
    {!material && <meshStandardMaterial color={color} roughness={0.78} />}
  </mesh>
);
function Pipe({
  points,
  radius = 0.22,
  color = radixSage.sage11,
  active = false,
}: {
  points: [number, number, number][];
  radius?: number;
  color?: string;
  active?: boolean;
}) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        points.map((p) => new THREE.Vector3(...p)),
        false,
        'catmullrom',
        0.08
      ),
    [points]
  );
  const bead = useRef<THREE.Mesh>(null);
  const { invalidate } = useThree();
  useFrame(({ clock }) => {
    if (active && bead.current) {
      bead.current.position.copy(
        curve.getPoint((clock.elapsedTime * 0.17) % 1)
      );
      invalidate();
    }
  });
  return (
    <group>
      <mesh castShadow>
        <tubeGeometry args={[curve, 48, radius, 10, false]} />
        <meshStandardMaterial
          color={active ? radixJade.jade10 : color}
          metalness={0.65}
          roughness={0.37}
        />
      </mesh>
      {active && (
        <mesh ref={bead}>
          <sphereGeometry args={[radius * 1.2, 8, 8]} />
          <meshStandardMaterial color={radixTeal.teal4} />
        </mesh>
      )}
    </group>
  );
}
function Cylinder({
  at,
  radius,
  height,
  color = radixSage.sage8,
  metal = 0.4,
}: {
  at: [number, number, number];
  radius: number;
  height: number;
  color?: string;
  metal?: number;
}) {
  return (
    <mesh position={at} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, 40]} />
      <meshStandardMaterial color={color} metalness={metal} roughness={0.42} />
    </mesh>
  );
}
const Landscape = memo(function Landscape({
  intensity,
  animate,
}: {
  intensity: number;
  animate: boolean;
}) {
  const tree = useGLTF('/scene/tree.glb');
  const shrub = useGLTF('/scene/shrub.glb');
  const [shrubAlpha] = useTexture(['/scene/shrub-alpha.png']);
  shrubAlpha.flipY = false;
  const instances = useMemo(() => {
    const make = (source: THREE.Object3D, height: number) => {
      const object = source.clone(true);
      const bounds = new THREE.Box3().setFromObject(object);
      const size = bounds.getSize(new THREE.Vector3());
      const scale = height / size.y;
      object.scale.multiplyScalar(scale);
      object.position.y -= bounds.min.y * scale;
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const material = child.material as THREE.MeshStandardMaterial;
          if (source === shrub.scene || material.name.includes('leaves')) {
            child.material = material.clone();
            const foliage = child.material as THREE.MeshStandardMaterial;
            foliage.alphaMap = source === shrub.scene ? shrubAlpha : null;
            foliage.emissive.set(radixGrass.grass11);
            foliage.emissiveIntensity = 0.14;
            foliage.transparent = false;
            foliage.alphaTest = source === shrub.scene ? 0.4 : 0;
            foliage.side = THREE.DoubleSide;
          }
        }
      });
      return object;
    };
    const treePositions = [
      [-30, -20],
      [-24, -19],
      [-15, -19],
      [-5, -20],
      [5, -21],
      [25, -19],
      [30, -13],
      [31, -3],
      [30, 5],
      [-31, 11],
      [-25, 18],
      [-13, 19],
      [-3, 19],
      [8, 20],
      [31, 21],
      [-32, -8],
      [-28, -14],
      [19, -22],
    ];
    return treePositions
      .map(([x, z], i) => ({
        object: make(tree.scene, 5.8 + (i % 4) * 0.7),
        x,
        z,
        rotation: i * 2.39,
      }))
      .concat(
        Array.from({ length: 18 }, (_, i) => ({
          object: make(shrub.scene, 0.75 + (i % 3) * 0.2),
          x: i < 9 ? 4 + i * 2.7 : -26 + (i - 9) * 3,
          z: i < 9 ? -14 : 15,
          rotation: i * 1.4,
        }))
      );
  }, [tree.scene, shrub.scene, shrubAlpha]);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const elapsed = useRef(0);
  const { invalidate } = useThree();
  useFrame((_, delta) => {
    if (!animate || intensity === 0) return;
    elapsed.current += Math.min(delta, 0.05);
    groups.current.forEach((group, i) => {
      if (!group) return;
      group.rotation.z =
        (Math.sin(elapsed.current * 1.6 + i * 0.8) * 0.008 + 0.009) * intensity;
      group.rotation.x =
        Math.sin(elapsed.current * 1.1 + i) * 0.006 * intensity;
    });
    invalidate();
  });
  return (
    <group>
      {instances.map((p, i) => (
        <group
          key={i}
          ref={(group) => {
            groups.current[i] = group;
          }}
          position={[p.x, 0.72, p.z]}
          rotation={[0, p.rotation, 0]}
        >
          <primitive object={p.object} />
        </group>
      ))}
    </group>
  );
});
function Ground({
  grass,
  concrete,
}: {
  grass: THREE.Material;
  concrete: THREE.Material;
}) {
  const bed = useMemo(() => new THREE.ShapeGeometry(pondShape(0.74)), []);
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-35, -25);
    shape.lineTo(35, -25);
    shape.lineTo(35, 25);
    shape.lineTo(-35, 25);
    shape.closePath();
    const hole = new THREE.Path(pondShape().getPoints().reverse());
    shape.holes.push(hole);
    return new THREE.ShapeGeometry(shape);
  }, []);
  const bank = useMemo(() => {
    const vertices: number[] = [],
      uv: number[] = [],
      indices: number[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = shore((i / 96) * Math.PI * 2);
      const b = shore((i / 96) * Math.PI * 2, 0.72);
      vertices.push(a.x, 0.72, -a.y, b.x, -2, -b.y);
      uv.push(i / 12, 0, i / 12, 1);
      if (i < 96) {
        const k = i * 2;
        indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group>
      <Box at={[0, -2.8, 0]} size={[70, 1.5, 50]} color={radixSand.sand11} />
      {[-35, 35].map((x) => (
        <Box
          key={x}
          at={[x, -0.65, 0]}
          size={[0.05, 2.75, 50]}
          color={radixSand.sand11}
        />
      ))}
      {[-25, 25].map((z) => (
        <Box
          key={z}
          at={[0, -0.65, z]}
          size={[70, 2.75, 0.05]}
          color={radixSand.sand11}
        />
      ))}
      <mesh
        geometry={geometry}
        material={grass}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.72, 0]}
        receiveShadow
      />
      <mesh geometry={bank} material={concrete} receiveShadow />
      <mesh
        geometry={bed}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.95, 0]}
      >
        <meshStandardMaterial color={radixSage.sage11} />
      </mesh>
      <Box at={[0, 0.77, -11.8]} size={[64, 0.12, 2.3]} material={concrete} />
      <Box at={[27, 0.77, 0]} size={[2.1, 0.12, 42]} material={concrete} />
      <Box at={[0, 0.78, 17]} size={[58, 0.12, 2.2]} material={concrete} />
      <Box at={[-29, 0.78, 2.5]} size={[2.1, 0.12, 29]} material={concrete} />
      {Array.from({ length: 12 }, (_, i) => (
        <group key={i} position={[-26 + i * 4.7, 0.84, 16.6]}>
          <Box
            at={[0, 0.42, 0]}
            size={[1.6, 0.14, 0.5]}
            color={radixBronze.bronze11}
          />
          <Box
            at={[-0.55, 0.2, 0]}
            size={[0.1, 0.4, 0.4]}
            color={radixBronze.bronze12}
          />
          <Box
            at={[0.55, 0.2, 0]}
            size={[0.1, 0.4, 0.4]}
            color={radixBronze.bronze12}
          />
        </group>
      ))}
      {[-23, -8, 7, 22].map((x) => (
        <group key={x} position={[x, 0.83, -10.2]}>
          <Cylinder
            at={[0, 2, 0]}
            radius={0.065}
            height={4}
            color={radixSand.sand11}
          />
          <Box
            at={[0.35, 4, 0]}
            size={[0.9, 0.08, 0.25]}
            color={radixJade.jade12}
          />
        </group>
      ))}
      <Box at={[0, -3.6, 0]} size={[500, 0.1, 500]} color={radixSage.sage6} />
    </group>
  );
}
function useWaterNormal(animate: boolean, rain: number, flow = false) {
  const normal = useTexture('/scene/water-normal.jpg');
  const texture = useMemo(() => {
    const t = normal.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.2, 0.2);
    return t;
  }, [normal]);
  useEffect(() => () => texture.dispose(), [texture]);
  const { invalidate } = useThree();
  useFrame((_, delta) => {
    if (animate) {
      texture.offset.x += Math.min(delta, 0.05) * (0.008 + rain * 0.014);
      texture.offset.y +=
        Math.min(delta, 0.05) * (0.004 + rain * 0.009 + (flow ? 0.04 : 0));
      invalidate();
    }
  });
  return texture;
}
function CanalWater({
  animate,
  rain,
  flow,
}: {
  animate: boolean;
  rain: number;
  flow: boolean;
}) {
  const normal = useWaterNormal(animate, rain, flow);
  return (
    <mesh
      position={[20, 0.9, 19]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[5.9, 12]} />
      <meshPhysicalMaterial
        color={radixTeal.teal12}
        roughness={0.16 + rain * 0.12}
        metalness={0.3}
        normalMap={normal}
        normalScale={new THREE.Vector2(0.35 + rain * 0.5, 0.35 + rain * 0.5)}
        clearcoat={1}
      />
    </mesh>
  );
}
function Pond({
  ratio,
  onSelect,
  animate,
  rain,
}: {
  ratio: number;
  onSelect: () => void;
  animate: boolean;
  rain: number;
}) {
  const texture = useWaterNormal(animate, rain);
  const geometry = useMemo(() => new THREE.ShapeGeometry(pondShape(0.91)), []);
  return (
    <group>
      <mesh
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.5 + ratio * 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        receiveShadow
      >
        <meshPhysicalMaterial
          color={radixTeal.teal12}
          metalness={0.25}
          roughness={0.12 + rain * 0.13}
          normalMap={texture}
          normalScale={
            new THREE.Vector2(0.45 + rain * 0.65, 0.45 + rain * 0.65)
          }
          envMapIntensity={1.5}
          clearcoat={1}
          clearcoatRoughness={0.12}
        />
      </mesh>
      {Array.from({ length: 34 }, (_, i) => {
        const p = shore((i / 34) * Math.PI * 2, 0.98);
        return (
          <mesh
            key={i}
            position={[p.x, 0.55, -p.y]}
            rotation={[i * 0.4, i, 0]}
            scale={[0.9 + Math.sin(i) * 0.2, 0.45, 0.6]}
            castShadow
            receiveShadow
          >
            <icosahedronGeometry args={[0.7, 1]} />
            <meshStandardMaterial
              color={i % 2 ? radixSand.sand9 : radixSand.sand9}
              roughness={1}
            />
          </mesh>
        );
      })}
      <group position={[-1, 0.8, 2]}>
        <Box at={[0, 0, 0]} size={[3.5, 0.25, 2.8]} color={radixSand.sand11} />
        {[-1.5, 1.5].map((x) => (
          <Cylinder
            key={x}
            at={[x, -0.7, 0]}
            radius={0.09}
            height={2.4}
            color={radixSage.sage11}
          />
        ))}
      </group>
    </group>
  );
}
function Tank({
  x,
  z,
  concrete,
  ratio,
}: {
  x: number;
  z: number;
  concrete: THREE.Material;
  ratio: number;
}) {
  return (
    <group position={[x, 0.85, z]}>
      <Cylinder
        at={[0, 0.15, 0]}
        radius={2.6}
        height={0.3}
        color={radixBronze.bronze8}
        metal={0}
      />
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow material={concrete}>
        <cylinderGeometry args={[2.25, 2.25, 4.7, 64]} />
      </mesh>
      <mesh position={[0, 4.93, 0]} castShadow>
        <sphereGeometry args={[2.26, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={radixSage.sage8}
          metalness={0.5}
          roughness={0.45}
        />
      </mesh>
      {[0.7, 2.3, 4.4].map((y) => (
        <mesh key={y} rotation={[Math.PI / 2, 0, 0]} position={[0, y, 0]}>
          <torusGeometry args={[2.28, 0.035, 6, 64]} />
          <meshStandardMaterial
            color={radixSage.sage10}
            metalness={0.8}
            roughness={0.25}
          />
        </mesh>
      ))}
      <Cylinder
        at={[0, 7.05, 0]}
        radius={0.48}
        height={0.18}
        color={radixSage.sage11}
      />
      <Cylinder
        at={[0.8, 6.9, 0.1]}
        radius={0.07}
        height={1}
        color={radixSage.sage11}
      />
      {[-0.35, 0.35].map((a) => (
        <Cylinder
          key={a}
          at={[a, 2.8, 2.3]}
          radius={0.035}
          height={5.5}
          color={radixSage.sage11}
        />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <Box
          key={i}
          at={[0, 0.4 + i * 0.38, 2.3]}
          size={[0.7, 0.035, 0.035]}
          color={radixSage.sage11}
        />
      ))}
      <Box
        at={[1.15, 2.3, 2.05]}
        size={[0.12, 3.2, 0.12]}
        color={radixSage.sage11}
      />
      <Box
        at={[1.15, 0.7 + ratio * 1.6, 2.13]}
        size={[0.09, Math.max(0.01, ratio * 3.2), 0.04]}
        color={radixTeal.teal8}
      />
    </group>
  );
}
function Infrastructure({
  concrete,
  tankRatio,
  transfer,
  canal,
  irrigation,
  animate,
  rain,
  onSelect,
}: {
  concrete: THREE.Material;
  tankRatio: number;
  transfer: boolean;
  canal: boolean;
  irrigation: boolean;
  animate: boolean;
  rain: number;
  onSelect: (id: AssetId) => void;
}) {
  const pick = (id: AssetId) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(id);
  };
  return (
    <group>
      <Box at={[15, 0.8, -5]} size={[13, 0.35, 12]} material={concrete} />
      <group onClick={pick('tank')}>
        <Tank x={13} z={-6} concrete={concrete} ratio={tankRatio} />
        <Tank x={19} z={-6} concrete={concrete} ratio={tankRatio} />
      </group>
      <group onClick={pick('pump')}>
        <Box at={[4.7, 0.85, -4]} size={[5.5, 0.3, 7]} material={concrete} />
        {[-5.5, -2.5].map((z) => (
          <group key={z} position={[4.8, 1.05, z]}>
            <Box
              at={[0, 0.15, 0]}
              size={[3.3, 0.3, 1.3]}
              color={radixJade.jade12}
            />
            <mesh
              position={[-0.65, 0.7, 0]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[0.48, 0.48, 1.6, 24]} />
              <meshStandardMaterial
                color={radixSage.sage11}
                metalness={0.45}
                roughness={0.4}
              />
            </mesh>
            <mesh
              position={[0.5, 0.6, 0]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[0.54, 0.54, 0.6, 24]} />
              <meshStandardMaterial
                color={radixSage.sage11}
                metalness={0.55}
                roughness={0.35}
              />
            </mesh>
            {Array.from({ length: 7 }, (_, i) => (
              <mesh
                key={i}
                position={[-1.2 + i * 0.18, 0.7, 0]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <torusGeometry args={[0.48, 0.018, 4, 24]} />
                <meshStandardMaterial color={radixJade.jade12} />
              </mesh>
            ))}
            <Pipe
              points={[
                [1, 0.6, 0],
                [1.6, 0.6, 0],
                [1.6, 1.8, 0],
              ]}
              radius={0.18}
              active={transfer}
            />
          </group>
        ))}
        {[2.3, 7.1].flatMap((x) =>
          [-7, -0.6].map((z) => (
            <Cylinder
              key={`${x}-${z}`}
              at={[x, 2.6, z]}
              radius={0.055}
              height={3.5}
              color={radixSage.sage11}
            />
          ))
        )}
        <Box
          at={[4.7, 4.45, -3.8]}
          size={[6.2, 0.16, 7.6]}
          color={radixSage.sage11}
        />
        {Array.from({ length: 7 }, (_, i) => (
          <Box
            key={i}
            at={[2.25 + i * 0.8, 4.57, -3.8]}
            size={[0.68, 0.05, 6.5]}
            color={radixJade.jade12}
          />
        ))}
        <Box
          at={[7, 1.7, -8.1]}
          size={[1, 1.6, 0.55]}
          color={radixSage.sage8}
        />
        <Box
          at={[7, 2.05, -7.8]}
          size={[0.65, 0.3, 0.04]}
          color={radixJade.jade12}
        />
      </group>
      <Pipe
        points={[
          [-2, 0, 0],
          [1, 0.4, 0],
          [1, 1.7, -4],
          [4, 1.7, -4],
          [9, 1.7, -4],
          [10, 1.7, -6],
        ]}
        active={transfer}
      />
      <Pipe
        points={[
          [13, 1.4, -4],
          [16, 1.4, -3],
          [19, 1.4, -4],
        ]}
        active={transfer}
      />
      <Pipe
        points={[
          [16, 1.4, -4],
          [23, 1.4, -4],
          [23, 0.7, -15],
          [11, 0.7, -15],
        ]}
        active={irrigation}
        radius={0.13}
        color={radixSage.sage11}
      />
      <Pipe
        points={[
          [0, 0, 5],
          [3, 0.7, 5],
          [5, 1.3, 8],
          [18, 1.3, 8],
          [20, 1.3, 11],
          [20, -0.1, 13],
        ]}
        active={canal && animate}
        radius={0.32}
      />
      {[5, 9, 13, 17].map((x) => (
        <Box
          key={x}
          at={[x, 0.95, 8]}
          size={[0.4, 0.5, 1]}
          material={concrete}
        />
      ))}
      <group onClick={pick('canal')}>
        <Box at={[20, 0.2, 19]} size={[6, 0.5, 12]} material={concrete} />
        {[16.8, 23.2].map((x) => (
          <Box
            key={x}
            at={[x, 0.8, 19]}
            size={[0.45, 1.7, 12]}
            material={concrete}
          />
        ))}
        <CanalWater animate={animate} rain={rain} flow={canal} />
        {[18.4, 21.6].map((x) => (
          <Cylinder
            key={x}
            at={[x, 2.3, 13]}
            radius={0.1}
            height={3.4}
            color={radixSage.sage11}
          />
        ))}
        <Box
          at={[20, canal ? 2.1 : 1, 13]}
          size={[3, 1.9, 0.16]}
          color={radixSage.sage10}
        />
        <Box at={[20, 4, 13]} size={[3.6, 0.2, 0.4]} color={radixSage.sage10} />
        <Cylinder
          at={[20, 3.1, 13]}
          radius={0.045}
          height={2.8}
          color={radixSage.sage8}
        />
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[20, 4.3, 13]}>
          <torusGeometry args={[0.4, 0.04, 8, 24]} />
          <meshStandardMaterial color={radixSage.sage11} metalness={0.7} />
        </mesh>
      </group>
      <group onClick={pick('irrigation')}>
        {[7, 13, 19].map((x) => (
          <group key={x} position={[x, 0.8, -18]}>
            <Cylinder
              at={[0, 0.3, 0]}
              radius={0.055}
              height={0.6}
              color={radixSage.sage11}
            />
            <Cylinder
              at={[0, 0.65, 0]}
              radius={0.12}
              height={0.08}
              color={radixJade.jade12}
            />
            {irrigation &&
              Array.from({ length: 5 }, (_, i) => (
                <Pipe
                  key={i}
                  radius={0.015}
                  color={radixSage.sage6}
                  points={[
                    [0, 0.7, 0],
                    [Math.cos(i * 1.26), 1.4, Math.sin(i * 1.26)],
                    [Math.cos(i * 1.26) * 2, 0.1, Math.sin(i * 1.26) * 2],
                  ]}
                />
              ))}
          </group>
        ))}
      </group>
    </group>
  );
}
function CameraRig({
  view,
  reset,
  reduced,
}: {
  view: ViewId;
  reset: number;
  reduced: boolean;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, invalidate, size } = useThree();
  const transition = useRef(false);
  const aspect = size.width / Math.max(1, size.height);
  useEffect(() => {
    transition.current = true;
    invalidate();
  }, [view, reset, aspect, invalidate]);
  useFrame((_, delta) => {
    if (!transition.current || !controls.current) return;
    const target = targets[view];
    const from = new THREE.Vector3(...target.from),
      at = new THREE.Vector3(...target.at);
    if (view === 'site' && aspect < 1.7)
      from
        .sub(at)
        .multiplyScalar(Math.min(1.55, 1.7 / aspect))
        .add(at);
    const f = 1;
    camera.position.lerp(from, f);
    controls.current.target.lerp(at, f);
    controls.current.update();
    if (camera.position.distanceTo(from) < 0.02) transition.current = false;
    else invalidate();
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      maxPolarAngle={Math.PI * 0.47}
      minDistance={9}
      maxDistance={165}
      enableDamping
      dampingFactor={0.08}
      onStart={() => {
        transition.current = false;
      }}
    />
  );
}
function SceneContent({
  view,
  reset,
  labels,
  reduced,
  select,
}: {
  view: ViewId;
  reset: number;
  labels: boolean;
  reduced: boolean;
  select: (id: AssetId) => void;
}) {
  const { s, site, playing, dataset } = useBlueLoop();
  const weather = sceneWeather(dataset, s.hour);
  const materials = useSurfaces(weather.wetness);
  const { size } = useThree();
  const aspect = size.width / Math.max(1, size.height);
  const fit =
    view === 'site' && aspect < 1.7 ? Math.min(1.55, 1.7 / aspect) : 1;
  const fogOffset =
    new THREE.Vector3(...targets.site.from).length() * (fit - 1);
  const sky = new THREE.Color(radixSage.sage5).lerp(
    new THREE.Color(radixSage.sage9),
    weather.intensity * 0.65
  );
  return (
    <>
      <color attach="background" args={[sky]} />
      <fog
        attach="fog"
        args={[
          sky,
          105 - weather.intensity * 20 + fogOffset,
          210 - weather.intensity * 30 + fogOffset,
        ]}
      />
      <ambientLight intensity={0.25 + weather.intensity * 0.35} />
      <directionalLight
        position={[-30, 55, 20]}
        intensity={2.6 - weather.intensity * 1.65}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-48}
        shadow-camera-right={48}
        shadow-camera-top={38}
        shadow-camera-bottom={-38}
        shadow-normalBias={0.08}
        shadow-bias={-0.0002}
      />
      <Environment
        files="/scene/daylight.hdr"
        environmentIntensity={0.65 - weather.intensity * 0.2}
      />
      <Ground {...materials} />
      <Pond
        ratio={s.pond / site.pondCapacity}
        onSelect={() => select('pond')}
        animate={playing && !reduced}
        rain={weather.intensity}
      />
      <Landscape
        intensity={reduced ? 0 : weather.intensity}
        animate={playing && !reduced}
      />
      <WeatherEffects
        intensity={weather.intensity}
        wetness={weather.wetness}
        pondHeight={-1.5 + (s.pond / site.pondCapacity) * 2}
        animate={playing}
        reduced={reduced}
      />
      <Infrastructure
        concrete={materials.concrete}
        tankRatio={s.tank / site.tankCapacity}
        transfer={s.transferFlow > 0 && playing && !reduced}
        canal={s.canalFlow > 0}
        irrigation={s.irrigationFlow > 0}
        animate={playing && !reduced}
        onSelect={select}
        rain={weather.intensity}
      />
      {labels &&
        ASSETS.filter((asset) =>
          view === 'site'
            ? ['pond', 'tank', 'canal'].includes(asset.id)
            : view === asset.id
        ).map((asset) => {
          const pos: Record<AssetId, [number, number, number]> = {
            pond: [-17, 1, 1],
            tank: [16, 10, -6],
            pump: [4.7, 5, -4],
            canal: [20, 5, 17],
            irrigation: [13, 2, -18],
          };
          return (
            <Html
              key={asset.id}
              position={pos[asset.id]}
              center
              zIndexRange={[8, 0]}
            >
              <button
                className={`scene-marker ${view === asset.id ? 'selected' : ''}`}
                onClick={() => select(asset.id)}
              >
                <i />
                {asset.name}
                {asset.id === 'pond' && (
                  <b>{percent(s.pond, site.pondCapacity).toFixed(0)}%</b>
                )}
              </button>
            </Html>
          );
        })}
      <CameraRig view={view} reset={reset} reduced={reduced} />
    </>
  );
}
class SceneBoundary extends Component<
  { children: ReactNode; retry: () => void },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('BlueLoop 3D view:', error.message, info.componentStack);
  }
  render() {
    return this.state.error ? (
      <div className="scene-loading">
        <Layers3 />
        <strong>The 3D view could not load</strong>
        <p>Your simulation is available in the asset list below.</p>
        <button className="button" onClick={this.props.retry}>
          Retry 3D view
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function TownshipScene({
  compact = false,
  initialView = 'site',
}: {
  compact?: boolean;
  initialView?: ViewId;
}) {
  const [view, setView] = useState<ViewId>(initialView),
    [labels, setLabels] = useState(true),
    [reset, setReset] = useState(0),
    [epoch, setEpoch] = useState(0),
    [reduced, setReduced] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const { s, site, dataset } = useBlueLoop();
  const weather = sceneWeather(dataset, s.hour);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    setView(initialView);
  }, [initialView]);
  const selected = ASSETS.find((a) => a.id === view);
  const values: Record<AssetId, [string, string, string]> = {
    pond: [
      `${number(s.pond)} m³`,
      `${number(site.pondCapacity)} m³ capacity`,
      `${percent(s.pond, site.pondCapacity).toFixed(1)}% full`,
    ],
    tank: [
      `${number(s.tank)} m³`,
      `${number(site.tankCapacity)} m³ combined capacity`,
      `${percent(s.tank, site.tankCapacity).toFixed(1)}% full`,
    ],
    pump: [
      `${number(s.transferFlow)} m³/h`,
      `${number(site.transferRate)} m³/h maximum`,
      s.approved ? 'Drawdown approved' : 'Waiting for approval',
    ],
    canal: [
      `${number(s.canalFlow)} m³/h`,
      `${number(canalHeadroom(s, dataset))}% downstream headroom`,
      s.canalFlow > 0 ? 'Staged release active' : 'Gate closed',
    ],
    irrigation: [
      `${number(s.irrigationFlow)} m³/h`,
      `${number(s.irrigated)} m³ delivered this run`,
      `${number(s.soil)}% soil moisture index`,
    ],
  };
  return (
    <section
      className={`scene-panel ${compact ? 'compact' : ''}`}
      aria-label="Interactive 3D Elmina reference model"
      ref={container}
    >
      <div className="scene-topline">
        <span title="Illustrative site layout">
          <i className="live-dot" />
          Elmina 3D model
        </span>
        <span
          className="scene-weather"
          aria-label={`Weather: ${weather.label}, ${number(weather.rate, 1)} millimetres per hour`}
        >
          {weather.rate > 0 ? <CloudRain size={14} /> : <Sun size={14} />}
          {weather.label}
          {weather.rate > 0 && <span>{number(weather.rate, 1)} mm/h</span>}
        </span>
      </div>
      <div className="scene-canvas">
        <SceneBoundary key={epoch} retry={() => setEpoch((e) => e + 1)}>
          <Canvas
            shadows
            dpr={[1, 1.5]}
            frameloop="demand"
            camera={{
              position: targets.site.from,
              fov: 38,
              near: 0.3,
              far: 350,
            }}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.1,
            }}
            fallback={
              <div className="scene-loading">
                <strong>3D needs WebGL</strong>
                <p>Use the asset controls below to inspect the simulation.</p>
              </div>
            }
          >
            <Suspense
              fallback={
                <Html center>
                  <div className="model-loader">
                    <span />
                    Preparing the landscape…
                  </div>
                </Html>
              }
            >
              <SceneContent
                view={view}
                reset={reset}
                labels={labels}
                reduced={reduced}
                select={setView}
              />
            </Suspense>
          </Canvas>
        </SceneBoundary>
        <div className="scene-tools">
          <button
            title="Reset camera"
            aria-label="Reset 3D camera"
            onClick={() => {
              setView('site');
              setReset((r) => r + 1);
            }}
          >
            <RotateCcw size={16} />
          </button>
          <button
            title="Toggle labels"
            aria-label="Toggle asset labels"
            aria-pressed={labels}
            onClick={() => setLabels(!labels)}
          >
            <Eye size={16} />
          </button>
          <button
            title="Expand 3D view"
            aria-label="Expand 3D view"
            onClick={() => {
              if (document.fullscreenElement) void document.exitFullscreen();
              else
                void container.current
                  ?.requestFullscreen()
                  .catch(() => undefined);
            }}
          >
            <Maximize2 size={16} />
          </button>
        </div>
        <div className="scene-compass">
          <span>N</span>
          <svg width="22" height="26" viewBox="0 0 22 26" aria-hidden="true">
            <path d="m11 1 8 22-8-5-8 5Z" fill={radixSage.sage11} />
            <path d="m11 1 8 22-8-5Z" fill={radixSage.sage8} />
          </svg>
        </div>
        {selected && (
          <div className="asset-inspector">
            <div>
              <span className="asset-code">{selected.code}</span>
              <button
                aria-label="Close asset inspection"
                onClick={() => setView('site')}
              >
                <X size={15} />
              </button>
            </div>
            <h3>{selected.name}</h3>
            <strong>{values[selected.id][0]}</strong>
            <p>{values[selected.id][1]}</p>
            <span className="asset-state">
              <i />
              {values[selected.id][2]}
            </span>
          </div>
        )}
        <div className="scene-hint">
          <Focus size={14} />
          Drag to orbit, scroll to zoom
        </div>
      </div>
      <div className="scene-assets">
        <button
          className={view === 'site' ? 'active' : ''}
          onClick={() => {
            setView('site');
            setReset((r) => r + 1);
          }}
        >
          <Layers3 size={14} />
          Site view
        </button>
        {ASSETS.map((a) => (
          <button
            key={a.id}
            className={view === a.id ? 'active' : ''}
            onClick={() => setView(a.id)}
          >
            {a.name}
          </button>
        ))}
      </div>
    </section>
  );
}
