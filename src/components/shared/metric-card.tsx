import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { IconWell, type IconWellTone } from '@/components/shared/icon-well';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type MetricCardTone = 'default' | 'gold' | 'mint' | 'lavender' | 'ink';

const CARD_TONE_CLASS: Record<MetricCardTone, string> = {
  default: 'bg-card text-card-foreground ring-1 ring-border',
  gold: 'bg-tone-gold text-tone-gold-foreground ring-1 ring-transparent dark:ring-white/10',
  mint: 'bg-tone-mint text-tone-mint-foreground ring-1 ring-transparent dark:ring-white/10',
  lavender:
    'bg-tone-lavender text-tone-lavender-foreground ring-1 ring-transparent dark:ring-white/10',
  ink: 'bg-tone-ink text-tone-ink-foreground ring-1 ring-transparent dark:ring-white/12',
};

const LABEL_TONE_CLASS: Record<MetricCardTone, string> = {
  default: 'text-muted-foreground',
  gold: 'text-tone-gold-foreground/70 dark:text-tone-gold-foreground/75',
  mint: 'text-tone-mint-foreground/70 dark:text-tone-mint-foreground/75',
  lavender: 'text-tone-lavender-foreground/70 dark:text-tone-lavender-foreground/75',
  ink: 'text-tone-ink-foreground/60 dark:text-tone-ink-foreground/70',
};

const DESCRIPTION_TONE_CLASS: Record<MetricCardTone, string> = {
  default: 'text-muted-foreground',
  gold: 'text-tone-gold-foreground/55',
  mint: 'text-tone-mint-foreground/55',
  lavender: 'text-tone-lavender-foreground/55',
  ink: 'text-tone-ink-foreground/45',
};

/** Icon well contrast paired with each metric surface. */
const ICON_WELL_FOR_TONE: Record<MetricCardTone, IconWellTone> = {
  default: 'default',
  gold: 'inverse',
  mint: 'inverse',
  lavender: 'inverse',
  ink: 'mint',
};

export type MetricCardProps = {
  readonly title: string;
  readonly value: string;
  readonly description?: string;
  readonly icon: LucideIcon;
  readonly tone?: MetricCardTone;
  readonly badge?: string;
  readonly href?: string;
  readonly className?: string;
  readonly iconWellTone?: IconWellTone;
};

/**
 * Soft-squircle metric card — icon, large value, and label tag.
 * Optional badge / description for non-KPI contexts. Brand colors via `tone`.
 */
export function MetricCard({
  title,
  value,
  description,
  icon,
  tone = 'default',
  badge,
  href,
  className,
  iconWellTone,
}: MetricCardProps) {
  const content = (
    <div
      className={cn(
        'flex h-full min-h-[9.5rem] flex-col gap-5 rounded-3xl p-5 shadow-none transition-[transform,box-shadow] duration-200 sm:min-h-[10.5rem] sm:gap-6 sm:p-6',
        'hover:-translate-y-0.5 hover:shadow-card',
        CARD_TONE_CLASS[tone],
        href && 'cursor-pointer focus-within:ring-3 focus-within:ring-ring/50',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <IconWell icon={icon} tone={iconWellTone ?? ICON_WELL_FOR_TONE[tone]} />
        {badge ? (
          <Badge
            variant="outline"
            className={cn(
              'h-6 rounded-full bg-transparent px-2.5 text-[0.6875rem] font-medium tracking-wide',
              tone === 'ink' && 'border-white/25 text-tone-ink-foreground',
              tone === 'default' && 'border-border text-muted-foreground',
              tone !== 'ink' && tone !== 'default' && 'border-foreground/20',
            )}
          >
            {badge}
          </Badge>
        ) : null}
      </div>

      <div className="mt-auto min-w-0 space-y-1">
        <p className="text-metric-value truncate">{value}</p>
        <p className={cn('text-metric', LABEL_TONE_CLASS[tone])}>{title}</p>
        {description ? (
          <p className={cn('text-caption hidden sm:block', DESCRIPTION_TONE_CLASS[tone])}>
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full rounded-3xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label={`${title}: ${value}${description ? `. ${description}` : ''}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="h-full" role="group" aria-label={`${title}: ${value}`}>
      {content}
    </div>
  );
}
