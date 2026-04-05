"use client";

import type { ReactElement } from "react";
import { m, useReducedMotion } from "motion/react";
import { springs } from "@/lib/motion";

const WAVEFORM_BARS = [
  { height: "h-1.5", delay: "0ms" },
  { height: "h-3", delay: "150ms" },
  { height: "h-2", delay: "300ms" },
  { height: "h-3.5", delay: "450ms" },
  { height: "h-1", delay: "600ms" },
] as const;

const TypingIndicator = (): ReactElement => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <m.div
      className="flex items-start gap-3 px-4 py-2"
      role="status"
      aria-label="Assistant is typing"
      initial={
        shouldReduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 8, x: -12 }
      }
      animate={
        shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: 0 }
      }
      transition={shouldReduceMotion ? { duration: 0.01 } : springs.gentle}
    >
      {/* Avatar with logo mark */}
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-elevated ring-1 ring-border">
        <div className="relative size-4">
          <div className="absolute left-0 top-0 size-3 rounded-full bg-primary/20" />
          <div className="absolute bottom-0 right-0 size-3 rounded-full bg-accent/30" />
        </div>
      </div>

      {/* EKG waveform bars */}
      <div className="flex items-end gap-0.5 border-l-2 border-accent/30 py-3 pl-4">
        <div className="flex h-4 items-end gap-[3px]">
          {WAVEFORM_BARS.map((bar, i) => (
            <span
              key={i}
              className={`block w-[3px] rounded-full bg-accent ${bar.height}`}
              style={{
                animation: shouldReduceMotion
                  ? "none"
                  : `waveform 1.2s ease-in-out ${bar.delay} infinite`,
              }}
            />
          ))}
        </div>
      </div>
      <span className="sr-only">Assistant is typing</span>
    </m.div>
  );
};

export { TypingIndicator };
