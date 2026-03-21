"use client";

import { Zap, Shield, FileText, Users, Calendar, BarChart2, Smartphone, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Clock,
    title: "Precise Tracking",
    desc: "Log entries, breaks, and exits with split-second accuracy. Never lose a billable minute again.",
    color: "blue",
  },
  {
    icon: BarChart2,
    title: "Deep Analytics",
    desc: "Visualize productivity with interactive charts. Spot trends and optimize your workflow effortlessly.",
    color: "indigo",
  },
  {
    icon: Shield,
    title: "Privacy First",
    desc: "Enterprise-grade encryption protects all your activity logs. Your data stays yours — always.",
    color: "violet",
  },
  {
    icon: Users,
    title: "Team Ready",
    desc: "Share reports with managers or clients via expiring, permission-controlled public links.",
    color: "blue",
  },
  {
    icon: FileText,
    title: "Smart Exports",
    desc: "Download polished CSV reports with personalized headers, session separators, and Excel compatibility.",
    color: "indigo",
  },
  {
    icon: Smartphone,
    title: "Works Everywhere",
    desc: "Fully responsive on desktop, tablet, and mobile. Track from anywhere, any time.",
    color: "violet",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="w-full py-32 bg-zinc-50 dark:bg-zinc-900/40 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-6">
              Core Features
            </div>
            <h3 className="text-4xl font-black md:text-6xl tracking-tighter leading-tight">
              Engineered for<br/><span className="text-shimmer">Precision.</span>
            </h3>
          </div>
          <p className="text-lg text-muted-foreground max-w-sm leading-relaxed lg:text-right">
            A complete suite of pro-grade tools giving you total control over your workday — without the complexity.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group card-hover-glow relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8"
            >
              {/* BG hover fill */}
              <div className={`absolute inset-0 bg-${feature.color}-500/0 group-hover:bg-${feature.color}-500/5 dark:group-hover:bg-${feature.color}-500/10 transition-colors duration-500`} />
              
              {/* Icon */}
              <div className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-${feature.color}-100 dark:bg-${feature.color}-900/40 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-7 w-7 text-${feature.color}-600 dark:text-${feature.color}-400`} />
              </div>

              <h4 className="relative text-xl font-bold mb-3">{feature.title}</h4>
              <p className="relative text-muted-foreground leading-relaxed text-sm">{feature.desc}</p>

              {/* Arrow appears on hover */}
              <div className="relative mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 text-blue-500 text-sm font-semibold">
                Learn more <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Link href="/register">
            <Button size="lg" className="h-14 px-10 font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
              Unlock All Features Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
