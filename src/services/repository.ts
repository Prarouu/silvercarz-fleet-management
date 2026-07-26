import type { BaseEntity } from '@/types/common';
import type { ListQueryParams, PaginatedResult } from '@/types/pagination';

/**
 * Generic repository contract for future data-access modules.
 *
 * Implementations will live beside feature services (e.g.
 * `features/bookings/services`). This file only defines the shared shape —
 * it contains no database queries.
 */
export interface Repository<TEntity extends BaseEntity, TCreate, TUpdate> {
  findById(id: string): Promise<TEntity | null>;
  list(params?: ListQueryParams): Promise<PaginatedResult<TEntity>>;
  create(input: TCreate): Promise<TEntity>;
  update(id: string, input: TUpdate): Promise<TEntity>;
  delete(id: string): Promise<void>;
}

/**
 * Read-only repository variant for reporting / lookup use cases.
 */
export interface ReadRepository<TEntity extends BaseEntity> {
  findById(id: string): Promise<TEntity | null>;
  list(params?: ListQueryParams): Promise<PaginatedResult<TEntity>>;
}
