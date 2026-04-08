import type { Metadata, NextPage } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { DocumentList } from "@/components/documents/document-list";

export const metadata: Metadata = {
  title: "Documents - MedAssist AI",
  description:
    "Upload and manage your medical documents for AI-powered search.",
};

const DocumentsPage: NextPage = (): ReactElement => {
  return (
    <div className="min-h-dvh bg-background">
      <div className="border-b border-border bg-surface/50">
        <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
          <div className="flex items-start gap-4">
            <Link
              href="/"
              aria-label="Back to chat"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "mt-1 shrink-0")}
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
                Knowledge Base
              </p>
              <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-text sm:text-4xl">
                Document Library
              </h1>
              <p className="mt-2 text-base text-text-muted">
                Upload medical documents to enable AI-powered search and
                citation
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8 sm:px-8">
        <DocumentList />
      </div>
    </div>
  );
};

export default DocumentsPage;
