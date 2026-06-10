"use client";

import { useEffect, useRef, useState } from "react";

type PalanRevealProps = {
  children: React.ReactNode;
  className?: string;
};

export function PalanReveal({ children, className = "" }: PalanRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`palan-reveal ${visible ? "palan-reveal-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
