// components/auth/auth-form.tsx
"use client"

import { Button } from "@/components/shadcn-ui/button"
import { Input } from "@/components/shadcn-ui/input"
import Link from "next/link"
import React from "react";

interface AuthFormProps {
  children: React.ReactNode
  title: string
  socialButtons?: React.ReactNode
  footerText?: string
  footerLink?: {
    text: string
    href: string
  }
}

export function AuthCard({
 children,
 title,
 socialButtons,
 footerText,
 footerLink,
}: AuthFormProps) {
  return (
    <div className="w-full max-w-[400px] space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      {children}

      {socialButtons && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                OR CONTINUE WITH
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {socialButtons}
          </div>
        </>
      )}

      {footerText && footerLink && (
        <p className="text-center text-sm text-muted-foreground">
          {footerText}{" "}
          <Link
            href={footerLink.href}
            className="text-primary underline-offset-4 hover:underline"
          >
            {footerLink.text}
          </Link>
        </p>
      )}
    </div>
  )
}

export function AuthInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-foreground/90">{label}</label>
      <Input className="h-10" {...props} />
    </div>
  )
}

export function AuthButton({
 children,
 ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      className="w-full h-10 bg-[#6366F1] hover:bg-[#5658DD] text-white"
      {...props}
    >
      {children}
    </Button>
  )
}

export function AuthSocialButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      variant="outline"
      className="w-full h-10 font-normal hover:bg-background hover:opacity-80"
      {...props}
    >
      {children}
    </Button>
  )
}
