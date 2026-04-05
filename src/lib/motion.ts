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

export const reducedMotionFallback = {
  duration: 0.01,
};

export const fadeOnly = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.01 },
};
