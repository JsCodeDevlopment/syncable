"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { DatePicker } from "@/components/date-picker";
import { ReportChart } from "@/components/report-chart";
import { ReportTable } from "@/components/report-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { formatDuration } from "@/lib/db";
import { Calendar, Download, ExternalLink, FileText, Filter, PieChart, Share, Table as TableIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../actions/auth";
import { createSharedReport, generateReport, getUserSharedReports, deleteSharedReport, deleteSharedReports, type SharedReport } from "../actions/reports";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { formatDateForDisplay } from "@/lib/db";

export default function ReportsPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("daily");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [reportType, setReportType] = useState("detailed");
  const [shareLink, setShareLink] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [shareDuration, setShareDuration] = useState("7");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [reportData, setReportData] = useState<any>(null);

  const [savedReports, setSavedReports] = useState<SharedReport[]>([]);
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  const [isLoadingSavedReports, setIsLoadingSavedReports] = useState(false);

  useEffect(() => {
    // Get user ID using the server action
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

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
      console.log("Generating report for:", {
        userId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        activeTab,
      });

      const result = await generateReport(
        userId,
        startDate,
        endDate,
        activeTab
      );
      console.log("Report generation result:", result);

      if (result.success) {
        setReportData(result.data);
        toast({
          title: "Report generated",
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

  const handleDownloadReport = async () => {
    if (!reportData) {
      toast({
        title: "No report data",
        description: "Please generate a report first.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    try {
      // Create a CSV string
      const headers = [
        "Date",
        "Start Time",
        "End Time",
        "Duration",
        "Breaks",
        "Net Work",
      ];
      const rows = reportData.entries.map((entry: any) => [
        entry.date,
        entry.startTime,
        entry.endTime || "In progress",
        formatDuration(entry.duration),
        formatDuration(entry.breaks),
        formatDuration(entry.netWork),
      ]);

      // Add summary row
      rows.push([]);
      rows.push(["Summary"]);
      rows.push([
        "Total Duration",
        "",
        "",
        formatDuration(reportData.summary.totalDuration),
      ]);
      rows.push([
        "Total Breaks",
        "",
        "",
        formatDuration(reportData.summary.totalBreaks),
      ]);
      rows.push([
        "Total Net Work",
        "",
        "",
        formatDuration(reportData.summary.totalNetWork),
      ]);
      rows.push([
        "Days Worked",
        "",
        "",
        reportData.summary.daysWorked.toString(),
      ]);
      rows.push([
        "Average Daily Work",
        "",
        "",
        formatDuration(reportData.summary.averageDailyWork),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      // Create a blob and download it
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `syncable-report-${new Date().toISOString().split("T")[0]}.csv`
      );
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
        title: "Error",
        description: "Failed to download report",
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
        Number.parseInt(shareDuration)
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
        : [...prev, reportId]
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
        heading="Reports & Analytics"
        text="Analyze your productivity and export time tracking data."
      >
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleDownloadReport}
            disabled={!reportData || isDownloading}
            className="hidden sm:flex"
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Downloading..." : "Export CSV"}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Share className="mr-2 h-4 w-4" />
                Share Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Report</DialogTitle>
                <DialogDescription>
                  Create a public link to share your time tracking report with
                  others.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/50">
                  <Switch
                    id="public-report"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <div className="space-y-0.5">
                    <Label htmlFor="public-report" className="text-base">Public Access</Label>
                    <p className="text-xs text-muted-foreground">Allow anyone with the link to view this report</p>
                  </div>
                </div>

                {isPublic && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    {!shareLink && (
                      <div className="grid gap-2">
                        <Label htmlFor="share-duration">Link Expiration</Label>
                        <Select
                          value={shareDuration}
                          onValueChange={setShareDuration}
                        >
                          <SelectTrigger id="share-duration">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 day</SelectItem>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="0">No expiration</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {shareLink && (
                      <div className="grid gap-2">
                        <Label htmlFor="share-link">Share Link</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="share-link"
                            value={shareLink}
                            readOnly
                            onClick={(e) => e.currentTarget.select()}
                            className="bg-muted"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              navigator.clipboard.writeText(shareLink);
                              toast({
                                title: "Link copied",
                                description:
                                  "The share link has been copied to your clipboard.",
                              });
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                {isPublic && !shareLink ? (
                  <Button onClick={handleShareReport} disabled={isSharing} className="w-full sm:w-auto">
                    {isSharing ? "Generating..." : "Generate Link"}
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={() => setShareLink("")} className="w-full sm:w-auto">
                    Reset Link
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardHeader>

      <div className="grid gap-6">
        {/* Filters Section */}
        <Card className="border-t-4 border-t-primary shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Filter className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>
                  Customize parameters to generate your report
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  Period
                </Label>
                <Tabs
                  defaultValue="daily"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <DatePicker date={startDate} setDate={setStartDate} />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <DatePicker date={endDate} setDate={setEndDate} />
              </div>
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  Report Type
                </Label>
                <Select defaultValue={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary View</SelectItem>
                    <SelectItem value="detailed">Detailed View</SelectItem>
                    <SelectItem value="entries">Entries Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleGenerateReport} disabled={isGenerating} size="lg" className="w-full sm:w-auto">
                {isGenerating ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {reportData && (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4">
            <Card className="shadow-sm overflow-hidden">
              <div className="bg-muted/30 border-b p-2">
                <Tabs defaultValue="table" className="w-full">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold tracking-tight mr-2">Results View:</h3>
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
                  <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedReports.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Reports?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the
                      selected {selectedReports.length} shared reports.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
                          onCheckedChange={(checked) => handleSelectAll(!!checked)}
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
                      <TableRow key={report.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedReports.includes(report.id)}
                            onCheckedChange={() => handleToggleSelect(report.id)}
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
                            {formatDateForDisplay(new Date(report.start_date))} - {formatDateForDisplay(new Date(report.end_date))}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDateForDisplay(new Date(report.created_at))}
                        </TableCell>
                        <TableCell>
                          {report.expires_at ? (
                            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium bg-orange-100 dark:bg-orange-900/20 px-2 py-1 rounded-full">
                              {formatDateForDisplay(new Date(report.expires_at))}
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
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this shared report link.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteReport(report.id)}
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
                <h3 className="font-medium text-foreground mb-1">No Saved Reports</h3>
                <p className="text-sm max-w-sm mx-auto mb-4">
                  Generate a report above and use the "Share" feature to create a saved link here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
