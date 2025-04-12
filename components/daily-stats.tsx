"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getDailyStats } from "@/app/actions/time-entries"

export function DailyStats({ userId }: { userId: number }) {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const result = await getDailyStats(userId, new Date())
        if (result.success) {
          setData(result.data)
        }
      } catch (error) {
        console.error("Error fetching daily stats:", error)
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
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="hour" tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis tickFormatter={(value) => `${value}m`} tickLine={false} tickMargin={10} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
        <Bar dataKey="work" fill="var(--color-work)" radius={4} stackId="stack" />
        <Bar dataKey="break" fill="var(--color-break)" radius={4} stackId="stack" />
      </BarChart>
    </ChartContainer>
  )
}
