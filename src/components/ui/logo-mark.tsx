"use client";

import { useRef, type ReactElement } from "react";

import { gsap, useGSAP } from "@/lib/gsap-config";
import { cn } from "@/lib/utils";

const sizes = {
  sm: {
    container: "size-4",
    circles: "size-3",
    /** Pixel radius for orbital drift — proportional to container size */
    drift: 0,
  },
  md: {
    container: "size-8",
    circles: "size-6",
    /** ~3px drift on a 32px container */
    drift: 3,
  },
  lg: {
    container: "size-12",
    circles: "size-9",
    /** ~4px drift on a 48px container */
    drift: 4,
  },
} as const;

type LogoMarkProps = {
  size?: keyof typeof sizes;
  className?: string;
  /** Disable orbital animation (always static for "sm") */
  animate?: boolean;
};

/**
 * Overlapping brand circles with optional organic orbital animation.
 *
 * Animation approach: two independent Lissajous-style motions per circle
 * (sine waves on x/y with different periods) produce a gentle figure-8
 * drift. One circle orbits "clockwise-ish", the other "counter-clockwise-ish".
 * A subtle scale pulse adds breathing. The result looks like two cells
 * in a slow, calm dance — appropriate for a healthcare brand.
 *
 * Only "md" and "lg" sizes animate; "sm" is always static (used in the
 * nav header where motion would be distracting).
 */
const LogoMark = ({
  size = "sm",
  className,
  animate = true,
}: LogoMarkProps): ReactElement => {
  const s = sizes[size];
  const containerRef = useRef<HTMLDivElement>(null);
  const circle1Ref = useRef<HTMLDivElement>(null);
  const circle2Ref = useRef<HTMLDivElement>(null);

  const shouldAnimate = animate && size !== "sm" && s.drift > 0;

  useGSAP(
    () => {
      if (!shouldAnimate) return;
      if (!circle1Ref.current || !circle2Ref.current) return;

      // Respect prefers-reduced-motion
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      const d = s.drift;

      // ---------------------------------------------------------------
      // Circle 1 (primary/grey, top-left) — drifts in a gentle
      // elliptical path using two sine tweens with different periods.
      // ---------------------------------------------------------------

      // Horizontal drift: slow sine, ~8s period
      gsap.to(circle1Ref.current, {
        x: d,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Vertical drift: slightly faster, ~6s period — phase offset
      // creates an elliptical / figure-8 compound path
      gsap.to(circle1Ref.current, {
        y: d * 0.7,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Breathing scale pulse
      gsap.to(circle1Ref.current, {
        scale: 1.06,
        duration: 5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // ---------------------------------------------------------------
      // Circle 2 (accent/amber, bottom-right) — counter-phase drift
      // so the two circles weave around each other.
      // ---------------------------------------------------------------

      // Horizontal drift: opposite direction, different period (~10s)
      gsap.fromTo(
        circle2Ref.current,
        { x: d * 0.6 },
        {
          x: -d * 0.6,
          duration: 5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        }
      );

      // Vertical drift: counter-phase, ~7s period
      gsap.fromTo(
        circle2Ref.current,
        { y: -d * 0.5 },
        {
          y: d * 0.8,
          duration: 3.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        }
      );

      // Breathing scale pulse — offset timing from circle 1
      gsap.fromTo(
        circle2Ref.current,
        { scale: 1.04 },
        {
          scale: 0.97,
          duration: 4.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        }
      );
    },
    { scope: containerRef, dependencies: [shouldAnimate, s.drift] }
  );

  return (
    <div ref={containerRef} className={cn("relative", s.container, className)}>
      <div
        ref={circle1Ref}
        className={cn(
          "absolute left-0 top-0 rounded-full bg-primary/15 ring-1 ring-primary/20 will-change-transform",
          s.circles,
          size === "sm" && "bg-primary/20 ring-0"
        )}
      />
      <div
        ref={circle2Ref}
        className={cn(
          "absolute bottom-0 right-0 rounded-full bg-accent/20 ring-1 ring-accent/30 will-change-transform",
          s.circles,
          size === "sm" && "bg-accent/30 ring-0"
        )}
      />
    </div>
  );
};

export { LogoMark };
