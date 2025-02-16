// app/(app)/layout.tsx
import { AuthNavbar, Footer } from '@/components/navigation';

import React from "react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen flex-col">
      <AuthNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
