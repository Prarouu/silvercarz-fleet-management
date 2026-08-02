'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useId, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';
import { customerSignUpAction } from '@/features/customer-auth/actions/sign-up';
import {
  customerSignUpSchema,
  type CustomerSignUpInput,
} from '@/features/customer-auth/validations/credentials';
import { cn } from '@/lib/utils';

interface CustomerSignupFormProps {
  readonly nextPath?: string;
  readonly className?: string;
}

export function CustomerSignupForm({ nextPath, className }: CustomerSignupFormProps) {
  const fullNameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const errorId = useId();
  const successId = useId();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerSignUpInput>({
    resolver: zodResolver(customerSignUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onSubmit',
  });

  const isLoading = isSubmitting || isPending;

  const loginHref = nextPath
    ? `${ROUTES.customerLogin}?${new URLSearchParams({ next: nextPath }).toString()}`
    : ROUTES.customerLogin;

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await customerSignUpAction(values, nextPath);

      if (!result) {
        return;
      }

      if (!result.success) {
        setFormError(result.error.message);
        return;
      }

      if (result.data.emailConfirmationRequired) {
        setSuccessMessage('Please check your email to confirm your account before signing in.');
      }
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn('grid gap-4', className)}
      aria-describedby={formError ? errorId : successMessage ? successId : undefined}
    >
      {formError ? (
        <Alert variant="destructive" id={errorId}>
          <AlertTitle>Sign up failed</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert id={successId}>
          <AlertTitle>Confirm your email</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor={fullNameId}>Full name</Label>
        <Input
          id={fullNameId}
          type="text"
          autoComplete="name"
          autoFocus
          placeholder="Your full name"
          aria-invalid={errors.fullName ? true : undefined}
          aria-describedby={errors.fullName ? `${fullNameId}-error` : undefined}
          disabled={isLoading || Boolean(successMessage)}
          className="h-11 rounded-md"
          {...register('fullName')}
        />
        {errors.fullName ? (
          <p id={`${fullNameId}-error`} className="text-sm text-destructive" role="alert">
            {errors.fullName.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor={emailId}>Email</Label>
        <Input
          id={emailId}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          disabled={isLoading || Boolean(successMessage)}
          className="h-11 rounded-md"
          {...register('email')}
        />
        {errors.email ? (
          <p id={`${emailId}-error`} className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor={passwordId}>Password</Label>
        <div className="relative">
          <Input
            id={passwordId}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="h-11 rounded-md pr-10"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? `${passwordId}-error` : undefined}
            disabled={isLoading || Boolean(successMessage)}
            {...register('password')}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={isLoading || Boolean(successMessage)}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>
        {errors.password ? (
          <p id={`${passwordId}-error`} className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor={confirmPasswordId}>Confirm password</Label>
        <div className="relative">
          <Input
            id={confirmPasswordId}
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            className="h-11 rounded-md pr-10"
            aria-invalid={errors.confirmPassword ? true : undefined}
            aria-describedby={errors.confirmPassword ? `${confirmPasswordId}-error` : undefined}
            disabled={isLoading || Boolean(successMessage)}
            {...register('confirmPassword')}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowConfirmPassword((current) => !current)}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            disabled={isLoading || Boolean(successMessage)}
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>
        {errors.confirmPassword ? (
          <p id={`${confirmPasswordId}-error`} className="text-sm text-destructive" role="alert">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full rounded-md bg-primary font-bold tracking-wide text-primary-foreground uppercase hover:bg-primary/90"
        disabled={isLoading || Boolean(successMessage)}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            Creating account…
          </>
        ) : (
          'Create account'
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href={loginHref}
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
