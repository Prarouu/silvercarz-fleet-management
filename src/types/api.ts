/**
 * Standard API / service response envelopes.
 *
 * All future modules should return these shapes so UI layers can handle
 * success and failure uniformly.
 */

/** Successful response carrying a typed payload. */
export interface ApiSuccess<T> {
  readonly success: true;
  readonly data: T;
}

/** Failed response with a safe, display-ready message. */
export interface ApiFailure {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}

/** Discriminated union for any API / service call. */
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
