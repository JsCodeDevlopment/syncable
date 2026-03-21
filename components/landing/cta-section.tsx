"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const perks = [
  "No credit card required",
  "Setup in under 60 seconds",
  "Cancel anytime, no lock-in",
  "Pro features included free",
];

export function CTASection() {
  return (
    <section className="w-full py-32 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 animate-gradient-x" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] animate-float-slow pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900/50 rounded-full blur-[100px] animate-float pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full animate-spin-slow pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full animate-spin-slow pointer-events-none" style={{animationDirection: 'reverse'}} />

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 border border-white/20 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-semibold text-white mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Join the waitlist — It's free forever
          </div>

          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-none">
            Ready to upgrade<br />your workday?
          </h2>
          
          <p className="text-blue-100 text-xl max-w-xl mb-12 leading-relaxed">
            Thousands of professionals already use Syncable to reclaim their time. Join them today.
          </p>

          <Link href="/register">
            <Button
              size="lg"
              className="h-16 px-14 text-xl font-black rounded-2xl bg-white text-blue-700 hover:bg-blue-50 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Start Free Now
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>

          {/* Perks list */}
          <ul className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3">
            {perks.map((perk, i) => (
              <li key={i} className="flex items-center gap-2 text-blue-100 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-green-300 shrink-0" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
