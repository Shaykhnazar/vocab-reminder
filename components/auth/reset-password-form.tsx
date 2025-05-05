// components/auth/reset-password-form.tsx
"use client"

import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthCard, AuthInput, AuthButton } from "./auth-form"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"
import { resetPassword } from "@/lib/auth"
import { useTranslations } from 'next-intl';

export default function ResetPasswordForm() {
  const t = useTranslations('Auth.ResetPassword');
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
        title: t('toast.error'),
        description: t('toast.invalidToken'),
      })
      return
    }

    setIsLoading(true)

    try {
      await resetPassword(token, password)

      toast({
        title: t('toast.success'),
        description: t('toast.successDesc'),
      })

      router.push("/login")
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('toast.failedReset'),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard
      title={t('title')}
      footerText={t('footer.text')}
      footerLink={{
        text: t('footer.link'),
        href: "/login",
      }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput
          label={t('form.newPassword')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('form.newPasswordPlaceholder')}
          required
          disabled={isLoading}
        />
        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              {t('form.resettingPassword')}
            </>
          ) : (
            t('form.resetPassword')
          )}
        </AuthButton>
      </form>
    </AuthCard>
  )
}
