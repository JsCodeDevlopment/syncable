"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

// Types
export type TimeEntry = {
  id: number
  user_id: number
  start_time: Date
  end_time: Date | null
  status: "active" | "completed" | "deleted"
  created_at: Date
  updated_at: Date
}

export type Break = {
  id: number
  time_entry_id: number
  start_time: Date
  end_time: Date | null
  created_at: Date
  updated_at: Date
}

// Start a new time entry
export async function startTimeEntry(userId: number) {
  try {
    const result = await sql`
      INSERT INTO time_entries (user_id, start_time, status)
      VALUES (${userId}, NOW(), 'active')
      RETURNING id, user_id, start_time, end_time, status, created_at, updated_at
    `

    revalidatePath("/dashboard")
    return { success: true, data: result[0] as TimeEntry }
  } catch (error) {
    console.error("Error starting time entry:", error)
    return { success: false, error: "Failed to start time entry" }
  }
}

// End a time entry
export async function endTimeEntry(timeEntryId: number) {
  try {
    // First, end any active breaks for this time entry
    await sql`
      UPDATE breaks
      SET end_time = NOW(), updated_at = NOW()
      WHERE time_entry_id = ${timeEntryId} AND end_time IS NULL
    `

    // Then end the time entry
    const result = await sql`
      UPDATE time_entries
      SET end_time = NOW(), status = 'completed', updated_at = NOW()
      WHERE id = ${timeEntryId} AND end_time IS NULL
      RETURNING id, user_id, start_time, end_time, status, created_at, updated_at
    `

    revalidatePath("/dashboard")
    return { success: true, data: result[0] as TimeEntry }
  } catch (error) {
    console.error("Error ending time entry:", error)
    return { success: false, error: "Failed to end time entry" }
  }
}

// Start a break
export async function startBreak(timeEntryId: number) {
  try {
    const result = await sql`
      INSERT INTO breaks (time_entry_id, start_time)
      VALUES (${timeEntryId}, NOW())
      RETURNING id, time_entry_id, start_time, end_time, created_at, updated_at
    `

    revalidatePath("/dashboard")
    return { success: true, data: result[0] as Break }
  } catch (error) {
    console.error("Error starting break:", error)
    return { success: false, error: "Failed to start break" }
  }
}

// End a break
export async function endBreak(breakId: number) {
  try {
    const result = await sql`
      UPDATE breaks
      SET end_time = NOW(), updated_at = NOW()
      WHERE id = ${breakId} AND end_time IS NULL
      RETURNING id, time_entry_id, start_time, end_time, created_at, updated_at
    `

    revalidatePath("/dashboard")
    return { success: true, data: result[0] as Break }
  } catch (error) {
    console.error("Error ending break:", error)
    return { success: false, error: "Failed to end break" }
  }
}

// Get active time entry for a user
export async function getActiveTimeEntry(userId: number) {
  try {
    const timeEntries = await sql`
      SELECT id, user_id, start_time, end_time, status, created_at, updated_at
      FROM time_entries
      WHERE user_id = ${userId} AND status = 'active' AND end_time IS NULL
      ORDER BY start_time DESC
      LIMIT 1
    `

    if (timeEntries.length === 0) {
      return { success: true, data: null }
    }

    const timeEntry = timeEntries[0] as TimeEntry

    // Get active break if any
    const breaks = await sql`
      SELECT id, time_entry_id, start_time, end_time, created_at, updated_at
      FROM breaks
      WHERE time_entry_id = ${timeEntry.id} AND end_time IS NULL
      ORDER BY start_time DESC
      LIMIT 1
    `

    const activeBreak = breaks.length > 0 ? (breaks[0] as Break) : null

    return {
      success: true,
      data: {
        timeEntry,
        activeBreak,
      },
    }
  } catch (error) {
    console.error("Error getting active time entry:", error)
    return { success: false, error: "Failed to get active time entry" }
  }
}

// Get recent time entries for a user
export async function getRecentTimeEntries(userId: number, limit = 5) {
  try {
    const timeEntries = await sql`
      SELECT 
        te.id, 
        te.user_id, 
        te.start_time, 
        te.end_time, 
        te.status, 
        te.created_at, 
        te.updated_at,
        COALESCE(
          SUM(
            EXTRACT(EPOCH FROM (
              COALESCE(b.end_time, CURRENT_TIMESTAMP) - b.start_time
            )) * 1000
          ), 
          0
        )::float AS total_break_time
      FROM time_entries te
      LEFT JOIN breaks b ON te.id = b.time_entry_id
      WHERE te.user_id = ${userId} AND te.status = 'completed'
      GROUP BY te.id
      ORDER BY te.start_time DESC
      LIMIT ${limit}
    `

    // For each time entry, fetch its breaks
    const entriesWithBreaks = await Promise.all(
      timeEntries.map(async (entry) => {
        const breaks = await sql`
          SELECT id, time_entry_id, start_time, end_time, created_at, updated_at
          FROM breaks
          WHERE time_entry_id = ${entry.id}
          ORDER BY start_time
        `
        return { ...entry, breaks }
      }),
    )

    return { success: true, data: entriesWithBreaks }
  } catch (error) {
    console.error("Error getting recent time entries:", error)
    return { success: false, error: "Failed to get recent time entries" }
  }
}

// Get time entries for a specific date range
export async function getTimeEntriesInRange(userId: number, startDate: Date, endDate: Date) {
  try {
    const timeEntries = await sql`
      SELECT 
        te.id, 
        te.user_id, 
        te.start_time, 
        te.end_time, 
        te.status, 
        te.created_at, 
        te.updated_at,
        COALESCE(
          SUM(
            EXTRACT(EPOCH FROM (
              COALESCE(b.end_time, CURRENT_TIMESTAMP) - b.start_time
            )) * 1000
          ), 
          0
        )::float AS total_break_time
      FROM time_entries te
      LEFT JOIN breaks b ON te.id = b.time_entry_id
      WHERE 
        te.user_id = ${userId} AND 
        te.status = 'completed' AND
        te.start_time >= ${startDate} AND 
        te.start_time <= ${endDate}
      GROUP BY te.id
      ORDER BY te.start_time DESC
    `

    return { success: true, data: timeEntries }
  } catch (error) {
    console.error("Error getting time entries in range:", error)
    return { success: false, error: "Failed to get time entries in range" }
  }
}

// Get daily stats for a user
export async function getDailyStats(userId: number, date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  try {
    const result = await sql`
      WITH hourly_data AS (
        SELECT 
          EXTRACT(HOUR FROM te.start_time) AS hour,
          EXTRACT(EPOCH FROM (
            LEAST(
              COALESCE(te.end_time, CURRENT_TIMESTAMP),
              te.start_time + INTERVAL '1 hour' * (EXTRACT(HOUR FROM te.start_time) + 1) - INTERVAL '1 second'
            ) - 
            GREATEST(
              te.start_time,
              te.start_time + INTERVAL '1 hour' * EXTRACT(HOUR FROM te.start_time)
            )
          )) * 1000 AS work_ms,
          COALESCE(
            SUM(
              CASE WHEN b.id IS NOT NULL THEN
                EXTRACT(EPOCH FROM (
                  LEAST(
                    COALESCE(b.end_time, CURRENT_TIMESTAMP),
                    b.start_time + INTERVAL '1 hour' * (EXTRACT(HOUR FROM b.start_time) + 1) - INTERVAL '1 second'
                  ) - 
                  GREATEST(
                    b.start_time,
                    b.start_time + INTERVAL '1 hour' * EXTRACT(HOUR FROM b.start_time)
                  )
                )) * 1000
              ELSE 0
              END
            ),
            0
          ) AS break_ms
        FROM time_entries te
        LEFT JOIN breaks b ON te.id = b.time_entry_id
        WHERE 
          te.user_id = ${userId} AND 
          te.start_time >= ${startOfDay} AND 
          te.start_time <= ${endOfDay}
        GROUP BY hour, te.id, te.start_time, te.end_time
      )
      SELECT 
        hour,
        SUM(work_ms - break_ms) / 60000 AS work,
        SUM(break_ms) / 60000 AS break
      FROM hourly_data
      GROUP BY hour
      ORDER BY hour
    `

    // Format the data for the chart
    const formattedData = Array.from({ length: 24 }, (_, i) => {
      const hourData = result.find((r) => r.hour === i)
      return {
        hour: `${i % 12 === 0 ? 12 : i % 12} ${i < 12 ? "AM" : "PM"}`,
        work: hourData ? Math.round(hourData.work) : 0,
        break: hourData ? Math.round(hourData.break) : 0,
      }
    })

    return { success: true, data: formattedData }
  } catch (error) {
    console.error("Error getting daily stats:", error)
    return { success: false, error: "Failed to get daily stats" }
  }
}

// Get weekly stats for a user
export async function getWeeklyStats(userId: number, date: Date) {
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - date.getDay()) // Start from Sunday
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6) // End on Saturday
  endOfWeek.setHours(23, 59, 59, 999)

  try {
    const result = await sql`
      WITH daily_data AS (
        SELECT 
          EXTRACT(DOW FROM te.start_time) AS day_of_week,
          EXTRACT(EPOCH FROM (COALESCE(te.end_time, CURRENT_TIMESTAMP) - te.start_time)) / 3600 AS work_hours,
          COALESCE(
            SUM(
              EXTRACT(EPOCH FROM (COALESCE(b.end_time, CURRENT_TIMESTAMP) - b.start_time)) / 3600
            ),
            0
          ) AS break_hours
        FROM time_entries te
        LEFT JOIN breaks b ON te.id = b.time_entry_id
        WHERE 
          te.user_id = ${userId} AND 
          te.start_time >= ${startOfWeek} AND 
          te.start_time <= ${endOfWeek}
        GROUP BY day_of_week, te.id, te.start_time, te.end_time
      )
      SELECT 
        day_of_week,
        SUM(work_hours - break_hours) AS work,
        SUM(break_hours) AS break
      FROM daily_data
      GROUP BY day_of_week
      ORDER BY day_of_week
    `

    // Format the data for the chart
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const formattedData = dayNames.map((day, index) => {
      const dayData = result.find((r) => r.day_of_week === index)
      return {
        day,
        work: dayData ? Number.parseFloat(dayData.work.toFixed(1)) : 0,
        break: dayData ? Number.parseFloat(dayData.break.toFixed(1)) : 0,
      }
    })

    return { success: true, data: formattedData }
  } catch (error) {
    console.error("Error getting weekly stats:", error)
    return { success: false, error: "Failed to get weekly stats" }
  }
}

// Get monthly stats for a user
export async function getMonthlyStats(userId: number, date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const startOfMonth = new Date(year, month, 1)
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999)

  try {
    const result = await sql`
      WITH weekly_data AS (
        SELECT 
          FLOOR((EXTRACT(DAY FROM te.start_time) - 1) / 7) + 1 AS week_of_month,
          EXTRACT(EPOCH FROM (COALESCE(te.end_time, CURRENT_TIMESTAMP) - te.start_time)) / 3600 AS work_hours,
          COALESCE(
            SUM(
              EXTRACT(EPOCH FROM (COALESCE(b.end_time, CURRENT_TIMESTAMP) - b.start_time)) / 3600
            ),
            0
          ) AS break_hours
        FROM time_entries te
        LEFT JOIN breaks b ON te.id = b.time_entry_id
        WHERE 
          te.user_id = ${userId} AND 
          te.start_time >= ${startOfMonth} AND 
          te.start_time <= ${endOfMonth}
        GROUP BY week_of_month, te.id, te.start_time, te.end_time
      )
      SELECT 
        week_of_month,
        SUM(work_hours - break_hours) AS work,
        SUM(break_hours) AS break
      FROM weekly_data
      GROUP BY week_of_month
      ORDER BY week_of_month
    `

    // Format the data for the chart
    const formattedData = Array.from({ length: 5 }, (_, i) => {
      const weekData = result.find((r) => r.week_of_month === i + 1)
      return {
        week: `Week ${i + 1}`,
        work: weekData ? Number.parseFloat(weekData.work.toFixed(1)) : 0,
        break: weekData ? Number.parseFloat(weekData.break.toFixed(1)) : 0,
      }
    }).filter((week) => week.work > 0 || week.break > 0) // Remove empty weeks

    return { success: true, data: formattedData }
  } catch (error) {
    console.error("Error getting monthly stats:", error)
    return { success: false, error: "Failed to get monthly stats" }
  }
}
