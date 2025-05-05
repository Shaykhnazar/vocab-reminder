// components/auth/SignUpForm.tsx
"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUser } from '@/lib/auth';
import { signIn } from "next-auth/react"
import { Icons } from "@/components/icons"
import { AuthCard, AuthInput, AuthButton, AuthSocialButton } from "./auth-form"
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { LoginButton } from "@telegram-auth/react";
import { useTranslations } from 'next-intl';

export default function SignUpForm() {
  const t = useTranslations('Auth.SignUp');
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
          title: t('toast.emailRegistered'),
          description: (
            <div className="flex flex-col space-y-2">
              <p>{t('toast.emailRegisteredDesc')}</p>
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                {t('toast.signInInstead')}
              </Link>
            </div>
          ),
        })
      } else {
        toast({
          title: t('toast.error'),
          description: err.message || t('errors.generic'),
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleTelegramAuth = async (data: any) => {
    setIsLoading(true);
    try {
      const result = await signIn("telegram-login", {
        callbackUrl: "/",
        redirect: false, // Don't redirect automatically
      }, data);

      if (result?.error) {
        toast({
          title: t('toast.error'),
          description: result.error,
        });
      } else {
        // Successful login - redirect to words
        router.push("/words");
      }
    } catch (error) {
      console.error('Telegram auth error:', error);
      toast({
        title: t('toast.error'),
        description: t('errors.telegramAuth'),
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
      title={t('title')}
      socialButtons={socialButtons}
      footerText={t('footer.text')}
      footerLink={{
        text: t('footer.link'),
        href: "/login"
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label={t('form.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('form.emailPlaceholder')}
          required
          disabled={isLoading}
        />
        <AuthInput
          label={t('form.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('form.passwordPlaceholder')}
          required
          disabled={isLoading}
        />
        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              {t('form.creatingAccount')}
            </>
          ) : (
            t('form.createAccount')
          )}
        </AuthButton>
      </form>
    </AuthCard>
  )
}
