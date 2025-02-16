// components/auth/forgot-password-form.tsx
"use client"

import React, { useState } from "react"
import { AuthCard, AuthInput, AuthButton } from "./auth-form"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"
import { generatePasswordResetToken } from "@/lib/auth"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await generatePasswordResetToken(email)

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard
      title="Forgot Password"
      footerText="Remember your password?"
      footerLink={{
        text: "Sign in",
        href: "/login",
      }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
          disabled={isLoading}
        />
        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Sending reset link...
            </>
          ) : (
            "Send reset link"
          )}
        </AuthButton>
      </form>
    </AuthCard>
  )
}
