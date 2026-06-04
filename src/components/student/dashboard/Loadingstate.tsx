export default function LoadingState() {
  return (
    <div className="min-h-screen bg-surface/50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-foreground font-semibold">Loading your dashboard...</p>
        <p className="text-muted-foreground text-sm mt-1">Please wait</p>
      </div>
    </div>
  );
}