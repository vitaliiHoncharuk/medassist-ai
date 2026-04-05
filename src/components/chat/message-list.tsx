"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type ReactElement,
} from "react";
import type { UIMessage } from "ai";
import { ArrowDown } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { springs } from "@/lib/motion";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";

type MessageListProps = {
  messages: UIMessage[];
  isStreaming: boolean;
};

const SCROLL_THRESHOLD = 200;

const MessageList = ({
  messages,
  isStreaming,
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
              "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            )}
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.5, y: 20 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.5, y: 20 }
            }
            whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
            transition={
              shouldReduceMotion ? { duration: 0.01 } : springs.bouncy
            }
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
