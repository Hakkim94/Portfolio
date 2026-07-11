// hooks/useReveal.ts
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type RevealOptions = {
  y?: number;
  x?: number;
  opacity?: number;
  duration?: number;
  delay?: number;
  start?: string;
  scrub?: boolean;
};

export default function useReveal({
  y = 80,
  x = 0,
  opacity = 0,
  duration = 1,
  delay = 0,
  start = "top 85%",
  scrub = false,
}: RevealOptions = {}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        {
          y,
          x,
          opacity,
        },
        {
          y: 0,
          x: 0,
          opacity: 1,
          duration,
          delay,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ref.current,
            start,
            scrub,
            toggleActions: scrub
              ? undefined
              : "play none none reverse",
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [y, x, opacity, duration, delay, start, scrub]);

  return ref;
}