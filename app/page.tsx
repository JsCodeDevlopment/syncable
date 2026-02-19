import { Footer } from "@/components/footer";
import { LeadingHeader } from "@/components/leading-header";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart, Clock, Share2, Shield, Smartphone, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <LeadingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden bg-background">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-primary to-gray-900 dark:from-white dark:via-primary dark:to-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                  Master Your Time, <br className="hidden sm:inline" />
                  Maximize Your Potential
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed dark:text-gray-400 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
                  The most intuitive time tracking solution for modern professionals.
                  Log entries, analyze productivity, and generate insights effortlessly.
                </p>
              </div>
              <div className="flex flex-col gap-4 min-[400px]:flex-row animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                <Link href="/register">
                  <Button size="lg" className="px-8 h-12 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                    Start Tracking Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="px-8 h-12 text-base hover:bg-muted/50">
                    Existing User? Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Everyone's Productivity Stack</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Powerful features designed to help you stay focused and organized without the complexity.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="relative group overflow-hidden rounded-lg border bg-background p-6 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-xl">Precise Tracking</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Log entries, breaks, and exits with split-second precision. Never lose track of a billable minute again.
                </p>
              </div>

              <div className="relative group overflow-hidden rounded-lg border bg-background p-6 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="rounded-full bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <BarChart className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-xl">Detailed Analytics</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Visualize your productivity with interactive charts. Spot trends and optimize your workflow.
                </p>
              </div>

              <div className="relative group overflow-hidden rounded-lg border bg-background p-6 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/30 dark:text-green-400 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <Share2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-xl">Easy Sharing</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Generate secure public links to share your progress with clients, managers, or your team.
                </p>
              </div>

              <div className="relative group overflow-hidden rounded-lg border bg-background p-6 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="rounded-full bg-orange-100 p-3 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-xl">Fast & Lightweight</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Built for speed. No bloat, no lag. Syncable loads instantly so you can focus on work.
                </p>
              </div>

              <div className="relative group overflow-hidden rounded-lg border bg-background p-6 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="rounded-full bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-xl">Secure & Private</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Your data is yours. We use enterprise-grade encryption to keep your activity logs safe.
                </p>
              </div>

              <div className="relative group overflow-hidden rounded-lg border bg-background p-6 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="rounded-full bg-pink-100 p-3 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-xl">Mobile Ready</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Responsive design that works perfectly on your phone, tablet, or desktop computer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 bg-primary/5 border-y">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to take control?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                Join thousands of professionals who trust Syncable to manage their time effectively.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
                <Link href="/register">
                  <Button size="lg" className="px-8 h-12 text-base">
                    Get Started Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
