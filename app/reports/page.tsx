"use client";

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
import { formatCurrency } from "@/lib/format-currency";
import { ReportPDF } from "@/components/reports/report-pdf";
import dynamic from "next/dynamic";
import {
  Activity,
  Banknote,
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
  Share2,
  Table as TableIcon,
  Timer,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { StatCard, InsightSmallCard } from "@/components/stat-card";
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
import { getProjects } from "../actions/projects";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

const formatDateBR = (date: Date) => date.toLocaleDateString("pt-BR");

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("daily");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [reportType, setReportType] = useState("detailed");
  const [shareLink, setShareLink] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [shareDuration, setShareDuration] = useState("7");
  const [showInsightsInShare, setShowInsightsInShare] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [projects, setProjects] = useState<any[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [reportCreatedSuccess, setReportCreatedSuccess] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportCpfCnpj, setReportCpfCnpj] = useState("");
  const [exportUserName, setExportUserName] = useState("");
  const [exportUserDocument, setExportUserDocument] = useState("");
  const [showEarningsInPdf, setShowEarningsInPdf] = useState(true);
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const [isFetchingGlobal, setIsFetchingGlobal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserData(user);
          setExportUserName(user.name);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
        try {
          const result = await getProjects();
          if (result.success && result.data) {
            setProjects(result.data);
          }
        } catch (error) {
          console.error("Error loading projects:", error);
        }
    };

    loadProjects();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const fetchSavedReports = async () => {
    setIsLoadingSavedReports(true);
    try {
      const result = await getUserSharedReports();
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
    fetchSavedReports();
  }, []);

  const fetchGlobalAggregation = async () => {
    setIsFetchingGlobal(true);
    try {
      const result = await getGlobalReportAggregation();
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
    if (savedReports.length > 0) {
      fetchGlobalAggregation();
    } else {
      setGlobalReportData(null);
    }
  }, [savedReports.length]);

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
    if (!startDate || !endDate) {
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
        startDate,
        endDate,
        activeTab,
        selectedProjectId === "all" ? null : parseInt(selectedProjectId)
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
        "Projeto",
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
          entry.project_name || "N/A",
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
      ];

      if (reportData.summary.hourlyRate) {
        summaryLines.push(
          `Valor Hora;${formatCurrency(reportData.summary.hourlyRate, reportData.summary.currency)}`,
          `TOTAL A RECEBER;${formatCurrency(reportData.summary.totalPayable, reportData.summary.currency)}`
        );
      }

      summaryLines.push("----------------------------------------");

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
    if (!startDate || !endDate || !reportData) {
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
        activeTab as "daily" | "weekly" | "monthly",
        startDate,
        endDate,
        Number.parseInt(shareDuration),
        showInsightsInShare,
        reportName,
        reportCpfCnpj,
        selectedProjectId === "all" ? null : parseInt(selectedProjectId)
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
    try {
      const result = await deleteSharedReport(reportId);
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
    if (selectedReports.length === 0) return;
    try {
      const result = await deleteSharedReports(selectedReports);
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
      <div className="flex flex-col gap-8 pb-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {getGreeting()}{userData ? `, ${userData.name.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-muted-foreground mt-1 italic opacity-80">
               Analyze your productivity and generate detailed time reports.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog
              open={isGenerateModalOpen}
              onOpenChange={(open) => {
                setIsGenerateModalOpen(open);
                if (!open) setReportCreatedSuccess(false);
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm" className="shadow-lg hover:shadow-primary/20 transition-all font-semibold hover:scale-105 bg-primary">
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

                    <div className="grid gap-2">
                      <Label>Filter by Project</Label>
                      <Select
                        value={selectedProjectId}
                        onValueChange={setSelectedProjectId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Projects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">General (All Projects)</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
                                {project.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
        </div>
        {/* Global Summary Section */}
        {savedReports.length > 0 && globalReportData && (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
               <InsightSmallCard
                  label="Peak Activity"
                  value={globalReportData.summary.daysWorked.toString()}
                  subValue="Active days recorded"
                  icon={<TrendingUp className="h-4 w-4" />}
                  color="blue"
               />
               <InsightSmallCard
                  label="Work Consistency"
                  value={Math.round((globalReportData.summary.daysWorked / 30) * 100) + "%"}
                  subValue="Last 30 days activity"
                  icon={<Timer className="h-4 w-4" />}
                  color="purple"
               />
               <InsightSmallCard
                  label="Daily Average"
                  value={formatDuration(globalReportData.summary.averageDailyWork)}
                  subValue="Time per active day"
                  icon={<BarChart className="h-4 w-4" />}
                  color="green"
               />
            </div>

            <ReportInsights entries={globalReportData.entries} />
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Worked"
                value={formatDuration(globalReportData.summary.totalNetWork)}
                icon={<Clock className="h-4 w-4" />}
                description="net work time"
                color="blue"
              />
              <StatCard
                title="Total Breaks"
                value={formatDuration(globalReportData.summary.totalBreaks)}
                icon={<Coffee className="h-4 w-4" />}
                description="registered pauses"
                color="orange"
              />
              <StatCard
                title="Total Combined"
                value={formatDuration(globalReportData.summary.totalDuration)}
                icon={<Activity className="h-4 w-4" />}
                description="total elapsed time"
                color="purple"
              />
              {globalReportData.summary.hourlyRate ? (
                <StatCard
                  title="Total Payable"
                  value={formatCurrency(globalReportData.summary.totalPayable, globalReportData.summary.currency)}
                  icon={<Banknote className="h-4 w-4" />}
                  description={`Rate: ${formatCurrency(globalReportData.summary.hourlyRate, globalReportData.summary.currency)}/h`}
                  color="primary"
                />
              ) : (
                <StatCard
                  title="Total Payable"
                  value="N/A"
                  icon={<Banknote className="h-4 w-4" />}
                  description="Rate not set"
                  color="amber"
                />
              )}
            </div>

            <Card className="border-none shadow-xl relative overflow-hidden group bg-card/40 backdrop-blur-md">
               <div className="absolute -right-10 -top-10 h-64 w-64 bg-orange-500/5 rounded-full blur-[100px] group-hover:bg-orange-500/10 transition-colors" />
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative z-10 pb-6 px-8 pt-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner">
                    <BarChart className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tight">Aggregated Activity</CardTitle>
                    <CardDescription className="font-medium opacity-70">Consolidated data from all generated reports</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 px-8 pb-8">
                <Tabs defaultValue="table" className="w-full">
                  <div className="flex items-center justify-between pb-6">
                      <TabsList className="p-1 bg-muted/50 rounded-xl h-11">
                        <TabsTrigger value="table" className="text-xs px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all h-9">
                          <TableIcon className="mr-2 h-4 w-4" />
                          Table View
                        </TabsTrigger>
                        <TabsTrigger value="chart" className="text-xs px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all h-9">
                          <PieChart className="mr-2 h-4 w-4" />
                          Visual Chart
                        </TabsTrigger>
                      </TabsList>
                  </div>

                  <div className="rounded-2xl border border-border/40 overflow-hidden bg-background/20 backdrop-blur-sm">
                    <TabsContent value="table" className="m-0">
                      <ReportTable data={globalReportData.entries} />
                    </TabsContent>
                    <TabsContent value="chart" className="m-0 h-[400px] p-6">
                      <ReportChart data={globalReportData.entries} />
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Section */}
        {reportData && (
          <div
            ref={reportResultRef}
            className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 scroll-mt-40"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-card/40 backdrop-blur-md p-8 rounded-3xl border-none shadow-xl relative overflow-hidden group">
               <div className="absolute -left-10 -top-10 h-40 w-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
              <div className="relative z-10">
                <h2 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                  {reportName ? reportName : "Report Results"}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  {reportCpfCnpj && (
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                      ID: {reportCpfCnpj}
                    </span>
                  )}
                  <p className="text-muted-foreground font-medium opacity-70">
                    Detailed productivity analysis for the selected period.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                  <Dialog>
                  <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl font-semibold gap-2 border-primary/20 hover:bg-primary/5"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Report
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
                      <div className="flex items-center space-x-4 rounded-xl border p-4 bg-muted/30">
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
                      className="bg-accent/50 text-accent-foreground border-border hover:bg-accent transition-all hover:scale-105 active:scale-95 px-8 font-bold text-base h-12 shadow-lg"
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
                        {isClient ? (
                          <PDFDownloadLink
                            document={
                              <ReportPDF 
                                data={reportData} 
                                reportInfo={{
                                  name: reportName || "Time Tracking Report",
                                  type: reportType,
                                  startDate: startDate!,
                                  endDate: endDate!,
                                  idNumber: reportCpfCnpj,
                                  userName: exportUserName,
                                  userDocument: exportUserDocument,
                                  showEarnings: showEarningsInPdf
                                }} 
                              />
                            }
                            fileName={`Syncable_Report_${reportName || "General"}_${formatDateBR(new Date())}.pdf`}
                            style={{ textDecoration: "none" }}
                          >
                            {({ loading }) => (
                              <Button
                                variant="outline"
                                disabled={loading}
                                className="h-32 w-full flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
                              >
                                <FileText className={`h-10 w-10 text-red-500 ${loading ? "animate-pulse" : "group-hover:scale-110"} transition-transform`} />
                                <span className="font-bold text-lg">
                                  {loading ? "Preparing..." : "PDF Document"}
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                  {loading ? "Generating Sheet" : "Digital Sheet"}
                                </span>
                              </Button>
                            )}
                          </PDFDownloadLink>
                        ) : (
                          <Button
                            variant="outline"
                            disabled
                            className="h-32 w-full flex flex-col items-center justify-center gap-2 grayscale opacity-70"
                          >
                            <FileText className="h-10 w-10 text-red-500" />
                            <span className="font-bold text-lg">PDF Document</span>
                          </Button>
                        )}
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

                    <div className="space-y-4 px-1 pb-4">
                      <div className="grid gap-2">
                        <Label htmlFor="export-name" className="text-xs font-bold uppercase text-muted-foreground">Professional Name (Optional)</Label>
                        <Input 
                          id="export-name"
                          placeholder="Your full name"
                          value={exportUserName}
                          onChange={(e) => setExportUserName(e.target.value)}
                          className="h-10 rounded-xl"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="export-doc" className="text-xs font-bold uppercase text-muted-foreground">Document (CPF/CNPJ - Optional)</Label>
                        <Input 
                          id="export-doc"
                          placeholder="000.000.000-00"
                          value={exportUserDocument}
                          onChange={(e) => setExportUserDocument(e.target.value)}
                          className="h-10 rounded-xl"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-secondary">
                        <div className="space-y-0.5">
                          <Label htmlFor="show-earnings" className="text-sm font-bold">Show Estimated Value</Label>
                          <p className="text-[10px] text-muted-foreground">Include earnings and hourly rate in PDF</p>
                        </div>
                        <Switch 
                          id="show-earnings"
                          checked={showEarningsInPdf}
                          onCheckedChange={setShowEarningsInPdf}
                        />
                      </div>
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
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Worked"
                  value={formatDuration(reportData.summary.totalNetWork)}
                  icon={<Clock className="h-4 w-4" />}
                  description="net work time"
                  color="blue"
                />
                <StatCard
                  title="Total Breaks"
                  value={formatDuration(reportData.summary.totalBreaks)}
                  icon={<Coffee className="h-4 w-4" />}
                  description="registered pauses"
                  color="orange"
                />
                <StatCard
                  title="Combined Total"
                  value={formatDuration(reportData.summary.totalDuration)}
                  icon={<Activity className="h-4 w-4" />}
                  description="total elapsed time"
                  color="purple"
                />
                {reportData.summary.hourlyRate ? (
                  <StatCard
                    title="Total Payable"
                    value={formatCurrency(reportData.summary.totalPayable, reportData.summary.currency)}
                    icon={<Banknote className="h-4 w-4" />}
                    description={`Based on ${formatCurrency(reportData.summary.hourlyRate, reportData.summary.currency)}/h`}
                    color="primary"
                  />
                ) : (
                  <StatCard
                    title="Total Payable"
                    value="N/A"
                    icon={<Banknote className="h-4 w-4" />}
                    description="Set rate in Settings"
                    color="amber"
                  />
                )}
            </div>

            <ReportInsights entries={reportData.entries} />
            <Card className="border-none shadow-sm relative overflow-hidden group bg-card/40 backdrop-blur-md">
               <div className="absolute -right-10 -top-10 h-40 w-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
              <CardContent className="p-0">
                <Tabs defaultValue="table" className="w-full">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <TableIcon className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-bold tracking-tight">Report Data</h3>
                      </div>
                      <TabsList className="h-9 bg-muted/50">
                        <TabsTrigger value="table" className="text-xs px-4">
                          Table View
                        </TabsTrigger>
                        <TabsTrigger value="chart" className="text-xs px-4">
                          Visual Chart
                        </TabsTrigger>
                      </TabsList>
                  </div>

                  <div className="p-6">
                    <TabsContent value="table" className="m-0">
                      <ReportTable data={reportData.entries} />
                    </TabsContent>
                    <TabsContent value="chart" className="m-0 h-[400px]">
                      <ReportChart data={reportData.entries} />
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Saved Reports Section */}
        <Card className="border-none shadow-xl relative overflow-hidden bg-card/40 backdrop-blur-md group">
           <div className="absolute -left-10 -bottom-10 h-64 w-64 bg-orange-500/5 rounded-full blur-[100px] opacity-40 group-hover:bg-orange-500/10 transition-colors" />
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-6 relative z-10 px-8 pt-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner">
                <Share className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black tracking-tight">Saved Reports</CardTitle>
                <CardDescription className="font-medium opacity-70">
                  Manage your shared and archived reports
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {selectedReports.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="shadow-xl shadow-destructive/20 font-bold hover:scale-105 active:scale-95 transition-all"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Selected ({selectedReports.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl border-none shadow-2xl backdrop-blur-xl bg-background/80">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-black">Delete Reports?</AlertDialogTitle>
                      <AlertDialogDescription className="text-base font-medium opacity-80">
                        This action cannot be undone. This will permanently delete
                        the selected {selectedReports.length} shared reports and their public links.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                      <AlertDialogCancel className="rounded-xl font-bold border-none bg-muted/50 hover:bg-muted">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleBulkDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold shadow-lg shadow-destructive/20"
                      >
                        Confirm Deletion
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8 relative z-10">
            {isLoadingSavedReports ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary border-t-2 border-t-transparent"></div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Loading reports...</p>
              </div>
            ) : savedReports.length > 0 ? (
              <div className="rounded-2xl border border-border/40 overflow-hidden bg-background/20 backdrop-blur-sm">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-border/40">
                      <TableHead className="w-[60px] text-center">
                        <Checkbox
                          checked={
                            savedReports.length > 0 &&
                            selectedReports.length === savedReports.length
                          }
                          onCheckedChange={(checked) =>
                            handleSelectAll(!!checked)
                          }
                          aria-label="Select all"
                          className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                        />
                      </TableHead>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Report Type</TableHead>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Date Range</TableHead>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Created</TableHead>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Status / Expiry</TableHead>
                      <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedReports.map((report) => (
                      <TableRow
                        key={report.id}
                        className="hover:bg-orange-500/5 transition-colors border-border/40 group/row"
                      >
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedReports.includes(report.id)}
                            onCheckedChange={() =>
                              handleToggleSelect(report.id)
                            }
                            aria-label={`Select report ${report.id}`}
                            className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                          />
                        </TableCell>
                        <TableCell className="capitalize font-bold text-foreground">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover/row:bg-orange-500/10 transition-colors">
                               <FileText className="h-4 w-4 text-muted-foreground group-hover/row:text-orange-500 transition-colors" />
                            </div>
                            {report.report_type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted/50 text-[10px] font-bold text-foreground border border-border/40">
                             {formatDateForDisplay(new Date(report.start_date))} - {formatDateForDisplay(new Date(report.end_date))}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs font-medium">
                          {formatDateForDisplay(new Date(report.created_at))}
                        </TableCell>
                        <TableCell>
                          {report.expires_at ? (
                             <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase text-orange-500/80 tracking-tighter">Expires on</span>
                                <span className="text-xs font-bold text-foreground">
                                  {formatDateForDisplay(new Date(report.expires_at))}
                                </span>
                             </div>
                          ) : (
                            <span className="text-[10px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                              Permanent
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyLink(report.share_token)}
                              title="Copy Link"
                              className="h-9 w-9 rounded-xl hover:bg-orange-500/10 hover:text-orange-500 transition-all active:scale-90"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              title="View Report"
                              className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
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
                                  className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all active:scale-90"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-3xl border-none shadow-2xl backdrop-blur-xl bg-background/80">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-2xl font-black">Final Delete?</AlertDialogTitle>
                                  <AlertDialogDescription className="font-medium opacity-80">
                                    This will permanently remove the shared access link for this report.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-6">
                                  <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteReport(report.id)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold"
                                  >
                                    Delete Link
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
              <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/5">
                <div className="h-20 w-20 rounded-3xl bg-muted/20 flex items-center justify-center mb-6 shadow-inner">
                  <Share className="h-10 w-10 opacity-20" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-2">
                  No Saved Reports Yet
                </h3>
                <p className="text-sm font-medium text-muted-foreground max-w-sm mx-auto mb-8 px-4 opacity-70">
                  Generate a report above and use the "Share & Publish" feature to create
                  persistent shareable links here.
                </p>
                <Button variant="outline" className="rounded-xl font-bold" onClick={() => setIsGenerateModalOpen(true)}>
                    Create your first report
                </Button>
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
              
              {reportData.summary.hourlyRate && (
                <div className="flex justify-between font-bold pt-4 col-span-2 text-2xl border-t-2 border-black mt-2">
                  <span>TOTAL A RECEBER</span>
                  <span className="font-mono text-primary">
                    {formatCurrency(reportData.summary.totalPayable, reportData.summary.currency)}
                  </span>
                </div>
              )}
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
