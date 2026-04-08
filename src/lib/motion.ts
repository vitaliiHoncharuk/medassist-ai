import type { Target, Transition } from "motion/react";

export const springs = {
  /** Message enter animation — stiffness 300 / damping 24 */
  message: { type: "spring" as const, stiffness: 300, damping: 24 },
  /** Source panel expand — stiffness 250 / damping 25 */
  panel: { type: "spring" as const, stiffness: 250, damping: 25 },
  /** Prompt chip hover — stiffness 400 / damping 25 */
  chip: { type: "spring" as const, stiffness: 400, damping: 25 },
  /** Snappy general-purpose — stiffness 500 / damping 30 */
  snappy: { type: "spring" as const, stiffness: 500, damping: 30 },
  /** Gentle ease-in — stiffness 300 / damping 25 */
  gentle: { type: "spring" as const, stiffness: 300, damping: 25 },
  /** Bouncy for buttons — stiffness 400 / damping 15 */
  bouncy: { type: "spring" as const, stiffness: 400, damping: 15 },
};

export const reducedMotion = { duration: 0.01 };

/**
 * Pick between a full animation value and a fade-only fallback depending on
 * the user's reduced-motion preference.
 */
export const rm = (
  shouldReduce: boolean | null,
  full: Target,
  fade?: Target
): Target =>
  shouldReduce
    ? (fade ?? { opacity: (full as { opacity?: number }).opacity ?? 0 })
    : full;

/**
 * Pick a spring or the instant reduced-motion transition.
 */
export const rmTransition = (
  shouldReduce: boolean | null,
  spring: Transition
): Transition => (shouldReduce ? reducedMotion : spring);
