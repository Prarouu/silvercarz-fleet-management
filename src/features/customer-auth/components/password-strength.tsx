'use client';

import { Check, Circle } from 'lucide-react';

import {
  evaluatePasswordStrength,
  PASSWORD_CRITERIA,
} from '@/features/customer-auth/lib/password-strength';
import { cn } from '@/lib/utils';

/** Interpolates red → amber → green for a continuous strength feel. */
function strengthFillColor(percent: number): string {
  if (percent <= 0) {
    return 'transparent';
  }

  // 0% red (0°) → 100% green (120°) via HSL
  const hue = Math.round((Math.min(100, Math.max(0, percent)) / 100) * 120);
  return `hsl(${hue} 75% 42%)`;
}

function strengthLabelColor(percent: number): string | undefined {
  if (percent <= 0) {
    return undefined;
  }
  const hue = Math.round((Math.min(100, Math.max(0, percent)) / 100) * 120);
  return `hsl(${hue} 70% 34%)`;
}

interface PasswordStrengthProps {
  readonly password: string;
  readonly criteriaId: string;
  readonly meterId: string;
  readonly className?: string;
}

/**
 * Live password criteria checklist + red→green strength bar.
 */
export function PasswordStrength({
  password,
  criteriaId,
  meterId,
  className,
}: PasswordStrengthProps) {
  const strength = evaluatePasswordStrength(password);
  const fillColor = strengthFillColor(strength.percent);
  const labelColor = strength.percent > 0 ? strengthLabelColor(strength.percent) : undefined;

  return (
    <div className={cn('grid gap-3', className)}>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <p id={meterId} className="text-xs font-medium text-muted-foreground">
            Password strength
          </p>
          <p
            className={cn(
              'text-xs font-semibold',
              strength.percent === 0 ? 'text-muted-foreground' : undefined,
            )}
            style={labelColor ? { color: labelColor } : undefined}
            aria-live="polite"
          >
            {strength.label}
          </p>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="meter"
          aria-labelledby={meterId}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={strength.percent}
          aria-valuetext={strength.label}
        >
          <div
            className="h-full rounded-full transition-[width,background-color] duration-200 ease-out"
            style={{
              width: `${strength.percent}%`,
              backgroundColor: fillColor,
            }}
          />
        </div>
      </div>

      <ul id={criteriaId} className="grid gap-1.5" aria-label="Password requirements">
        {PASSWORD_CRITERIA.map((criterion) => {
          const isMet = strength.met[criterion.id];
          return (
            <li
              key={criterion.id}
              className={cn(
                'flex items-center gap-2 text-xs transition-colors',
                isMet ? 'text-success' : 'text-muted-foreground',
              )}
            >
              {isMet ? (
                <Check className="size-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <Circle className="size-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>
                {criterion.label}
                <span className="sr-only">{isMet ? ' — met' : ' — not met'}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
