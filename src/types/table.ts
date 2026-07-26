import type { SortOrder } from './common';

/**
 * Lightweight column descriptor for shared table utilities.
 *
 * Feature modules may extend this; TanStack Table column defs remain
 * the runtime source of truth for rendered tables.
 */
export interface TableColumn<TField extends string = string> {
  readonly id: TField;
  readonly header: string;
  readonly sortable?: boolean;
  readonly align?: 'left' | 'center' | 'right';
  readonly hidden?: boolean;
}

/** Active sort state for a table. */
export interface TableSortState<TField extends string = string> {
  readonly field: TField;
  readonly order: SortOrder;
}
