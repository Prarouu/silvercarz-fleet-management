import { appConfig } from '@/config/app';

/**
 * Pagination defaults for list queries and tables.
 */
export const PAGINATION = {
  defaultPage: 1,
  defaultPageSize: appConfig.defaultPageSize,
  pageSizeOptions: [10, 20, 50, 100] as const,
} as const;
