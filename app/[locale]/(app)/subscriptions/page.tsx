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

  try {
    // Get full subscription data including plans and current subscription
    const subscriptionData = await getFullSubscriptionData(session.user.id);
    
    return <SubscriptionsPage data={subscriptionData} />;
  } catch (error) {
    console.error('Error loading subscription data:', error);
    
    // Return empty data structure to prevent crash
    const fallbackData = {
      data: {
        currentSubscription: null,
        plans: [
          {
            id: 'free',
            name: 'Free Plan',
            description: 'Basic vocabulary learning with limited features',
            price: 0,
            billingPeriod: 'monthly' as const,
            wordLimit: 1000,
            features: ['Basic vocabulary management', 'Email notifications', 'Limited to 1000 words'],
            popular: false,
            gumroadProductId: 'free',
            gumroadPermalink: ''
          }
        ]
      }
    };
    
    return <SubscriptionsPage data={fallbackData} />;
  }
}
