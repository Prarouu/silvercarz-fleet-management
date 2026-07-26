import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { appConfig } from '@/config';

export const metadata: Metadata = {
  title: 'Forgot password',
};

/**
 * Password reset is not self-service in the MVP.
 * Accounts are managed by the Owner / Supabase Dashboard.
 */
export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-md border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold tracking-tight">Reset password</CardTitle>
        <CardDescription>
          Password resets for {appConfig.name} are handled by your administrator. Contact the Owner
          to restore access to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button asChild variant="outline">
          <Link href={ROUTES.login}>Back to sign in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
