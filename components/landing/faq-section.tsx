"use client";

import { HelpCircle, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is Syncable really free?",
    a: "Yes! All core time-tracking features are completely free for individual professionals. Premium team features are in the roadmap and will be announced soon.",
  },
  {
    q: "How accurate is the tracking?",
    a: "Extremely accurate. Every log entry is synced with server-time to eliminate device clock drift. You'll never lose a billable second again.",
  },
  {
    q: "Can I share my reports with clients?",
    a: "Absolutely. Generate a secure link with a custom expiration date — 1, 7, 30, or 90 days. You also control whether clients see your full productivity insights.",
  },
  {
    q: "What export formats are available?",
    a: "Currently, you can export polished CSV reports with custom headers, session separators and BOM encoding for perfect Excel compatibility. PDF export is coming soon.",
  },
  {
    q: "Is my data safe?",
    a: "Privacy is a core principle. We use industry-standard encryption and never sell your data. Shared links expire automatically and can be revoked at any time.",
  },
  {
    q: "Can I edit past time entries?",
    a: "Yes. You can edit, delete, or add manual time entries retroactively from the dashboard, giving you full control over your historical logs.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="w-full py-32 relative overflow-hidden bg-white dark:bg-zinc-950">
      <div className="absolute inset-0 landing-grid-bg opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-start">
          {/* Left: Label + heading */}
          <div className="lg:w-1/3 lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-6">
              FAQ
            </div>
            <h3 className="text-4xl font-black md:text-5xl tracking-tighter mb-4">
              Got <span className="text-shimmer">Questions?</span>
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Everything you need to know. Can't find your answer?{" "}
              <a href="mailto:support@syncable.io" className="text-blue-500 hover:underline font-semibold">
                Contact us.
              </a>
            </p>

            <div className="mt-8 flex items-center gap-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
              <HelpCircle className="h-8 w-8 text-blue-500 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Still need help? Our expert team replies within{" "}
                <span className="font-semibold text-foreground">24 hours</span>.
              </p>
            </div>
          </div>

          {/* Right: Accordion */}
          <div className="flex-1">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 overflow-hidden bg-white dark:bg-zinc-900 card-hover-glow"
                >
                  <AccordionTrigger className="text-left text-base font-bold hover:no-underline py-5 gap-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
