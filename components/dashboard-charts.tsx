"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Pie,
  PieChart,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type DashboardChartsProps = {
  projectsDistribution: {
    name: string
    color: string
    workDuration: number
    breakDuration: number
    totalDuration: number
    percentage: number
  }[]
  weeklyData: {
    day: string
    hours: number
  }[]
}

export function DashboardCharts({ projectsDistribution, weeklyData }: DashboardChartsProps) {
  // Format data for project breakdown chart (convert ms to hours)
  const projectBreakdownData = projectsDistribution.map(p => ({
    name: p.name,
    work: Math.round((p.workDuration / 3600000) * 10) / 10,
    breaks: Math.round((p.breakDuration / 3600000) * 10) / 10,
    color: p.color
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-none bg-card/50 backdrop-blur-sm bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Productivity Weekly</CardTitle>
            <CardDescription>Hours worked per day this week</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData}>
                <XAxis
                  dataKey="day"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}h`}
                />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.05)'}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase text-muted-foreground font-bold">
                                {payload[0].payload.day}
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].value}h
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar
                  dataKey="hours"
                  fill="currentColor"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm border-none bg-card/50 backdrop-blur-sm bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Allocation by Project</CardTitle>
            <CardDescription>Time share per project</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={projectsDistribution.length > 0 ? projectsDistribution : [{name: 'No data', totalDuration: 1, color: '#e2e8f0'}]}
                  dataKey="totalDuration"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {projectsDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
                            <span className="font-medium text-xs truncate max-w-[150px]">{payload[0].name}</span>
                            <span className="text-muted-foreground ml-auto">{payload[0].payload.percentage}%</span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                  />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-1.5 max-h-[100px] overflow-auto pr-2 custom-scrollbar">
              {projectsDistribution.map((item) => (
                <div key={item.name} className="flex items-center">
                  <div className="h-2 w-2 rounded-full mr-2 shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] font-medium truncate flex-1">{item.name}</span>
                  <span className="text-[11px] text-muted-foreground">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-none bg-card/50 backdrop-blur-sm bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Work vs Breaks Breakdown</CardTitle>
          <CardDescription>Comparison between focused work and intervals per project</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={projectsDistribution.length > 2 ? projectsDistribution.length * 50 + 100 : 250}>
            <BarChart data={projectBreakdownData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}h`} />
              <YAxis dataKey="name" type="category" fontSize={11} tickLine={false} axisLine={false} width={100} />
              <Tooltip 
                cursor={{fill: 'rgba(0,0,0,0.05)'}}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-lg flex flex-col gap-1">
                        <p className="text-xs font-bold mb-1">{payload[0].payload.name}</p>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="text-xs text-muted-foreground">Work:</span>
                          <span className="text-xs font-bold">{payload[0].value}h</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-orange-400" />
                          <span className="text-xs text-muted-foreground">Breaks:</span>
                          <span className="text-xs font-bold">{payload[1]?.value || 0}h</span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '11px' }} />
              <Bar dataKey="work" name="Marketable Work" stackId="a" fill="currentColor" className="fill-primary" radius={[0, 0, 0, 0]} barSize={20} minPointSize={2} />
              <Bar dataKey="breaks" name="Breaks Time" stackId="a" fill="#fb923c" radius={[0, 4, 4, 0]} barSize={20} minPointSize={2} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
