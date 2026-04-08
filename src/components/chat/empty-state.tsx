"use client";

import {
  useCallback,
  useRef,
  type ReactElement,
  type MouseEvent,
} from "react";
import { m, useReducedMotion } from "motion/react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap-config";
import { PROMPT_SUGGESTIONS } from "@/lib/chat/constants";
import { springs, rmTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/ui/logo-mark";

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
        "group relative flex flex-col gap-1.5 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface p-3 pl-4 text-left sm:gap-2 sm:p-4 sm:pl-5",
        "shadow-[var(--shadow-sm)]",
        "transition-all duration-200",
        "hover:border-border-accent hover:translate-x-1",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
      style={{
        backgroundImage:
          "radial-gradient(400px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), color-mix(in oklch, var(--color-accent) 4%, transparent), transparent 40%)",
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
      transition={rmTransition(shouldReduceMotion, { ...springs.chip, duration: 0.5 })}
      custom={index}
    >
      {/* Vitals stripe */}
      <div className="absolute bottom-3 left-0 top-3 w-0.5 rounded-full bg-accent/40 transition-colors duration-200 group-hover:bg-accent" />
      <span className="font-body text-[10px] font-medium uppercase tracking-[0.08em] text-accent">
        {title}
      </span>
      <span className="text-sm leading-snug text-text">
        {description}
      </span>
    </m.button>
  );
};

const EmptyState = ({ onSelectPrompt }: EmptyStateProps): ReactElement => {
  const shouldReduceMotion = useReducedMotion();
  const headingRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!headingRef.current) return;

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      const line1El =
        headingRef.current.querySelector<HTMLElement>(".heading-line-1");
      const line2El =
        headingRef.current.querySelector<HTMLElement>(".heading-line-2");

      if (!line1El || !line2El) return;

      // Use tag:"span" so word wrappers stay inline (div default breaks
      // background-clip:text gradient on the parent .text-gradient span).
      // wordsClass adds the gradient to each word individually since
      // background-clip:text doesn't propagate to child elements.
      const split1 = SplitText.create(line1El, {
        type: "words",
        tag: "span",
        wordsClass: "text-gradient",
      });
      const split2 = SplitText.create(line2El, {
        type: "words",
        tag: "span",
      });

      // inline-block needed for transforms on <span> wrappers
      gsap.set([...split1.words, ...split2.words], {
        display: "inline-block",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 85%",
          once: true,
        },
        defaults: { ease: "power3.out" },
      });

      tl.from(split1.words, {
        x: -40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
      }).from(
        split2.words,
        {
          x: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.08,
        },
        "-=0.3"
      );
    },
    { scope: headingRef }
  );

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-6 sm:py-24">
      {/* Dot grid background */}
      <div className="pointer-events-none absolute inset-0 bg-dot-grid" />

      <m.div
        className="relative w-full max-w-lg space-y-4 text-center sm:space-y-8"
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
          className="mx-auto flex size-8 items-center justify-center sm:size-12"
          variants={{
            hidden: shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.8, filter: "blur(8px)" },
            visible: shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, scale: 1, filter: "blur(0px)" },
          }}
          transition={rmTransition(shouldReduceMotion, springs.gentle)}
        >
          <div className="relative size-8 sm:size-12">
            <LogoMark size="lg" className="hidden sm:block" />
            <LogoMark size="md" className="sm:hidden" />
            {/* Pulse ring on amber circle */}
            <div className="absolute bottom-0 right-0 size-6 rounded-full bg-accent/10 motion-safe:animate-[pulse-ring_3s_cubic-bezier(0,0,0.2,1)_infinite] sm:size-9" />
          </div>
        </m.div>

        {/* Heading — GSAP SplitText reveal */}
        <div ref={headingRef} className="space-y-2 sm:space-y-3">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-4xl">
            <span className="heading-line-1">
              Search your medical documents
            </span>
            <br />
            <span className="heading-line-2 text-text-muted">with AI</span>
          </h2>
          <m.p
            className="mx-auto max-w-md text-sm text-text-muted"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            transition={rmTransition(shouldReduceMotion, { duration: 0.3, ease: "easeOut" })}
          >
            Upload clinical guidelines, formularies, and drug references. Ask
            questions in plain language.
          </m.p>
        </div>

        {/* Prompt cards */}
        <m.div
          className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.15,
                delayChildren: shouldReduceMotion ? 0 : 0.8,
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
