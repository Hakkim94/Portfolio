"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ParticleUniforms } from "@/materials/ParticleMaterial";

export type UseScrollAnimationOptions = {
  /** Uniform refs to drive assembly + dissolve. */
  uniforms: ParticleUniforms | null;
  /** Scroll track element (tall spacer) for ScrollTrigger. */
  scrollTrackRef: React.RefObject<HTMLElement | null>;
  /** Pin target (canvas container). */
  pinTargetRef: React.RefObject<HTMLElement | null>;
  /** Intro assembly duration in seconds. */
  assemblyDuration?: number;
  /** Called when scroll progress hits 100% and dissolve is complete. */
  onDissolveComplete?: () => void;
  /** Whether particle buffers are ready. */
  enabled?: boolean;
};

/**
 * GSAP-driven animation timeline:
 *
 * - On mount: 2s cinematic assembly (uAssembly 0 -> 1)
 * - On scroll:
 *     0%–20%  idle (assembled portrait)
 *     40%     dissolve begins
 *     70%     most particles gone
 *     100%    fully dissolved -> onDissolveComplete
 */
export function useScrollAnimation({
  uniforms,
  scrollTrackRef,
  pinTargetRef,
  assemblyDuration = 2,
  onDissolveComplete,
  enabled = true,
}: UseScrollAnimationOptions): void {
  const assemblyTweenRef = useRef<gsap.core.Tween | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !uniforms || !scrollTrackRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    // Reset state.
    uniforms.uAssembly.value = 0;
    uniforms.uDissolve.value = 0;
    completedRef.current = false;

    // Cinematic intro: scattered particles assemble into portrait.
    assemblyTweenRef.current = gsap.to(uniforms.uAssembly, {
      value: 1,
      duration: assemblyDuration,
      ease: "expo.out",
      overwrite: true,
    });

    const pinTarget = pinTargetRef.current ?? scrollTrackRef.current;

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: scrollTrackRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: pinTarget,
      pinSpacing: false,
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;

        // 0%–20%: idle (portrait stays intact).
        // 40%–100%: dissolve ramps with easing.
        if (p < 0.4) {
          uniforms.uDissolve.value = 0;
          return;
        }

        const t = (p - 0.4) / 0.6;
        const eased = gsap.parseEase("power2.in")(Math.min(1, Math.max(0, t)));
        uniforms.uDissolve.value = eased;

        // 100%: all particles gone.
        if (p >= 0.999 && !completedRef.current) {
          completedRef.current = true;
          uniforms.uDissolve.value = 1;
          onDissolveComplete?.();
        }
      },
    });

    return () => {
      assemblyTweenRef.current?.kill();
      scrollTriggerRef.current?.kill();
      scrollTriggerRef.current = null;
    };
  }, [
    uniforms,
    scrollTrackRef,
    pinTargetRef,
    assemblyDuration,
    onDissolveComplete,
    enabled,
  ]);
}
