"use client";

import { memo, useState, useCallback, type ReactElement } from "react";
import type { UIMessage } from "ai";
import { m, AnimatePresence, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { springs, rm, rmTransition } from "@/lib/motion";
import { MarkdownRenderer } from "./markdown-renderer";
import { LogoMark } from "@/components/ui/logo-mark";
import { extractTextFromParts } from "@/lib/chat/utils";
import type { SourceInfo } from "@/lib/chat/types";

/**
 * Parse source references from assistant message text.
 * Looks for patterns like [Source 1: Document Name] in the text.
 */
const parseSourceReferences = (text: string): SourceInfo[] => {
  const sourcePattern = /\[Source \d+:\s*([^\]]+)\]/g;
  const sources: SourceInfo[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = sourcePattern.exec(text)) !== null) {
    const docName = match[1]?.trim();
    if (docName && !seen.has(docName)) {
      seen.add(docName);
      sources.push({
        documentName: docName,
        excerpt: `Referenced from ${docName}`,
      });
    }
  }

  return sources;
};

type SourcePanelProps = {
  sources: SourceInfo[];
};

const SourcePanel = ({ sources }: SourcePanelProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleToggle = useCallback((): void => {
    setIsOpen((prev) => !prev);
  }, []);

  if (sources.length === 0) return <></>;

  return (
    <div className="mt-2 pl-4">
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1 text-xs text-text-muted",
          "transition-colors duration-150 hover:bg-surface hover:text-text",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
        aria-expanded={isOpen}
      >
        <span className="flex size-4 items-center justify-center rounded bg-accent/10 font-mono text-[9px] font-bold text-accent">
          {sources.length}
        </span>
        <span className="font-medium">
          {sources.length === 1 ? "reference" : "references"}
        </span>
        <m.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={rmTransition(shouldReduceMotion, springs.panel)}
        >
          <ChevronDown className="size-3" />
        </m.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={rm(shouldReduceMotion, { opacity: 0, height: 0 })}
            animate={rm(shouldReduceMotion, { opacity: 1, height: "auto" })}
            exit={rm(shouldReduceMotion, { opacity: 0, height: 0 })}
            transition={rmTransition(shouldReduceMotion, springs.panel)}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-1">
              {sources.map((source, i) => (
                <div
                  key={source.documentName}
                  className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-xs transition-colors hover:bg-surface-elevated"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accent/10 font-mono text-[10px] font-bold text-accent">
                    {i + 1}
                  </span>
                  <span className="truncate font-medium text-text">
                    {source.documentName}
                  </span>
                </div>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

type MessageBubbleProps = {
  message: UIMessage;
  isStreaming?: boolean;
};

const MessageBubbleInner = ({
  message,
  isStreaming = false,
}: MessageBubbleProps): ReactElement => {
  const isUser = message.role === "user";
  const shouldReduceMotion = useReducedMotion();

  const textContent = extractTextFromParts(message);

  const sources = !isUser ? parseSourceReferences(textContent) : [];

  if (isUser) {
    return (
      <m.div
        layout={!shouldReduceMotion}
        className="flex w-full justify-end px-4 py-2"
        initial={rm(shouldReduceMotion, { opacity: 0, y: 12 })}
        animate={rm(shouldReduceMotion, { opacity: 1, y: 0 })}
        transition={rmTransition(shouldReduceMotion, springs.message)}
      >
        <div className="max-w-[75%] rounded-[var(--radius-xl)] rounded-br-[var(--radius-sm)] bg-user-bubble px-4 py-2.5 shadow-[var(--shadow-sm)] dark:ring-1 dark:ring-white/5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-user-bubble-text">
            {textContent}
          </p>
        </div>
      </m.div>
    );
  }

  return (
    <m.div
      layout={!shouldReduceMotion}
      className="flex w-full gap-3 px-4 py-2"
      initial={rm(shouldReduceMotion, { opacity: 0, y: 12 })}
      animate={rm(shouldReduceMotion, { opacity: 1, y: 0 })}
      transition={rmTransition(shouldReduceMotion, springs.message)}
    >
      {/* Avatar with logo mark */}
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-elevated ring-1 ring-border">
        <LogoMark size="sm" />
      </div>

      {/* Content with vitals stripe */}
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "border-l-2 pl-4",
            isStreaming
              ? "border-accent/60"
              : "border-accent/30"
          )}
        >
          <div className={cn(isStreaming && "streaming-cursor")}>
            <MarkdownRenderer content={textContent} />
          </div>
        </div>
        {!isStreaming && <SourcePanel sources={sources} />}
      </div>
    </m.div>
  );
};

const MessageBubble = memo(MessageBubbleInner);
MessageBubble.displayName = "MessageBubble";

export { MessageBubble };
