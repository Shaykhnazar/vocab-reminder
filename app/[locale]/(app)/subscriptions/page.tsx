// app/(app)/subscriptions/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SubscriptionsPage from "@/components/subscription/SubscriptionsPage";
import { getFullSubscriptionData } from "@/lib/supabase";

export default async function Subscriptions() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Get full subscription data including plans and current subscription
  const subscriptionData = await getFullSubscriptionData(session.user.id);

  return <SubscriptionsPage data={subscriptionData} />;
}
