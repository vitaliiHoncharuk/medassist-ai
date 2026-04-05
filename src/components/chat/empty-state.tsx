"use client";

import {
  useCallback,
  useRef,
  type ReactElement,
  type MouseEvent,
} from "react";
import { m, useReducedMotion } from "motion/react";
import { PROMPT_SUGGESTIONS } from "@/lib/chat/constants";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  onSelectPrompt: (prompt: string) => void;
};

type PromptCardProps = {
  title: string;
  description: string;
  prompt: string;
  onSelect: (prompt: string) => void;
  index: number;
};

const PromptCard = ({
  title,
  description,
  prompt,
  onSelect,
  index,
}: PromptCardProps): ReactElement => {
  const cardRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLButtonElement>): void => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--spotlight-x", `${x}px`);
      card.style.setProperty("--spotlight-y", `${y}px`);
    },
    []
  );

  return (
    <m.button
      ref={cardRef}
      type="button"
      onClick={() => onSelect(prompt)}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative flex flex-col gap-1.5 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface p-3.5 pl-5 text-left",
        "shadow-[var(--shadow-sm)]",
        "transition-all duration-200",
        "hover:border-border-accent hover:translate-x-1",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
      style={{
        backgroundImage:
          "radial-gradient(400px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), oklch(0.68 0.17 65 / 0.04), transparent 40%)",
      }}
      variants={{
        hidden: shouldReduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 12, scale: 0.96 },
        visible: shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 1, y: 0, scale: 1 },
      }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      transition={shouldReduceMotion ? { duration: 0.01 } : springs.chip}
      custom={index}
    >
      {/* Vitals stripe */}
      <div className="absolute bottom-3 left-0 top-3 w-0.5 rounded-full bg-accent/40 transition-colors duration-200 group-hover:bg-accent" />
      <span className="font-body text-[10px] font-medium uppercase tracking-[0.08em] text-accent">
        {title}
      </span>
      <span className="line-clamp-1 text-sm text-text">
        {description}
      </span>
    </m.button>
  );
};

const EmptyState = ({ onSelectPrompt }: EmptyStateProps): ReactElement => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-16 sm:py-24">
      {/* Dot grid background */}
      <div className="pointer-events-none absolute inset-0 bg-dot-grid" />

      <m.div
        className="relative w-full max-w-lg space-y-8 text-center"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: shouldReduceMotion ? 0 : 0.1,
              delayChildren: shouldReduceMotion ? 0 : 0.1,
            },
          },
        }}
      >
        {/* Logo mark with pulse */}
        <m.div
          className="mx-auto flex size-12 items-center justify-center"
          variants={{
            hidden: shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.8, filter: "blur(8px)" },
            visible: shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, scale: 1, filter: "blur(0px)" },
          }}
          transition={shouldReduceMotion ? { duration: 0.01 } : springs.gentle}
        >
          <div className="relative size-12">
            <div className="absolute left-0 top-1 size-9 rounded-full bg-primary/10 ring-1 ring-primary/15" />
            <div className="absolute bottom-1 right-0 size-9 rounded-full bg-accent/15 ring-1 ring-accent/25" />
            {/* Pulse ring on amber circle */}
            <div className="absolute bottom-1 right-0 size-9 rounded-full bg-accent/10 motion-safe:animate-[pulse-ring_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
          </div>
        </m.div>

        {/* Heading */}
        <m.div
          variants={{
            hidden: shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 20, filter: "blur(8px)" },
            visible: shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, filter: "blur(0px)" },
          }}
          transition={
            shouldReduceMotion
              ? { duration: 0.01 }
              : { duration: 0.4, ease: "easeOut" }
          }
          className="space-y-3"
        >
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient">Search your medical documents</span>
            <br />
            <span className="text-text-muted">with AI</span>
          </h2>
          <m.p
            className="mx-auto max-w-md text-sm text-text-muted"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            transition={
              shouldReduceMotion
                ? { duration: 0.01 }
                : { duration: 0.3, ease: "easeOut" }
            }
          >
            Upload clinical guidelines, formularies, and drug references. Ask
            questions in plain language.
          </m.p>
        </m.div>

        {/* Prompt cards */}
        <m.div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.08,
                delayChildren: shouldReduceMotion ? 0 : 0.5,
              },
            },
          }}
        >
          {PROMPT_SUGGESTIONS.map((suggestion, index) => (
            <PromptCard
              key={suggestion.title}
              title={suggestion.title}
              description={suggestion.description}
              prompt={suggestion.prompt}
              onSelect={onSelectPrompt}
              index={index}
            />
          ))}
        </m.div>
      </m.div>
    </div>
  );
};

export { EmptyState };
