"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/dashboard" className="flex items-center space-x-2">
        <Clock className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">TimeKeeper</span>
      </Link>
      <nav className="flex gap-6">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/reports"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === "/reports" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Reports
        </Link>
        <Link
          href="/settings"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === "/settings" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Settings
        </Link>
      </nav>
    </div>
  )
}
