"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type ReactElement,
} from "react";
import type { UIMessage } from "ai";
import { AlertTriangle, ArrowDown, RefreshCw } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { springs, rm, rmTransition } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";

type MessageListProps = {
  messages: UIMessage[];
  isStreaming: boolean;
  error?: Error;
  onRetry?: () => void;
};

const SCROLL_THRESHOLD = 200;

const MessageList = ({
  messages,
  isStreaming,
  error,
  onRetry,
}: MessageListProps): ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isUserScrolledRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  const scrollToBottom = useCallback((): void => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    isUserScrolledRef.current = false;
  }, []);

  const handleScroll = useCallback((): void => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom < SCROLL_THRESHOLD;

    setShowScrollButton(!isNearBottom);
    isUserScrolledRef.current = !isNearBottom;
  }, []);

  useEffect(() => {
    if (!isUserScrolledRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        aria-busy={isStreaming}
      >
        <div className="mx-auto max-w-3xl space-y-4 py-4 sm:space-y-6">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={
                isStreaming &&
                index === messages.length - 1 &&
                message.role === "assistant"
              }
            />
          ))}
          {isStreaming &&
            (messages.length === 0 ||
              messages[messages.length - 1]?.role !== "assistant") && (
              <TypingIndicator />
            )}
          {error && (
            <div className="flex items-start gap-3 px-4 sm:px-6">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-error/10">
                <AlertTriangle className="size-4 text-error" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-error">
                  {error.message || "Something went wrong. Please try again."}
                </p>
                {onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="w-fit gap-1.5"
                  >
                    <RefreshCw className="size-3.5" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <AnimatePresence>
        {showScrollButton && (
          <m.button
            type="button"
            onClick={scrollToBottom}
            className={cn(
              "absolute bottom-4 left-1/2 z-10 flex size-10 -translate-x-1/2 items-center justify-center",
              "rounded-full bg-accent text-accent-foreground",
              "shadow-[var(--shadow-md)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
            initial={rm(shouldReduceMotion, { opacity: 0, scale: 0.5, y: 20 })}
            animate={rm(shouldReduceMotion, { opacity: 1, scale: 1, y: 0 })}
            exit={rm(shouldReduceMotion, { opacity: 0, scale: 0.5, y: 20 })}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
            transition={rmTransition(shouldReduceMotion, springs.bouncy)}
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="size-4" />
          </m.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export { MessageList };
