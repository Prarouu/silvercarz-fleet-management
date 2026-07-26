/**
 * Centralized application error utilities.
 *
 * Feature modules should convert unknown failures through these helpers
 * instead of formatting error messages inline.
 *
 * Supabase-specific normalization lives in `@/lib/supabase/errors` and
 * can be composed with `toAppError` when needed.
 */

export const ERROR_CODES = {
  unknown: 'unknown',
  validation: 'validation',
  notFound: 'not_found',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  conflict: 'conflict',
  network: 'network',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

export class AppError extends Error {
  readonly code: string;
  override readonly cause?: unknown;

  constructor(message: string, code: string = ERROR_CODES.unknown, options?: { cause?: unknown }) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = options?.cause;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

interface ErrorLike {
  message: string;
  code?: string;
  name?: string;
}

function isErrorLike(error: unknown): error is ErrorLike {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

/**
 * Converts any thrown value into a typed `AppError` safe for UI display.
 */
export function toAppError(error: unknown, fallbackMessage = FALLBACK_MESSAGE): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (isErrorLike(error)) {
    return new AppError(error.message || fallbackMessage, error.code ?? ERROR_CODES.unknown, {
      cause: error,
    });
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return new AppError(error, ERROR_CODES.unknown);
  }

  return new AppError(fallbackMessage, ERROR_CODES.unknown, { cause: error });
}

/** Shorthand when only a display message is needed. */
export function getDisplayErrorMessage(error: unknown, fallbackMessage = FALLBACK_MESSAGE): string {
  return toAppError(error, fallbackMessage).message;
}
