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
import { formatCurrency } from "@/lib/format-currency";
import {
  Activity,
  Banknote,
  Calendar,
  Clock,
  Coffee,
  FileText,
  LayoutDashboard,
  Search,
  Timer,
  TrendingUp,
  BarChart as BarChartIcon,
} from "lucide-react";
import Image from "next/image";
import { StatCard, InsightSmallCard } from "@/components/stat-card";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { RichTextViewer } from "@/components/rich-text-editor";
import { cn } from "@/lib/utils";
import { ReportPDF } from "@/components/reports/report-pdf";
import dynamic from "next/dynamic";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

const formatDateBR = (date: Date) => date.toLocaleDateString("pt-BR");

interface DataPageProps {
  token: string;
}

export function DataPage({ token }: DataPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        <div className="flex h-16 items-center justify-between py-4 px-6 md:px-20 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center space-x-2 group shrink-0">
              <div className="relative">
                <Image
                  src="/images/syncable-logo.png"
                  className="dark:invert grayscale group-hover:grayscale-0 transition-all duration-500"
                  alt="Syncable Logo"
                  width={100}
                  height={80}
                />
                <div className="absolute -inset-1 bg-primary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
            <div className="hidden md:flex h-6 w-px bg-border/40" />
            <div className="hidden md:flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                <FileText className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                / shared report analysis
              </span>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl font-bold shadow-lg shadow-primary/5 hover:bg-primary hover:text-primary-foreground transition-all h-9 px-4">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Go to Dashboard</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full px-4 md:px-8 py-8">
        <div className="w-full space-y-8 pb-12">
          {/* Header Info Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/40 backdrop-blur-md p-8 rounded-3xl border-none shadow-xl relative overflow-hidden group">
             <div className="absolute -left-10 -top-10 h-40 w-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
            <div className="relative z-10">
              <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                {report.report_name ? report.report_name : "Time Tracking Report"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {report.report_cpf_cnpj && (
                   <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 shadow-sm">
                      ID: {report.report_cpf_cnpj}
                   </span>
                )}
                <div className="flex items-center gap-2 text-muted-foreground font-medium opacity-80">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-xs uppercase font-bold tracking-wider">
                    {report.report_type} Period:
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {new Date(report.start_date).toLocaleDateString()} — {new Date(report.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 relative z-10">
                <Badge variant="secondary" className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                  Verified Shared Report
                </Badge>

                {isClient && reportData && (
                  <PDFDownloadLink
                    document={
                      <ReportPDF 
                        data={reportData} 
                        reportInfo={{
                          name: report.report_name || "Time Tracking Report",
                          type: report.report_type,
                          startDate: new Date(report.start_date),
                          endDate: new Date(report.end_date),
                          idNumber: report.report_cpf_cnpj
                        }} 
                      />
                    }
                    fileName={`Syncable_Shared_${report.report_name || "Report"}_${formatDateBR(new Date())}.pdf`}
                  >
                    {({ loading }) => (
                      <Button
                        disabled={loading}
                        variant="outline"
                        className="h-9 rounded-xl font-bold gap-2 bg-background border-border hover:bg-primary hover:text-primary-foreground transition-all px-4 shadow-sm"
                      >
                        <FileText className="h-4 w-4" />
                        {loading ? "Preparing..." : "Export PDF"}
                      </Button>
                    )}
                  </PDFDownloadLink>
                )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
             <InsightSmallCard
                title="Work Consistency"
                value={Math.round((reportData.summary.daysWorked / 30) * 100) + "%"}
                subValue="Last 30 days activity"
                icon={<Timer className="h-4 w-4" />}
                color="purple"
             />
             <InsightSmallCard
                title="Daily Average"
                value={formatDuration(reportData.summary.averageDailyWork)}
                subValue="Time per active day"
                icon={<BarChartIcon className="h-4 w-4" />}
                color="green"
             />
             <InsightSmallCard
                title="Active Days"
                value={reportData.summary.daysWorked.toString()}
                subValue="Sessions recorded"
                icon={<Activity className="h-4 w-4" />}
                color="blue"
             />
          </div>

          {report.show_insights && <ReportInsights entries={reportData.entries} />}

          <div className="grid gap-6 md:grid-cols-4">
            <StatCard
              title="Total Work Time"
              value={formatDuration(reportData.summary.totalNetWork)}
              icon={<Clock className="h-4 w-4" />}
              description="net work duration"
              color="blue"
            />
            <StatCard
              title="Total Break Time"
              value={formatDuration(reportData.summary.totalBreaks)}
              icon={<Coffee className="h-4 w-4" />}
              description="resting periods"
              color="orange"
            />
            <StatCard
              title="Elapsed Total"
              value={formatDuration(reportData.summary.totalDuration)}
              icon={<Activity className="h-4 w-4" />}
              description="full period tracking"
              color="purple"
            />
            {reportData.summary.hourlyRate ? (
              <StatCard
                title="Estimated Payable"
                value={formatCurrency(reportData.summary.totalPayable, reportData.summary.currency)}
                icon={<Banknote className="h-4 w-4" />}
                description={`Rate: ${formatCurrency(reportData.summary.hourlyRate, reportData.summary.currency)}/h`}
                color="primary"
              />
            ) : (
              <StatCard
                title="Payable Amount"
                value="N/A"
                icon={<Banknote className="h-4 w-4" />}
                description="Rate not defined"
                color="amber"
              />
            )}
          </div>

          <Card className="border-none shadow-xl relative overflow-hidden group bg-card/40 backdrop-blur-md">
             <div className="absolute -right-10 -top-10 h-64 w-64 bg-primary/3 rounded-full blur-[100px] group-hover:bg-primary/5 transition-colors" />
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative z-10 pb-6 px-8 pt-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight">Detailed Activity Report</CardTitle>
                  <CardDescription className="font-medium opacity-70">Comprehensive breakdown of time entries and interactions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 px-8 pb-8">
              <Tabs defaultValue="table" className="w-full">
                <div className="flex items-center justify-between pb-6">
                    <TabsList className="p-1 bg-muted/50 rounded-xl h-11">
                      <TabsTrigger value="table" className="text-xs px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all h-9 gap-2">
                        <Clock className="h-4 w-4" />
                        Table View
                      </TabsTrigger>
                      <TabsTrigger value="chart" className="text-xs px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all h-9 gap-2">
                        <BarChartIcon className="h-4 w-4" />
                        Visual Insights
                      </TabsTrigger>
                    </TabsList>
                </div>

                <div className="rounded-2xl border border-border/40 overflow-hidden bg-background/20 backdrop-blur-sm">
                  <TabsContent value="table" className="m-0 animate-in fade-in duration-500">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow className="hover:bg-transparent border-border/40">
                            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground p-4">Date</TableHead>
                            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Session Period</TableHead>
                            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Gross</TableHead>
                            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground text-orange-500">Breaks</TableHead>
                            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground text-blue-500">Net Work</TableHead>
                            <TableHead className="w-[120px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.entries.map((entry: any) => {
                            let obsContent;
                            try {
                              obsContent = entry.observations ? JSON.parse(entry.observations) : null;
                            } catch (e) {
                              obsContent = entry.observations ? [{ type: 'paragraph', children: [{ text: entry.observations }] }] : null;
                            }
                            
                            const isExpanded = expandedRows[entry.id];
                            
                            return (
                              <Fragment key={entry.id}>
                                <TableRow 
                                  key={entry.id} 
                                  className={cn(
                                    "transition-colors border-border/40 hover:bg-primary/5 group/row",
                                    isExpanded ? "bg-primary/5" : "bg-transparent",
                                    obsContent && "cursor-pointer"
                                  )}
                                  onClick={() => obsContent && toggleRow(entry.id)}
                                >
                                  <TableCell className="p-4">
                                     <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted/50 text-[10px] font-bold text-foreground border border-border/40 whitespace-nowrap">
                                        {entry.date}
                                     </span>
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground">
                                      <span className="px-2 py-0.5 rounded bg-background/50 border border-border/40 font-mono text-foreground">{entry.startTime}</span>
                                      <span className="opacity-40">→</span>
                                      <span className="px-2 py-0.5 rounded bg-background/50 border border-border/40 font-mono text-foreground">{entry.endTime || "Live"}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="tabular-nums font-bold text-xs">{formatDuration(entry.duration)}</TableCell>
                                  <TableCell className="tabular-nums font-bold text-xs text-orange-500/80">{formatDuration(entry.breaks)}</TableCell>
                                  <TableCell className="tabular-nums font-black text-sm text-blue-500">{formatDuration(entry.netWork)}</TableCell>
                                  <TableCell>
                                    {obsContent && (
                                      <div className="flex justify-center pr-4">
                                        <Button 
                                          variant="ghost"
                                          size="sm" 
                                          className={cn(
                                            "h-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                                            isExpanded ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-primary/10 text-primary hover:bg-primary/20"
                                          )}
                                        >
                                          {isExpanded ? "Hide" : "Details"}
                                        </Button>
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                                {isExpanded && obsContent && (
                                  <TableRow className="border-none bg-primary/[0.02]">
                                    <TableCell colSpan={6} className="p-0 border-none">
                                      <div className="px-6 py-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="rounded-2xl border border-primary/20 bg-background/40 backdrop-blur-sm p-6 shadow-xl border-t-2 border-t-primary/30">
                                          <div className="flex items-center gap-3 mb-4 border-b border-border/40 pb-3">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                               <Search className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Session Observations</span>
                                          </div>
                                          <RichTextViewer content={obsContent} className="text-sm leading-relaxed font-medium" />
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </Fragment>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  <TabsContent value="chart" className="m-0 h-[450px] animate-in fade-in duration-500 p-8">
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
                      <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          tickMargin={15}
                          axisLine={false}
                          fontSize={10}
                          fontWeight={700}
                          tick={{ fill: 'currentColor', opacity: 0.5 }}
                        />
                        <YAxis
                          tickFormatter={(value) => `${value}h`}
                          tickLine={false}
                          tickMargin={15}
                          axisLine={false}
                          fontSize={10}
                          fontWeight={700}
                          tick={{ fill: 'currentColor', opacity: 0.5 }}
                        />
                        <ChartTooltip
                          cursor={{ fill: 'var(--primary)', opacity: 0.05 }}
                          content={<ChartTooltipContent indicator="dashed" />}
                        />
                        <Bar
                          dataKey="work"
                          fill="var(--color-work)"
                          radius={[6, 6, 0, 0]}
                          stackId="stack"
                          barSize={40}
                        />
                        <Bar
                          dataKey="break"
                          fill="var(--color-break)"
                          radius={[6, 6, 0, 0]}
                          stackId="stack"
                          barSize={40}
                        />
                      </BarChart>
                    </ChartContainer>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
