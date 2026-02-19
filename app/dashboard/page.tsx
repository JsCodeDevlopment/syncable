import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { RecentEntries } from "@/components/recent-entries"
import { TimeTracker } from "@/components/time-tracker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDuration } from "@/lib/db"
import { Activity, BarChart, Calendar, Clock, Coffee, TrendingUp } from "lucide-react"
import Link from "next/link"
import { requireAuth } from "../actions/auth"
import { getDashboardSummary } from "../actions/dashboard-summary"

export default async function DashboardPage() {
  // Check if user is authenticated
  const user = await requireAuth()

  // Get dashboard summary data
  const summaryResult = await getDashboardSummary(user.id)
  const summary = summaryResult.success ? summaryResult.data : null

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`${getGreeting()}, ${user.name.split(" ")[0]}!`}
        text="Here's what's happening with your time today."
      >
        <div className="flex items-center space-x-2">
          <Link href="/reports">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <BarChart className="mr-2 h-4 w-4" />
              View Reports
            </Button>
            <Button variant="outline" size="icon" className="sm:hidden">
              <BarChart className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50/50 dark:from-background dark:to-background overflow-hidden relative">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-500/10 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Today</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {summary ? formatDuration(summary.today.netDuration) : "0h 00m"}
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center font-medium">
              {summary && summary.today.percentChange !== 0 ? (
                <>
                  <span className={`flex items-center ${summary.today.percentChange > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {summary.today.percentChange > 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingUp className="mr-1 h-3 w-3 rotate-180" />}
                    {Math.abs(summary.today.percentChange)}%
                  </span>
                  <span className="ml-1 opacity-80">from yesterday</span>
                </>
              ) : (
                <span className="opacity-60">No data from yesterday</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-green-500 bg-gradient-to-br from-white to-green-50/50 dark:from-background dark:to-background overflow-hidden relative">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-green-500/10 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {summary ? formatDuration(summary.week.netDuration) : "0h 00m"}
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center font-medium">
              {summary && summary.week.percentChange !== 0 ? (
                <>
                  <span className={`flex items-center ${summary.week.percentChange > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {summary.week.percentChange > 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingUp className="mr-1 h-3 w-3 rotate-180" />}
                    {Math.abs(summary.week.percentChange)}%
                  </span>
                  <span className="ml-1 opacity-80">from last week</span>
                </>
              ) : (
                <span className="opacity-60">No data from last week</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50/50 dark:from-background dark:to-background overflow-hidden relative">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-purple-500/10 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {summary ? formatDuration(summary.month.netDuration) : "0h 00m"}
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center font-medium">
              {summary && summary.month.percentChange !== 0 ? (
                <>
                  <span className={`flex items-center ${summary.month.percentChange > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {summary.month.percentChange > 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingUp className="mr-1 h-3 w-3 rotate-180" />}
                    {Math.abs(summary.month.percentChange)}%
                  </span>
                  <span className="ml-1 opacity-80">from last month</span>
                </>
              ) : (
                <span className="opacity-60">Just getting started</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-orange-500 bg-gradient-to-br from-white to-orange-50/50 dark:from-background dark:to-background overflow-hidden relative">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-orange-500/10 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Breaks Today</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Coffee className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {summary ? formatDuration(summary.todayBreaks.totalTime) : "0h 00m"}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium opacity-80">
              {summary
                ? `${summary.todayBreaks.count} break${summary.todayBreaks.count !== 1 ? "s" : ""} taken`
                : "No breaks taken"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-6">
          <Card className="border-t-4 border-t-primary shadow-sm">
            <CardHeader>
              <CardTitle>Time Tracker</CardTitle>
              <CardDescription>Track your active work session</CardDescription>
            </CardHeader>
            <CardContent>
              <TimeTracker userId={user.id} />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3 space-y-6">
          <Card className="shadow-sm h-full max-h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest time entries</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full px-6 pb-6">
                <RecentEntries userId={user.id} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
