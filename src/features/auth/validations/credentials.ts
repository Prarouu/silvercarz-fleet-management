/**
 * Credential validation schemas for login and password flows.
 *
 * Used by the login UI (React Hook Form) and sign-in Server Action.
 */

import { z } from 'zod';

import { emailSchema, nonEmptyStringSchema } from '@/validations';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be at most 72 characters.');

export const signInCredentialsSchema = z.object({
  email: emailSchema,
  password: nonEmptyStringSchema,
});

export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type SignInCredentials = z.infer<typeof signInCredentialsSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
