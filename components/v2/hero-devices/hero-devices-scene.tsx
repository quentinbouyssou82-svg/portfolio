"use client";

import { Center, Environment } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import type { Group } from "three";
import { HeroIPhoneModel } from "./hero-iphone-model";
import type { PhoneScreenConfig } from "./hero-devices-assets";

/** Portrait, écran face caméra — GLB Pirmin Huber */
const PHONE_ROTATION: [number, number, number] = [
  Math.PI/2,
  Math.PI/-2,
  Math.PI / 2,
];

type HeroPhoneRigProps = {
  scrollRotationRef: RefObject<number>;
  screen: PhoneScreenConfig;
};

function HeroPhoneRig({ scrollRotationRef, screen }: HeroPhoneRigProps) {
  const rig = useRef<Group>(null);
  const smoothScroll = useRef(0);
  const viewport = useThree((s) => s.viewport);

  const fitScale = Math.min(viewport.width * 0.32, viewport.height * 0.52);

  useFrame(() => {
    const g = rig.current;
    if (!g) return;

    const target = scrollRotationRef.current ?? 0;
    smoothScroll.current += (target - smoothScroll.current) * 0.08;

    // Axe X (1er) : au scroll, le haut du téléphone bascule vers le bas
    g.rotation.x = smoothScroll.current *-5;
    g.rotation.y = smoothScroll.current *2;
    g.rotation.z = smoothScroll.current *0;
  });

  return (
    <group position={[0, -0.05, 0]}>
      <group ref={rig} scale={fitScale}>
        <Center>
          <group rotation={PHONE_ROTATION}>
            <HeroIPhoneModel key={`${screen.src}-${screen.inset}`} screen={screen} />
          </group>
        </Center>
      </group>
    </group>
  );
}

type HeroDevicesSceneProps = {
  scrollRotationRef: RefObject<number>;
  screen: PhoneScreenConfig;
};

export function HeroDevicesScene({ scrollRotationRef, screen }: HeroDevicesSceneProps) {
  return (
    <>
      <Environment preset="studio" environmentIntensity={0.16} />

      <ambientLight intensity={0.2} />
      <directionalLight position={[2, 2.5, 4]} intensity={0.55} />
      <directionalLight position={[-2, 1, 2.5]} intensity={0.45} color="#fff8ee" />
      <spotLight
        position={[-1.5, 2, 3]}
        angle={0.4}
        penumbra={1}
        intensity={0.4}
        color="#c9a962"
      />

      <HeroPhoneRig scrollRotationRef={scrollRotationRef} screen={screen} />
    </>
  );
}
