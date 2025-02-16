// app/verify-email/page.tsx
import { verifyEmail } from '@/lib/auth';
import { Button } from '@/components/shadcn-ui/button';
import Link from 'next/link';

interface VerifyEmailPageProps {
  searchParams: { token?: string };
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  let verified = false;
  let error = null;

  if (searchParams.token) {
    try {
      verified = await verifyEmail(searchParams.token);
    } catch (e: any) {
      error = e.message;
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Email Verification
          </h1>
          {verified ? (
            <>
              <p className="text-muted-foreground">
                Your email has been verified successfully!
              </p>
              <div className="mt-4">
                <Link href="/login">
                  <Button className="w-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            </>
          ) : error ? (
            <>
              <p className="text-destructive">{error}</p>
              <div className="mt-4">
                <Link href="/signup">
                  <Button variant="outline" className="w-full">
                    Back to Sign Up
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">
              Verifying your email address...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
