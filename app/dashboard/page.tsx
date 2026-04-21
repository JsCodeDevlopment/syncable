import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { RecentEntries } from "@/components/recent-entries";
import { TimeTracker } from "@/components/time-tracker";
import { DashboardCharts } from "@/components/dashboard-charts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDuration } from "@/lib/format-duration";
import { formatCurrency } from "@/lib/format-currency";
import {
  Activity,
  ArrowUpRight,
  Briefcase,
  Clock,
  Coffee,
  DollarSign,
  History,
  LayoutDashboard,
  Timer,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { requireAuth } from "../actions/auth";
import { getDashboardSummary } from "../actions/dashboard-summary";
import { getDashboardInsights } from "../actions/dashboard-insights";

export default async function DashboardPage() {
  const user = await requireAuth();

  const summaryResult = await getDashboardSummary(user.id);
  const summary = summaryResult.success ? summaryResult.data : null;

  const insightsResult = await getDashboardInsights(user.id);
  const insights = insightsResult.success ? insightsResult.data : null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-8 pb-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {getGreeting()}, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground mt-1 italic opacity-80">
              Welcome back to your time control center.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/reports">
              <Button size="sm" className="shadow-lg hover:shadow-primary/20 transition-all font-semibold hover:scale-105">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Full Reports
              </Button>
            </Link>
          </div>
        </div>

        {/* TOP STRATEGIC INSIGHTS */}
        {insights && (
          <div className="grid gap-6 md:grid-cols-3">
             <InsightSmallCard 
                title="Daily Average"
                value={formatDuration(insights.avgDailyWork)}
                icon={<TrendingUp className="h-5 w-5" />}
                color="primary"
             />
             <InsightSmallCard 
                title="Peak Activity"
                value={insights.mostWorkedDay?.date || "-"}
                icon={<Briefcase className="h-5 w-5" />}
                color="blue"
             />
             <InsightSmallCard 
                title="Consistency"
                value={`${insights.totalDaysWorked} days registered`}
                icon={<ArrowUpRight className="h-5 w-5" />}
                color="green"
             />
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today"
            value={summary ? formatDuration(summary.today.netDuration) : "0h 00m"}
            icon={<Timer className="h-4 w-4" />}
            trend={summary?.today.percentChange}
            description="worked today"
            color="blue"
          />
          <StatCard
            title="This Week"
            value={summary ? formatDuration(summary.week.netDuration) : "0h 00m"}
            icon={<Clock className="h-4 w-4" />}
            trend={summary?.week.percentChange}
            description="total this week"
            color="green"
          />
          <StatCard
            title="Earnings (Month)"
            value={summary ? formatCurrency(summary.month.earnings, summary.today.currency) : "R$ 0.00"}
            icon={<DollarSign className="h-4 w-4" />}
            description="estimated revenue"
            color="amber"
          />
          <StatCard
            title="Breaks Today"
            value={summary ? formatDuration(summary.todayBreaks.totalTime) : "0h 00m"}
            icon={<Coffee className="h-4 w-4" />}
            description={`${summary?.todayBreaks.count || 0} breaks today`}
            color="orange"
          />
        </div>

        {/* Main Dashboard Content */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Tracker & Charts Area */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-sm relative overflow-hidden group bg-card/40 backdrop-blur-md">
               <div className="absolute -right-10 -top-10 h-40 w-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
              <CardHeader className="flex flex-row items-center justify-between relative z-10">
                <div>
                  <CardTitle>Time Tracker</CardTitle>
                  <CardDescription>Manage your active work session</CardDescription>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <TimeTracker userId={user.id} />
              </CardContent>
            </Card>

            {insights?.weeklyChartData && (
              <DashboardCharts 
                weeklyData={insights.weeklyChartData}
                projectsDistribution={summary?.projectsDistribution || []}
              />
            )}
          </div>

          {/* Side Info Area */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-sm border-none bg-card/30 backdrop-blur-md bg-gradient-to-br from-primary/5 via-transparent to-transparent h-full relative overflow-hidden">
               <div className="absolute -left-10 -bottom-10 h-40 w-40 bg-primary/5 rounded-full blur-3xl opacity-40" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <div className="space-y-1 font-mono uppercase italic tracking-tighter opacity-70">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    recent activities
                  </CardTitle>
                </div>
                <Link href="/reports" className="text-[10px] text-primary hover:underline font-bold uppercase tracking-widest bg-primary/10 px-2 py-1 rounded">
                  view all
                </Link>
              </CardHeader>
              <CardContent className="p-0 relative z-10">
                <div className="px-6 pb-6 pt-2">
                  <RecentEntries userId={user.id} limit={6} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function InsightSmallCard({ title, value, icon, color }: any) {
  const colorStyles: any = {
    primary: "bg-primary/20 text-primary border-primary/30",
    blue: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    green: "bg-green-500/20 text-green-500 border-green-500/30"
  }

  return (
    <Card className="border-none bg-card/40 backdrop-blur-md relative overflow-hidden group">
      <div className={`absolute -right-2 -bottom-2 h-16 w-16 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-50 ${color === 'primary' ? 'bg-primary' : color === 'blue' ? 'bg-blue-500' : 'bg-green-500'}`} />
      <CardContent className="pt-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl border transition-transform group-hover:scale-110 shadow-sm ${colorStyles[color]}`}>
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
            <h4 className="text-xl font-bold tracking-tight">{value}</h4>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatCard({ title, value, icon, trend, description, color }: any) {
  const glowColors: any = {
    blue: "bg-blue-500/20",
    green: "bg-green-500/20",
    orange: "bg-orange-500/20",
    purple: "bg-purple-500/20",
    amber: "bg-amber-500/20"
  }

  const iconColors: any = {
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50",
    green: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200/50 dark:border-green-800/50",
    orange: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/50",
    purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50",
    amber: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50"
  }

  return (
    <Card className="border-none shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-300 bg-card/60 backdrop-blur-md relative">
      {/* Decorative Glow Orb */}
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-30 ${glowColors[color]}`} />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 border ${iconColors[color]}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-black tracking-tight">{value}</div>
        <div className="flex items-center mt-1">
          {trend !== undefined && trend !== 0 ? (
            <span className={`text-xs font-black mr-1 flex items-center ${trend > 0 ? "text-green-600" : "text-red-500"}`}>
               <TrendingUp className={`h-3 w-3 mr-0.5 ${trend < 0 ? 'rotate-180' : ''}`} />
               {Math.abs(trend)}%
            </span>
          ) : null}
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
            {description}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
