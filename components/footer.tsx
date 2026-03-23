"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Image
                src="/images/syncable-logo.png"
                className="dark:invert h-auto"
                alt="Syncable Logo"
                width={130}
                height={40}
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Elevating the standard of time tracking for modern professionals.
              Precision, privacy, and performance in every punch.
            </p>
            <div className="flex gap-4">
              <Link
                href="https://github.com/JsCodeDevlopment"
                target="_blank"
                className="h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                <Github className="h-4.5 w-4.5" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/jscodedevelopment"
                target="_blank"
                className="h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                <Linkedin className="h-4.5 w-4.5" />
              </Link>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-xs uppercase tracking-[0.2em] mb-6 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-1 h-3 bg-primary rounded-full" />
              Platform
            </h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/#features"
                  className="hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 group-hover:bg-primary transition-colors" />
                  Key Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 group-hover:bg-primary transition-colors" />
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 group-hover:bg-primary transition-colors" />
                  Common Questions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-xs uppercase tracking-[0.2em] mb-6 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-1 h-3 bg-primary rounded-full" />
              Contact & Privacy
            </h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <span>jonatasilva118@gmail.com</span>
              </li>
              <li className="pt-2 border-t mt-4 border-dashed border-muted-foreground/20" />
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-muted-foreground font-medium opacity-70">
            © {new Date().getFullYear()} Syncable Corp. Precision Workflows.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
            <span>Crafted by</span>
            <Link
              href="https://github.com/JsCodeDevlopment"
              className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-primary hover:text-white hover:bg-primary transition-all font-black ring-1 ring-zinc-200 dark:ring-zinc-700"
              target="_blank"
            >
              Jonatas Silva
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
