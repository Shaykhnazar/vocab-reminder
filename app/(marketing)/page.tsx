// app/(marketing)/page.tsx
import LandingPage from '@/components/LandingPage';
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function MarketingPage() {
  const session = await getServerSession(authOptions);

  // If session exists, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
