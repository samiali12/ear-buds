"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { MODEL_URL, TECH3D, TECH_PARTS, type PartSpec } from "@/lib/tech3d";
import { useThemeTokens, type ThemeTokens } from "@/lib/theme";

interface EarbudProps {
  /** The part currently being presented */
  activePart: PartSpec;
  /** Whether the section is on screen — the scene stops rendering otherwise */
  visible: boolean;
}

type Theme = ThemeTokens;

/** Frame-rate independent damping factor. */
function damp(delta: number) {
  return 1 - Math.exp(-TECH3D.damping * delta);
}

type PartMaterials = THREE.MeshStandardMaterial[];

/**
 * Drives every part towards its presented or resting position.
 * The scene only renders while it is on screen.
 */
function useExplode(
  refs: React.MutableRefObject<Record<string, THREE.Group | null>>,
  activeMesh: string,
  visible: boolean
) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [activeMesh, invalidate]);

  useFrame((_, delta) => {
    if (!visible) return;

    const k = damp(delta);

    for (const [name, node] of Object.entries(refs.current)) {
      if (!node) continue;

      const home = node.userData.home as THREE.Vector3 | undefined;
      if (!home) continue;

      const isActive = name === activeMesh;
      const distance = node.userData.explode as THREE.Vector3 | undefined;
      const goal = isActive && distance ? home.clone().add(distance) : home;

      node.position.lerp(goal, k);

      const materials = node.userData.materials as PartMaterials | undefined;
      if (materials) {
        for (const material of materials) {
          material.emissiveIntensity = THREE.MathUtils.lerp(
            material.emissiveIntensity,
            isActive ? 0.6 : 0,
            k
          );
        }
      }
    }

    invalidate();
  });
}

/** Collects the tintable materials of a part. */
function collectMaterials(node: THREE.Group): PartMaterials {
  const materials: PartMaterials = [];

  node.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;

    const material = mesh.material as THREE.MeshStandardMaterial | undefined;
    if (material && "emissiveIntensity" in material) {
      materials.push(material);
    }
  });

  return materials;
}

/**
 * The earbud, drawn from primitives. This is the fallback that runs whenever
 * the GLB is not available.
 */
function PrimitiveEarbud({
  activePart,
  visible,
  theme,
}: EarbudProps & { theme: Theme }) {
  const parts = useRef<Record<string, THREE.Group | null>>({});
  const root = useRef<THREE.Group>(null);

  const distances = useMemo(() => {
    const map: Record<string, THREE.Vector3> = {};
    for (const part of TECH_PARTS) {
      map[part.mesh] = new THREE.Vector3(...part.explode).multiplyScalar(
        TECH3D.explodeDistance
      );
    }
    return map;
  }, []);

  useExplode(parts, activePart.mesh, visible);

  useFrame((_, delta) => {
    if (!visible || !root.current) return;
    const k = damp(delta);
    const target = new THREE.Euler(...activePart.rotation);
    root.current.rotation.x = THREE.MathUtils.lerp(
      root.current.rotation.x,
      target.x,
      k
    );
    root.current.rotation.y = THREE.MathUtils.lerp(
      root.current.rotation.y,
      target.y,
      k
    );
    root.current.rotation.z = THREE.MathUtils.lerp(
      root.current.rotation.z,
      target.z,
      k
    );
  });

  const register = (name: string) => (node: THREE.Group | null) => {
    if (node) {
      if (!node.userData.home) {
        node.userData.home = node.position.clone();
        node.userData.explode = distances[name];
      }
      if (!node.userData.materials) {
        node.userData.materials = collectMaterials(node);
      }
    }
    parts.current[name] = node;
  };

  return (
    <group ref={root} scale={TECH3D.scale}>
      {/* Shell */}
      <group name="Shell" ref={register("Shell")}>
        <mesh position={[0, 0.06, 0]} scale={[0.86, 1, 0.8]}>
          <sphereGeometry args={[0.46, 64, 64]} />
          <meshPhysicalMaterial
            color={theme.ivory}
            metalness={0.18}
            roughness={0.34}
            clearcoat={0.7}
            clearcoatRoughness={0.28}
          />
        </mesh>

        {/* Stem */}
        <mesh position={[0, -0.44, -0.02]} rotation={[0.12, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.055, 0.62, 32]} />
          <meshPhysicalMaterial
            color={theme.ivory}
            metalness={0.18}
            roughness={0.34}
            clearcoat={0.7}
            clearcoatRoughness={0.28}
          />
        </mesh>

        {/* Champagne band */}
        <mesh position={[0, 0.04, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.018, 16, 64]} />
          <meshStandardMaterial
            color={theme.gold}
            metalness={1}
            roughness={0.24}
          />
        </mesh>
      </group>

      {/* Silicone tip */}
      <group name="Tip" ref={register("Tip")}>
        <mesh position={[0, 0.1, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.15, 0.26, 32]} />
          <meshStandardMaterial
            color={theme.ivory}
            metalness={0}
            roughness={0.82}
          />
        </mesh>
      </group>

      {/* Driver */}
      <group name="Driver" ref={register("Driver")}>
        <mesh position={[0, 0.06, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.1, 48]} />
          <meshStandardMaterial
            color={theme.gold}
            metalness={0.85}
            roughness={0.32}
            emissive={theme.gold}
            emissiveIntensity={0}
          />
        </mesh>
      </group>

      {/* Cell */}
      <group name="Cell" ref={register("Cell")}>
        <mesh position={[0, -0.02, -0.04]}>
          <boxGeometry args={[0.38, 0.26, 0.14]} />
          <meshStandardMaterial
            color={theme.gold}
            metalness={0.6}
            roughness={0.4}
            emissive={theme.gold}
            emissiveIntensity={0}
          />
        </mesh>
      </group>

      {/* Radio */}
      <group name="Chip" ref={register("Chip")}>
        <mesh position={[0.04, -0.2, 0.1]}>
          <boxGeometry args={[0.26, 0.18, 0.04]} />
          <meshStandardMaterial
            color={theme.gold}
            metalness={0.7}
            roughness={0.35}
            emissive={theme.gold}
            emissiveIntensity={0}
          />
        </mesh>
      </group>

      {/* Microphone array */}
      <group name="MicArray" ref={register("MicArray")}>
        {(
          [
            [-0.16, -0.3, -0.22],
            [0.16, -0.3, -0.22],
            [0, -0.34, -0.3],
          ] as [number, number, number][]
        ).map((position, index) => (
          <mesh key={index} position={position}>
            <sphereGeometry args={[0.036, 24, 24]} />
            <meshStandardMaterial
              color={theme.gold}
              metalness={0.9}
              roughness={0.28}
              emissive={theme.gold}
              emissiveIntensity={0}
            />
          </mesh>
        ))}
      </group>

      {/* Noise control */}
      <group name="NoiseControl" ref={register("NoiseControl")}>
        <mesh position={[-0.16, -0.16, 0.06]}>
          <boxGeometry args={[0.16, 0.12, 0.04]} />
          <meshStandardMaterial
            color={theme.gold}
            metalness={0.75}
            roughness={0.33}
            emissive={theme.gold}
            emissiveIntensity={0}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * The earbud, drawn from a GLB. Each PartSpec maps onto a named node.
 */
function EarbudModel({
  activePart,
  visible,
  theme,
}: EarbudProps & { theme: Theme }) {
  const { scene } = useGLTF(MODEL_URL);
  const clone = useMemo(() => scene.clone(true), [scene]);
  const root = useRef<THREE.Group>(null);
  const parts = useRef<Record<string, THREE.Group | null>>({});

  const distances = useMemo(() => {
    const map: Record<string, THREE.Vector3> = {};
    for (const part of TECH_PARTS) {
      map[part.mesh] = new THREE.Vector3(...part.explode).multiplyScalar(
        TECH3D.explodeDistance
      );
    }
    return map;
  }, []);

  // Map each PartSpec onto its named node inside the model
  useEffect(() => {
    const found: Record<string, THREE.Group | null> = {};

    clone.traverse((object) => {
      if (!object.name) return;

      const spec = TECH_PARTS.find((part) => part.mesh === object.name);
      if (!spec) return;

      const group = object as THREE.Group;
      group.userData.home = group.position.clone();
      group.userData.explode = distances[spec.mesh];

      const materials: PartMaterials = [];
      group.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;

        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(theme.gold),
          metalness: 0.85,
          roughness: 0.3,
          emissive: new THREE.Color(theme.gold),
          emissiveIntensity: 0,
        });

        mesh.material = material;
        materials.push(material);
      });

      group.userData.materials = materials;
      found[spec.mesh] = group;
    });

    parts.current = found;
  }, [clone, distances, theme]);

  useExplode(parts, activePart.mesh, visible);

  useFrame((_, delta) => {
    if (!visible || !root.current) return;
    const k = damp(delta);
    const target = new THREE.Euler(...activePart.rotation);
    root.current.rotation.x = THREE.MathUtils.lerp(
      root.current.rotation.x,
      target.x,
      k
    );
    root.current.rotation.y = THREE.MathUtils.lerp(
      root.current.rotation.y,
      target.y,
      k
    );
    root.current.rotation.z = THREE.MathUtils.lerp(
      root.current.rotation.z,
      target.z,
      k
    );
  });

  return (
    <group ref={root} scale={TECH3D.scale}>
      <primitive object={clone} />
    </group>
  );
}

/**
 * The earbud. Uses the GLB when it is present and falls back to the
 * primitive build when it is not.
 */
export default function Earbud({ activePart, visible }: EarbudProps) {
  const theme = useThemeTokens();
  const [modelAvailable, setModelAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(MODEL_URL, { method: "HEAD" })
      .then((response) => {
        if (!cancelled) setModelAvailable(response.ok);
      })
      .catch(() => {
        if (!cancelled) setModelAvailable(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!theme || modelAvailable === null) return null;

  if (!modelAvailable) {
    return (
      <PrimitiveEarbud
        activePart={activePart}
        visible={visible}
        theme={theme}
      />
    );
  }

  return (
    <EarbudModel activePart={activePart} visible={visible} theme={theme} />
  );
}
