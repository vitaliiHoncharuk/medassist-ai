"use client";

import { useState, useEffect, useCallback, type ReactElement } from "react";
import { AnimatePresence } from "motion/react";
import { FileText, Loader2 } from "lucide-react";
import { DocumentCard } from "./document-card";
import { DocumentUpload } from "./document-upload";

type DocumentData = {
  id: string;
  name: string;
  chunkCount: number;
  createdAt: string | Date | null;
};

type ApiDocument = {
  id: string;
  name: string;
  chunkCount: number;
  createdAt: string | null;
};

const DocumentList = (): ReactElement => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const response = await fetch("/api/documents");
      if (!response.ok) {
        setError("Failed to load documents");
        return;
      }

      const data: unknown = await response.json();
      if (
        data &&
        typeof data === "object" &&
        "documents" in data &&
        Array.isArray((data as { documents: unknown }).documents)
      ) {
        setDocuments(
          (
            (data as { documents: ApiDocument[] }).documents
          ).map((doc) => ({
            id: doc.id,
            name: doc.name,
            chunkCount: doc.chunkCount,
            createdAt: doc.createdAt,
          }))
        );
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  const handleUploadComplete = useCallback((): void => {
    void fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = useCallback((id: string): void => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }, []);

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
          <div className="rounded-xl border border-error/20 bg-error/5 p-5 text-sm text-error" role="alert">
            {error}
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
                  onDelete={handleDelete}
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
