import { PAGINATION } from '@/constants';
import type { PaginatedResult, PaginationMeta, PaginationParams } from '@/types';

/** Builds pagination metadata from raw totals. */
export function createPaginationMeta(params: PaginationParams, totalItems: number): PaginationMeta {
  const pageSize = Math.max(1, params.pageSize);
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
  const page = Math.max(1, params.page);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: totalPages > 0 && page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
  };
}

/** Wraps a data array with pagination metadata. */
export function createPaginatedResult<T>(
  data: readonly T[],
  params: PaginationParams,
  totalItems: number,
): PaginatedResult<T> {
  return {
    data,
    meta: createPaginationMeta(params, totalItems),
  };
}

/** Normalizes potentially missing pagination input to safe defaults. */
export function normalizePaginationParams(params?: Partial<PaginationParams>): PaginationParams {
  return {
    page: Math.max(1, params?.page ?? PAGINATION.defaultPage),
    pageSize: Math.max(1, params?.pageSize ?? PAGINATION.defaultPageSize),
  };
}

/** Converts page/pageSize into a zero-based offset for queries. */
export function toOffset(params: PaginationParams): number {
  const normalized = normalizePaginationParams(params);
  return (normalized.page - 1) * normalized.pageSize;
}
