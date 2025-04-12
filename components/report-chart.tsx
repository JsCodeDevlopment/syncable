"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ReportChartProps {
  data: {
    id: number
    date: string
    startTime: string
    endTime: string | null
    duration: number
    breaks: number
    netWork: number
  }[]
}

export function ReportChart({ data }: ReportChartProps) {
  // Process data for the chart
  const chartData = data.map((entry) => ({
    date: entry.date,
    work: Math.round((entry.netWork / (1000 * 60 * 60)) * 10) / 10, // Convert to hours with 1 decimal
    break: Math.round((entry.breaks / (1000 * 60 * 60)) * 10) / 10, // Convert to hours with 1 decimal
  }))

  return (
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
  )
}
