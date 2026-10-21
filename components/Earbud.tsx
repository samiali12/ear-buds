"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { ALL_PARTS, MODEL_URL, TECH3D, type PartSpec } from "@/lib/tech3d";
import { useThemeTokens, type ThemeTokens } from "@/lib/theme";

interface EarbudProps {
  /** The part currently being presented */
  activePart: PartSpec;
  /** Whether the section is on screen — the scene stops rendering otherwise */
  visible: boolean;
}

type Theme = ThemeTokens;
type PartMap = Map<string, THREE.Group>;
type PartMaterials = THREE.MeshStandardMaterial[];

/** Parts that only exist while they are the presented one. */
const REVEAL_MESHES = new Set(
  ALL_PARTS.filter((part) => part.reveal).map((part) => part.mesh)
);

const KNOWN_MESHES = new Set(ALL_PARTS.map((part) => part.mesh));

/** Frame-rate independent damping factor. */
function damp(delta: number) {
  return 1 - Math.exp(-TECH3D.damping * delta);
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
 * Indexes the named parts of the model so each one can be driven.
 */
function useIndexParts(
  rootRef: React.RefObject<THREE.Group | null>,
  partsRef: React.MutableRefObject<PartMap>,
  theme: Theme | null
) {
  useEffect(() => {
    const index: PartMap = new Map();

    rootRef.current?.traverse((object) => {
      const group = object as THREE.Group;
      if (!group.name) return;
      if (!KNOWN_MESHES.has(group.name)) return;
      if (index.has(group.name)) return;

      group.userData.home = group.position.clone();
      group.userData.materials = collectMaterials(group);
      group.userData.reveal = REVEAL_MESHES.has(group.name);

      if (group.userData.reveal) {
        group.scale.setScalar(0);
      }

      index.set(group.name, group);
    });

    partsRef.current = index;
  }, [rootRef, partsRef, theme]);
}

/**
 * Drives every part towards its presented or resting position.
 * The scene only renders while it is on screen.
 */
function useExplode(
  partsRef: React.MutableRefObject<PartMap>,
  activePart: PartSpec,
  visible: boolean
) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [activePart, visible, invalidate]);

  useFrame((_, delta) => {
    if (!visible) return;

    const k = damp(delta);
    const distance = new THREE.Vector3(...activePart.explode).multiplyScalar(
      TECH3D.explodeDistance
    );

    for (const [name, node] of partsRef.current) {
      const home = node.userData.home as THREE.Vector3 | undefined;
      if (!home) continue;

      const isActive = name === activePart.mesh;
      const goal = isActive ? home.clone().add(distance) : home;

      node.position.lerp(goal, k);

      if (node.userData.reveal) {
        const scale = THREE.MathUtils.lerp(node.scale.x, isActive ? 1 : 0, k);
        node.scale.setScalar(scale);
      }

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

/** Shared animation for both the primitive and the GLB build. */
function usePresentation(
  rootRef: React.RefObject<THREE.Group | null>,
  partsRef: React.MutableRefObject<PartMap>,
  activePart: PartSpec,
  visible: boolean
) {
  useExplode(partsRef, activePart, visible);

  useFrame((_, delta) => {
    if (!visible || !rootRef.current) return;

    const k = damp(delta);
    const target = new THREE.Euler(...activePart.rotation);

    rootRef.current.rotation.x = THREE.MathUtils.lerp(
      rootRef.current.rotation.x,
      target.x,
      k
    );
    rootRef.current.rotation.y = THREE.MathUtils.lerp(
      rootRef.current.rotation.y,
      target.y,
      k
    );
    rootRef.current.rotation.z = THREE.MathUtils.lerp(
      rootRef.current.rotation.z,
      target.z,
      k
    );
  });
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
  const rootRef = useRef<THREE.Group>(null);
  const partsRef = useRef<PartMap>(new Map());

  useIndexParts(rootRef, partsRef, theme);
  usePresentation(rootRef, partsRef, activePart, visible);

  return (
    <group ref={rootRef} scale={TECH3D.scale}>
      {/* Shell */}
      <group name="Shell">
        <mesh position={[0, 0.06, 0]} scale={[0.78, 1, 0.74]}>
          <sphereGeometry args={[0.4, 64, 64]} />
          <meshPhysicalMaterial
            color={theme.ivory}
            metalness={0.18}
            roughness={0.34}
            clearcoat={0.7}
            clearcoatRoughness={0.28}
            emissive={theme.gold}
            emissiveIntensity={0}
          />
        </mesh>

        {/* Stem */}
        <mesh position={[0.02, -0.42, -0.04]} rotation={[0.14, 0, 0]}>
          <cylinderGeometry args={[0.062, 0.05, 0.58, 32]} />
          <meshPhysicalMaterial
            color={theme.ivory}
            metalness={0.18}
            roughness={0.34}
            clearcoat={0.7}
            clearcoatRoughness={0.28}
            emissive={theme.gold}
            emissiveIntensity={0}
          />
        </mesh>

        {/* Champagne band */}
        <mesh position={[0, 0.02, 0.27]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.13, 0.016, 16, 64]} />
          <meshStandardMaterial
            color={theme.gold}
            metalness={1}
            roughness={0.24}
            emissive={theme.gold}
            emissiveIntensity={0}
          />
        </mesh>
      </group>

      {/* Silicone tip */}
      <group name="Tip">
        <mesh position={[0, 0.08, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.135, 0.3, 32]} />
          <meshStandardMaterial
            color={theme.ivory}
            metalness={0}
            roughness={0.82}
            emissive={theme.gold}
            emissiveIntensity={0}
          />
        </mesh>
      </group>

      {/* Seal */}
      <group name="Seal">
        <mesh position={[0, 0.08, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.14, 0.02, 16, 48]} />
          <meshStandardMaterial
            color={theme.ivory}
            metalness={0.1}
            roughness={0.7}
            emissive={theme.gold}
            emissiveIntensity={0}
          />
        </mesh>
      </group>

      {/* Driver */}
      <group name="Driver">
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
      <group name="Cell">
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
      <group name="Chip">
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

      {/* Codec board */}
      <group name="Codec">
        <mesh position={[0.08, -0.3, 0.02]} rotation={[0, 0.4, 0]}>
          <boxGeometry args={[0.22, 0.14, 0.03]} />
          <meshStandardMaterial
            color={theme.gold}
            metalness={0.65}
            roughness={0.38}
            emissive={theme.gold}
            emissiveIntensity={0}
          />
        </mesh>
      </group>

      {/* Microphone array */}
      <group name="MicArray">
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
      <group name="NoiseControl">
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

      {/* Charging case — only shown while it is the presented part */}
      <group name="Case" position={[1.05, -0.16, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.58]}>
          <capsuleGeometry args={[0.38, 0.42, 8, 40]} />
          <meshPhysicalMaterial
            color={theme.ivory}
            metalness={0.2}
            roughness={0.32}
            clearcoat={0.8}
            clearcoatRoughness={0.25}
            emissive={theme.gold}
            emissiveIntensity={0}
          />
        </mesh>
        <mesh position={[0, 0.02, 0.215]}>
          <boxGeometry args={[0.62, 0.012, 0.01]} />
          <meshStandardMaterial
            color={theme.gold}
            metalness={1}
            roughness={0.24}
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
  const rootRef = useRef<THREE.Group>(null);
  const partsRef = useRef<PartMap>(new Map());

  useIndexParts(rootRef, partsRef, theme);
  usePresentation(rootRef, partsRef, activePart, visible);

  return (
    <group ref={rootRef} scale={TECH3D.scale}>
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
