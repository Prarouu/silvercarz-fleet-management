/**
 * Browser storage keys used across the application.
 *
 * Keep every localStorage / sessionStorage key here so keys stay unique
 * and easy to rotate.
 */
export const STORAGE_KEYS = {
  theme: 'silvercarz-theme',
  sidebarState: 'silvercarz-sidebar',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
