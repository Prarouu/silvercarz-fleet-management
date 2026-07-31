'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MotionSection } from '@/features/dashboard/components/motion';
import { useLiveNow } from '@/features/dashboard/hooks/use-live-now';
import { appConfig } from '@/config';
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

type DashboardWelcomeProps = {
  readonly asOfDate: string;
};

/** Large welcome hero card with live date and time. */
export function DashboardWelcome({ asOfDate }: DashboardWelcomeProps) {
  const now = useLiveNow();
  const headline = `${resolveGreeting(now)}. Welcome back.`;

  return (
    <MotionSection delay={0.05} aria-label="Welcome">
      <Card className="overflow-hidden border-none bg-tone-ink text-tone-ink-foreground shadow-none ring-0">
        <CardContent className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div className="space-y-2.5">
            <p className="text-metric text-tone-ink-foreground/55">Operations desk</p>
            <h2
              className="min-h-[2.5rem] font-heading text-2xl font-semibold tracking-tight text-balance sm:min-h-[2.75rem] sm:text-3xl"
              suppressHydrationWarning
            >
              {headline}
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-pretty text-tone-ink-foreground/60">
              Review today&apos;s pickups and returns, monitor fleet availability, and keep bookings
              moving without leaving this workspace.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-tone-gold px-4 py-3 text-tone-gold-foreground">
            <p className="text-metric text-tone-gold-foreground/65">Today</p>
            <p className="mt-1 font-heading text-lg font-semibold tabular-nums">
              <time dateTime={asOfDate}>{formatDate(asOfDate)}</time>
            </p>
            <p className="text-sm text-tone-gold-foreground/70 tabular-nums" aria-live="polite">
              <time
                className="inline-block min-w-[7.5rem]"
                dateTime={now.toISOString()}
                suppressHydrationWarning
              >
                {formatClock(now)}
              </time>
            </p>
          </div>
        </CardContent>
      </Card>
    </MotionSection>
  );
}
