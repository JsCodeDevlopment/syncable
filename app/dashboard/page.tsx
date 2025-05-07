import { DailyStats } from "@/components/daily-stats"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { MonthlyStats } from "@/components/monthly-stats"
import { RecentEntries } from "@/components/recent-entries"
import { TimeTracker } from "@/components/time-tracker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WeeklyStats } from "@/components/weekly-stats"
import { formatDuration } from "@/lib/utils"
import Link from "next/link"
import { requireAuth } from "../actions/auth"
import { getDashboardSummary } from "../actions/dashboard-summary"

export default async function DashboardPage() {
  // Check if user is authenticated
  const user = await requireAuth()

  // Get dashboard summary data
  const summaryResult = await getDashboardSummary(user.id)
  const summary = summaryResult.success ? summaryResult.data : null

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Track your time and view your progress">
        <Link href="/reports">
          <Button variant="outline">View Reports</Button>
        </Link>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary ? formatDuration(summary.today.netDuration) : "0h 00m"}</div>
            <p className="text-xs text-muted-foreground">
              {summary && summary.today.percentChange !== 0
                ? `${summary.today.percentChange > 0 ? "+" : ""}${summary.today.percentChange}% from yesterday`
                : "No data from yesterday"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary ? formatDuration(summary.week.netDuration) : "0h 00m"}</div>
            <p className="text-xs text-muted-foreground">
              {summary && summary.week.percentChange !== 0
                ? `${summary.week.percentChange > 0 ? "+" : ""}${summary.week.percentChange}% from last week`
                : "No data from last week"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary ? formatDuration(summary.month.netDuration) : "0h 00m"}</div>
            <p className="text-xs text-muted-foreground">
              {summary && summary.month.percentChange !== 0
                ? `${summary.month.percentChange > 0 ? "+" : ""}${summary.month.percentChange}% from last month`
                : "No data from last month"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Breaks Today</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? formatDuration(summary.todayBreaks.totalTime) : "0h 00m"}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary
                ? `${summary.todayBreaks.count} break${summary.todayBreaks.count !== 1 ? "s" : ""} taken`
                : "No breaks taken"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Time Tracker</CardTitle>
            <CardDescription>Track your time entries, breaks, and exits</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeTracker userId={user.id} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>Your most recent time entries</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentEntries userId={user.id} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>View your time tracking statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily">
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
              <TabsContent value="daily">
                <DailyStats userId={user.id} />
              </TabsContent>
              <TabsContent value="weekly">
                <WeeklyStats userId={user.id} />
              </TabsContent>
              <TabsContent value="monthly">
                <MonthlyStats userId={user.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
