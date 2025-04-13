"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-10">
      <Link href="/dashboard" className="flex items-center space-x-2">
        <Image
          src="/images/syncable-logo.png"
          alt="Syncable Logo"
          width={120}
          height={100}
        />
      </Link>
      <nav className="flex gap-6">
        <Button
          className={cn(
            "flex items-center text-sm font-medium transition-colors"
          )}
          variant={pathname === "/dashboard" ? "default" : "outline"}
        >
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button
          className={cn(
            "flex items-center text-sm font-medium transition-colors"
          )}
          variant={pathname === "/reports" ? "default" : "outline"}
        >
          <Link href="/reports">Reports</Link>
        </Button>
        <Button
          className={cn(
            "flex items-center text-sm font-medium transition-colors"
          )}
          variant={pathname === "/settings" ? "default" : "outline"}
        >
          <Link href="/settings">Settings</Link>
        </Button>
      </nav>
    </div>
  );
}
