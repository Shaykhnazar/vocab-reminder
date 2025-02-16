// app/forgot-password/page.tsx
import ForgotPasswordForm from "@/components/auth/forgot-password-form"
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";

export default async function ForgotPasswordPage() {
  const session = await getServerSession(authOptions);

  // If already authenticated, redirect to home
  if (session) {
    redirect("/");
  }
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <ForgotPasswordForm />
    </div>
  )
}
