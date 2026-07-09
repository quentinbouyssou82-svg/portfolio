import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { APEX_DURATION, APEX_EASE, APEX_SCROLL } from "@/lib/apex-advisory/motion";
import { initTimelineScroll } from "@/lib/apex-advisory/timeline-scroll";

let registered = false;

function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

const REVEAL_FROM = { opacity: 0, y: APEX_SCROLL.revealY };
const REVEAL_TO = { opacity: 1, y: 0, duration: APEX_DURATION.base, ease: APEX_EASE.out };

function isAlreadyRevealed(el: HTMLElement) {
  return (
    el.hasAttribute("data-ax-reveal") ||
    el.hasAttribute("data-ax-stagger-item") ||
    el.closest("[data-ax-stagger]") !== null ||
    el.closest("[data-ax-headline]") !== null ||
    el.closest("[data-ax-headline-words]") !== null
  );
}

export function initApexScrollStory(root: HTMLElement, reduced: boolean) {
  registerGsap();

  root.classList.add("ax-story-ready");

  const cleanups: Array<() => void> = [];

  const ctx = gsap.context(() => {
    const reset = root.querySelectorAll<HTMLElement>(
      "[data-ax-reveal], [data-ax-line], [data-ax-word], [data-ax-stagger-item], .ax-story-focus",
    );

    if (reduced) {
      gsap.set(reset, { opacity: 1, y: 0, clearProps: "transform" });
      gsap.set(root.querySelectorAll("[data-ax-keyword]"), { "--ax-emphasis": 1 });
      gsap.set(root.querySelectorAll("[data-ax-gold-scroll]"), { "--ax-gold-progress": 1 });
      gsap.set(root.querySelectorAll("[data-ax-hero-headline]"), { "--ax-hero-scroll": 0 });
      gsap.set(root.querySelectorAll("[data-ax-visual-reveal]"), {
        opacity: 1,
        y: 0,
        scale: 1,
        clearProps: "transform",
      });
    }

    root.querySelectorAll<HTMLElement>("[data-ax-story-section]").forEach((section) => {
      if (section.id === "hero" || reduced) return;

      const focus = section.querySelector<HTMLElement>(".ax-story-focus");
      if (!focus) return;

      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: APEX_SCROLL.scrubSection,
        },
      })
        .fromTo(
          focus,
          { opacity: 0.72, y: 12 },
          { opacity: 1, y: 0, ease: APEX_EASE.luxury, duration: 0.42 },
          0.1,
        )
        .to(focus, { opacity: 1, y: 0, duration: 0.38 }, 0.5)
        .to(focus, { opacity: 0.78, y: -6, ease: APEX_EASE.inOutSoft, duration: 0.38 }, 0.72);
    });

    if (!reduced) {
      root.querySelectorAll<HTMLElement>("[data-ax-reveal]").forEach((el) => {
        gsap.fromTo(el, REVEAL_FROM, {
          ...REVEAL_TO,
          scrollTrigger: {
            trigger: el,
            start: APEX_SCROLL.revealStart,
            toggleActions: "play none none reverse",
          },
        });
      });

      root.querySelectorAll<HTMLElement>("[data-ax-stagger]").forEach((group) => {
        const items = group.querySelectorAll<HTMLElement>("[data-ax-stagger-item]");
        if (!items.length) return;

        gsap.fromTo(items, REVEAL_FROM, {
          ...REVEAL_TO,
          stagger: APEX_SCROLL.revealStagger,
          scrollTrigger: {
            trigger: group,
            start: APEX_SCROLL.revealStaggerStart,
            toggleActions: "play none none reverse",
          },
        });
      });

      root.querySelectorAll<HTMLElement>("[data-ax-headline]").forEach((headline) => {
        const lines = headline.querySelectorAll<HTMLElement>("[data-ax-line]");
        if (!lines.length) return;

        gsap.fromTo(lines, REVEAL_FROM, {
          opacity: 1,
          y: 0,
          duration: APEX_DURATION.fast,
          stagger: APEX_SCROLL.headlineStagger,
          ease: APEX_EASE.out,
          scrollTrigger: {
            trigger: headline,
            start: APEX_SCROLL.headlineStart,
            toggleActions: "play none none reverse",
          },
        });
      });

      root.querySelectorAll<HTMLElement>("[data-ax-headline-words]").forEach((headline) => {
        const words = headline.querySelectorAll<HTMLElement>("[data-ax-word]");
        if (!words.length) return;

        gsap.fromTo(words, REVEAL_FROM, {
          opacity: 1,
          y: 0,
          duration: APEX_DURATION.fast,
          stagger: APEX_SCROLL.wordStagger,
          ease: APEX_EASE.out,
          scrollTrigger: {
            trigger: headline,
            start: APEX_SCROLL.headlineStart,
            toggleActions: "play none none reverse",
          },
        });
      });

      root.querySelectorAll<HTMLElement>("[data-ax-story-section] .ax-body").forEach((el) => {
        if (!(el instanceof HTMLElement) || isAlreadyRevealed(el)) return;

        gsap.fromTo(el, REVEAL_FROM, {
          ...REVEAL_TO,
          duration: APEX_DURATION.fast,
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        });
      });

      root.querySelectorAll<HTMLElement>("[data-ax-keyword]").forEach((el) => {
        gsap.fromTo(
          el,
          { "--ax-emphasis": 0 },
          {
            "--ax-emphasis": 1,
            ease: APEX_EASE.inOutSoft,
            scrollTrigger: {
              trigger: el,
              start: APEX_SCROLL.keywordStart,
              end: "center center",
              scrub: APEX_SCROLL.scrubKeyword,
            },
          },
        );
      });

      root.querySelectorAll<HTMLElement>("[data-ax-gold-scroll]").forEach((el) => {
        if (el.classList.contains("ax-gold-text") || el.hasAttribute("data-ax-keyword")) return;
        if (el.closest("[data-ax-hero-headline]")) return;

        gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: APEX_SCROLL.goldScrollStart,
            end: APEX_SCROLL.goldScrollEnd,
            scrub: APEX_SCROLL.scrubGold,
          },
        })
          .fromTo(
            el,
            { "--ax-gold-progress": 0 },
            { "--ax-gold-progress": 1, ease: "none", duration: 0.48 },
            0,
          )
          .to(el, { "--ax-gold-progress": 0.3, ease: "none", duration: 0.52 }, 0.48);
      });

      root.querySelectorAll<HTMLElement>("[data-ax-hero-headline]").forEach((headline) => {
        const heroSection = headline.closest("#hero") ?? headline;

        gsap.fromTo(
          headline,
          { "--ax-hero-scroll": 0 },
          {
            "--ax-hero-scroll": 1,
            ease: "none",
            scrollTrigger: {
              trigger: heroSection,
              start: "top top",
              end: "bottom 38%",
              scrub: APEX_SCROLL.scrubParallax,
            },
          },
        );

        headline.querySelectorAll<HTMLElement>("[data-ax-gold-scroll]").forEach((el) => {
          if (el.classList.contains("ax-gold-text") || el.hasAttribute("data-ax-keyword")) return;

          gsap.timeline({
            scrollTrigger: {
              trigger: heroSection,
              start: APEX_SCROLL.goldScrollStart,
              end: APEX_SCROLL.goldScrollEnd,
              scrub: APEX_SCROLL.scrubGold,
            },
          })
            .fromTo(
              el,
              { "--ax-gold-progress": 0 },
              { "--ax-gold-progress": 1, ease: "none", duration: 0.42 },
              0,
            )
            .to(
              el,
              { "--ax-gold-progress": APEX_SCROLL.heroGoldRest, ease: "none", duration: 0.58 },
              0.42,
            );
        });

        headline.querySelectorAll<HTMLElement>(".ax-hero-accent").forEach((el) => {
          gsap.fromTo(
            el,
            { "--ax-gold-accent": 0 },
            {
              "--ax-gold-accent": 1,
              ease: APEX_EASE.inOutSoft,
              scrollTrigger: {
                trigger: heroSection,
                start: APEX_SCROLL.goldScrollStart,
                end: APEX_SCROLL.goldScrollPeak,
                scrub: APEX_SCROLL.scrubGold,
              },
            },
          );
        });
      });

      root.querySelectorAll<HTMLElement>("[data-ax-visual-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 22, scale: 0.99 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: APEX_DURATION.slow,
            ease: APEX_EASE.out,
            scrollTrigger: {
              trigger: el,
              start: APEX_SCROLL.visualStart,
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      root.querySelectorAll<HTMLElement>("[data-ax-visual-parallax]").forEach((el) => {
        const inner =
          el.querySelector<HTMLElement>(
            ".ax-visual__inner, .ax-hero-abstract__inner, .ax-photo-layer__inner",
          ) ?? el;
        gsap.fromTo(
          inner,
          { y: "-5%" },
          {
            y: "5%",
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("[data-ax-story-section]") ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: APEX_SCROLL.scrubParallax,
            },
          },
        );
      });
    }

    root.querySelectorAll<HTMLElement>("[data-ax-timeline]").forEach((timeline) => {
      const cleanup = initTimelineScroll(timeline, reduced);
      if (cleanup) cleanups.push(cleanup);
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, root);

  return () => {
    cleanups.forEach((fn) => fn());
    ctx.revert();
    root.classList.remove("ax-story-ready");
  };
}
