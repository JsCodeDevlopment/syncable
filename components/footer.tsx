"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center gap-2">
              <Image
                src="/images/syncable-logo.png"
                className="dark:invert"
                alt="Syncable Logo"
                width={140}
                height={120}
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Elevating the standard of time tracking for modern professionals
              since 2025. Precision, privacy, and performance in every punch.
            </p>
            <div className="flex gap-4">
              <Link
                href="https://github.com/JsCodeDevlopment"
                target="_blank"
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <Github className="h-4 w-4" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/jscodedevelopment"
                target="_blank"
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-sm uppercase tracking-widest mb-6 border-l-2 border-primary pl-3">
              Product
            </h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <Link
                  href="#features"
                  className="hover:text-primary transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="hover:text-primary transition-colors"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Mobile App
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Integrations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-sm uppercase tracking-widest mb-6 border-l-2 border-primary pl-3">
              Company
            </h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-sm uppercase tracking-widest mb-6 border-l-2 border-primary pl-3">
              Support
            </h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <Link
                  href="#faq"
                  className="hover:text-primary transition-colors"
                >
                  General FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Contact Expert
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>jonatasilva118@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Syncable Corporation. Built with ❤️ for
            the future of work.
          </p>
          <p className="flex items-center gap-1 uppercase tracking-widest">
            Proudly crafted by{" "}
            <Link
              href="https://github.com/JsCodeDevlopment"
              className="text-primary hover:text-primary/80 font-black"
              target="_blank"
            >
              JsCodeDevlopment
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
