/** Premium easing curves — agency motion design (mirrors CSS --ax-ease-* tokens) */
export const APEX_EASE = {
  out: "power3.out",
  outSoft: "power2.out",
  outExpo: "expo.out",
  inOut: "power2.inOut",
  inOutSoft: "power1.inOut",
  cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
  luxury: "power2.out",
} as const;

export const APEX_DURATION = {
  fast: 0.72,
  base: 0.95,
  slow: 1.2,
  cinematic: 1.6,
} as const;

/** ScrollTrigger tuning — higher scrub = smoother, less jerky */
export const APEX_SCROLL = {
  scrubSection: 1.15,
  scrubParallax: 1.05,
  scrubKeyword: 0.85,
  scrubGold: 1.35,
  scrubTimeline: 0.72,
  goldScrollStart: "top 86%",
  goldScrollPeak: "center center",
  goldScrollEnd: "bottom 18%",
  revealStart: "top 88%",
  revealStaggerStart: "top 85%",
  headlineStart: "top 86%",
  keywordStart: "top 82%",
  visualStart: "top 86%",
  revealY: 14,
  revealStagger: 0.08,
  headlineStagger: 0.1,
  wordStagger: 0.04,
  heroParallaxY: 14,
  heroParallaxScale: 0.024,
  heroGoldRest: 0.42,
} as const;
