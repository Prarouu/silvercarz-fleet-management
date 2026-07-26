/**
 * Shared domain-agnostic TypeScript types.
 *
 * Feature-specific types belong in `features/<name>/types` — only promote
 * a type here when two or more modules need it.
 */

/** ISO-style ascending / descending sort direction. */
export type SortOrder = 'asc' | 'desc';

/** Generic label/value pair for selects, filters, and menus. */
export interface SelectOption<TValue extends string = string> {
  readonly label: string;
  readonly value: TValue;
  readonly disabled?: boolean;
}

/** Standard timestamp fields present on persisted records. */
export interface TimestampFields {
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Base shape for entities that have an id and audit timestamps. */
export interface BaseEntity extends TimestampFields {
  readonly id: string;
}

/** Nullable helper that preserves the original type when non-null. */
export type Nullable<T> = T | null;

/** Make selected keys optional. */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
