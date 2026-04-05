"use client";

import React, { memo, useState, useCallback, type ReactElement } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { springs } from "@/lib/motion";

type CopyButtonProps = {
  code: string;
};

const CopyButton = ({ code }: CopyButtonProps): ReactElement => {
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleCopy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [code]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "absolute right-2 top-2 rounded-[var(--radius-sm)] p-1.5",
        "bg-surface/80 text-text-muted hover:text-text",
        "opacity-0 transition-opacity duration-150 group-hover:opacity-100",
        "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent"
      )}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <m.span
            key="check"
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, rotate: -90, scale: 0.5 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, rotate: 0, scale: 1 }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.5 }
            }
            transition={
              shouldReduceMotion ? { duration: 0.01 } : springs.snappy
            }
            className="block"
          >
            <Check className="size-4 text-success" />
          </m.span>
        ) : (
          <m.span
            key="copy"
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.5 }
            }
            animate={
              shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.5 }
            }
            transition={
              shouldReduceMotion ? { duration: 0.01 } : springs.snappy
            }
            className="block"
          >
            <Copy className="size-4" />
          </m.span>
        )}
      </AnimatePresence>
    </button>
  );
};

const extractTextFromChildren = (children: React.ReactNode): string => {
  if (typeof children === "string") return children;
  if (Array.isArray(children))
    return children.map(extractTextFromChildren).join("");
  if (React.isValidElement(children) && children.props) {
    const props = children.props as { children?: React.ReactNode };
    return extractTextFromChildren(props.children);
  }
  return "";
};

const components: Components = {
  pre: ({ children, ...props }) => {
    const code = extractTextFromChildren(children);
    return (
      <div className="group relative my-3">
        <pre
          className={cn(
            "overflow-x-auto rounded-[var(--radius-md)] p-4",
            "bg-surface-elevated font-mono text-sm leading-relaxed",
            "shadow-[var(--shadow-inset-depth)]"
          )}
          {...props}
        >
          {children}
        </pre>
        <CopyButton code={code} />
      </div>
    );
  },
  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className={cn(
            "rounded-[var(--radius-sm)] bg-surface-elevated px-1.5 py-0.5",
            "font-mono text-[0.875em]"
          )}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  a: ({ href, children, ...props }) => {
    const isSafeUrl = href && /^https?:\/\/|^mailto:/i.test(href);
    if (!isSafeUrl) {
      return <span {...props}>{children}</span>;
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline-offset-2 hover:underline"
        {...props}
      >
        {children}
      </a>
    );
  },
  ul: ({ children, ...props }) => (
    <ul className="my-2 ml-4 list-disc space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-2 ml-4 list-decimal space-y-1" {...props}>
      {children}
    </ol>
  ),
  p: ({ children, ...props }) => (
    <p className="my-2 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  h1: ({ children, ...props }) => (
    <h1
      className="mb-2 mt-4 font-heading text-xl font-semibold tracking-tight"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="mb-2 mt-3 font-heading text-lg font-semibold tracking-tight"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mb-1 mt-2 font-heading text-base font-semibold tracking-tight"
      {...props}
    >
      {children}
    </h3>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-2 border-l-2 border-accent pl-4 italic text-text-muted"
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-border" />,
};

type MarkdownRendererProps = {
  content: string;
};

const MarkdownRenderer = memo(
  ({ content }: MarkdownRendererProps): ReactElement => {
    return (
      <div className="prose-chat text-sm leading-relaxed">
        <ReactMarkdown
          rehypePlugins={[rehypeHighlight]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }
);

MarkdownRenderer.displayName = "MarkdownRenderer";

export { MarkdownRenderer };
