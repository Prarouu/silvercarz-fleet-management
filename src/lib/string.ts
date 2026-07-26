/** Trims and collapses internal whitespace. */
export function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/** Returns true when a string is empty or only whitespace. */
export function isBlank(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim().length === 0;
}

/** Capitalizes the first character of a string. */
export function capitalize(value: string): string {
  if (value.length === 0) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Converts an identifier-like string into Title Case words.
 * Example: `in_progress` → `In Progress`
 */
export function toTitleCase(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((part) => capitalize(part.toLowerCase()))
    .join(' ');
}

/** Truncates a string to `maxLength`, appending an ellipsis when needed. */
export function truncate(value: string, maxLength: number, ellipsis = '…'): string {
  if (maxLength < 0) {
    return value;
  }
  if (value.length <= maxLength) {
    return value;
  }
  if (maxLength === 0) {
    return '';
  }
  return `${value.slice(0, Math.max(0, maxLength - ellipsis.length))}${ellipsis}`;
}
