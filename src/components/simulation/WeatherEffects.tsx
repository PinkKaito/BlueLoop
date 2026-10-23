'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { sage, teal } from '@radix-ui/colors';
import * as THREE from 'three';

type WeatherProps = {
  intensity: number;
  wetness: number;
  pondHeight: number;
  animate: boolean;
  reduced: boolean;
};

// Match the pond's irregular shoreline, in world X/Z coordinates.
function inPond(x: number, z: number) {
  const angle = Math.atan2(-z / 9, (x + 13) / 14);
  const radius =
    1 + Math.sin(angle * 3 + 0.8) * 0.075 + Math.cos(angle * 5) * 0.035;
  return Math.hypot((x + 13) / 14, z / 9) < radius * 0.86;
}
function surfaceAt(x: number, z: number) {
  if (inPond(x, z)) return { floor: 0, pond: 1 };
  if (x > 17 && x < 23 && z > 13 && z < 25) return { floor: 0.91, pond: 0 };
  if (x > 1.6 && x < 7.8 && z > -7.6 && z < 0) return { floor: 4.65, pond: 0 };
  for (const tankX of [13, 19]) {
    const distance = Math.hypot(x - tankX, z + 6);
    if (distance < 2.25)
      return {
        floor: 7 + Math.sqrt(Math.max(0, 1 - (distance / 2.25) ** 2)) * 0.55,
        pond: 0,
      };
  }
  if (x > 8.5 && x < 21.5 && z > -11 && z < 1) return { floor: 0.99, pond: 0 };
  if (x > 1.9 && x < 7.5 && z > -7.5 && z < -0.5)
    return { floor: 1.02, pond: 0 };
  if (
    Math.abs(z + 11.8) < 1.15 ||
    Math.abs(z - 17) < 1.1 ||
    Math.abs(x - 27) < 1.05 ||
    Math.abs(x + 29) < 1.05
  )
    return { floor: 0.86, pond: 0 };
  return { floor: 0.74, pond: 0 };
}

function particleGeometry(count: number, impacts: boolean) {
  const plane = new THREE.PlaneGeometry(1, 1);
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.index = plane.index;
  geometry.attributes = { ...plane.attributes };
  const seeds = new Float32Array(count * 4);
  const surfaces = new Float32Array(count * 2);
  // Stable pseudo-random placement avoids flickering when rain intensity changes.
  let state = impacts ? 7183 : 4187;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    let x = (random() - 0.5) * 68;
    let z = (random() - 0.5) * 48;
    if (impacts && i % 2 === 0) {
      const angle = random() * Math.PI * 2;
      const r = Math.sqrt(random()) * 0.76;
      x = -13 + Math.cos(angle) * 14 * r;
      z = Math.sin(angle) * 9 * r;
    } else if (impacts && i % 6 === 1) {
      x = 17.3 + random() * 5.4;
      z = 13.3 + random() * 11.4;
    }
    const surface = surfaceAt(x, z);
    seeds.set([x, z, random(), 0.65 + random() * 0.7], i * 4);
    surfaces.set([surface.floor, surface.pond], i * 2);
  }
  geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4));
  geometry.setAttribute(
    'aSurface',
    new THREE.InstancedBufferAttribute(surfaces, 2)
  );
  geometry.instanceCount = count;
  return geometry;
}

const vertexCommon = `
  attribute vec4 aSeed;
  attribute vec2 aSurface;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uPond;
  varying vec2 vUv;
  varying float vLife;
  varying float vPond;
`;
const fragmentCommon = `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  varying float vLife;
  varying float vPond;
`;
function weatherMaterial(impacts: boolean) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uPond: { value: 0 },
      uColor: { value: new THREE.Color(impacts ? teal.teal4 : sage.sage1) },
    },
    vertexShader:
      vertexCommon +
      (impacts
        ? `
      void main() {
        vUv = uv; vPond = aSurface.y;
        vLife = fract(aSeed.z + uTime * (.8 + aSeed.w * .5));
        float radius = (.08 + vLife * (.55 + uIntensity * .35)) * aSeed.w;
        vec3 p = vec3(aSeed.x + position.x * radius * 2., mix(aSurface.x, uPond, aSurface.y) + .018, aSeed.y + position.y * radius * 2.);
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.);
      }
    `
        : `
      void main() {
        vUv = uv; vPond = aSurface.y;
        vLife = fract(aSeed.z - uTime * (.56 + uIntensity * .28) / aSeed.w);
        float height = vLife * 32.;
        float floorY = mix(aSurface.x, uPond, aSurface.y);
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        float length = (.65 + uIntensity * .8) * aSeed.w;
        vec3 p = vec3(aSeed.x - height * .13, floorY + height, aSeed.y + height * .035);
        p += right * position.x * (.025 + uIntensity * .018);
        p += vec3(-.13, 1., .035) * position.y * length;
        p.y = max(p.y, floorY + .012);
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.);
      }
    `),
    fragmentShader:
      fragmentCommon +
      (impacts
        ? `
      void main() {
        float d = length((vUv - .5) * 2.);
        float ring = 1. - smoothstep(.025, .085, abs(d - .8));
        float inner = (1. - smoothstep(.02, .07, abs(d - .49))) * .35;
        float alpha = (ring + inner) * (1. - vLife) * (.12 + uIntensity * .19);
        alpha *= mix(.45, 1., vPond);
        if (alpha < .008) discard;
        gl_FragColor = vec4(uColor, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `
        : `
      void main() {
        float edge = 1. - smoothstep(.12, .5, abs(vUv.x - .5));
        float tail = sin(vUv.y * 3.14159);
        float alpha = edge * tail * (.22 + uIntensity * .22);
        if (alpha < .008) discard;
        gl_FragColor = vec4(uColor, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `),
  });
}

export function WeatherEffects({
  intensity,
  wetness,
  pondHeight,
  animate,
  reduced,
}: WeatherProps) {
  const { invalidate } = useThree();
  const elapsed = useRef(0);
  const resources = useMemo(
    () => ({
      drops: particleGeometry(2200, false),
      impacts: particleGeometry(300, true),
      dropMaterial: weatherMaterial(false),
      impactMaterial: weatherMaterial(true),
    }),
    []
  );
  const puddle = useMemo(() => {
    const shape = new THREE.Shape();
    for (let i = 0; i <= 48; i++) {
      const t = (i / 48) * Math.PI * 2;
      const r = 1 + Math.sin(t * 3) * 0.14 + Math.cos(t * 7) * 0.07;
      const x = Math.cos(t) * r,
        y = Math.sin(t) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    return new THREE.ShapeGeometry(shape);
  }, []);
  useEffect(
    () => () => {
      Object.values(resources).forEach((resource) => resource.dispose());
      puddle.dispose();
    },
    [resources, puddle]
  );
  resources.drops.instanceCount =
    intensity > 0 ? Math.round(80 + intensity ** 1.8 * 2120) : 0;
  resources.impacts.instanceCount =
    intensity > 0 ? Math.round(20 + intensity ** 1.5 * 280) : 0;
  for (const material of [resources.dropMaterial, resources.impactMaterial]) {
    material.uniforms.uIntensity.value = intensity;
    material.uniforms.uPond.value = pondHeight;
  }
  useFrame((_, delta) => {
    if (!animate || intensity === 0 || reduced) return;
    elapsed.current += Math.min(delta, 0.05);
    resources.dropMaterial.uniforms.uTime.value = elapsed.current;
    resources.impactMaterial.uniforms.uTime.value = elapsed.current;
    invalidate();
  });
  return (
    <group>
      {!reduced && (
        <>
          <mesh
            geometry={resources.drops}
            material={resources.dropMaterial}
            frustumCulled={false}
            raycast={() => null}
          />
          <mesh
            geometry={resources.impacts}
            material={resources.impactMaterial}
            frustumCulled={false}
            raycast={() => null}
          />
        </>
      )}
      {wetness > 0.015 &&
        (
          [
            [-20, 0.842, -11.8, 1.8, 0.55],
            [-7, 0.842, -11.9, 2.6, 0.65],
            [12, 0.842, -11.7, 1.4, 0.7],
            [27, 0.842, -3, 0.65, 2.2],
            [27, 0.842, 9, 0.7, 1.4],
            [-9, 0.852, 17, 2, 0.7],
            [5, 0.852, 17, 1.2, 0.55],
            [10, 0.988, -1.3, 0.8, 0.65],
          ] as const
        ).map(([x, y, z, sx, sz], i) => (
          <mesh
            key={i}
            geometry={puddle}
            position={[x, y, z]}
            rotation={[-Math.PI / 2, 0, i * 0.3]}
            scale={[sx, sz, 1]}
            receiveShadow
            raycast={() => null}
          >
            <meshPhysicalMaterial
              color={sage.sage8}
              transparent
              opacity={wetness * 0.48}
              roughness={0.08}
              metalness={0.15}
              clearcoat={1}
              envMapIntensity={1.2}
              depthWrite={false}
            />
          </mesh>
        ))}
    </group>
  );
}
