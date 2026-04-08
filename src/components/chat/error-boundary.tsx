"use client";

import {
  Component,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type ReactElement,
} from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorBoundaryProps = {
  children: ReactNode;
  onReset?: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}

type ErrorFallbackProps = {
  onReset: () => void;
};

const ErrorFallback = ({ onReset }: ErrorFallbackProps): ReactElement => {
  const [isResetting, setIsResetting] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleReset = useCallback((): void => {
    setIsResetting(true);
    timerRef.current = setTimeout(() => {
      setIsResetting(false);
      onReset();
    }, 400);
  }, [onReset]);

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-4 py-8 animate-fade-in"
      role="alert"
    >
      <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-border bg-surface p-8 text-center shadow-[var(--shadow-md)]">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-error/10">
          <AlertTriangle className="size-6 text-error" />
        </div>
        <h3 className="mb-2 font-heading text-lg font-semibold tracking-tight text-text">
          Something went wrong
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-text-muted">
          An error occurred while loading the chat. Your conversation data is
          safe.
        </p>
        <Button
          onClick={handleReset}
          disabled={isResetting}
          className="gap-2"
        >
          <RefreshCw
            className={`size-4 ${isResetting ? "animate-spin" : ""}`}
          />
          {isResetting ? "Restarting..." : "Try again"}
        </Button>
      </div>
    </div>
  );
};

export { ErrorBoundary, ErrorFallback };
