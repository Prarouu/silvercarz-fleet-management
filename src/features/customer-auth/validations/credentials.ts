/**
 * Customer signup / login credential schemas.
 *
 * Reuses shared email + password primitives. Role is never accepted from the client.
 */

import { z } from 'zod';

import { passwordSchema, signInCredentialsSchema } from '@/features/auth/validations/credentials';
import { emailSchema } from '@/validations';

export { signInCredentialsSchema };
export type { SignInCredentials } from '@/features/auth/validations/credentials';

export const customerSignUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Enter your full name.')
      .max(120, 'Full name must be at most 120 characters.'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type CustomerSignUpInput = z.infer<typeof customerSignUpSchema>;
