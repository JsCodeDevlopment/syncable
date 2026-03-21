"use client";

import { getSharedReport } from "@/app/actions/reports";
import { NoDataPage } from "@/app/shared-report/[token]/no-data-page";
import { Footer } from "@/components/footer";
import { PageError } from "@/components/page-error";
import { PageLoading } from "@/components/page-loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportInsights } from "@/components/report-insights";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDuration } from "@/lib/format-duration";
import {
  Activity,
  Calendar,
  Clock,
  Coffee,
  FileText,
  LayoutDashboard,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface DataPageProps {
  token: string;
}

export function DataPage({ token }: DataPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        console.log("Fetching shared report with token:", token);
        const result = await getSharedReport(token);
        console.log("Shared report result:", result);

        if (!result.success || !result.data) {
          setError(
            result.error ||
              "This shared report is not available or has expired.",
          );
        } else {
          setReport(result.data.report);
          setReportData(result.data.reportData);
        }
      } catch (err) {
        console.error("Error fetching shared report:", err);
        setError(
          "Failed to load the shared report. Please check the URL and try again.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [token]);

  if (isLoading) {
    return <PageLoading title="Loading Report" />;
  }

  if (error) {
    return <PageError title="Report Not Available" error={error} />;
  }

  // Check if we have valid report data
  if (
    !reportData ||
    !reportData.entries ||
    !Array.isArray(reportData.entries) ||
    reportData.entries.length === 0
  ) {
    return <NoDataPage report={report} />;
  }

  // Process data for the chart
  const chartData = reportData.entries.map((entry: any) => ({
    date: entry.date,
    work: Math.round((entry.netWork / (1000 * 60 * 60)) * 10) / 10, // Convert to hours with 1 decimal
    break: Math.round((entry.breaks / (1000 * 60 * 60)) * 10) / 10, // Convert to hours with 1 decimal
  }));

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 dark:bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="w-full px-4 md:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Image
                src="/images/syncable-logo.png"
                alt="Syncable Logo"
                width={120}
                height={100}
                className="dark:invert"
              />
            </Link>
            <div className="hidden md:flex h-6 w-px bg-border mx-2" />
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="h-4 w-4" />
              Shared Report
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full px-4 md:px-8 py-8">
        <div className="w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Time Tracking Report</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} Period:
                </span>
                <span className="text-sm">
                  {new Date(report.start_date).toLocaleDateString()} — {new Date(report.end_date).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Badge variant="secondary" className="w-fit h-7 px-3 text-xs font-semibold bg-primary/10 text-primary border-none">
              Shared Externally
            </Badge>
          </div>

          {report.show_insights && <ReportInsights entries={reportData.entries} />}

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50/50 dark:from-background dark:to-background overflow-hidden relative">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-500/10 blur-2xl" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Work Time</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Clock className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {formatDuration(reportData.summary.totalNetWork)}
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-medium opacity-80">
                  Logged across {reportData.summary.daysWorked} day
                  {reportData.summary.daysWorked !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-l-4 border-l-orange-500 bg-gradient-to-br from-white to-orange-50/50 dark:from-background dark:to-background overflow-hidden relative">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-orange-500/10 blur-2xl" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Break Time</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Coffee className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {formatDuration(reportData.summary.totalBreaks)}
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-medium opacity-80">
                  Recovery & rest periods
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50/50 dark:from-background dark:to-background overflow-hidden relative">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-purple-500/10 blur-2xl" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg Daily Productivity</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Activity className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {formatDuration(reportData.summary.averageDailyWork)}
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-medium opacity-80">
                  Calculated per working day
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm overflow-hidden border-t-4 border-t-primary">
            <CardHeader className="pb-2 bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Detailed Activity Report</CardTitle>
                  <CardDescription>Comprehensive breakdown of time entries and interactions</CardDescription>
                </div>
                <div className="hidden sm:flex h-10 w-10 rounded-full bg-primary/10 items-center justify-center text-primary">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <div className="bg-muted/10 border-b p-2">
              <Tabs defaultValue="table" className="w-full">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold tracking-tight mr-2 uppercase text-muted-foreground">
                      Display:
                    </h3>
                    <TabsList className="h-8">
                      <TabsTrigger value="table" className="text-xs px-3 gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        Data Table
                      </TabsTrigger>
                      <TabsTrigger value="chart" className="text-xs px-3 gap-2">
                        <Activity className="h-3.5 w-3.5" />
                        Visual Insights
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <div className="p-0 sm:p-4 mt-2">
                  <TabsContent value="table" className="m-0 animate-in fade-in duration-500">
                    <div className="rounded-md border bg-background overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead className="font-bold">Date</TableHead>
                              <TableHead className="font-bold">Session</TableHead>
                              <TableHead className="font-bold">Gross Duration</TableHead>
                              <TableHead className="font-bold text-orange-600 dark:text-orange-400">Breaks</TableHead>
                              <TableHead className="font-bold text-blue-600 dark:text-blue-400">Net Work</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportData.entries.map((entry: any) => (
                              <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                                <TableCell className="font-medium whitespace-nowrap">{entry.date}</TableCell>
                                <TableCell className="whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border font-mono">{entry.startTime}</span>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border font-mono">{entry.endTime || "In progress"}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="tabular-nums font-medium">{formatDuration(entry.duration)}</TableCell>
                                <TableCell className="tabular-nums text-orange-600/80 dark:text-orange-400/80">{formatDuration(entry.breaks)}</TableCell>
                                <TableCell className="tabular-nums font-bold text-blue-600 dark:text-blue-400">{formatDuration(entry.netWork)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="chart" className="m-0 h-[400px] animate-in fade-in duration-500">
                    <div className="bg-background rounded-md border p-4 h-full">
                      <ChartContainer
                        config={{
                          work: {
                            label: "Work Hours",
                            color: "hsl(var(--chart-1))",
                          },
                          break: {
                            label: "Break Hours",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                        className="h-full w-full"
                      >
                        <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                          <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            fontSize={12}
                          />
                          <YAxis
                            tickFormatter={(value) => `${value}h`}
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            fontSize={12}
                          />
                          <ChartTooltip
                            content={<ChartTooltipContent indicator="dashed" />}
                          />
                          <Bar
                            dataKey="work"
                            fill="var(--color-work)"
                            radius={[4, 4, 0, 0]}
                            stackId="stack"
                            barSize={32}
                          />
                          <Bar
                            dataKey="break"
                            fill="var(--color-break)"
                            radius={[4, 4, 0, 0]}
                            stackId="stack"
                            barSize={32}
                          />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
