import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error: Error | unknown;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-surface/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-sm border border-border p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Something went wrong
        </h3>
        <p className="text-muted-foreground mb-6">
          {error instanceof Error ? error.message : "An unexpected error occurred"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary hover:bg-primary-hover text-panel-foreground px-6 py-3 rounded-xl transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}