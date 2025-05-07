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
import { formatDuration } from "@/lib/utils";
import { Download, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../actions/auth";
import { createSharedReport, generateReport } from "../actions/reports";

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

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Reports"
        text="Generate and download time tracking reports"
      >
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleDownloadReport}
            disabled={!reportData || isDownloading}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Downloading..." : "Download"}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Share className="mr-2 h-4 w-4" />
                Share
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
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public-report"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public-report">Make report public</Label>
                </div>

                {isPublic && !shareLink && (
                  <div className="grid gap-2">
                    <Label htmlFor="share-duration">Link expiration</Label>
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
                    <Label htmlFor="share-link">Public link</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="share-link"
                        value={shareLink}
                        readOnly
                        onClick={(e) => e.currentTarget.select()}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(shareLink);
                          toast({
                            title: "Link copied",
                            description:
                              "The share link has been copied to your clipboard.",
                          });
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                {isPublic && !shareLink ? (
                  <Button onClick={handleShareReport} disabled={isSharing}>
                    {isSharing ? "Generating Link..." : "Generate Link"}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setShareLink("")}>
                    Reset
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardHeader>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>
              Select the time period and type of report you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="grid gap-2">
                <Label>Period</Label>
                <Tabs
                  defaultValue="daily"
                  value={activeTab}
                  onValueChange={setActiveTab}
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
                <Label>Report Type</Label>
                <Select defaultValue={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="entries">Entries Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Results</CardTitle>
            <CardDescription>View your time tracking report</CardDescription>
          </CardHeader>
          <CardContent>
            {reportData ? (
              <Tabs defaultValue="table">
                <TabsList>
                  <TabsTrigger value="table">Table</TabsTrigger>
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                </TabsList>
                <TabsContent value="table" className="pt-4">
                  <ReportTable data={reportData.entries} />
                </TabsContent>
                <TabsContent value="chart" className="pt-4">
                  <ReportChart data={reportData.entries} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No report data available. Use the filters above to generate a
                report.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
