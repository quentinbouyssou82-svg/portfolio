"use client";

/**
 * iPhone 14 GLB — modèle de Pirmin Huber, via
 * https://github.com/Mornieur/3d-iphone-website-threejs
 */
import { useGLTF, useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import {
  Color,
  LinearFilter,
  MeshPhysicalMaterial,
  SRGBColorSpace,
  type Mesh,
} from "three";
import type { PhoneScreenConfig } from "./hero-devices-assets";
import type { GLTF } from "three-stdlib";

const MODEL_PATH = "/models/iphone-scene-black-transformed.glb";

type IPhoneGLTF = GLTF & {
  nodes: {
    Object_4: Mesh;
    Object_6: Mesh;
    Object_40: Mesh;
  };
  materials: {
    PaletteMaterial001: MeshPhysicalMaterial;
    PaletteMaterial002: MeshPhysicalMaterial;
    Screen: MeshPhysicalMaterial;
  };
};

type HeroIPhoneModelProps = {
  screen: PhoneScreenConfig;
};

export function HeroIPhoneModel({ screen }: HeroIPhoneModelProps) {
  const { nodes, materials } = useGLTF(MODEL_PATH) as IPhoneGLTF;
  const screenTexture = useTexture(screen.src);

  useEffect(() => {
    screenTexture.colorSpace = SRGBColorSpace;
    screenTexture.minFilter = LinearFilter;
    screenTexture.magFilter = LinearFilter;
    screenTexture.anisotropy = 16;
    screenTexture.needsUpdate = true;
  }, [screenTexture, screen.src]);

  const bodyMaterial = useMemo(() => {
    const mat = materials.PaletteMaterial001.clone();
    mat.envMapIntensity = 0.35;
    mat.roughness = Math.min(1, mat.roughness + 0.12);
    mat.needsUpdate = true;
    return mat;
  }, [materials.PaletteMaterial001]);

  const frameMaterial = useMemo(() => {
    const mat = materials.PaletteMaterial002.clone();
    mat.envMapIntensity = 0.3;
    mat.roughness = Math.min(1, mat.roughness + 0.15);
    mat.needsUpdate = true;
    return mat;
  }, [materials.PaletteMaterial002]);

  const screenMaterial = useMemo(() => {
    const mat = materials.Screen.clone();
    mat.map = screenTexture;
    mat.emissiveMap = screenTexture;
    mat.color = new Color("#ffffff");
    mat.emissive = new Color("#ffffff");
    mat.emissiveIntensity = 1;
    mat.metalness = 0;
    mat.roughness = 1;
    mat.envMapIntensity = 0;
    mat.clearcoat = 0;
    mat.toneMapped = false;
    mat.needsUpdate = true;
    return mat;
  }, [materials.Screen, screenTexture]);

  const s = screen.inset;

  return (
    <group dispose={null}>
      <mesh
        geometry={nodes.Object_4.geometry}
        material={bodyMaterial}
        position={[-0.051, 1.249, -0.131]}
        rotation={[0, 0, -Math.PI / 2]}
        scale={[0.181, 0.177, 0.181]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={nodes.Object_6.geometry}
        material={frameMaterial}
        position={[-0.142, 1.25, -0.131]}
        rotation={[0, 0, -Math.PI / 2]}
        scale={[0.144, 0.026, 0.144]}
        castShadow
      />
      <group
        position={[0.121, 0.948, 0]}
        rotation={[-Math.PI, 0, 0]}
        scale={[-0.205 * s, 0.829 * s, 0.854]}
      >
        <mesh geometry={nodes.Object_40.geometry} material={screenMaterial} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
