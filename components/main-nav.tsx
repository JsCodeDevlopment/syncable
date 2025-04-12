"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/dashboard" className="flex items-center space-x-2">
        <img
          src="/images/syncable-logo.png"
          alt="Syncable Logo"
          className="h-8"
        />
      </Link>
      <nav className="flex gap-6">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/reports"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === "/reports" ? "text-primary" : "text-muted-foreground"
          )}
        >
          Reports
        </Link>
        <Link
          href="/settings"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === "/settings" ? "text-primary" : "text-muted-foreground"
          )}
        >
          Settings
        </Link>
      </nav>
    </div>
  );
}
