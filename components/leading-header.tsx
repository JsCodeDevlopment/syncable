import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function LeadingHeader() {
  return (
    <header className="border-b w-full">
      <div className="flex w-full h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Image
            src="/images/syncable-logo.png"
            alt="Syncable Logo"
            width={140}
            height={120}
          />
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Sign up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
