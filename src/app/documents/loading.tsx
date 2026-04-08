import type { ReactElement } from "react";
import { Loader2 } from "lucide-react";

const DocumentsLoading = (): ReactElement => {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Loader2 className="size-8 animate-spin text-accent" />
    </div>
  );
};

export default DocumentsLoading;
