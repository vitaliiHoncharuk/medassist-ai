"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { FileText, SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo-mark";

type ChatHeaderProps = {
  onNewChat?: () => void;
  hasMessages?: boolean;
};

const ChatHeader = ({
  onNewChat,
  hasMessages = false,
}: ChatHeaderProps): ReactElement => {
  return (
    <header className="glass flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-4 shadow-[var(--shadow-sm)] sm:px-6">
      <div className="flex items-center gap-3">
        <LogoMark size="md" animate={false} />
        <div className="flex items-baseline gap-1.5">
          <h1 className="font-heading text-base font-semibold tracking-tight text-text">
            MedAssist
          </h1>
          <span className="rounded-sm bg-accent/15 px-1 py-0.5 font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-accent">
            AI
          </span>
        </div>
      </div>

      {/* Actions zone */}
      <div className="flex items-center gap-1">
        {hasMessages && onNewChat && (
          <button
            type="button"
            onClick={onNewChat}
            className={cn(
              buttonVariants({ variant: "ghost", size: "default" }),
              "gap-2"
            )}
          >
            <SquarePen className="size-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        )}
        <Link
          href="/documents"
          className={cn(
            buttonVariants({ variant: "ghost", size: "default" }),
            "gap-2"
          )}
        >
          <FileText className="size-4" />
          <span className="hidden sm:inline">Documents</span>
        </Link>
      </div>
    </header>
  );
};

export { ChatHeader };
