'use client';

import type { LucideIcon } from 'lucide-react';

import { MetricCard, type MetricCardTone } from '@/components/shared/metric-card';
import { MotionItem } from '@/features/dashboard/components/motion';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

export type KpiCardProps = {
  readonly title: string;
  readonly value: number;
  readonly icon: LucideIcon;
  readonly tone?: MetricCardTone;
  readonly href?: string;
  readonly index?: number;
  readonly className?: string;
};

/**
 * Dashboard KPI card — icon, value, and label tag only.
 */
export function KpiCard({
  title,
  value,
  icon,
  tone = 'default',
  href,
  index = 0,
  className,
}: KpiCardProps) {
  return (
    <MotionItem index={index} className={cn('h-full', className)}>
      <MetricCard title={title} value={formatNumber(value)} icon={icon} tone={tone} href={href} />
    </MotionItem>
  );
}
