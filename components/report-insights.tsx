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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {insights.map((insight, idx) => {
        const typeStyles: any = {
           success: 'green',
           warning: 'orange',
           info: 'blue',
           purple: 'purple'
        };
        const color = typeStyles[insight.type] || 'primary';
        
        return (
          <Card key={idx} className="border-none bg-card/40 backdrop-blur-md relative overflow-hidden group">
            <div className={`absolute -right-2 -bottom-2 h-16 w-16 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-50 ${
                color === 'primary' ? 'bg-primary' : 
                color === 'blue' ? 'bg-blue-500' : 
                color === 'green' ? 'bg-green-500' : 
                color === 'orange' ? 'bg-orange-500' : 'bg-purple-500'
            }`} />
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl border transition-transform group-hover:scale-110 shadow-sm ${
                    color === 'primary' ? 'bg-primary/20 text-primary border-primary/30' :
                    color === 'blue' ? 'bg-blue-500/20 text-blue-500 border-blue-500/30' :
                    color === 'green' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                    color === 'orange' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                    'bg-purple-500/20 text-purple-500 border-purple-500/30'
                }`}>
                  {getIcon(insight.label)}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{insight.label}</p>
                  <h4 className="text-xl font-bold tracking-tight">{insight.value}</h4>
                  {insight.subValue && (
                     <p className="text-[9px] font-medium text-muted-foreground opacity-60 truncate max-w-[120px]">{insight.subValue}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
