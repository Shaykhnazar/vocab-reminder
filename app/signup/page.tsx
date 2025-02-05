// auth/signup.tsx
import SignUpForm from '@/components/auth/SignUpForm';
import Link from "next/link";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
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
        <h2 className="text-center text-3xl font-extrabold">Sign Up</h2>
        <SignUpForm/>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
