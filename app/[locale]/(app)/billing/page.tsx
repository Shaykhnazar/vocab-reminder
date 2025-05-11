// app/(app)/billing/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import BillingPage from "@/components/billing/BillingPage";
import { getSubscriptionData, getBillingHistory } from "@/lib/supabase";

export default async function Billing() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Get subscription data and billing history
  const subscriptionData = await getSubscriptionData(session.user.id);
  const billingHistory = await getBillingHistory(session.user.id);

  return <BillingPage
    subscriptionData={subscriptionData}
    billingHistory={billingHistory}
  />;
}
