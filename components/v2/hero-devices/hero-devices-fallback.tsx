"use client";

import Image from "next/image";
import type { PhoneScreenConfig } from "./hero-devices-assets";

type HeroDevicesFallbackProps = {
  screen: PhoneScreenConfig;
};

/** Fallback statique — iPhone centré. */
export function HeroDevicesFallback({ screen }: HeroDevicesFallbackProps) {
  const insetPct = `${screen.inset * 100}%`;

  return (
    <div className="v2-devices-fallback" aria-hidden>
      <div className="v2-devices-fallback-phone">
        <div className="v2-devices-fallback-phone-body">
          <div className="v2-devices-fallback-phone-notch" />
          <div className="v2-devices-fallback-phone-screen">
            <div
              className="absolute inset-0 m-auto bg-black"
              style={{ width: insetPct, height: insetPct }}
            >
              <Image
                src={screen.src}
                alt=""
                fill
                className="object-contain object-center"
                sizes="(max-width: 768px) 200px, 280px"
                quality={95}
                priority
              />
            </div>
          </div>
        </div>
        <div className="v2-devices-fallback-phone-shadow" />
      </div>
    </div>
  );
}
