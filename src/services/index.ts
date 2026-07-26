/**
 * Shared service-layer foundation.
 *
 * Feature modules should:
 * 1. Implement domain repositories against `Repository` / `ReadRepository`
 * 2. Expose public methods that return `ApiResponse<T>` via `ok` / `fail` / `fromPromise`
 * 3. Never leak raw infrastructure errors to the UI
 */

export { fail, failWith, fromPromise, isFailure, isSuccess, ok } from './result';

export type { ReadRepository, Repository } from './repository';
