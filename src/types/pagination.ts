import type { SortOrder } from './common';

/** Incoming pagination parameters for list queries. */
export interface PaginationParams {
  readonly page: number;
  readonly pageSize: number;
}

/** Sort parameters for list queries. */
export interface SortParams<TField extends string = string> {
  readonly sortBy?: TField;
  readonly sortOrder?: SortOrder;
}

/** Combined list-query input used by future services. */
export interface ListQueryParams<TField extends string = string>
  extends PaginationParams, SortParams<TField> {
  readonly search?: string;
}

/** Metadata describing a paginated result set. */
export interface PaginationMeta {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

/** Generic paginated collection. */
export interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly meta: PaginationMeta;
}
