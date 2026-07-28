'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MotionItem } from '@/features/dashboard/components/motion';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

export type KpiCardProps = {
  readonly title: string;
  readonly value: number;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly iconClassName?: string;
  readonly href?: string;
  readonly index?: number;
  readonly className?: string;
};

/**
 * Reusable dashboard KPI card.
 * Hover elevation + optional navigation for future drill-downs.
 */
export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  href,
  index = 0,
  className,
}: KpiCardProps) {
  const content = (
    <Card
      size="sm"
      className={cn(
        'h-full shadow-none transition-[box-shadow,transform] duration-200',
        'hover:-translate-y-0.5 hover:shadow-md',
        href && 'cursor-pointer focus-within:ring-3 focus-within:ring-ring/50',
        className,
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardDescription>{title}</CardDescription>
          <CardTitle className="font-heading text-2xl font-semibold tracking-tight tabular-nums">
            {formatNumber(value)}
          </CardTitle>
        </div>
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg',
            iconClassName ?? 'bg-primary/15 text-primary',
          )}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <MotionItem index={index} className="h-full">
      {href ? (
        <Link
          href={href}
          className="block h-full rounded-xl focus-visible:outline-none"
          aria-label={`${title}: ${formatNumber(value)}. ${description}`}
        >
          {content}
        </Link>
      ) : (
        <div className="h-full" role="group" aria-label={`${title}: ${formatNumber(value)}`}>
          {content}
        </div>
      )}
    </MotionItem>
  );
}
