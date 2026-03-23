"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { DatePicker } from "@/components/date-picker";
import { ReportChart } from "@/components/report-chart";
import { ReportInsights } from "@/components/report-insights";
import { ReportTable } from "@/components/report-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { formatDateForDisplay } from "@/lib/db";
import { formatDuration } from "@/lib/format-duration";
import {
  Activity,
  BarChart,
  CheckCircle2,
  Clock,
  Coffee,
  Copy,
  Download,
  ExternalLink,
  FileText,
  PieChart,
  Share,
  Table as TableIcon,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getCurrentUser } from "../actions/auth";
import {
  createSharedReport,
  deleteSharedReport,
  deleteSharedReports,
  generateReport,
  getGlobalReportAggregation,
  getUserSharedReports,
  type ReportData,
  type SharedReport,
} from "../actions/reports";

export default function ReportsPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("daily");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [reportType, setReportType] = useState("detailed");
  const [shareLink, setShareLink] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [shareDuration, setShareDuration] = useState("7");
  const [showInsightsInShare, setShowInsightsInShare] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [reportCreatedSuccess, setReportCreatedSuccess] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportCpfCnpj, setReportCpfCnpj] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const reportResultRef = useRef<HTMLDivElement>(null);

  const [reportData, setReportData] = useState<any>(null);

  const [savedReports, setSavedReports] = useState<SharedReport[]>([]);
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  const [isLoadingSavedReports, setIsLoadingSavedReports] = useState(false);
  const [globalReportData, setGlobalReportData] = useState<ReportData | null>(
    null,
  );
  const [isFetchingGlobal, setIsFetchingGlobal] = useState(false);

  useEffect(() => {
    // Get user ID using the server action
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.id);
          setUserData(user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const fetchSavedReports = async () => {
    if (!userId) return;
    setIsLoadingSavedReports(true);
    try {
      const result = await getUserSharedReports(userId);
      if (result.success && result.data) {
        setSavedReports(result.data);
      }
    } catch (error) {
      console.error("Error fetching saved reports:", error);
    } finally {
      setIsLoadingSavedReports(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSavedReports();
    }
  }, [userId]);

  const fetchGlobalAggregation = async () => {
    if (!userId) return;
    setIsFetchingGlobal(true);
    try {
      const result = await getGlobalReportAggregation(userId);
      if (result.success && result.data) {
        setGlobalReportData(result.data);
      } else {
        setGlobalReportData(null);
      }
    } catch (error) {
      console.error("Error fetching global aggregation:", error);
    } finally {
      setIsFetchingGlobal(false);
    }
  };

  useEffect(() => {
    if (userId && savedReports.length > 0) {
      fetchGlobalAggregation();
    } else {
      setGlobalReportData(null);
    }
  }, [userId, savedReports.length]);

  // Update date range when period changes
  useEffect(() => {
    const today = new Date();

    // Set end date to today for all periods
    setEndDate(today);

    if (activeTab === "daily") {
      // For daily, start date is also today
      setStartDate(today);
    } else if (activeTab === "weekly") {
      // For weekly, start date is 7 days ago
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 6); // 7 days including today
      setStartDate(weekAgo);
    } else if (activeTab === "monthly") {
      // For monthly, start date is 30 days ago
      const monthAgo = new Date(today);
      monthAgo.setDate(today.getDate() - 29); // 30 days including today
      setStartDate(monthAgo);
    }
  }, [activeTab]);

  const scrollToReport = () => {
    setIsGenerateModalOpen(false);
    // Increased timeout to ensure Modal close animation doesn't interfere with scroll
    setTimeout(() => {
      if (reportResultRef.current) {
        reportResultRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 400);
  };

  const setShortcuts = (type: "daily" | "weekly" | "monthly") => {
    const today = new Date();
    setEndDate(today);

    if (type === "daily") {
      setStartDate(today);
      setActiveTab("daily");
    } else if (type === "weekly") {
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      setStartDate(lastWeek);
      setActiveTab("weekly");
    } else if (type === "monthly") {
      const lastMonth = new Date();
      lastMonth.setMonth(today.getMonth() - 1);
      setStartDate(lastMonth);
      setActiveTab("monthly");
    }
  };

  const handleGenerateReport = async () => {
    if (!userId || !startDate || !endDate) {
      toast({
        title: "Missing information",
        description: "Please select a date range for the report.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setReportData(null); // Clear previous report data

    try {
      const result = await generateReport(
        userId,
        startDate,
        endDate,
        activeTab,
      );
      console.log("Report generation result:", result);

      if (result.success && result.data) {
        setReportData(result.data);
        setReportCreatedSuccess(true);
        toast({
          title: "Report ready",
          description: "Your report has been generated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate report",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = (format: "csv" | "pdf") => {
    if (!reportData) {
      toast({
        title: "No report data",
        description: "Please generate a report first.",
        variant: "destructive",
      });
      return;
    }

    if (format === "pdf") {
      toast({
        title: "Generating PDF",
        description:
          "Your document is being prepared. Choose 'Save as PDF' in the print dialog.",
      });
      window.print();
      return;
    }

    setIsDownloading(true);

    try {
      // Create a fancy CSV string with header info
      const userName = userData?.name || "User";
      const fileDate = new Date().toISOString().split("T")[0];

      const titleLines = [
        "=========================================",
        `      RELATÓRIO SYNCABLE - ${reportName || userName.toUpperCase()}      `,
        "=========================================",
        `Período: ${startDate ? formatDateForDisplay(startDate) : "N/A"} até ${endDate ? formatDateForDisplay(endDate) : "N/A"}`,
        `Gerado em: ${new Date().toLocaleString()}`,
      ];

      if (reportCpfCnpj) {
        titleLines.push(`Documento (CPF/CNPJ): ${reportCpfCnpj}`);
      }

      titleLines.push(
        "",
        "DETALHAMENTO DIÁRIO",
        "----------------------------------------",
      );

      const headers = [
        "Data",
        "Início",
        "Fim",
        "Duração",
        "Intervalo",
        "Líquido",
        "Observações",
      ];

      const dataRows = reportData.entries.map((entry: any) => {
        let obsText = "";
        if (entry.observations) {
          try {
            const parsed = JSON.parse(entry.observations);
            obsText = parsed
              .map((n: any) => n.children ? n.children.map((c: any) => c.text).join("") : "")
              .join(" ")
              .replace(/;/g, ",")
              .replace(/\n/g, " ");
          } catch (e) {
            obsText = entry.observations.replace(/;/g, ",").replace(/\n/g, " ");
          }
        }
        return [
          entry.date,
          entry.startTime,
          entry.endTime || "Em execução",
          formatDuration(entry.duration),
          formatDuration(entry.breaks),
          formatDuration(entry.netWork),
          obsText,
        ];
      });

      const summaryLines = [
        "",
        "----------------------------------------",
        "RESUMO DO PERÍODO",
        "----------------------------------------",
        `Total de Horas Trabalhadas;${formatDuration(reportData.summary.totalNetWork)}`,
        `Total de Pausas;${formatDuration(reportData.summary.totalBreaks)}`,
        `Total Acumulado (Bruto);${formatDuration(reportData.summary.totalDuration)}`,
        `Total de Dias Registrados;${reportData.summary.daysWorked}`,
        `Média Diária de Trabalho;${formatDuration(reportData.summary.averageDailyWork)}`,
        "----------------------------------------",
      ];

      // Use semicolon for better Excel compatibility in PT-BR locale
      const separator = ";";
      const csvContent =
        "\ufeff" +
        [
          ...titleLines.map((line) => line),
          headers.join(separator),
          ...dataRows.map((row: any[]) => row.join(separator)),
          ...summaryLines,
        ].join("\n");

      // Create a blob and download it
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Relatorio_Syncable_${fileDate}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Report downloaded",
        description: "Your report has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        title: "Download failed",
        description: "Could not generate the report file.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareReport = async () => {
    if (!userId || !startDate || !endDate || !reportData) {
      toast({
        title: "Missing information",
        description: "Please generate a report first.",
        variant: "destructive",
      });
      return;
    }

    if (!isPublic) {
      toast({
        title: "Report not public",
        description: "Please make the report public to share it.",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);

    try {
      const result = await createSharedReport(
        userId,
        activeTab as "daily" | "weekly" | "monthly",
        startDate,
        endDate,
        Number.parseInt(shareDuration),
        showInsightsInShare,
        reportName,
        reportCpfCnpj
      );

      if (result.success) {
        const baseUrl = window.location.origin;
        const shareUrl = `${baseUrl}/shared-report/${result.data?.share_token}`;
        setShareLink(shareUrl);

        toast({
          title: "Report shared",
          description: "Your report has been shared successfully.",
        });
        fetchSavedReports(); // Refresh the list of saved reports
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to share report",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sharing report:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    if (!userId) return;
    try {
      const result = await deleteSharedReport(reportId, userId);
      if (result.success) {
        toast({
          title: "Report deleted",
          description: "The report has been deleted successfully.",
        });
        fetchSavedReports(); // Refresh list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete report",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!userId || selectedReports.length === 0) return;
    try {
      const result = await deleteSharedReports(selectedReports, userId);
      if (result.success) {
        toast({
          title: "Reports deleted",
          description: `${selectedReports.length} reports have been deleted successfully.`,
        });
        setSelectedReports([]);
        fetchSavedReports();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete reports",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting reports:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReports(savedReports.map((r) => r.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleToggleSelect = (reportId: number) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId],
    );
  };

  const handleCopyLink = (token: string) => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/shared-report/${token}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied",
      description: "The share link has been copied to your clipboard.",
    });
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`${getGreeting()}${userData ? `, ${userData.name.split(" ")[0]}` : ""}!`}
        text="Analyze your productivity and generate detailed time reports."
      >
        <div className="flex items-center space-x-2">
          <Dialog
            open={isGenerateModalOpen}
            onOpenChange={(open) => {
              setIsGenerateModalOpen(open);
              if (!open) setReportCreatedSuccess(false);
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <FileText className="mr-2 h-4 w-4" />
                Generate New Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Generate Report</DialogTitle>
                <DialogDescription>
                  Choose the period and format for your time report.
                </DialogDescription>
              </DialogHeader>

              {!reportCreatedSuccess ? (
                <div className="grid gap-6 py-4">
                  <div className="grid gap-3">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Shortcuts
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShortcuts("daily")}
                        className={
                          activeTab === "daily"
                            ? "border-primary bg-primary/5"
                            : ""
                        }
                      >
                        Daily
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShortcuts("weekly")}
                        className={
                          activeTab === "weekly"
                            ? "border-primary bg-primary/5"
                            : ""
                        }
                      >
                        Weekly
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShortcuts("monthly")}
                        className={
                          activeTab === "monthly"
                            ? "border-primary bg-primary/5"
                            : ""
                        }
                      >
                        Monthly
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Start Date</Label>
                      <DatePicker date={startDate} setDate={setStartDate} />
                    </div>
                    <div className="grid gap-2">
                      <Label>End Date</Label>
                      <DatePicker date={endDate} setDate={setEndDate} />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Report Type</Label>
                    <Select
                      defaultValue={reportType}
                      onValueChange={setReportType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary View</SelectItem>
                        <SelectItem value="detailed">Detailed View</SelectItem>
                        <SelectItem value="entries">Entries Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="reportName">Name (Optional)</Label>
                      <Input
                        id="reportName"
                        placeholder="Ex: John Doe"
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reportCpfCnpj">CPF/CNPJ (Optional)</Label>
                      <Input
                        id="reportCpfCnpj"
                        placeholder="000.000.000-00"
                        value={reportCpfCnpj}
                        onChange={(e) => setReportCpfCnpj(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className="w-full mt-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Generating...
                      </>
                    ) : (
                      "Generate Report"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Report Created!</h3>
                  <p className="text-muted-foreground mb-8">
                    Your report for the selected period has been generated and
                    is ready for review.
                  </p>
                  <Button onClick={scrollToReport} className="w-full">
                    View Report Results
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardHeader>

      <div className="space-y-8">
        {/* Global Summary Section */}
        {savedReports.length > 0 && globalReportData && (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4">
            <ReportInsights entries={globalReportData.entries} />
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50/50 dark:from-background dark:to-background overflow-hidden relative">
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-500/10 blur-2xl" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Total Worked
                  </CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Clock className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {formatDuration(globalReportData.summary.totalNetWork)}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all border-l-4 border-l-orange-500 bg-gradient-to-br from-white to-orange-50/50 dark:from-background dark:to-background overflow-hidden relative">
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-orange-500/10 blur-2xl" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Total Breaks
                  </CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <Coffee className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {formatDuration(globalReportData.summary.totalBreaks)}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50/50 dark:from-background dark:to-background overflow-hidden relative">
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-purple-500/10 blur-2xl" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Total Combined
                  </CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Activity className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {formatDuration(globalReportData.summary.totalDuration)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm overflow-hidden border-t-4 border-t-orange-500">
              <CardHeader className="pb-2 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Aggregated Activity
                    </CardTitle>
                    <CardDescription>
                      Consolidated data from all generated reports
                    </CardDescription>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <BarChart className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <div className="bg-muted/10 border-b p-2">
                <Tabs defaultValue="table" className="w-full">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold tracking-tight mr-2 uppercase text-muted-foreground">
                        View Mode:
                      </h3>
                      <TabsList className="h-8">
                        <TabsTrigger value="table" className="text-xs px-3">
                          <TableIcon className="mr-1.5 h-3.5 w-3.5" />
                          Table
                        </TabsTrigger>
                        <TabsTrigger value="chart" className="text-xs px-3">
                          <PieChart className="mr-1.5 h-3.5 w-3.5" />
                          Chart
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </div>

                  <div className="p-4">
                    <TabsContent value="table" className="m-0">
                      <ReportTable data={globalReportData.entries} />
                    </TabsContent>
                    <TabsContent value="chart" className="m-0 h-[350px]">
                      <ReportChart data={globalReportData.entries} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </Card>
          </div>
        )}

        {/* Results Section */}
        {reportData && (
          <div
            ref={reportResultRef}
            className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 scroll-mt-40"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white/50 dark:bg-background/50 p-6 rounded-2xl border backdrop-blur-sm shadow-sm">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight">
                  {reportName ? `Report: ${reportName}` : "Report Results"}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {reportCpfCnpj ? (
                    <span className="block mb-1 font-medium text-xs uppercase tracking-widest text-primary/70">
                      Document: {reportCpfCnpj}
                    </span>
                  ) : null}
                  Detailed productivity analysis for the selected period.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Re-implement Share Dialog here */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      size="lg"
                      className="bg-primary hover:bg-primary/90  shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 px-6"
                      onClick={() => {
                        setShareLink("");
                        setIsPublic(false);
                      }}
                    >
                      <Share className="mr-2 h-5 w-5" />
                      Share & Publish
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Share Report</DialogTitle>
                      <DialogDescription>
                        Generate a shareable link for this specific result.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="flex items-center space-x-4 rounded-md border p-4 bg-muted/30">
                        <Share className="h-5 w-5 text-primary" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold">Public Access</p>
                          <p className="text-xs text-muted-foreground">
                            Enable to generate a shareable URL.
                          </p>
                        </div>
                        <Switch
                          checked={isPublic}
                          onCheckedChange={setIsPublic}
                          disabled={isSharing || !!shareLink}
                        />
                      </div>

                      {isPublic && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                          <div className="grid gap-2">
                            <Label
                              htmlFor="duration"
                              className="text-xs font-semibold uppercase text-muted-foreground"
                            >
                              Expiration
                            </Label>
                            <Select
                              defaultValue={shareDuration}
                              onValueChange={setShareDuration}
                              disabled={isSharing || !!shareLink}
                            >
                              <SelectTrigger id="duration" className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 Day</SelectItem>
                                <SelectItem value="7">7 Days</SelectItem>
                                <SelectItem value="30">30 Days</SelectItem>
                                <SelectItem value="0">Never</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {shareLink && (
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                                Shareable Link
                              </Label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <Input
                                    value={shareLink}
                                    readOnly
                                    className="bg-muted text-xs h-9 pr-10"
                                  />
                                  <div className="absolute right-3 top-2.5">
                                    <ExternalLink className="h-4 w-4 opacity-30" />
                                  </div>
                                </div>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className={`h-9 w-9 transition-colors ${copiedLink ? "text-green-600 border-green-200 bg-green-50" : ""}`}
                                  onClick={() => {
                                    navigator.clipboard.writeText(shareLink);
                                    setCopiedLink(true);
                                    setTimeout(
                                      () => setCopiedLink(false),
                                      2000,
                                    );
                                    toast({ title: "Link Copied!" });
                                  }}
                                  title="Copy Link"
                                >
                                  {copiedLink ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-9 w-9"
                                  asChild
                                  title="Open Link"
                                >
                                  <a
                                    href={shareLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-4 w-4 text-primary" />
                                  </a>
                                </Button>
                              </div>
                            </div>
                          )}

                          {!shareLink && (
                            <div className="flex items-center justify-between py-2 border-t pt-2">
                              <div>
                                <Label className="text-sm font-medium">
                                  Extra Statistics
                                </Label>
                                <p className="text-[10px] text-muted-foreground">
                                  Show performance insights cards
                                </p>
                              </div>
                              <Switch
                                checked={showInsightsInShare}
                                onCheckedChange={setShowInsightsInShare}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      {isPublic && !shareLink ? (
                        <Button
                          onClick={handleShareReport}
                          disabled={isSharing}
                          className="w-full h-11 text-base font-bold"
                        >
                          {isSharing ? "Creating..." : "Generate Public Link"}
                        </Button>
                      ) : shareLink ? (
                        <Button
                          variant="ghost"
                          onClick={() => setShareLink("")}
                          className="w-full"
                        >
                          Create New Link
                        </Button>
                      ) : null}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={isDownloadModalOpen}
                  onOpenChange={setIsDownloadModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsDownloadModalOpen(true)}
                      className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/30 transition-all hover:scale-105 active:scale-95 px-6 shadow-lg shadow-blue-500/10"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Export / Download
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Download className="h-5 w-5 text-primary" />
                        Export Report
                      </DialogTitle>
                      <DialogDescription>
                        Choose the format for your generated report.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-8">
                      <div className="relative group">
                        <Button
                          variant="outline"
                          disabled
                          className="h-32 w-full flex flex-col items-center justify-center gap-2 grayscale brightness-75 opacity-70 cursor-not-allowed"
                        >
                          <FileText className="h-10 w-10 text-red-500" />
                          <span className="font-bold text-lg">
                            PDF Document
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                            Digital Sheet
                          </span>
                        </Button>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-primary px-3 py-1 rounded-full text-[10px] text-black font-bold shadow-lg rotate-12 -translate-y-4">
                            COMING SOON
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="h-32 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all group"
                        onClick={() => {
                          handleDownloadReport("csv");
                          setIsDownloadModalOpen(false);
                        }}
                      >
                        <TableIcon className="h-10 w-10 text-green-600 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-lg">CSV Sheet</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                          Excel / Data
                        </span>
                      </Button>
                    </div>
                    <DialogFooter className="sm:justify-center border-t pt-4">
                      <p className="text-[10px] text-center text-muted-foreground italic max-w-[80%]">
                        Ao escolher PDF, utilize a função &quot;Salvar como
                        PDF&quot; na janela de impressão do sistema.
                      </p>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <ReportInsights entries={reportData.entries} />
            <Card className="shadow-sm overflow-hidden border-t-4 border-t-primary">
              <div className="bg-muted/30 border-b p-2">
                <Tabs defaultValue="table" className="w-full">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold tracking-tight mr-2">
                        Results View:
                      </h3>
                      <TabsList className="h-9">
                        <TabsTrigger value="table" className="text-xs px-3">
                          <TableIcon className="mr-1.5 h-3.5 w-3.5" />
                          Data Table
                        </TabsTrigger>
                        <TabsTrigger value="chart" className="text-xs px-3">
                          <PieChart className="mr-1.5 h-3.5 w-3.5" />
                          Visual Chart
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </div>

                  <div className="p-4">
                    <TabsContent value="table" className="m-0">
                      <ReportTable data={reportData.entries} />
                    </TabsContent>
                    <TabsContent value="chart" className="m-0 h-[400px]">
                      <ReportChart data={reportData.entries} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </Card>
          </div>
        )}

        {/* Saved Reports Section */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <Share className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>Saved Reports</CardTitle>
                <CardDescription>
                  Manage your shared and archived reports
                </CardDescription>
              </div>
            </div>
            {selectedReports.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedReports.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Reports?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the selected {selectedReports.length} shared reports.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBulkDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Reports
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingSavedReports ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : savedReports.length > 0 ? (
              <div className="rounded-md border m-4 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[50px] text-center">
                        <Checkbox
                          checked={
                            savedReports.length > 0 &&
                            selectedReports.length === savedReports.length
                          }
                          onCheckedChange={(checked) =>
                            handleSelectAll(!!checked)
                          }
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedReports.map((report) => (
                      <TableRow
                        key={report.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedReports.includes(report.id)}
                            onCheckedChange={() =>
                              handleToggleSelect(report.id)
                            }
                            aria-label={`Select report ${report.id}`}
                          />
                        </TableCell>
                        <TableCell className="capitalize font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            {report.report_type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium">
                            {formatDateForDisplay(new Date(report.start_date))}{" "}
                            - {formatDateForDisplay(new Date(report.end_date))}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDateForDisplay(new Date(report.created_at))}
                        </TableCell>
                        <TableCell>
                          {report.expires_at ? (
                            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium bg-orange-100 dark:bg-orange-900/20 px-2 py-1 rounded-full">
                              {formatDateForDisplay(
                                new Date(report.expires_at),
                              )}
                            </span>
                          ) : (
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
                              Never
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyLink(report.share_token)}
                              title="Copy Link"
                              className="h-8 w-8"
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              title="View Report"
                              className="h-8 w-8"
                            >
                              <a
                                href={`/shared-report/${report.share_token}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Delete Report"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this shared
                                    report link.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteReport(report.id)
                                    }
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Share className="h-6 w-6 opacity-40" />
                </div>
                <h3 className="font-medium text-foreground mb-1">
                  No Saved Reports
                </h3>
                <p className="text-sm max-w-sm mx-auto mb-4">
                  Generate a report above and use the "Share" feature to create
                  a saved link here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Hidden Print Section for PDF Export */}
      {reportData && (
        <div className="hidden print:block p-8 font-sans bg-white text-black min-h-screen">
          <div className="border-b-2 border-black pb-4 mb-8">
            <h1 className="text-3xl font-bold uppercase tracking-tighter">
              {reportName ? `Relatório: ${reportName}` : "Relatório de Horas"}
            </h1>
            {reportCpfCnpj && (
              <p className="text-sm font-medium text-gray-600 mt-1">
                CPF/CNPJ: {reportCpfCnpj}
              </p>
            )}
            <p className="text-xl">Syncable Time Tracking System</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase text-gray-500">
                Usuário
              </p>
              <p className="text-lg font-semibold">
                {userData?.name || "Usuário Syncable"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase text-gray-500">
                Período
              </p>
              <p className="text-md leading-none">
                {startDate ? formatDateForDisplay(startDate) : "N/A"} -
                {endDate ? formatDateForDisplay(endDate) : "N/A"}
              </p>
            </div>
          </div>

          <table className="w-full mb-12 border-collapse">
            <thead>
              <tr className="border-b-2 border-black text-left">
                <th className="py-2 pr-4 bg-gray-50">Data</th>
                <th className="py-2 pr-4 bg-gray-50">Início</th>
                <th className="py-2 pr-4 bg-gray-50">Fim</th>
                <th className="py-2 pr-4 bg-gray-50">Duração</th>
                <th className="py-2 pr-4 bg-gray-50">Intervalo</th>
                <th className="py-2 bg-gray-50">Líquido</th>
              </tr>
            </thead>
            <tbody>
              {reportData.entries.map((entry: any, i: number) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-2 pr-4">{entry.date}</td>
                  <td className="py-2 pr-4">{entry.startTime}</td>
                  <td className="py-2 pr-4">
                    {entry.endTime || "Em execução"}
                  </td>
                  <td className="py-2 pr-4">
                    {formatDuration(entry.duration)}
                  </td>
                  <td className="py-2 pr-4">{formatDuration(entry.breaks)}</td>
                  <td className="py-2">{formatDuration(entry.netWork)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4 uppercase tracking-wider text-gray-700">
              Resumo do Período
            </h2>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-600">Trabalho Líquido Total</span>
                <span className="font-mono font-bold">
                  {formatDuration(reportData.summary.totalNetWork)}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-600">Total de Pausas</span>
                <span className="font-mono">
                  {formatDuration(reportData.summary.totalBreaks)}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-600">Acumulado Bruto</span>
                <span className="font-mono">
                  {formatDuration(reportData.summary.totalDuration)}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-600">Dias Trabalhados</span>
                <span className="font-mono">
                  {reportData.summary.daysWorked}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-2 col-span-2 text-lg">
                <span>Média Diária de Trabalho</span>
                <span className="font-mono">
                  {formatDuration(reportData.summary.averageDailyWork)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-gray-200 text-center text-xs text-gray-400 italic">
            Este relatório foi gerado automaticamente pela plataforma Syncable
            em {new Date().toLocaleString()}.
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
