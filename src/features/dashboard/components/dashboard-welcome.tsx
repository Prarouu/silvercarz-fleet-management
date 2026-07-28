'use client';

import { useEffect, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { MotionSection } from '@/features/dashboard/components/motion';
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
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const greeting = resolveGreeting(now);

  return (
    <MotionSection delay={0.05} aria-label="Welcome">
      <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/20 via-card to-card shadow-none ring-1 ring-border">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div className="space-y-2">
            <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              Operations desk
            </p>
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              {greeting}. Welcome back.
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-pretty text-muted-foreground">
              Review today&apos;s pickups and returns, monitor fleet availability, and keep bookings
              moving without leaving this workspace.
            </p>
          </div>
          <div className="shrink-0 rounded-xl bg-background/70 px-4 py-3 ring-1 ring-border backdrop-blur-sm">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Today
            </p>
            <p className="mt-1 font-heading text-lg font-semibold tabular-nums">
              <time dateTime={asOfDate}>{formatDate(asOfDate)}</time>
            </p>
            <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
              <time dateTime={now.toISOString()}>{formatClock(now)}</time>
            </p>
          </div>
        </CardContent>
      </Card>
    </MotionSection>
  );
}
