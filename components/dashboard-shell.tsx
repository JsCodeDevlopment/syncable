import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import type React from "react";

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex items-center justify-between py-4 px-20">
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
