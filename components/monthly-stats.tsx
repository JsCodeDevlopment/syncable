"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getMonthlyStats } from "@/app/actions/time-entries"

export function MonthlyStats({ userId }: { userId: number }) {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const result = await getMonthlyStats(userId, new Date())
        if (result.success) {
          setData(result.data)
        }
      } catch (error) {
        console.error("Error fetching monthly stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

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
      className="h-[300px]"
    >
      <LineChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="week" tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis tickFormatter={(value) => `${value}h`} tickLine={false} tickMargin={10} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
        <Line
          type="monotone"
          dataKey="work"
          stroke="var(--color-work)"
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="break"
          stroke="var(--color-break)"
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
