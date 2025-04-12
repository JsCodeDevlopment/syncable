"use server"

import { sql } from "@/lib/db"

export type SummaryData = {
  today: {
    duration: number
    breakTime: number
    netDuration: number
    percentChange: number
    breakCount: number
  }
  week: {
    duration: number
    breakTime: number
    netDuration: number
    percentChange: number
  }
  month: {
    duration: number
    breakTime: number
    netDuration: number
    percentChange: number
  }
  todayBreaks: {
    totalTime: number
    count: number
  }
}

export async function getDashboardSummary(
  userId: number,
): Promise<{ success: boolean; data?: SummaryData; error?: string }> {
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
    const todayResult = await sql`
      SELECT 
        COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(te.end_time, CURRENT_TIMESTAMP) - te.start_time)) * 1000), 0)::float AS total_duration,
        COALESCE(SUM(
          COALESCE(
            (SELECT SUM(EXTRACT(EPOCH FROM (COALESCE(b.end_time, CURRENT_TIMESTAMP) - b.start_time)) * 1000)
             FROM breaks b
             WHERE b.time_entry_id = te.id),
            0
          )
        ), 0)::float AS total_break_time,
        COUNT(DISTINCT b.id) AS break_count
      FROM time_entries te
      LEFT JOIN breaks b ON te.id = b.time_entry_id
      WHERE 
        te.user_id = ${userId} AND 
        te.start_time >= ${startOfToday} AND 
        te.start_time < ${endOfToday}
    `

    // Yesterday's data
    const yesterdayResult = await sql`
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
    `

    // This week's data
    const weekResult = await sql`
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
    `

    // Last week's data
    const lastWeekResult = await sql`
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
    `

    // This month's data
    const monthResult = await sql`
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
    `

    // Last month's data
    const lastMonthResult = await sql`
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
    `

    // Calculate percent changes
    const todayDuration = todayResult[0].total_duration
    const todayBreakTime = todayResult[0].total_break_time
    const todayNetDuration = todayDuration - todayBreakTime

    const yesterdayDuration = yesterdayResult[0].total_duration
    const yesterdayBreakTime = yesterdayResult[0].total_break_time
    const yesterdayNetDuration = yesterdayDuration - yesterdayBreakTime

    const weekDuration = weekResult[0].total_duration
    const weekBreakTime = weekResult[0].total_break_time
    const weekNetDuration = weekDuration - weekBreakTime

    const lastWeekDuration = lastWeekResult[0].total_duration
    const lastWeekBreakTime = lastWeekResult[0].total_break_time
    const lastWeekNetDuration = lastWeekDuration - lastWeekBreakTime

    const monthDuration = monthResult[0].total_duration
    const monthBreakTime = monthResult[0].total_break_time
    const monthNetDuration = monthDuration - monthBreakTime

    const lastMonthDuration = lastMonthResult[0].total_duration
    const lastMonthBreakTime = lastMonthResult[0].total_break_time
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
          breakCount: Number.parseInt(todayResult[0].break_count) || 0,
        },
        week: {
          duration: weekDuration,
          breakTime: weekBreakTime,
          netDuration: weekNetDuration,
          percentChange: weekPercentChange,
        },
        month: {
          duration: monthDuration,
          breakTime: monthBreakTime,
          netDuration: monthNetDuration,
          percentChange: monthPercentChange,
        },
        todayBreaks: {
          totalTime: todayBreakTime,
          count: Number.parseInt(todayResult[0].break_count) || 0,
        },
      },
    }
  } catch (error) {
    console.error("Error getting dashboard summary:", error)
    return { success: false, error: "Failed to get dashboard summary" }
  }
}
