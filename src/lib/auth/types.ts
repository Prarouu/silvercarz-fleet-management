/**
 * Authentication domain types.
 *
 * Slim, app-facing shapes derived from Supabase Auth. Feature code should
 * prefer these over importing `@supabase/supabase-js` types directly.
 */

/** Known application roles — populated once role assignment is wired up. */
export type AppRole = 'owner' | 'manager';

/**
 * Authenticated user as consumed by the application.
 * Role is optional until authorization metadata is introduced.
 */
export interface AuthUser {
  readonly id: string;
  readonly email: string | undefined;
  readonly role: AppRole | null;
}

/** Result of resolving the current auth state on the server. */
export interface AuthState {
  readonly user: AuthUser | null;
  readonly isAuthenticated: boolean;
}
