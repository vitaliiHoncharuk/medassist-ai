"use client";

import {
  useState,
  useCallback,
  useRef,
  type ReactElement,
  type DragEvent,
  type ChangeEvent,
} from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { springs } from "@/lib/motion";
import { Button } from "@/components/ui/button";

type DocumentUploadProps = {
  onUploadComplete: () => void;
};

const ACCEPTED_TYPES = new Set(["application/pdf", "text/plain"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const DocumentUpload = ({
  onUploadComplete,
}: DocumentUploadProps): ReactElement => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.has(file.type)) {
      return "Only PDF and TXT files are supported";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be under 10MB";
    }
    return null;
  }, []);

  const uploadFile = useCallback(
    async (file: File): Promise<void> => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data: unknown = await response.json();
          const errorMessage =
            data &&
            typeof data === "object" &&
            "error" in data &&
            typeof (data as { error: unknown }).error === "string"
              ? (data as { error: string }).error
              : "Upload failed";
          setError(errorMessage);
          return;
        }

        onUploadComplete();
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile, onUploadComplete]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        void uploadFile(file);
      }
    },
    [uploadFile]
  );

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files?.[0];
      if (file) {
        void uploadFile(file);
      }
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [uploadFile]
  );

  const handleClick = useCallback((): void => {
    fileInputRef.current?.click();
  }, []);

  return (
    <m.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0.01 } : springs.gentle}
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={cn(
          "group relative flex h-56 cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border-2 border-dashed p-10",
          "transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background",
          isDragging
            ? "border-accent bg-accent/5"
            : "border-border hover:border-accent/40 hover:bg-surface/50",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        {/* Dot grid overlay - visible on hover/drag */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-[radial-gradient(circle,_currentColor_0.5px,_transparent_0.5px)] bg-[size:20px_20px] text-accent/10 transition-opacity duration-300",
            isDragging
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          )}
        />

        {/* Upload icon with ring */}
        <div className="relative flex size-14 items-center justify-center rounded-xl bg-surface-elevated ring-1 ring-border">
          {isUploading ? (
            <Loader2 className="size-6 animate-spin text-accent" />
          ) : (
            <Upload className="size-6 text-text-muted transition-colors group-hover:text-accent" />
          )}
        </div>

        <div className="relative z-10 text-center">
          <p className="font-body text-base font-medium text-text">
            {isUploading
              ? "Processing document..."
              : "Drop files here or click to upload"}
          </p>
          <p className="mt-1.5 text-sm text-text-muted">
            PDF and TXT files, up to 10MB
          </p>
        </div>

        {!isUploading && (
          <Button variant="outline" size="sm" type="button" className="relative z-10">
            <FileText className="size-4" data-icon="inline-start" />
            Choose file
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload document"
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </m.div>
  );
};

export { DocumentUpload };
