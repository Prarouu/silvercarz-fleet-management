/**
 * Auth feature public exports.
 *
 * Infrastructure (session, guards, sign-out helper) lives in `@/lib/auth`.
 * This barrel exposes feature-owned schemas, actions, and UI for login.
 */

export { signInAction, type SignInActionResult } from './actions/sign-in';
export { signOutAction } from './actions/sign-out';
export { LoginForm } from './components/login-form';
export { LoginPanel } from './components/login-panel';
export { UserMenu } from './components/user-menu';
export {
  passwordSchema,
  resetPasswordRequestSchema,
  signInCredentialsSchema,
  updatePasswordSchema,
  type ResetPasswordRequest,
  type SignInCredentials,
  type UpdatePasswordInput,
} from './validations/credentials';
