/**
 * Customer password criteria + live strength scoring.
 *
 * Aligns with common Supabase defaults (min length) and adds clear composition
 * rules so signup UX and Zod validation stay in sync.
 */

export const PASSWORD_CRITERIA = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (password: string) => password.length >= 8,
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: 'number',
    label: 'One number',
    test: (password: string) => /\d/.test(password),
  },
  {
    id: 'special',
    label: 'One special character',
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
] as const;

export type PasswordCriterionId = (typeof PASSWORD_CRITERIA)[number]['id'];

export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
  readonly score: number;
  readonly maxScore: number;
  readonly percent: number;
  readonly level: PasswordStrengthLevel;
  readonly label: string;
  readonly met: Readonly<Record<PasswordCriterionId, boolean>>;
  readonly allMet: boolean;
}

const LEVEL_BY_SCORE: Record<number, { level: PasswordStrengthLevel; label: string }> = {
  0: { level: 'empty', label: 'Enter a password' },
  1: { level: 'weak', label: 'Weak' },
  2: { level: 'weak', label: 'Weak' },
  3: { level: 'fair', label: 'Fair' },
  4: { level: 'good', label: 'Good' },
  5: { level: 'strong', label: 'Strong' },
};

/** Evaluates password criteria and returns a 0–100 strength result. */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const met = Object.fromEntries(
    PASSWORD_CRITERIA.map((criterion) => [criterion.id, criterion.test(password)]),
  ) as Record<PasswordCriterionId, boolean>;

  const score = password.length === 0 ? 0 : PASSWORD_CRITERIA.filter((c) => met[c.id]).length;
  const maxScore = PASSWORD_CRITERIA.length;
  const { level, label } = LEVEL_BY_SCORE[score] ?? LEVEL_BY_SCORE[0]!;

  return {
    score,
    maxScore,
    percent: password.length === 0 ? 0 : Math.round((score / maxScore) * 100),
    level,
    label,
    met,
    allMet: score === maxScore,
  };
}

/** Zod-friendly checks that mirror PASSWORD_CRITERIA. */
export function getUnmetPasswordCriteria(password: string): string[] {
  return PASSWORD_CRITERIA.filter((criterion) => !criterion.test(password)).map(
    (criterion) => criterion.label,
  );
}
