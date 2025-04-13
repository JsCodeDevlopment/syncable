"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © 2025 - {new Date().getFullYear()} Syncable. All rights reserved.
          Designed by{" "}
          <Link
            href="https://github.com/JsCodeDevlopment"
            className="text-red-500 hover:underline"
            target="_blank"
          >
            Jonatas Silva
          </Link>
        </p>
        <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
