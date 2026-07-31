import { Car } from 'lucide-react';

import { IconWell } from '@/components/shared/icon-well';
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
    <Card className="w-full max-w-md border-none bg-card/95 shadow-dialog ring-1 ring-border/60 backdrop-blur-sm">
      <CardHeader className="items-center text-center">
        <IconWell
          icon={Car}
          tone="default"
          size="md"
          className="mb-2 size-12 rounded-2xl bg-primary text-primary-foreground [&_svg]:size-6"
        />
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
