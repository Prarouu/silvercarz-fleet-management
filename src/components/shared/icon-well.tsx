import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { iconSizeClass } from '@/themes';

export type IconWellTone = 'default' | 'gold' | 'mint' | 'lavender' | 'ink' | 'inverse';

const TONE_CLASS: Record<IconWellTone, string> = {
  default: 'bg-primary/15 text-primary',
  gold: 'bg-tone-gold text-tone-gold-foreground',
  mint: 'bg-tone-mint text-tone-mint-foreground',
  lavender: 'bg-tone-lavender text-tone-lavender-foreground',
  ink: 'bg-tone-ink text-tone-ink-foreground',
  /** Dark square on pastel metric cards (reference language). */
  inverse: 'bg-foreground text-background',
};

type IconWellProps = {
  readonly icon: LucideIcon;
  readonly tone?: IconWellTone;
  readonly className?: string;
  readonly size?: 'sm' | 'md';
};

/**
 * Squared icon container used across metric cards and branded marks.
 * Matches the reference design language: small radius square, centered icon.
 */
export function IconWell({ icon: Icon, tone = 'default', className, size = 'md' }: IconWellProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg',
        size === 'sm' ? 'size-8' : 'size-9',
        TONE_CLASS[tone],
        className,
      )}
      aria-hidden="true"
    >
      <Icon className={size === 'sm' ? iconSizeClass.md : iconSizeClass.lg} />
    </div>
  );
}
