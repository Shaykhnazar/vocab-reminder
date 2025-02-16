// components/auth/reset-password-form.tsx
"use client"

import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthCard, AuthInput, AuthButton } from "./auth-form"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"
import { resetPassword } from "@/lib/auth"

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid reset token",
      })
      return
    }

    setIsLoading(true)

    try {
      await resetPassword(token, password)

      toast({
        title: "Password reset successful",
        description: "You can now sign in with your new password.",
      })

      router.push("/login")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard
      title="Reset Password"
      footerText="Remember your password?"
      footerLink={{
        text: "Sign in",
        href: "/login",
      }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your new password"
          required
          disabled={isLoading}
        />
        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Resetting password...
            </>
          ) : (
            "Reset password"
          )}
        </AuthButton>
      </form>
    </AuthCard>
  )
}
