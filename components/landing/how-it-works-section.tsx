"use client";

import { Clock, Timer, Share2, FileText, BarChart2, Zap } from "lucide-react";

const usefulInfo = [
  "Precision tracking down to the second",
  "Unlimited log history",
  "Automated PDF & CSV reports",
  "Privacy-first approach",
  "One-click task categorization",
  "Interactive productivity analytics",
  "Cross-device real-time sync",
  "Secure expiring share links",
  "Zero friction start/stop"
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "< 50ms", label: "Response Time" },
  { value: "256-bit", label: "Encryption" },
  { value: "∞", label: "Log History" },
];

export function HowItWorksSection() {
  return (
    <>
      {/* Useful Info Marquee Bar */}
      <div className="w-full bg-blue-600 py-5 overflow-hidden border-y border-blue-500 shadow-lg">
        <div className="flex gap-20 animate-marquee whitespace-nowrap">
          {[...usefulInfo, ...usefulInfo].map((info, i) => (
            <span key={i} className="text-white font-black text-xs uppercase tracking-[0.2em] opacity-90 flex items-center gap-4">
              <span className="inline-block h-2 w-2 rounded-full bg-white animate-pulse"></span>
              {info}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="w-full bg-zinc-950 dark:bg-zinc-950 py-12 border-b border-zinc-800">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <p className="text-4xl font-black text-blue-400 mb-2 group-hover:scale-110 transition-transform">{stat.value}</p>
                <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="w-full py-32 relative overflow-hidden bg-white dark:bg-zinc-950">
        <div className="absolute inset-0 landing-grid-bg opacity-40" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-6">
              The Workflow
            </div>
            <h3 className="text-4xl font-black md:text-6xl mb-6 tracking-tighter">Complexity,<br/><span className="text-shimmer">Simplified.</span></h3>
            <p className="text-lg text-muted-foreground">3 powerful steps to go from zero to total work clarity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="absolute top-16 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-700 to-transparent hidden md:block" />

            {[
              { step: "01", icon: Timer, title: "One-Click Entry", desc: "Start your timer instantly with zero friction. No forms, no menus — just one tap from anywhere.", color: "blue" },
              { step: "02", icon: BarChart2, title: "Real-Time Insights", desc: "Watch your productivity metrics update live. Spot patterns and optimize your workflow on the fly.", color: "indigo" },
              { step: "03", icon: Share2, title: "Insightful Sharing", desc: "Generate polished reports and share expiring links with clients or managers in seconds.", color: "violet" },
            ].map((item, i) => (
              <div
                key={i}
                className="relative group card-hover-glow bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-${item.color}-500/10 rounded-bl-full`} />
                <div className="relative">
                  <span className="text-7xl font-black text-zinc-100 dark:text-zinc-800 select-none">{item.step}</span>
                  <div className={`mt-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-${item.color}-100 dark:bg-${item.color}-900/30`}>
                    <item.icon className={`h-7 w-7 text-${item.color}-600 dark:text-${item.color}-400`} />
                  </div>
                  <h4 className="text-2xl font-bold mt-4 mb-3">{item.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
