import { z } from 'zod';

import { PAGINATION } from '@/constants/pagination';

/**
 * Reusable Zod schemas and validation helpers.
 *
 * Feature modules should compose these primitives instead of redefining
 * common field rules. Domain-specific schemas belong in
 * `features/<name>/validations`.
 */

export const nonEmptyStringSchema = z.string().trim().min(1, 'This field is required.');

export const emailSchema = z.email('Enter a valid email address.');

export const optionalEmailSchema = z.union([z.literal(''), emailSchema]).optional();

/** Basic international phone shape — digits with optional leading +. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s()-]{7,20}$/, 'Enter a valid phone number.');

export const uuidSchema = z.uuid('Enter a valid id.');

export const positiveIntSchema = z.number().int().positive();

export const nonNegativeIntSchema = z.number().int().nonnegative();

export const paginationSchema = z.object({
  page: positiveIntSchema.default(PAGINATION.defaultPage),
  pageSize: positiveIntSchema.default(PAGINATION.defaultPageSize),
});

export const sortOrderSchema = z.enum(['asc', 'desc']);

export const searchSchema = z.string().trim().max(200).optional();

/** Returns true when `value` parses successfully against `schema`. */
export function isValid<T>(schema: z.ZodType<T>, value: unknown): value is T {
  return schema.safeParse(value).success;
}

/** Parses `value` or returns null when validation fails. */
export function parseOrNull<T>(schema: z.ZodType<T>, value: unknown): T | null {
  const result = schema.safeParse(value);
  return result.success ? result.data : null;
}
