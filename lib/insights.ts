import { formatDuration } from "./format-duration";

export type ReportEntry = {
  id: number;
  date: string; // "dd/mm/yyyy"
  duration: number;
  breaks: number;
  netWork: number;
};

export type InsightMetric = {
  label: string;
  value: string;
  subValue?: string;
  type: "success" | "warning" | "info" | "purple";
};

export function calculateInsights(entries: ReportEntry[]): InsightMetric[] {
  if (!entries || entries.length === 0) return [];

  const dailyStats: Record<string, { work: number; breaks: number; entries: number }> = {};
  
  entries.forEach(entry => {
    if (!dailyStats[entry.date]) {
      dailyStats[entry.date] = { work: 0, breaks: 0, entries: 0 };
    }
    dailyStats[entry.date].work += entry.netWork;
    dailyStats[entry.date].breaks += entry.breaks;
    dailyStats[entry.date].entries += 1;
  });

  const dates = Object.keys(dailyStats);
  if (dates.length === 0) return [];

  // 1. Most Worked Day
  let mostWorkedDate = dates[0];
  let maxWork = dailyStats[dates[0]].work;

  // 2. Day with Most Breaks
  let mostBreaksDate = dates[0];
  let maxBreaks = dailyStats[dates[0]].breaks;

  dates.forEach(date => {
    if (dailyStats[date].work > maxWork) {
      maxWork = dailyStats[date].work;
      mostWorkedDate = date;
    }
    if (dailyStats[date].breaks > maxBreaks) {
      maxBreaks = dailyStats[date].breaks;
      mostBreaksDate = date;
    }
  });

  const insights: InsightMetric[] = [
    {
      label: "Top Performer (Day)",
      value: formatDuration(maxWork),
      subValue: `Recorded on ${mostWorkedDate}`,
      type: "success"
    },
    {
      label: "Recovery Champion (Day)",
      value: formatDuration(maxBreaks),
      subValue: `Most breaks on ${mostBreaksDate}`,
      type: "warning"
    }
  ];

  // 3. Weekly Stats (Simple grouping by week of month or year)
  if (dates.length >= 7) {
    const totalNetWork = Object.values(dailyStats).reduce((acc, curr) => acc + curr.work, 0);
    const avgDailyWork = totalNetWork / dates.length;
    
    insights.push({
      label: "Average Daily Production",
      value: formatDuration(avgDailyWork),
      subValue: `Based on last ${dates.length} days`,
      type: "info"
    });
  }

  // 4. Session Efficiency
  const totalEntries = entries.length;
  const totalNetWork = entries.reduce((acc, curr) => acc + curr.netWork, 0);
  const avgSessionDuration = totalNetWork / totalEntries;

  insights.push({
    label: "Average Session",
    value: formatDuration(avgSessionDuration),
    subValue: `Across ${totalEntries} session${totalEntries !== 1 ? 's' : ''}`,
    type: "purple"
  });

  return insights;
}
