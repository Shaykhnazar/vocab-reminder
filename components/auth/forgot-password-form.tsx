// components/auth/forgot-password-form.tsx
"use client"

import React, { useState } from "react"
import { AuthCard, AuthInput, AuthButton } from "./auth-form"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"
import { generatePasswordResetToken } from "@/lib/auth"
import { useTranslations } from 'next-intl';

export default function ForgotPasswordForm() {
  const t = useTranslations('Auth.ForgotPassword');
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await generatePasswordResetToken(email)

      toast({
        title: t('toast.checkEmail'),
        description: t('toast.resetLinkSent'),
      })
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('toast.genericError'),
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
          label={t('form.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('form.emailPlaceholder')}
          required
          disabled={isLoading}
        />
        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              {t('form.sendingResetLink')}
            </>
          ) : (
            t('form.sendResetLink')
          )}
        </AuthButton>
      </form>
    </AuthCard>
  )
}
