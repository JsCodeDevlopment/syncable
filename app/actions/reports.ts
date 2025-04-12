"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

export type ReportData = {
  entries: {
    id: number
    date: string
    startTime: string
    endTime: string | null
    duration: number
    breaks: number
    netWork: number
  }[]
  summary: {
    totalDuration: number
    totalBreaks: number
    totalNetWork: number
    averageDailyWork: number
    daysWorked: number
  }
}

export type SharedReport = {
  id: number
  user_id: number
  share_token: string
  report_type: "daily" | "weekly" | "monthly"
  start_date: Date
  end_date: Date
  expires_at: Date | null
  created_at: Date
  updated_at: Date
}

// Generate a report for a specific date range
export async function generateReport(
  userId: number,
  startDate: Date,
  endDate: Date,
  reportType: string,
): Promise<{ success: boolean; data?: ReportData; error?: string }> {
  try {
    // Get time entries in the date range
    const entriesResult = await sql`
      SELECT 
        te.id, 
        te.start_time, 
        te.end_time,
        EXTRACT(EPOCH FROM (COALESCE(te.end_time, CURRENT_TIMESTAMP) - te.start_time)) * 1000 AS duration,
        COALESCE(
          (SELECT SUM(EXTRACT(EPOCH FROM (COALESCE(b.end_time, CURRENT_TIMESTAMP) - b.start_time)) * 1000)
           FROM breaks b
           WHERE b.time_entry_id = te.id),
          0
        ) AS break_time
      FROM time_entries te
      WHERE 
        te.user_id = ${userId} AND 
        te.status = 'completed' AND
        te.start_time >= ${startDate} AND 
        te.start_time <= ${endDate}
      ORDER BY te.start_time DESC
    `

    // Format the entries
    const entries = entriesResult.map((entry) => {
      const startTime = new Date(entry.start_time)
      const endTime = entry.end_time ? new Date(entry.end_time) : null
      const duration = Number.parseFloat(entry.duration)
      const breaks = Number.parseFloat(entry.break_time)
      const netWork = duration - breaks

      return {
        id: entry.id,
        date: startTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        startTime: startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
        endTime: endTime
          ? endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
          : null,
        duration,
        breaks,
        netWork,
      }
    })

    // Calculate summary
    const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0)
    const totalBreaks = entries.reduce((sum, entry) => sum + entry.breaks, 0)
    const totalNetWork = totalDuration - totalBreaks
    const daysWorked = new Set(entries.map((entry) => entry.date)).size
    const averageDailyWork = daysWorked > 0 ? totalNetWork / daysWorked : 0

    return {
      success: true,
      data: {
        entries,
        summary: {
          totalDuration,
          totalBreaks,
          totalNetWork,
          averageDailyWork,
          daysWorked,
        },
      },
    }
  } catch (error) {
    console.error("Error generating report:", error)
    return { success: false, error: "Failed to generate report" }
  }
}

// Create a shared report
export async function createSharedReport(
  userId: number,
  reportType: "daily" | "weekly" | "monthly",
  startDate: Date,
  endDate: Date,
  expiresInDays: number,
): Promise<{ success: boolean; data?: SharedReport; error?: string }> {
  try {
    // Generate a unique token
    const shareToken = crypto.randomBytes(8).toString("hex")

    // Calculate expiration date
    const expiresAt = expiresInDays > 0 ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null

    const result = await sql`
      INSERT INTO shared_reports (
        user_id, 
        share_token, 
        report_type, 
        start_date, 
        end_date, 
        expires_at
      )
      VALUES (
        ${userId}, 
        ${shareToken}, 
        ${reportType}, 
        ${startDate}, 
        ${endDate}, 
        ${expiresAt}
      )
      RETURNING *
    `

    return { success: true, data: result[0] as SharedReport }
  } catch (error) {
    console.error("Error creating shared report:", error)
    return { success: false, error: "Failed to create shared report" }
  }
}

// Get a shared report by token
export async function getSharedReport(
  shareToken: string,
): Promise<{ success: boolean; data?: { report: SharedReport; reportData: ReportData }; error?: string }> {
  try {
    // Get the shared report
    const reportResult = await sql`
      SELECT *
      FROM shared_reports
      WHERE share_token = ${shareToken}
    `

    if (reportResult.length === 0) {
      return { success: false, error: "Shared report not found" }
    }

    const report = reportResult[0] as SharedReport

    // Check if the report has expired
    if (report.expires_at && new Date(report.expires_at) < new Date()) {
      return { success: false, error: "Shared report has expired" }
    }

    // Generate the report data
    const reportDataResult = await generateReport(
      report.user_id,
      new Date(report.start_date),
      new Date(report.end_date),
      report.report_type,
    )

    if (!reportDataResult.success) {
      return { success: false, error: reportDataResult.error }
    }

    return {
      success: true,
      data: {
        report,
        reportData: reportDataResult.data!,
      },
    }
  } catch (error) {
    console.error("Error getting shared report:", error)
    return { success: false, error: "Failed to get shared report" }
  }
}

// Get all shared reports for a user
export async function getUserSharedReports(
  userId: number,
): Promise<{ success: boolean; data?: SharedReport[]; error?: string }> {
  try {
    const result = await sql`
      SELECT *
      FROM shared_reports
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    return { success: true, data: result as SharedReport[] }
  } catch (error) {
    console.error("Error getting user shared reports:", error)
    return { success: false, error: "Failed to get user shared reports" }
  }
}

// Delete a shared report
export async function deleteSharedReport(
  reportId: number,
  userId: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify the report belongs to the user
    const verifyResult = await sql`
      SELECT id FROM shared_reports
      WHERE id = ${reportId} AND user_id = ${userId}
    `

    if (verifyResult.length === 0) {
      return { success: false, error: "Shared report not found or access denied" }
    }

    await sql`
      DELETE FROM shared_reports
      WHERE id = ${reportId}
    `

    revalidatePath("/reports")
    return { success: true }
  } catch (error) {
    console.error("Error deleting shared report:", error)
    return { success: false, error: "Failed to delete shared report" }
  }
}
