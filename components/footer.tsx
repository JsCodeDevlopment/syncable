"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-border/40 bg-card/40 backdrop-blur-md pt-20 pb-10 overflow-hidden group">
      {/* Decorative Background Elements */}
      <div className="absolute -left-20 -bottom-20 h-80 w-80 bg-primary/5 rounded-full blur-[100px] opacity-40 group-hover:bg-primary/10 transition-colors duration-1000" />
      <div className="absolute -right-20 -top-20 h-64 w-64 bg-orange-500/5 rounded-full blur-[100px] opacity-20 group-hover:bg-orange-500/10 transition-colors duration-1000" />

      <div className="container mx-auto px-6 md:px-20 max-w-[1600px] relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5 space-y-8">
            <Link href="/" className="inline-block group/logo">
              <div className="relative">
                <Image
                  src="/images/syncable-logo.png"
                  className="dark:invert grayscale group-hover/logo:grayscale-0 transition-all duration-500"
                  alt="Syncable Logo"
                  width={140}
                  height={50}
                />
                <div className="absolute -inset-2 bg-primary/20 rounded-xl blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-700" />
              </div>
            </Link>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-sm opacity-80">
              Elevating the standard of time tracking for modern professionals.
              Precision, privacy, and performance in every punch. Built for those who value every second.
            </p>
            <div className="flex gap-4">
              <Link
                href="https://github.com/JsCodeDevlopment"
                target="_blank"
                className="h-10 w-10 rounded-2xl bg-muted/30 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl hover:scale-110 active:scale-95 border border-border/40"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/jscodedevelopment"
                target="_blank"
                className="h-10 w-10 rounded-2xl bg-muted/30 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl hover:scale-110 active:scale-95 border border-border/40"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="md:col-span-3">
            <h5 className="font-black text-[10px] uppercase tracking-[0.25em] mb-8 text-foreground flex items-center gap-3">
              <span className="w-2 h-2 bg-primary rounded-sm rotate-45" />
              Platform
            </h5>
            <ul className="space-y-5 text-sm font-bold text-muted-foreground">
              <li>
                <Link
                  href="/#features"
                  className="hover:text-primary transition-all flex items-center gap-3 group/link"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-border group-hover/link:bg-primary group-hover/link:scale-150 transition-all" />
                  Key Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-primary transition-all flex items-center gap-3 group/link"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-border group-hover/link:bg-primary group-hover/link:scale-150 transition-all" />
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="hover:text-primary transition-all flex items-center gap-3 group/link"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-border group-hover/link:bg-primary group-hover/link:scale-150 transition-all" />
                  Common Questions
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h5 className="font-black text-[10px] uppercase tracking-[0.25em] mb-8 text-foreground flex items-center gap-3">
              <span className="w-2 h-2 bg-primary rounded-sm rotate-45" />
              Direct Support
            </h5>
            <ul className="space-y-6 text-sm font-bold text-muted-foreground">
              <li className="flex items-center gap-4 group/mail cursor-default">
                <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover/mail:bg-primary group-hover/mail:text-white transition-all duration-300">
                  <Mail className="h-5 w-5" />
                </div>
                <span className="group-hover/mail:text-foreground transition-colors">jonatasilva118@gmail.com</span>
              </li>
              <li className="pt-2 border-t mt-6 border-dashed border-border/40" />
              <li className="flex gap-8">
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-all text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-all text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
            © {new Date().getFullYear()} Syncable Corp. • Precision Time tracking for the elite.
          </p>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
            <span>Engineered by</span>
            <Link
              href="https://github.com/JsCodeDevlopment"
              className="px-4 py-1.5 rounded-xl bg-background/50 text-foreground hover:text-white hover:bg-primary transition-all font-black border border-border/40 hover:border-primary shadow-sm hover:shadow-primary/20"
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
