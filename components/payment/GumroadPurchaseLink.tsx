'use client';

import React from 'react';
import { Button } from '@/components/shadcn-ui/button';
import { useToast } from "@/hooks/use-toast";
import { useSession } from 'next-auth/react'; // Import useSession from next-auth

type GumroadLinkProps = {
  planType: 'monthly' | 'yearly' | 'lifetime';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  className?: string;
  email?: string;
  children: React.ReactNode;
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

const GumroadPurchaseLink: React.FC<GumroadLinkProps> = ({
   planType,
   variant = 'default',
   className = '',
   email,
   children
 }) => {
  const { toast } = useToast();
  // Get session data from NextAuth
  const { data: session } = useSession();

  // Get the appropriate product ID based on the plan type
  const getProductId = () => {
    switch (planType) {
      case 'monthly':
        return process.env.NEXT_PUBLIC_GUMROAD_MONTHLY_PRODUCT_ID;
      case 'yearly':
        return process.env.NEXT_PUBLIC_GUMROAD_YEARLY_PRODUCT_ID;
      case 'lifetime':
        return process.env.NEXT_PUBLIC_GUMROAD_LIFETIME_PRODUCT_ID;
      default:
        return process.env.NEXT_PUBLIC_GUMROAD_MONTHLY_PRODUCT_ID;
    }
  };

  const handlePurchase = () => {
    const sellerId = process.env.NEXT_PUBLIC_GUMROAD_SELLER_ID;
    const productId = getProductId();

    if (!sellerId || !productId) {
      toast({
        title: "Configuration Error",
        description: "Payment system is not properly configured. Please try again later.",
      });
      return;
    }

    // Build the Gumroad URL
    let gumroadUrl = `https://vocabry.gumroad.com/l/${productId}`;

    // Add query parameters
    // const params = new URLSearchParams();

    // Pre-fill the email if available
    let userEmail = email;
    if (!userEmail && session?.user?.email) {
      userEmail = session.user.email;
    }

    if (userEmail) {
      gumroadUrl += `?email=${encodeURIComponent(userEmail)}`;
    }

    // Add success and cancel URLs
    // const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    // params.append('success_url', `${appUrl}/payment/success?plan=${planType}`);
    // params.append('cancel_url', `${appUrl}/payment/cancel`);

    // Append params to URL
    // if (params.toString()) {
    //   gumroadUrl += `?${params.toString()}`;
    // }

    console.log('Opening Gumroad URL:', gumroadUrl);

    // Open the Gumroad URL in a new tab
    window.open(gumroadUrl, '_blank');
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handlePurchase}
    >
      {children}
    </Button>
  );
};

export default GumroadPurchaseLink;
