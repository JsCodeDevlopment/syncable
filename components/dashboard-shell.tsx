"use client";

import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import type React from "react";

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({
  children,
  className,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        <div className="flex h-16 items-center justify-between py-4 px-6 md:px-20 max-w-[1600px] mx-auto">
          <MainNav />
          <UserNav />
        </div>
      </header>
      <main className="flex-1 px-20">
        <div className="grid gap-6 py-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}
