// components/auth/SignInForm.tsx
"use client"

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoginButton } from "@telegram-auth/react";
import { AuthCard, AuthInput, AuthButton, AuthSocialButton } from "./auth-form"
import { Icons } from "@/components/icons"
import Link from "next/link";
import {useToast} from "@/hooks/use-toast";

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password")
        return
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error(error);
      setError('An error occurred during sign in');
    } finally {
      setIsLoading(false)
    }
  }

  // Add to SignUpForm.tsx
  const handleTelegramAuth = async (data: any) => {
    setIsLoading(true);
    try {
      const result = await signIn("telegram-login", {
        callbackUrl: "/",
        redirect: false, // Don't redirect automatically
      }, data);

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
        });
      } else {
        // Successful login - redirect to words
        router.push("/words");
      }
    } catch (error) {
      console.error('Telegram auth error:', error);
      toast({
        title: "Error",
        description: 'An error occurred during Telegram sign in',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const socialButtons = (
    <>
      <AuthSocialButton
        type="button"
        onClick={() => signIn("google", {callbackUrl: "/"})}
        disabled={isLoading}
      >
        <Icons.google className="mr-2 h-4 w-4"/>
        Google
      </AuthSocialButton>

      {botUsername ? (
        <div className="flex justify-center">
          <LoginButton
            botUsername={botUsername}
            onAuthCallback={handleTelegramAuth}
          />
        </div>
      ) : null}
    </>
  )

  return (
    <AuthCard
      title="Sign In"
      socialButtons={socialButtons}
      footerText="Don't have an account?"
      footerLink={{
        text: "Sign Up",
        href: "/signup"
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        <div className="space-y-2">
          <AuthInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </AuthButton>
      </form>
    </AuthCard>
  );
}
