"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateInsights, type ReportEntry } from "@/lib/insights";
import { formatDuration } from "@/lib/format-duration";
import { Activity, Clock, Coffee, TrendingUp } from "lucide-react";

interface ReportInsightsProps {
  entries?: any[];
  insightsData?: any;
}

export function ReportInsights({ entries, insightsData }: ReportInsightsProps) {
  let insights: any[] = [];
  
  if (entries) {
    insights = calculateInsights(entries as ReportEntry[]);
  } else if (insightsData) {
    // Transform pre-calculated insights from dashboard-insights action
    insights = [
      {
        label: "Top Performer (30d)",
        value: formatDuration(insightsData.mostWorkedDay.duration),
        subValue: `On ${insightsData.mostWorkedDay.date}`,
        type: "success"
      },
      {
        label: "Recovery Hero",
        value: formatDuration(insightsData.mostBreaksDay.duration),
        subValue: `Most breaks on ${insightsData.mostBreaksDay.date}`,
        type: "warning"
      },
      {
        label: "Avg Daily Rhythm",
        value: formatDuration(insightsData.avgDailyWork),
        subValue: `Over ${insightsData.totalDaysWorked} active days`,
        type: "info"
      }
    ];
  }

  if (insights.length === 0) return null;

  const getIcon = (label: string) => {
    if (label.includes("Top Performer") || label.includes("Average Daily")) return <TrendingUp className="h-4 w-4" />;
    if (label.includes("Recovery Champion")) return <Coffee className="h-4 w-4" />;
    if (label.includes("Session")) return <Clock className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getStyles = (type: string) => {
    switch (type) {
      case "success": return {
        border: "border-l-green-500",
        bg: "bg-gradient-to-br from-white to-green-50/50 dark:from-background dark:to-background",
        iconContainer: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
        blur: "bg-green-500/10"
      };
      case "warning": return {
        border: "border-l-orange-500",
        bg: "bg-gradient-to-br from-white to-orange-50/50 dark:from-background dark:to-background",
        iconContainer: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
        blur: "bg-orange-500/10"
      };
      case "info": return {
        border: "border-l-blue-500",
        bg: "bg-gradient-to-br from-white to-blue-50/50 dark:from-background dark:to-background",
        iconContainer: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        blur: "bg-blue-500/10"
      };
      case "purple": return {
        border: "border-l-purple-500",
        bg: "bg-gradient-to-br from-white to-purple-50/50 dark:from-background dark:to-background",
        iconContainer: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
        blur: "bg-purple-500/10"
      };
      default: return {
        border: "border-l-slate-500",
        bg: "bg-gradient-to-br from-white to-slate-50/50 dark:from-background dark:to-background",
        iconContainer: "bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400",
        blur: "bg-slate-500/10"
      };
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {insights.map((insight, idx) => {
        const styles = getStyles(insight.type);
        return (
          <Card key={idx} className={`hover:shadow-lg transition-all border-l-4 ${styles.border} ${styles.bg} overflow-hidden relative group`}>
            <div className={`absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full ${styles.blur} blur-2xl transition-transform group-hover:scale-125`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                {insight.label}
              </CardTitle>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12 ${styles.iconContainer}`}>
                {getIcon(insight.label)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground group-hover:translate-x-1 transition-transform">
                {insight.value}
              </div>
              {insight.subValue && (
                <p className="mt-2 text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-tighter flex items-center gap-1 group-hover:opacity-100 transition-opacity">
                  {insight.subValue}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
