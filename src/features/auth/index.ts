/**
 * Auth feature public exports.
 *
 * Infrastructure (session, guards, sign-out) lives in `@/lib/auth`.
 * This barrel exposes feature-owned schemas for the upcoming login UI.
 */

export {
  passwordSchema,
  resetPasswordRequestSchema,
  signInCredentialsSchema,
  updatePasswordSchema,
  type ResetPasswordRequest,
  type SignInCredentials,
  type UpdatePasswordInput,
} from './validations/credentials';
