"use client";

import { useCallback, type ReactElement } from "react";
import { AnimatePresence } from "motion/react";
import { FileText, Loader2, RefreshCw } from "lucide-react";
import { DocumentCard } from "./document-card";
import { DocumentUpload } from "./document-upload";
import { useDocuments, useInvalidateDocuments } from "@/lib/api/hooks";
import { Button } from "@/components/ui/button";

const DocumentList = (): ReactElement => {
  const { data: documents = [], isLoading, error, refetch } = useDocuments();
  const invalidateDocuments = useInvalidateDocuments();

  const handleUploadComplete = useCallback((): void => {
    invalidateDocuments();
  }, [invalidateDocuments]);

  const errorMessage = error instanceof Error ? error.message : "Failed to load documents";

  return (
    <div className="space-y-8">
      <DocumentUpload onUploadComplete={handleUploadComplete} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold tracking-tight text-text">
            Uploaded Documents
          </h2>
          {!isLoading && !error && documents.length > 0 && (
            <span className="text-sm text-text-muted">
              {documents.length} {documents.length === 1 ? "file" : "files"}
            </span>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-accent" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between rounded-xl border border-error/20 bg-error/5 p-5 text-sm text-error" role="alert">
            <span>{errorMessage}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void refetch()}
              className="gap-1.5 text-error hover:text-error"
            >
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && documents.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-xl bg-surface-elevated ring-1 ring-border">
              <FileText className="size-6 text-text-muted/50" />
            </div>
            <div>
              <p className="font-heading text-base font-medium text-text-muted">
                No documents uploaded yet
              </p>
              <p className="mt-1.5 text-sm text-text-muted/70">
                Upload medical documents above to start asking questions
              </p>
            </div>
          </div>
        )}

        {!isLoading && !error && documents.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {documents.map((doc, index) => (
                <DocumentCard
                  key={doc.id}
                  id={doc.id}
                  name={doc.name}
                  chunkCount={doc.chunkCount}
                  createdAt={doc.createdAt}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export { DocumentList };
