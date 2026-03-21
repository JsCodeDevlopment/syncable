import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function LeadingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between mx-auto">
        <div className="flex items-center gap-2 group cursor-pointer">
          <Image
            src="/images/syncable-logo.png"
            className="dark:invert"
            alt="Syncable Logo"
            width={140}
            height={120}
          />
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            href="#features"
            className="hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="hover:text-primary transition-colors"
          >
            How it works
          </Link>
          <Link href="#faq" className="hover:text-primary transition-colors">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-semibold">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button className="font-bold shadow-lg shadow-primary/25">
              Join Now
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
