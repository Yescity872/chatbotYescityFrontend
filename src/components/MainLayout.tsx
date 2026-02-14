"use client";

import { useAuth } from "@/lib/AuthContext";
import React from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // If user is logged in, we add padding to top to account for fixed navbar
  // If not logged in, we don't need the padding since navbar is null
  const shouldAddPadding = !loading && user;

  return (
    <main className={shouldAddPadding ? "pt-[80px]" : ""}>
      {children}
    </main>
  );
}
