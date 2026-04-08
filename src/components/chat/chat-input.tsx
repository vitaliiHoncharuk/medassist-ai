"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type ReactElement,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { ArrowUp, Shield } from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { springs, rmTransition } from "@/lib/motion";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isDisabled: boolean;
};

const MIN_ROWS = 1;
const MAX_ROWS = 5;
const LINE_HEIGHT = 24;

const ChatInput = ({
  value,
  onChange,
  onSend,
  isDisabled,
}: ChatInputProps): ReactElement => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const adjustHeight = useCallback((): void => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const minHeight = MIN_ROWS * LINE_HEIGHT;
    const maxHeight = MAX_ROWS * LINE_HEIGHT;
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>): void => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const canSend = !isDisabled && value.trim().length > 0;

  const handleSend = useCallback((): void => {
    if (!canSend) return;
    onSend();
    textareaRef.current?.focus();
  }, [canSend, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>): void => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="shrink-0 bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="py-3"
        >
          {/* Input container with animated border */}
          <div
            className={cn(
              "chat-input-container relative rounded-2xl transition-all duration-300",
              isFocused ? "chat-input-focused" : ""
            )}
          >
            {/* Rotating conic gradient border — visible on focus */}
            <div
              className={cn(
                "pointer-events-none absolute -inset-[1px] rounded-2xl transition-opacity duration-500",
                isFocused ? "opacity-100" : "opacity-0"
              )}
              style={{
                background:
                  "conic-gradient(from var(--border-angle, 0deg), transparent 30%, var(--color-accent) 50%, transparent 70%)",
                animation: isFocused && !shouldReduceMotion
                  ? "rotate-border 3s linear infinite"
                  : "none",
              }}
            />

            {/* Inner container — sits on top of the gradient border */}
            <div
              className={cn(
                "relative rounded-2xl border bg-surface transition-all duration-300",
                isFocused
                  ? "border-transparent bg-surface shadow-[0_0_0_1px_var(--color-border),0_4px_24px_-4px_color-mix(in_oklch,var(--color-accent)_12%,transparent)]"
                  : "border-border shadow-[var(--shadow-sm)]"
              )}
            >
              <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ask about your medical documents..."
                disabled={isDisabled}
                rows={MIN_ROWS}
                className={cn(
                  "w-full resize-none rounded-2xl bg-transparent px-4 py-3.5 pr-13 sm:px-5 sm:py-4 sm:pr-14",
                  "font-body text-sm leading-6 text-text placeholder:text-text-muted/50 sm:text-base sm:leading-7",
                  "focus:outline-none",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                aria-label="Type a message"
              />

              {/* Send button */}
              <m.button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className={cn(
                  "absolute bottom-2.5 right-2.5 flex size-8 items-center justify-center rounded-lg sm:bottom-3 sm:right-3 sm:size-9 sm:rounded-xl",
                  "transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                  canSend ? "text-accent-foreground" : "text-text-muted",
                  !canSend && "cursor-not-allowed"
                )}
                animate={
                  shouldReduceMotion
                    ? { opacity: canSend ? 1 : 0.5 }
                    : {
                        backgroundColor: canSend
                          ? "var(--color-accent)"
                          : "var(--color-surface-elevated)",
                        opacity: canSend ? 1 : 0.4,
                      }
                }
                whileHover={
                  canSend && !shouldReduceMotion ? { scale: 1.05 } : undefined
                }
                whileTap={
                  canSend && !shouldReduceMotion ? { scale: 0.92 } : undefined
                }
                transition={rmTransition(shouldReduceMotion, springs.snappy)}
                aria-label="Send message"
              >
                <ArrowUp className="size-4 sm:size-5" />
              </m.button>
            </div>
          </div>
        </form>

        {/* Disclaimer — inline below input, not a top banner */}
        <div className="flex items-center justify-center gap-1 pb-2">
          <Shield className="size-2.5 shrink-0 text-text-muted/40 sm:size-3" />
          <p className="text-[10px] text-text-muted/40 sm:text-xs">
            For informational purposes only &mdash; not medical advice
          </p>
        </div>
      </div>
    </div>
  );
};

export { ChatInput };
