// app/(marketing)/layout.tsx
import { GuestNavbar, Footer } from '@/components/navigation';
import React from "react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <GuestNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
