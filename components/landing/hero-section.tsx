"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how much of the section has been scrolled
      // 0 when the section starts entering, 1 when it's fully scrolled past
      const progress = Math.min(Math.max(window.scrollY / (viewportHeight * 0.8), 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Transform values based on scroll
  const rotateX = 25 - (scrollProgress * 25);
  const scale = 0.9 + (scrollProgress * 0.1);
  const opacity = 0.4 + (scrollProgress * 0.6);
  const translateY = 40 - (scrollProgress * 40);

  return (
    <section ref={containerRef} className="relative w-full min-h-[140vh] py-20 flex flex-col items-center overflow-hidden bg-white dark:bg-zinc-950">
      {/* Animated grid background */}
      <div className="absolute inset-0 landing-grid-bg opacity-40 pointer-events-none" />

      {/* Blue glows */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] animate-float-slow pointer-events-none" />

      <div className="container px-4 md:px-6 mx-auto relative z-10 pt-12 md:pt-24 pb-10">
        <div className="flex flex-col items-center text-center">
          {/* Announcement badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-5 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 shadow-sm mb-10 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Syncable v2.0 — The Pro Update is here
          </div>

          {/* Main heading */}
          <h1 className="animate-fade-up delay-100 text-5xl font-black tracking-tighter sm:text-6xl md:text-7xl xl:text-8xl mb-6 max-w-5xl leading-[0.9]">
            Don't Just Track Time.{" "}
            <span className="text-shimmer">Command It.</span>
          </h1>

          <p className="animate-fade-up delay-200 text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
            The high-performance engine for elite professionals. Precision
            tracking, automated reports, and actionable analytics — beautifully
            unified.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-4 mb-24">
            <Link href="/register">
              <Button
                size="lg"
                className="h-14 px-10 text-lg font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Parallax Mockup Frame */}
      <div 
        className="container px-4 md:px-6 mx-auto relative z-20 pb-20"
        style={{ perspective: "1500px" }}
      >
        <div 
          className="relative max-w-6xl mx-auto shadow-2xl transition-all duration-300 ease-out"
          style={{ 
            transform: `rotateX(${rotateX}deg) scale(${scale}) translateY(${translateY}px)`,
            opacity: opacity,
            transformStyle: "preserve-3d"
          }}
        >
          {/* Floating stat overlay */}
          <div className="absolute -top-12 -left-6 z-30 hidden lg:flex items-center gap-3 bg-white dark:bg-zinc-900 px-5 py-4 rounded-2xl shadow-2xl border border-blue-100 dark:border-blue-900 animate-float">
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <BarChart2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                Efficiency
              </p>
              <p className="text-2xl font-black text-green-600 dark:text-green-400">
                +34%
              </p>
            </div>
          </div>

          <div className="relative group rounded-[2.5rem] p-1 bg-gradient-to-b from-blue-200/50 via-blue-100/20 to-transparent dark:from-blue-800/30 dark:via-blue-900/10">
            <div className="relative rounded-[2rem] overflow-hidden border border-white/20 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
              {/* Fake titlebar */}
              <div className="flex items-center gap-2 px-5 py-4 bg-zinc-200/80 dark:bg-zinc-800/80 backdrop-blur-sm border-b border-zinc-300/50 dark:border-zinc-700/50">
                <span className="h-3 w-3 rounded-full bg-red-400"></span>
                <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
                <span className="h-3 w-3 rounded-full bg-green-400"></span>
                <span className="ml-4 text-[10px] md:text-xs font-mono text-muted-foreground opacity-60 truncate">
                  https://syncable.vercel.app/dashboard
                </span>
              </div>
              <Image
                src="/gallery/image1.png"
                alt="Syncable Dashboard Preview"
                width={1600}
                height={900}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

