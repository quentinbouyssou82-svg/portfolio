/**
 * Driveely landing — minimal client runtime (~2.5KB).
 * Scroll-scrub hero video, scroll reveals, nav + sticky CTA.
 * No framework hydration gap.
 */
(function initDriveelyLanding() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nav = document.querySelector("[data-site-nav]");
  if (nav) {
    let scrolled = window.scrollY > 10;
    nav.classList.toggle("is-scrolled", scrolled);
    window.addEventListener(
      "scroll",
      () => {
        const next = window.scrollY > 10;
        if (next === scrolled) return;
        scrolled = next;
        nav.classList.toggle("is-scrolled", next);
      },
      { passive: true },
    );
  }

  const reveals = document.querySelectorAll("[data-reveal]");
  if (reveals.length) {
    if (reduced) {
      reveals.forEach((el) => el.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        },
        { rootMargin: "-8% 0px", threshold: 0 },
      );
      reveals.forEach((el) => io.observe(el));
    }
  }

  const hero = document.querySelector("[data-site-hero]");
  const sticky = document.querySelector("[data-site-sticky-cta]");
  if (hero && sticky) {
    const io = new IntersectionObserver(
      ([entry]) => {
        const show = !entry.isIntersecting;
        sticky.classList.toggle("is-visible", show);
        sticky.setAttribute("aria-hidden", show ? "false" : "true");
      },
      { threshold: 0.12, rootMargin: "-48px 0px 0px 0px" },
    );
    io.observe(hero);
  }

  // ── Hero video: scroll-scrub (not autoplay) ──────────────────────────────
  // Top of page / hero fully in view → t=0. Hero scrolled past → t=duration.
  // Video stays paused; currentTime is driven by scroll via rAF lerp.
  const video = document.querySelector(".hero-bg-video");
  const poster = document.querySelector(".hero-bg-poster");
  if (!video || !hero || reduced) return;

  const src = video.getAttribute("data-src");
  if (!src) return;

  let duration = 0;
  let targetTime = 0;
  let displayTime = 0;
  let rafId = 0;
  let ready = false;
  let attached = false;
  let unlocking = false;

  const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

  /** Progress 0→1 as the hero scrolls from top-of-page to fully off-screen. */
  const scrollProgress = () => {
    const rect = hero.getBoundingClientRect();
    const range = Math.max(1, rect.height);
    return clamp01(-rect.top / range);
  };

  const markReady = () => {
    if (ready) return;
    ready = true;
    video.classList.add("is-ready", "is-playing");
    poster?.classList.add("is-hidden");
    scheduleScrub();
  };

  const applyTime = (t) => {
    if (!Number.isFinite(t) || video.readyState < 1) return;
    try {
      // Keep paused — scrubbing while playing causes stuck/paused races on iOS.
      if (!video.paused) video.pause();
      if (Math.abs(video.currentTime - t) > 0.016) {
        video.currentTime = t;
      }
    } catch (_) {
      /* seek not ready yet */
    }
  };

  const tick = () => {
    rafId = 0;
    if (!duration) return;

    const delta = targetTime - displayTime;
    if (Math.abs(delta) < 0.012) {
      displayTime = targetTime;
      applyTime(displayTime);
      return;
    }

    // Short lerp = smooth without lagging behind fast scrolls.
    displayTime += delta * 0.42;
    applyTime(displayTime);
    rafId = requestAnimationFrame(tick);
  };

  const scheduleScrub = () => {
    if (!duration) return;
    targetTime = scrollProgress() * duration;
    if (!rafId) rafId = requestAnimationFrame(tick);
  };

  const unlockSeek = () => {
    if (unlocking || !Number.isFinite(duration) || duration <= 0) return;
    unlocking = true;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const done = () => {
      try {
        video.pause();
      } catch (_) {}
      displayTime = scrollProgress() * duration;
      targetTime = displayTime;
      applyTime(displayTime);
      // Fade in only once a frame is available (avoid black flash).
      if (video.readyState >= 2) markReady();
      else video.addEventListener("loadeddata", markReady, { once: true });
    };

    const p = video.play();
    if (p && typeof p.then === "function") {
      p.then(done).catch(done);
    } else {
      done();
    }
  };

  const onMeta = () => {
    const d = video.duration;
    if (!Number.isFinite(d) || d <= 0) return;
    duration = d;
    unlockSeek();
  };

  const attachVideo = () => {
    if (attached) return;
    attached = true;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = false;
    video.removeAttribute("loop");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("muted", "");
    video.preload = "auto";

    if (!video.querySelector("source")) {
      const source = document.createElement("source");
      source.src = src;
      source.type = "video/mp4";
      video.appendChild(source);
    }

    video.addEventListener("loadedmetadata", onMeta, { once: true });
    // Some browsers fire loadeddata before we bind; also cover cached media.
    video.addEventListener(
      "loadeddata",
      () => {
        if (!duration && Number.isFinite(video.duration) && video.duration > 0) {
          duration = video.duration;
          unlockSeek();
        } else if (duration) {
          markReady();
        }
      },
      { once: true },
    );

    video.load();
    if (video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0) {
      onMeta();
    }
  };

  window.addEventListener("scroll", scheduleScrub, { passive: true });
  window.addEventListener("resize", scheduleScrub, { passive: true });

  // iOS often needs a user gesture before media pipeline is fully seekable.
  window.addEventListener("touchstart", attachVideo, { once: true, passive: true });
  window.addEventListener("pointerdown", attachVideo, { once: true, passive: true });

  if ("requestIdleCallback" in window) {
    requestIdleCallback(attachVideo, { timeout: 900 });
  } else {
    window.addEventListener("load", attachVideo, { once: true });
  }
})();
