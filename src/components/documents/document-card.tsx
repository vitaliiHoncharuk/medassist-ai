"use client";

import { useState, useCallback, type ReactElement } from "react";
import { FileText, Trash2, Loader2 } from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { springs, rm, rmTransition } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { useDeleteDocument } from "@/lib/api/hooks";
import type { DocumentDTO } from "@/lib/db/schema";

type DocumentCardProps = DocumentDTO & {
  index: number;
};

const DocumentCard = ({
  id,
  name,
  chunkCount,
  createdAt,
  index,
}: DocumentCardProps): ReactElement => {
  const [showConfirm, setShowConfirm] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const deleteMutation = useDeleteDocument();
  const isDeleting = deleteMutation.isPending;
  const deleteError = deleteMutation.error;

  const handleDeleteClick = useCallback((): void => {
    if (showConfirm) {
      deleteMutation.mutate(id, {
        onSettled: () => setShowConfirm(false),
      });
    } else {
      setShowConfirm(true);
    }
  }, [showConfirm, id, deleteMutation]);

  const handleCancelDelete = useCallback((): void => {
    setShowConfirm(false);
    deleteMutation.reset();
  }, [deleteMutation]);

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown date";

  return (
    <m.div
      layout={!shouldReduceMotion}
      initial={rm(shouldReduceMotion, { opacity: 0, y: 12, scale: 0.96 })}
      animate={rm(shouldReduceMotion, { opacity: 1, y: 0, scale: 1 })}
      exit={rm(shouldReduceMotion, { opacity: 0, y: -8, scale: 0.96 })}
      transition={rmTransition(shouldReduceMotion, { ...springs.message, delay: index * 0.05 })}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border border-border bg-surface p-4",
        "transition-all duration-200",
        "hover:border-border-accent hover:shadow-[var(--shadow-sm)]"
      )}
    >
      {/* Amber top stripe */}
      <div className="absolute left-4 right-4 top-0 h-0.5 rounded-b-full bg-accent/30 transition-colors group-hover:bg-accent/60" />

      {/* File type indicator + delete */}
      <div className="flex items-center justify-between">
        <div className="flex size-9 items-center justify-center rounded-lg bg-accent/10 ring-1 ring-accent/15">
          <FileText className="size-4 text-accent" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showConfirm && !isDeleting && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelDelete}
              className="text-xs"
            >
              Cancel
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className={cn(
              "text-text-muted transition-opacity hover:text-destructive",
              !showConfirm && "opacity-0 group-hover:opacity-100"
            )}
            aria-label={showConfirm ? "Confirm delete" : "Delete document"}
          >
            {isDeleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div>
        <p className="truncate font-heading text-sm font-medium text-text">
          {name}
        </p>
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-text-muted">
          <span>{formattedDate}</span>
          <span className="size-0.5 rounded-full bg-text-muted/40" />
          <span className="font-mono">
            {chunkCount} {chunkCount === 1 ? "chunk" : "chunks"}
          </span>
        </div>
        {deleteError && (
          <p className="mt-1.5 text-[11px] text-error" role="alert">
            {deleteError.message}
          </p>
        )}
      </div>
    </m.div>
  );
};

export { DocumentCard };
