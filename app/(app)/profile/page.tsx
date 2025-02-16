// app/(app)/profile/page.tsx
import ProfilePage from '@/components/ProfilePage';
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  return <ProfilePage />;
}
