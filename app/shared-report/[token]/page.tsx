"use client"

import { useState, useEffect } from "react"
import { getSharedReport } from "@/app/actions/reports"
import { formatDuration } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function SharedReportPage({ params }: { params: { token: string } }) {
  const { token } = params
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [report, setReport] = useState<any>(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        console.log("Fetching shared report with token:", token)
        const result = await getSharedReport(token)
        console.log("Shared report result:", result)

        if (!result.success) {
          setError(result.error || "This shared report is not available or has expired.")
        } else {
          setReport(result.data.report)
          setReportData(result.data.reportData)
        }
      } catch (err) {
        console.error("Error fetching shared report:", err)
        setError("Failed to load the shared report. Please check the URL and try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [token])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold">Loading Report</h1>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold">Report Not Available</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  // Check if we have valid report data
  if (!reportData || !reportData.entries || !Array.isArray(reportData.entries) || reportData.entries.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="border-b">
          <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Syncable</h1>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="container py-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Shared Time Report</h1>
              <p className="text-muted-foreground">
                {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} report from{" "}
                {new Date(report.start_date).toLocaleDateString()} to {new Date(report.end_date).toLocaleDateString()}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>No Data Available</CardTitle>
                <CardDescription>This report doesn't contain any time entries for the selected period.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  No time entries were found for this report period.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
        <footer className="border-t py-6">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
            <p className="text-sm text-gray-500">© 2025 Syncable. All rights reserved.</p>
          </div>
        </footer>
      </div>
    )
  }

  // Process data for the chart
  const chartData = reportData.entries.map((entry: any) => ({
    date: entry.date,
    work: Math.round((entry.netWork / (1000 * 60 * 60)) * 10) / 10, // Convert to hours with 1 decimal
    break: Math.round((entry.breaks / (1000 * 60 * 60)) * 10) / 10, // Convert to hours with 1 decimal
  }))

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Syncable</h1>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Shared Time Report</h1>
            <p className="text-muted-foreground">
              {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} report from{" "}
              {new Date(report.start_date).toLocaleDateString()} to {new Date(report.end_date).toLocaleDateString()}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Work Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(reportData.summary.totalNetWork)}</div>
                <p className="text-xs text-muted-foreground">
                  Across {reportData.summary.daysWorked} day{reportData.summary.daysWorked !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Break Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(reportData.summary.totalBreaks)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Daily Work</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(reportData.summary.averageDailyWork)}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Report Results</CardTitle>
              <CardDescription>View time tracking data</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="table">
                <TabsList>
                  <TabsTrigger value="table">Table</TabsTrigger>
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                </TabsList>
                <TabsContent value="table" className="pt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Start Time</TableHead>
                          <TableHead>End Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Breaks</TableHead>
                          <TableHead>Net Work</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.entries.length > 0 ? (
                          reportData.entries.map((entry: any) => (
                            <TableRow key={entry.id}>
                              <TableCell>{entry.date}</TableCell>
                              <TableCell>{entry.startTime}</TableCell>
                              <TableCell>{entry.endTime || "In progress"}</TableCell>
                              <TableCell>{formatDuration(entry.duration)}</TableCell>
                              <TableCell>{formatDuration(entry.breaks)}</TableCell>
                              <TableCell>{formatDuration(entry.netWork)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              No results found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="chart" className="pt-4">
                  <ChartContainer
                    config={{
                      work: {
                        label: "Work",
                        color: "hsl(var(--chart-1))",
                      },
                      break: {
                        label: "Break",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[400px]"
                  >
                    <BarChart accessibilityLayer data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                      <YAxis tickFormatter={(value) => `${value}h`} tickLine={false} tickMargin={10} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                      <Bar dataKey="work" fill="var(--color-work)" radius={4} stackId="stack" />
                      <Bar dataKey="break" fill="var(--color-break)" radius={4} stackId="stack" />
                    </BarChart>
                  </ChartContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-gray-500">© 2025 Syncable. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
