import { AppError, toAppError } from '@/lib/errors';
import type { ApiFailure, ApiResponse, ApiSuccess } from '@/types/api';

/** Creates a successful service / API response. */
export function ok<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

/** Creates a failed service / API response from an `AppError` or unknown value. */
export function fail(error: unknown): ApiFailure {
  const appError = toAppError(error);
  return {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
    },
  };
}

/** Creates a failed response with an explicit code and message. */
export function failWith(code: string, message: string): ApiFailure {
  return fail(new AppError(message, code));
}

/**
 * Executes an async operation and wraps the outcome in `ApiResponse`.
 * Use this as the standard boundary for future service methods.
 */
export async function fromPromise<T>(operation: () => Promise<T>): Promise<ApiResponse<T>> {
  try {
    const data = await operation();
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export function isSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success;
}

export function isFailure<T>(response: ApiResponse<T>): response is ApiFailure {
  return !response.success;
}
