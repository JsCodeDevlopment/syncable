"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-10">
      <Link href="/dashboard" className="flex items-center space-x-2 group shrink-0">
        <div className="relative">
          <Image
            src="/images/syncable-logo.png"
            className="dark:invert grayscale group-hover:grayscale-0 transition-all duration-500"
            alt="Syncable Logo"
            width={100}
            height={80}
          />
          <div className="absolute -inset-1 bg-primary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
      <nav className="hidden md:flex items-center gap-8">
        {[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Reports", href: "/reports" },
          { name: "Settings", href: "/settings" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative text-sm font-semibold tracking-wide transition-all duration-300 py-1 px-2 group",
              pathname === item.href 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.name}
            <span className={cn(
              "absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 rounded-full",
              pathname === item.href ? "w-full" : "w-0 group-hover:w-full opacity-50"
            )} />
          </Link>
        ))}
      </nav>
    </div>
  );
}
