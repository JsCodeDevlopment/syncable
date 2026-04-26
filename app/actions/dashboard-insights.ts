"use server";

import { sql } from "@/lib/db";
import { formatDateForDisplay } from "@/lib/db";
import { requireAuth } from "./auth";

export type DashboardInsight = {
  mostWorkedDay: { date: string; duration: number } | null;
  mostBreaksDay: { date: string; duration: number } | null;
  avgDailyWork: number;
  totalDaysWorked: number;
  weeklyChartData: { day: string; hours: number }[];
};

export async function getDashboardInsights() {
  const user = await requireAuth();
  const userId = user.id;
  try {
    // Get last 30 days of completed time entries
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = (await sql`
      SELECT 
        DATE(te.start_time) as entry_date,
        SUM(EXTRACT(EPOCH FROM (COALESCE(te.end_time, CURRENT_TIMESTAMP) - te.start_time)) * 1000) AS total_duration,
        SUM(
          COALESCE(
            (SELECT SUM(EXTRACT(EPOCH FROM (COALESCE(b.end_time, CURRENT_TIMESTAMP) - b.start_time)) * 1000)
             FROM breaks b
             WHERE b.time_entry_id = te.id),
            0
          )
        ) AS total_breaks
      FROM time_entries te
      WHERE 
        te.user_id = ${userId} AND 
        te.status IN ('completed', 'active') AND
        te.start_time >= ${thirtyDaysAgo}
      GROUP BY DATE(te.start_time)
      ORDER BY entry_date DESC
    `) as any[];

    if (result.length === 0) return { success: true, data: null };

    let mostWorked = result[0];
    let mostBreaks = result[0];
    let totalWork = 0;

    result.forEach(day => {
      const netWork = day.total_duration - day.total_breaks;
      const currentMaxNetWork = mostWorked.total_duration - mostWorked.total_breaks;
      
      if (netWork > currentMaxNetWork) {
        mostWorked = day;
      }
      
      if (day.total_breaks > mostBreaks.total_breaks) {
        mostBreaks = day;
      }
      
      totalWork += netWork;
    });

    return {
      success: true,
      data: {
        mostWorkedDay: {
          date: formatDateForDisplay(new Date(mostWorked.entry_date)),
          duration: mostWorked.total_duration - mostWorked.total_breaks
        },
        mostBreaksDay: {
          date: formatDateForDisplay(new Date(mostBreaks.entry_date)),
          duration: mostBreaks.total_breaks
        },
        avgDailyWork: totalWork / result.length,
        totalDaysWorked: result.length,
        weeklyChartData: Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dateStr = date.toISOString().split('T')[0];
          const dayData = result.find(d => {
            const dStr = new Date(d.entry_date).toISOString().split('T')[0];
            return dStr === dateStr;
          });
          return {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            hours: dayData ? Math.round(((dayData.total_duration - dayData.total_breaks) / 3600000) * 10) / 10 : 0
          };
        })
      }
    };
  } catch (error) {
    console.error("Error getting dashboard insights:", error);
    return { success: false, error: "Failed to get insights" };
  }
}
