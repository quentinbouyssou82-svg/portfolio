"use client";

import { useState } from "react";
import { FOOD_IMAGE_PLACEHOLDER } from "@/lib/maison/foods/food-image-map";

type Props = {
  src: string;
  name: string;
  className?: string;
};

/** Illustration Fluent Emoji 3D locale — fallback placeholder même style. */
export function FoodCardImage({ src, name, className = "" }: Props) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- assets statiques locaux 3D
    <img
      src={imgSrc}
      alt={name}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (imgSrc !== FOOD_IMAGE_PLACEHOLDER) {
          setImgSrc(FOOD_IMAGE_PLACEHOLDER);
        }
      }}
      className={`absolute inset-0 h-full w-full object-contain p-2 drop-shadow-sm ${className}`}
    />
  );
}
