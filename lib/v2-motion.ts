/** Motion tokens V2 — easing & durées unifiés sur tout le site. */
export const V2_EASE = [0.22, 1, 0.36, 1] as const;

export const V2_MOTION = {
  duration: {
    fast: 0.2,
    normal: 0.32,
    slow: 0.4,
    reveal: 0.4,
  },
  delay: {
    step1: 0.04,
    step2: 0.08,
    step3: 0.12,
    step4: 0.16,
    step5: 0.2,
    step6: 0.24,
  },
} as const;
