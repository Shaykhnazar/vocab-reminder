// app/(auth)/login.tsx
import SignInForm from '@/components/auth/SignInForm';
import {getServerSession} from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {redirect} from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authOptions);

  // If already authenticated, redirect to home
  if (session) {
    redirect("/");
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <SignInForm/>
    </div>
  );
}
