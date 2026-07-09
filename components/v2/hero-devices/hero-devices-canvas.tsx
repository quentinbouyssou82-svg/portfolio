"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, type RefObject } from "react";
import { HeroDevicesScene } from "./hero-devices-scene";
import type { PhoneScreenConfig } from "./hero-devices-assets";

type HeroDevicesCanvasProps = {
  scrollRotationRef: RefObject<number>;
  screen: PhoneScreenConfig;
};

/** Force R3F to match container after grid layout settles. */
function CanvasResizeSync() {
  const invalidate = useThree((s) => s.invalidate);
  const setSize = useThree((s) => s.setSize);

  useEffect(() => {
    const stage = document.querySelector(".v2-devices-stage");
    if (!stage) return;

    const sync = () => {
      const { width, height } = stage.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setSize(width, height);
        invalidate();
      }
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(stage);
    window.addEventListener("resize", sync, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [invalidate, setSize]);

  return null;
}

export function HeroDevicesCanvas({ scrollRotationRef, screen }: HeroDevicesCanvasProps) {
  return (
    <Canvas
      className="v2-devices-canvas"
      camera={{ position: [0, 0, 5.2], fov: 28, near: 0.1, far: 40 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <CanvasResizeSync />
      <HeroDevicesScene scrollRotationRef={scrollRotationRef} screen={screen} />
    </Canvas>
  );
}
