// app/(auth)/login.tsx
import SignInForm from '@/components/auth/SignInForm';
import Link from "next/link";
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-6">
        <h2 className="text-center text-3xl font-extrabold">Sign In</h2>
        <SignInForm/>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
