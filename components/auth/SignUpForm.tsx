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


export default function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast();
  const router = useRouter()


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

  const socialButtons = (
    <AuthSocialButton
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/" })}
      disabled={isLoading}
    >
      <Icons.google className="mr-2 h-4 w-4" />
      Google
    </AuthSocialButton>
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
