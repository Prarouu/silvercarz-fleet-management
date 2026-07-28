'use client';

import { appConfig } from '@/config';
import { useLiveNow } from '@/features/dashboard/hooks/use-live-now';
import { resolveGreeting } from '@/features/dashboard/lib/greeting';
import { formatDate } from '@/lib/format';

function formatClock(date: Date): string {
  return new Intl.DateTimeFormat(appConfig.locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}

type DashboardHeaderProps = {
  readonly asOfDate: string;
};

/**
 * Live greeting header with date and clock.
 * Subtitle: "Manage your fleet efficiently."
 */
export function DashboardHeader({ asOfDate }: DashboardHeaderProps) {
  const now = useLiveNow();
  const greeting = now ? resolveGreeting(now) : 'Welcome';

  return (
    <header className="space-y-1.5" aria-label="Dashboard greeting">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-heading text-balance">
          {greeting}, <span className="text-foreground">{appConfig.name}</span>
        </h1>
        <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
          <time dateTime={asOfDate}>{formatDate(asOfDate)}</time>
          <span className="mx-2 text-border" aria-hidden="true">
            ·
          </span>
          {now ? (
            <time dateTime={now.toISOString()}>{formatClock(now)}</time>
          ) : (
            <span className="inline-block min-w-[7.5rem]" aria-hidden="true">
              --:--:-- --
            </span>
          )}
        </p>
      </div>
      <p className="text-body text-muted-foreground">Manage your fleet efficiently.</p>
    </header>
  );
}
