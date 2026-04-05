"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const ChatHeader = (): ReactElement => {
  return (
    <header className="glass flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-4 shadow-[var(--shadow-sm)] sm:px-6">
      {/* Brand zone */}
      <div className="flex items-center gap-3">
        {/* Logo mark: two overlapping circles */}
        <div className="relative size-8">
          <div className="absolute left-0 top-0.5 size-6 rounded-full bg-primary/15 ring-1 ring-primary/20" />
          <div className="absolute bottom-0.5 right-0 size-6 rounded-full bg-accent/20 ring-1 ring-accent/30" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <h1 className="font-heading text-base font-semibold tracking-tight text-text">
            MedAssist
          </h1>
          <span className="rounded-sm bg-accent/15 px-1 py-0.5 font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-accent">
            AI
          </span>
        </div>
      </div>

      {/* Navigation zone */}
      <Link href="/documents">
        <Button variant="ghost" size="sm" className="gap-1.5">
          <FileText className="size-3.5" />
          <span className="hidden sm:inline">Documents</span>
        </Button>
      </Link>
    </header>
  );
};

export { ChatHeader };
