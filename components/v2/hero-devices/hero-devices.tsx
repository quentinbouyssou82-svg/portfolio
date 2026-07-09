"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { usePrefersReducedMotion } from "@/hooks/use-motion-prefs";
import {
  getPhoneScreenConfig,
  PHONE_SCREEN_DARK,
  PHONE_SCREEN_LIGHT,
} from "./hero-devices-assets";
import { HeroDevicesFallback } from "./hero-devices-fallback";

const MODEL_PATH = "/models/iphone-scene-black-transformed.glb";

useGLTF.preload(MODEL_PATH);
useTexture.preload(PHONE_SCREEN_LIGHT);
useTexture.preload(PHONE_SCREEN_DARK);

const HeroDevicesCanvas = dynamic(
  () => import("./hero-devices-canvas").then((m) => m.HeroDevicesCanvas),
  {
    ssr: false,
    loading: () => null,
  },
);

function useHeroScrollRotation() {
  const scrollRotationRef = useRef(0);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const update = () => {
      const rect = hero.getBoundingClientRect();
      const h = hero.offsetHeight || 1;
      const scrolled = Math.min(1, Math.max(0, -rect.top / (h * 0.85)));
      scrollRotationRef.current = scrolled;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return scrollRotationRef;
}

export function HeroDevices({ theme }: { theme: "dark" | "light" }) {
  const reduced = usePrefersReducedMotion();
  const [canRenderWebGL, setCanRenderWebGL] = useState(false);
  const scrollRotationRef = useHeroScrollRotation();
  const screen = getPhoneScreenConfig(theme);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl");
      setCanRenderWebGL(Boolean(gl));
    } catch {
      setCanRenderWebGL(false);
    }
  }, []);

  const showCanvas = canRenderWebGL && !reduced;

  return (
    <div className="v2-devices-stage">
      {showCanvas ? (
        <Suspense fallback={<HeroDevicesFallback screen={screen} />}>
          <HeroDevicesCanvas
            key={theme}
            scrollRotationRef={scrollRotationRef}
            screen={screen}
          />
        </Suspense>
      ) : (
        <HeroDevicesFallback screen={screen} />
      )}
    </div>
  );
}
