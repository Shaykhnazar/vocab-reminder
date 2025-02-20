// components/auth/SignUpForm.tsx
"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Use `next/navigation` instead of `next/router`
import { createUser } from '@/lib/auth';
import { signIn } from "next-auth/react"
import { Icons } from "@/components/icons"
import { AuthCard, AuthInput, AuthButton, AuthSocialButton } from "./auth-form"
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {LoginButton} from "@telegram-auth/react";


export default function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast();
  const router = useRouter()

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createUser(email, password)
      router.push("/verify-email")
    } catch (err: any) {
      console.error('Signup error:', err)

      if (err.message?.includes('already registered')) {
        toast({
          variant: "default",
          title: "Email already registered",
          description: (
            <div className="flex flex-col space-y-2">
              <p>This email is already registered.</p>
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in instead
              </Link>
            </div>
          ),
        })
      } else {
        toast({
          title: "Error",
          description: err.message || 'An error occurred during sign up',
        })
      }
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
      title="Sign Up"
      socialButtons={socialButtons}
      footerText="Already have an account?"
      footerLink={{
        text: "Sign In",
        href: "/login"
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
          disabled={isLoading}
        />
        <AuthInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          disabled={isLoading}
        />
        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </AuthButton>
      </form>
    </AuthCard>
  )
}
