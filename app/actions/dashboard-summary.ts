"use server"

import { sql } from "@/lib/db"
import { requireAuth } from "./auth"

export type SummaryData = {
  today: {
    duration: number
    breakTime: number
    netDuration: number
    percentChange: number
    breakCount: number
    earnings: number
    currency: string
  }
  week: {
    duration: number
    breakTime: number
    netDuration: number
    percentChange: number
    earnings: number
  }
  month: {
    duration: number
    breakTime: number
    netDuration: number
    percentChange: number
    earnings: number
  }
  todayBreaks: {
    totalTime: number
    count: number
  }
  projectsDistribution: {
    name: string
    color: string
    workDuration: number
    breakDuration: number
    totalDuration: number
    percentage: number
  }[]
}

export async function getDashboardSummary(): Promise<{ success: boolean; data?: SummaryData; error?: string }> {
  const user = await requireAuth()
  const userId = user.id

  try {
    // Get today's data
    const today = new Date()
    const startOfToday = new Date(today)
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date(today)
    endOfToday.setHours(23, 59, 59, 999)

    // Get yesterday's data for comparison
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const startOfYesterday = new Date(yesterday)
    startOfYesterday.setHours(0, 0, 0, 0)
    const endOfYesterday = new Date(yesterday)
    endOfYesterday.setHours(23, 59, 59, 999)

    // Get start of week
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0)

    // Get start of last week
    const startOfLastWeek = new Date(startOfWeek)
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)
    const endOfLastWeek = new Date(startOfWeek)
    endOfLastWeek.setMilliseconds(-1)

    // Get start of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Get start of last month
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    startOfLastMonth.setHours(0, 0, 0, 0)
    const endOfLastMonth = new Date(startOfMonth)
    endOfLastMonth.setMilliseconds(-1)

    // Today's data
    const todayResult = (await sql`
      WITH te_filtered AS (
          SELECT 
              id,
              EXTRACT(EPOCH FROM (COALESCE(end_time, CURRENT_TIMESTAMP) - start_time)) * 1000 AS duration,
              project_id
          FROM time_entries
          WHERE user_id = ${userId}
            AND start_time >= ${startOfToday}
            AND start_time <= ${endOfToday}
      ),
      break_stats AS (
          SELECT 
              time_entry_id,
              COUNT(*) AS cnt,
              SUM(EXTRACT(EPOCH FROM (COALESCE(end_time, CURRENT_TIMESTAMP) - start_time)) * 1000) AS break_duration
          FROM breaks
          WHERE time_entry_id IN (SELECT id FROM te_filtered)
          GROUP BY time_entry_id
      )
      SELECT 
          COALESCE(SUM(te.duration), 0)::FLOAT AS total_duration,
          COALESCE(SUM(bs.break_duration), 0)::FLOAT AS total_break_time,
          COALESCE(SUM(bs.cnt), 0)::INT AS break_count,
          COALESCE(SUM(
            (te.duration - COALESCE(bs.break_duration, 0)) / 3600000.0 * COALESCE(p.hourly_rate, us.hourly_rate, 0)
          ), 0)::FLOAT AS total_earnings,
          COALESCE(us.currency, 'BRL') as currency
      FROM users u
      LEFT JOIN user_settings us ON us.user_id = u.id
      LEFT JOIN te_filtered te ON 1=1
      LEFT JOIN projects p ON te.project_id = p.id
      LEFT JOIN break_stats bs ON te.id = bs.time_entry_id
      WHERE u.id = ${userId}
      GROUP BY u.id, us.currency;
    `) as { total_duration: number; total_break_time: number; break_count: number; total_earnings: number; currency: string }[]

    // Get project distribution for current month (Work vs Breaks)
    const projectDistResult = (await sql`
      WITH te_month AS (
        SELECT id, project_id,
          EXTRACT(EPOCH FROM (COALESCE(end_time, CURRENT_TIMESTAMP) - start_time)) * 1000 as wall_duration
        FROM time_entries
        WHERE user_id = ${userId} AND start_time >= ${startOfMonth}
      ),
      br_month AS (
        SELECT time_entry_id,
          SUM(EXTRACT(EPOCH FROM (COALESCE(end_time, CURRENT_TIMESTAMP) - start_time)) * 1000) as break_duration
        FROM breaks
        WHERE time_entry_id IN (SELECT id FROM te_month)
        GROUP BY time_entry_id
      )
      SELECT 
        COALESCE(p.name, 'No Project') as name,
        COALESCE(p.color, '#94a3b8') as color,
        SUM(tem.wall_duration)::FLOAT as total_duration,
        SUM(COALESCE(bm.break_duration, 0))::FLOAT as break_duration
      FROM te_month tem
      LEFT JOIN br_month bm ON tem.id = bm.time_entry_id
      LEFT JOIN projects p ON tem.project_id = p.id
      GROUP BY p.name, p.color
      ORDER BY total_duration DESC
    `) as { name: string; color: string; total_duration: number; break_duration: number }[]

    const totalMonthDuration = projectDistResult.reduce((acc, curr) => acc + curr.total_duration, 0)
    const projectsDistribution = projectDistResult.map(p => ({
      name: p.name,
      color: p.color,
      totalDuration: p.total_duration,
      breakDuration: p.break_duration,
      workDuration: p.total_duration - p.break_duration,
      percentage: totalMonthDuration > 0 ? Math.round((p.total_duration / totalMonthDuration) * 100) : 0
    }))

    // Yesterday's data
    const yesterdayResult = (await sql`
      SELECT 
        COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(te.end_time, CURRENT_TIMESTAMP) - te.start_time)) * 1000), 0)::float AS total_duration,
        COALESCE(SUM(
          COALESCE(
            (SELECT SUM(EXTRACT(EPOCH FROM (COALESCE(b.end_time, CURRENT_TIMESTAMP) - b.start_time)) * 1000)
             FROM breaks b
             WHERE b.time_entry_id = te.id),
            0
          )
        ), 0)::float AS total_break_time
      FROM time_entries te
      WHERE 
        te.user_id = ${userId} AND 
        te.start_time >= ${startOfYesterday} AND 
        te.start_time < ${endOfYesterday}
    `) as { total_duration: number; total_break_time: number }[]

    // This week's data
    const weekResult = (await sql`
      SELECT 
        COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(te.end_time, CURRENT_TIMESTAMP) - te.start_time)) * 1000), 0)::float AS total_duration,
        COALESCE(SUM(
          COALESCE(
            (SELECT SUM(EXTRACT(EPOCH FROM (COALESCE(b.end_time, CURRENT_TIMESTAMP) - b.start_time)) * 1000)
             FROM breaks b
             WHERE b.time_entry_id = te.id),
            0
          )
        ), 0)::float AS total_break_time
      FROM time_entries te
      WHERE 
        te.user_id = ${userId} AND 
        te.start_time >= ${startOfWeek} AND 
        te.start_time <= ${endOfToday}
    `) as { total_duration: number; total_break_time: number }[]

    // Last week's data
    const lastWeekResult = (await sql`
      SELECT 
        COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(te.end_time, CURRENT_TIMESTAMP) - te.start_time)) * 1000), 0)::float AS total_duration,
        COALESCE(SUM(
          COALESCE(
            (SELECT SUM(EXTRACT(EPOCH FROM (COALESCE(b.end_time, CURRENT_TIMESTAMP) - b.start_time)) * 1000)
             FROM breaks b
             WHERE b.time_entry_id = te.id),
            0
          )
        ), 0)::float AS total_break_time
      FROM time_entries te
      WHERE 
        te.user_id = ${userId} AND 
        te.start_time >= ${startOfLastWeek} AND 
        te.start_time < ${endOfLastWeek}
    `) as { total_duration: number; total_break_time: number }[]

    // This month's data
    const monthResult = (await sql`
      SELECT 
        COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(te.end_time, CURRENT_TIMESTAMP) - te.start_time)) * 1000), 0)::float AS total_duration,
        COALESCE(SUM(
          COALESCE(
            (SELECT SUM(EXTRACT(EPOCH FROM (COALESCE(b.end_time, CURRENT_TIMESTAMP) - b.start_time)) * 1000)
             FROM breaks b
             WHERE b.time_entry_id = te.id),
            0
          )
        ), 0)::float AS total_break_time
      FROM time_entries te
      WHERE 
        te.user_id = ${userId} AND 
        te.start_time >= ${startOfMonth} AND 
        te.start_time <= ${endOfToday}
    `) as { total_duration: number; total_break_time: number }[]

    // Last month's data
    const lastMonthResult = (await sql`
      SELECT 
        COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(te.end_time, CURRENT_TIMESTAMP) - te.start_time)) * 1000), 0)::float AS total_duration,
        COALESCE(SUM(
          COALESCE(
            (SELECT SUM(EXTRACT(EPOCH FROM (COALESCE(b.end_time, CURRENT_TIMESTAMP) - b.start_time)) * 1000)
             FROM breaks b
             WHERE b.time_entry_id = te.id),
            0
          )
        ), 0)::float AS total_break_time
      FROM time_entries te
      WHERE 
        te.user_id = ${userId} AND 
        te.start_time >= ${startOfLastMonth} AND 
        te.start_time < ${endOfLastMonth}
    `) as { total_duration: number; total_break_time: number }[]

    // Financial data for Week and Month
    const financialResult = (await sql`
      SELECT 
        SUM(CASE WHEN te.start_time >= ${startOfWeek} THEN (EXTRACT(EPOCH FROM (COALESCE(te.end_time, CURRENT_TIMESTAMP) - te.start_time)) * 1000 - COALESCE((SELECT SUM(EXTRACT(EPOCH FROM (COALESCE(b.end_time, CURRENT_TIMESTAMP) - b.start_time)) * 1000) FROM breaks b WHERE b.time_entry_id = te.id), 0)) / 3600000.0 * COALESCE(p.hourly_rate, us.hourly_rate, 0) ELSE 0 END) as week_earnings,
        SUM(CASE WHEN te.start_time >= ${startOfMonth} THEN (EXTRACT(EPOCH FROM (COALESCE(te.end_time, CURRENT_TIMESTAMP) - te.start_time)) * 1000 - COALESCE((SELECT SUM(EXTRACT(EPOCH FROM (COALESCE(b.end_time, CURRENT_TIMESTAMP) - b.start_time)) * 1000) FROM breaks b WHERE b.time_entry_id = te.id), 0)) / 3600000.0 * COALESCE(p.hourly_rate, us.hourly_rate, 0) ELSE 0 END) as month_earnings
      FROM time_entries te
      CROSS JOIN users u
      LEFT JOIN user_settings us ON us.user_id = u.id
      LEFT JOIN projects p ON te.project_id = p.id
      WHERE te.user_id = ${userId} AND u.id = ${userId}
        AND te.start_time >= ${startOfMonth}
    `) as { week_earnings: number; month_earnings: number }[]

    const weekEarnings = financialResult[0]?.week_earnings || 0
    const monthEarnings = financialResult[0]?.month_earnings || 0

    // Calculate percent changes
    const todayDuration = todayResult[0]?.total_duration || 0
    const todayBreakTime = todayResult[0]?.total_break_time || 0
    const todayNetDuration = todayDuration - todayBreakTime

    const yesterdayDuration = yesterdayResult[0]?.total_duration || 0
    const yesterdayBreakTime = yesterdayResult[0]?.total_break_time || 0
    const yesterdayNetDuration = yesterdayDuration - yesterdayBreakTime

    const weekDuration = weekResult[0]?.total_duration || 0
    const weekBreakTime = weekResult[0]?.total_break_time || 0
    const weekNetDuration = weekDuration - weekBreakTime

    const lastWeekDuration = lastWeekResult[0]?.total_duration || 0
    const lastWeekBreakTime = lastWeekResult[0]?.total_break_time || 0
    const lastWeekNetDuration = lastWeekDuration - lastWeekBreakTime

    const monthDuration = monthResult[0]?.total_duration || 0
    const monthBreakTime = monthResult[0]?.total_break_time || 0
    const monthNetDuration = monthDuration - monthBreakTime

    const lastMonthDuration = lastMonthResult[0]?.total_duration || 0
    const lastMonthBreakTime = lastMonthResult[0]?.total_break_time || 0
    const lastMonthNetDuration = lastMonthDuration - lastMonthBreakTime

    // Calculate percent changes
    const todayPercentChange =
      yesterdayNetDuration === 0
        ? 100
        : Math.round(((todayNetDuration - yesterdayNetDuration) / yesterdayNetDuration) * 100)

    const weekPercentChange =
      lastWeekNetDuration === 0
        ? 100
        : Math.round(((weekNetDuration - lastWeekNetDuration) / lastWeekNetDuration) * 100)

    const monthPercentChange =
      lastMonthNetDuration === 0
        ? 100
        : Math.round(((monthNetDuration - lastMonthNetDuration) / lastMonthNetDuration) * 100)

    return {
      success: true,
      data: {
        today: {
          duration: todayDuration,
          breakTime: todayBreakTime,
          netDuration: todayNetDuration,
          percentChange: todayPercentChange,
          breakCount: todayResult[0]?.break_count || 0,
          earnings: todayResult[0]?.total_earnings || 0,
          currency: todayResult[0]?.currency || 'BRL',
        },
        week: {
          duration: weekDuration,
          breakTime: weekBreakTime,
          netDuration: weekNetDuration,
          percentChange: weekPercentChange,
          earnings: weekEarnings,
        },
        month: {
          duration: monthDuration,
          breakTime: monthBreakTime,
          netDuration: monthNetDuration,
          percentChange: monthPercentChange,
          earnings: monthEarnings,
        },
        todayBreaks: {
          totalTime: todayBreakTime,
          count: todayResult[0]?.break_count || 0,
        },
        projectsDistribution,
      },
    }
  } catch (error) {
    console.error("Error getting dashboard summary:", error)
    return { success: false, error: "Failed to get dashboard summary" }
  }
}
