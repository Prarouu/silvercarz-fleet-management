import { Loader2 } from 'lucide-react';

/** Full-area centered loading indicator for route-level loading states. */
export function LoadingScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-2 py-16"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
