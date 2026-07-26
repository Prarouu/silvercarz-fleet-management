import { Car } from 'lucide-react';

import { LoginForm } from '@/features/auth/components/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { appConfig } from '@/config';

interface LoginPanelProps {
  readonly nextPath?: string;
  readonly initialError?: string;
}

/**
 * Server-rendered login shell: brand mark + credential form.
 * The interactive form is a Client Component.
 */
export function LoginPanel({ nextPath, initialError }: LoginPanelProps) {
  return (
    <Card className="w-full max-w-md border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
      <CardHeader className="items-center text-center">
        <div
          className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          <Car className="size-6" />
        </div>
        <CardTitle className="text-xl font-semibold tracking-tight">{appConfig.name}</CardTitle>
        <CardDescription>
          Sign in to {appConfig.title}. Accounts are issued by your administrator.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm nextPath={nextPath} initialError={initialError} />
      </CardContent>
    </Card>
  );
}
