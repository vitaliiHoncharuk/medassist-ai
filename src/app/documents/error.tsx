"use client";

import type { ReactElement } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error;
  reset: () => void;
};

const DocumentsError = ({ reset }: ErrorProps): ReactElement => {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 text-center shadow-md">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-error/10">
          <AlertTriangle className="size-6 text-error" />
        </div>
        <h2 className="mb-2 font-heading text-lg font-semibold text-text">
          Failed to load documents
        </h2>
        <p className="mb-6 text-sm text-text-muted">
          An error occurred while loading the document library. Please try
          again.
        </p>
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="size-4" />
          Try again
        </Button>
      </div>
    </div>
  );
};

export default DocumentsError;
