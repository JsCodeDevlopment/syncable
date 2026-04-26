"use server";

import { formatDateForDisplay, formatTimeForDisplay, sql } from "@/lib/db";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { getUserSettings } from "./user-settings";
import { requireAuth } from "./auth";

export type ReportData = {
  entries: {
    id: number;
    date: string;
    startTime: string;
    endTime: string | null;
    duration: number;
    breaks: number;
    netWork: number;
    observations?: string | null;
    project_id?: number | null;
    project_name?: string | null;
    project_color?: string | null;
  }[];
  summary: {
    totalDuration: number;
    totalBreaks: number;
    totalNetWork: number;
    averageDailyWork: number;
    daysWorked: number;
    totalPayable: number;
    hourlyRate: number | null;
    currency: string;
  };
};

export type SharedReport = {
  id: number;
  user_id: number;
  share_token: string;
  report_type: "daily" | "weekly" | "monthly";
  start_date: Date;
  end_date: Date;
  expires_at: Date | null;
  show_insights: boolean;
  report_name?: string | null;
  report_cpf_cnpj?: string | null;
  project_id?: number | null;
  created_at: Date;
  updated_at: Date;
};

// Internal helper to generate a report for a specific user
async function generateReportInternal(
  userId: number,
  startDate: Date,
  endDate: Date,
  reportType: string,
  projectId?: number | null
): Promise<{ success: boolean; data?: ReportData; error?: string }> {
  try {
    console.log(
      "Generating report for user:",
      userId,
      "from",
      startDate,
      "to",
      endDate,
      "type:",
      reportType
    );

    // Adjust the end date to include the entire day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    console.log("Adjusted date range:", {
      startDate: startDate.toISOString(),
      adjustedEndDate: adjustedEndDate.toISOString(),
    });

    // Get time entries in the date range
    const entriesResult = (await sql`
      SELECT 
        te.id, 
        te.start_time, 
        te.end_time,
        te.observations,
        te.project_id,
        p.name as project_name,
        p.color as project_color,
        COALESCE(p.hourly_rate, us.hourly_rate) as effective_rate,
        COALESCE(p.currency, us.currency) as effective_currency,
        EXTRACT(EPOCH FROM (COALESCE(te.end_time, CURRENT_TIMESTAMP) - te.start_time)) * 1000 AS duration,
        COALESCE(
          (SELECT SUM(EXTRACT(EPOCH FROM (COALESCE(b.end_time, CURRENT_TIMESTAMP) - b.start_time)) * 1000)
           FROM breaks b
           WHERE b.time_entry_id = te.id),
          0
        ) AS break_time
      FROM time_entries te
      LEFT JOIN projects p ON te.project_id = p.id
      JOIN user_settings us ON te.user_id = us.user_id
      WHERE 
        te.user_id = ${userId} AND 
        te.status = 'completed' AND
        te.start_time >= ${startDate} AND 
        te.start_time <= ${adjustedEndDate}
        ${projectId ? sql`AND te.project_id = ${projectId}` : sql``}
      ORDER BY te.start_time DESC
    `) as any;

    console.log("Found entries:", entriesResult.length);

    // Format the entries
    const entries = entriesResult.map((entry: any) => {
      const startTime = new Date(entry.start_time);
      const endTime = entry.end_time ? new Date(entry.end_time) : null;
      const duration = Number.parseFloat(entry.duration);
      const breaks = Number.parseFloat(entry.break_time);
      const netWork = duration - breaks;

      return {
        id: entry.id,
        date: formatDateForDisplay(startTime),
        startTime: formatTimeForDisplay(startTime),
        endTime: endTime ? formatTimeForDisplay(endTime) : null,
        duration,
        breaks,
        netWork,
        observations: entry.observations,
        project_id: entry.project_id,
        project_name: entry.project_name,
        project_color: entry.project_color,
        effective_rate: entry.effective_rate ? Number(entry.effective_rate) : null,
        effective_currency: entry.effective_currency || "BRL",
      };
    });

    // Calculate summary
    const totalDuration = entries.reduce(
      (sum: number, entry: { duration: number }) => sum + entry.duration,
      0
    );
    const totalBreaks = entries.reduce((sum: number, entry: { breaks: number }) => sum + entry.breaks, 0);
    const totalNetWork = totalDuration - totalBreaks;
    const daysWorked = new Set(entries.map((entry: { date: string }) => entry.date)).size;
    const averageDailyWork = daysWorked > 0 ? totalNetWork / daysWorked : 0;

    // Calculate total payable
    // We sum the payable for each entry individually because they might have different rates
    let totalPayable = 0;

    entries.forEach((entry: any) => {
      if (entry.effective_rate) {
        totalPayable += (entry.netWork / 3600000) * entry.effective_rate;
      }
    });

    // Determine the primary rate and currency for the summary
    const settingsResult = await getUserSettings(userId);
    let summaryHourlyRate = settingsResult.data?.hourly_rate || null;
    let summaryCurrency = settingsResult.data?.currency || "BRL";

    if (projectId) {
      const projectResult = (await sql`SELECT hourly_rate, currency FROM projects WHERE id = ${projectId} AND user_id = ${userId}`) as any[];
      if (projectResult.length > 0) {
        // If it's a project report, the project's rate and currency are the primary ones
        summaryHourlyRate = projectResult[0].hourly_rate !== null ? Number(projectResult[0].hourly_rate) : summaryHourlyRate;
        summaryCurrency = projectResult[0].currency || summaryCurrency;
      }
    }

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
          totalPayable,
          hourlyRate: summaryHourlyRate,
          currency: summaryCurrency,
        },
      },
    };
  } catch (error) {
    console.error("Error generating report:", error);
    return {
      success: false,
      error: "Failed to generate report. Database error.",
    };
  }
}

// Public action to generate a report for the current user
export async function generateReport(
  startDate: Date,
  endDate: Date,
  reportType: string,
  projectId?: number | null
) {
  const user = await requireAuth();
  return generateReportInternal(user.id, startDate, endDate, reportType, projectId);
}

// Create a shared report
export async function createSharedReport(
  reportType: "daily" | "weekly" | "monthly",
  startDate: Date,
  endDate: Date,
  expiresInDays: number,
  showInsights: boolean = true,
  reportName: string = "",
  reportCpfCnpj: string = "",
  projectId: number | null = null
): Promise<{ success: boolean; data?: SharedReport; error?: string }> {
  const user = await requireAuth();
  const userId = user.id;
  try {
    console.log(
      "Creating shared report for user:",
      userId,
      "type:",
      reportType,
      "expires in:",
      expiresInDays,
      "days",
      "show insights:",
      showInsights
    );

    // Generate a unique token
    const shareToken = crypto.randomBytes(8).toString("hex");

    // Calculate expiration date
    const expiresAt =
      expiresInDays > 0
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;

    // Check if the shared_reports table exists
    const tableCheck = (await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'shared_reports'
      );
    `) as any;

    const tableExists = tableCheck[0].exists;

    if (!tableExists) {
      console.log("Creating shared_reports table");
      // Create the table if it doesn't exist
      await sql`
        CREATE TABLE shared_reports (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          share_token TEXT NOT NULL UNIQUE,
          report_type TEXT NOT NULL,
          start_date TIMESTAMP WITH TIME ZONE NOT NULL,
          end_date TIMESTAMP WITH TIME ZONE NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE,
          show_insights BOOLEAN DEFAULT TRUE,
          report_name TEXT,
          report_cpf_cnpj TEXT,
          project_id INTEGER,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `;
    }

    // Attempt to add new columns if they don't exist (for existing tables)
    try {
      await sql`ALTER TABLE shared_reports ADD COLUMN IF NOT EXISTS show_insights BOOLEAN DEFAULT TRUE`;
      await sql`ALTER TABLE shared_reports ADD COLUMN IF NOT EXISTS report_name TEXT`;
      await sql`ALTER TABLE shared_reports ADD COLUMN IF NOT EXISTS report_cpf_cnpj TEXT`;
      await sql`ALTER TABLE shared_reports ADD COLUMN IF NOT EXISTS project_id INTEGER`;
    } catch (e) {
      console.log("Columns might already exist or table alteration failed:", e);
    }

    console.log("Schema check/update completed");

    const result = (await sql`
      INSERT INTO shared_reports (
        user_id, 
        share_token, 
        report_type, 
        start_date, 
        end_date, 
        expires_at,
        show_insights,
        report_name,
        report_cpf_cnpj,
        project_id
      )
      VALUES (
        ${userId}, 
        ${shareToken}, 
        ${reportType}, 
        ${startDate}, 
        ${endDate}, 
        ${expiresAt},
        ${showInsights},
        ${reportName},
        ${reportCpfCnpj},
        ${projectId}
      )
      RETURNING *
    `) as any[];

    console.log("Shared report created successfully:", result[0]);
    return { success: true, data: result[0] as SharedReport };
  } catch (error) {
    console.error("Critical error in createSharedReport:", error);
    return {
      success: false,
      error: "Failed to create shared report. Database error.",
    };
  }
}

// Get a shared report by token
export async function getSharedReport(
  shareToken: string
): Promise<{
  success: boolean;
  data?: { report: SharedReport; reportData: ReportData };
  error?: string;
}> {
  try {
    console.log("Getting shared report with token:", shareToken);

    // Check if the shared_reports table exists
    const tableCheck = (await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'shared_reports'
      );
    `) as any;

    const tableExists = tableCheck[0].exists;

    if (!tableExists) {
      console.log("shared_reports table does not exist");
      return { success: false, error: "Shared report not found" };
    }

    // Get the shared report
    const reportResult = (await sql`
      SELECT *
      FROM shared_reports
      WHERE share_token = ${shareToken}
    `) as any;

    if (reportResult.length === 0) {
      console.log("No shared report found with token:", shareToken);
      return { success: false, error: "Shared report not found" };
    }

    const report = reportResult[0] as SharedReport;
    console.log("Found shared report:", report);

    // Check if the report has expired
    if (report.expires_at && new Date(report.expires_at) < new Date()) {
      console.log("Shared report has expired");
      return { success: false, error: "Shared report has expired" };
    }

    // Generate the report data
    const reportDataResult = await generateReportInternal(
      report.user_id,
      new Date(report.start_date),
      new Date(report.end_date),
      report.report_type,
      report.project_id
    );

    if (!reportDataResult.success) {
      console.log("Failed to generate report data:", reportDataResult.error);
      return { success: false, error: reportDataResult.error };
    }

    console.log("Generated report data successfully");
    return {
      success: true,
      data: {
        report,
        reportData: reportDataResult.data!,
      },
    };
  } catch (error) {
    console.error("Error getting shared report:", error);
    return {
      success: false,
      error: "Failed to get shared report. Database error.",
    };
  }
}

// Get all shared reports for a user
export async function getUserSharedReports(): Promise<{ success: boolean; data?: SharedReport[]; error?: string }> {
  const user = await requireAuth();
  const userId = user.id;
  try {
    // Check if the shared_reports table exists
    const tableCheck = (await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'shared_reports'
      );
    `) as any;

    const tableExists = tableCheck[0].exists;

    if (!tableExists) {
      return { success: true, data: [] };
    }

    const result = (await sql`
      SELECT *
      FROM shared_reports
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `) as any[];

    console.log("User shared reports fetched:", result.length);
    return { success: true, data: result as SharedReport[] };
  } catch (error) {
    console.error("Error getting user shared reports:", error);
    return {
      success: false,
      error: "Failed to get user shared reports. Database error.",
    };
  }
}

// Delete a shared report
export async function deleteSharedReport(
  reportId: number
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const userId = user.id;
  try {
    // Verify the report belongs to the user
    const verifyResult = (await sql`
      SELECT id FROM shared_reports
      WHERE id = ${reportId} AND user_id = ${userId}
    `) as any;

    if (verifyResult.length === 0) {
      return {
        success: false,
        error: "Shared report not found or access denied",
      };
    }

    await sql`
      DELETE FROM shared_reports
      WHERE id = ${reportId}
    `;

    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("Error deleting shared report:", error);
    return {
      success: false,
      error: "Failed to delete shared report. Database error.",
    };
  }
}

// Delete multiple shared reports
export async function deleteSharedReports(
  reportIds: number[]
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const userId = user.id;
  try {
    if (reportIds.length === 0) {
      return { success: true };
    }

    let reportIdsString = reportIds.join(',');
    // Verify the reports belong to the user
    // Since neon driver might not support ANY(${reportIds}), we can use a simpler approach or a loop if needed,
    // but a single query is better. Let's try direct deletion with WHERE user_id check.

    // We can't easily pass an array to `IN` with the current `sql` tag usage unless we format manually or iterate.
    // However, neon's `sql` usually supports arrays. Let's try to be safe iterate or use dynamic construction if needed.
    // Actually, `sql` template literal usually handles arrays for IN clauses if passed directly or we can construct user-side checks.

    // Safe implementation: Delete where ID in list AND user_id matches.
    // Since we don't know the exact binding for arrays in this `neon` setup (it varies), 
    // we can just loop for safety, or try to pass it. 
    // Given the small number of reports likely, a loop isn't terrible, but a single query is preferred.
    // Let's assume standard postgres behavior. 

    // Constructing an ANY query is safer if supported.
    // await sql`DELETE FROM shared_reports WHERE id = ANY(${reportIds}) AND user_id = ${userId}`

    // However, to be absolutely safe without testing the driver capabilities right now, 
    // I will use a loop since I can't verify if `neon` driver here supports `ANY` array binding out of the box.
    // Wait, the `neon` serverless driver supports array parameters usually.

    // Let's simpler:
    for (const id of reportIds) {
      await sql`
            DELETE FROM shared_reports
            WHERE id = ${id} AND user_id = ${userId}
        `;
    }

    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("Error deleting shared reports:", error);
    return {
      success: false,
      error: "Failed to delete shared reports. Database error.",
    };
  }
}

// Get global report aggregation based on all saved reports
export async function getGlobalReportAggregation(): Promise<{ success: boolean; data?: ReportData; error?: string }> {
  const user = await requireAuth();
  const userId = user.id;
  try {
    // 1. Get all saved reports for the user
    // Directly fetch without calling the other action to simplify
    const savedReportsRes = (await sql`
        SELECT * FROM shared_reports WHERE user_id = ${userId}
    `) as any;

    if (savedReportsRes.length === 0) {
      return { success: true, data: undefined };
    }

    // 2. Fetch all time entries that fall into at least one shared report's range
    // We'll use a single query with subquery for efficiency
    const entriesResult = (await sql`
      SELECT 
        te.id, 
        te.start_time, 
        te.end_time,
        te.observations,
        te.project_id,
        p.name as project_name,
        p.color as project_color,
        COALESCE(p.hourly_rate, us.hourly_rate) as effective_rate,
        COALESCE(p.currency, us.currency) as effective_currency,
        EXTRACT(EPOCH FROM (COALESCE(te.end_time, CURRENT_TIMESTAMP) - te.start_time)) * 1000 AS duration,
        COALESCE(
          (SELECT SUM(EXTRACT(EPOCH FROM (COALESCE(b.end_time, CURRENT_TIMESTAMP) - b.start_time)) * 1000)
           FROM breaks b
           WHERE b.time_entry_id = te.id),
          0
        ) AS break_time
      FROM time_entries te
      LEFT JOIN projects p ON te.project_id = p.id
      JOIN user_settings us ON te.user_id = us.user_id
      WHERE 
        te.user_id = ${userId} AND 
        te.status = 'completed' AND
        EXISTS (
          SELECT 1 FROM shared_reports sr
          WHERE sr.user_id = ${userId}
          AND te.start_time >= sr.start_date
          AND te.start_time <= (sr.end_date + interval '1 day' - interval '1 millisecond')
        )
      ORDER BY te.start_time DESC
    `) as any;

    // 3. Format the entries (avoiding duplicates because of EXISTS)
    const entries = entriesResult.map((entry: any) => {
      const startTime = new Date(entry.start_time);
      const endTime = entry.end_time ? new Date(entry.end_time) : null;
      const duration = Number.parseFloat(entry.duration);
      const breaks = Number.parseFloat(entry.break_time);
      const netWork = duration - breaks;

      return {
        id: entry.id,
        date: formatDateForDisplay(startTime),
        startTime: formatTimeForDisplay(startTime),
        endTime: endTime ? formatTimeForDisplay(endTime) : null,
        duration,
        breaks,
        netWork,
        observations: entry.observations,
        project_id: entry.project_id,
        project_name: entry.project_name,
        project_color: entry.project_color,
        effective_rate: entry.effective_rate ? Number(entry.effective_rate) : null,
        effective_currency: entry.effective_currency || "BRL",
      };
    });

    // 4. Calculate summary
    const totalDuration = entries.reduce((sum: number, entry: any) => sum + entry.duration, 0);
    const totalBreaks = entries.reduce((sum: number, entry: any) => sum + entry.breaks, 0);
    const totalNetWork = totalDuration - totalBreaks;
    const daysWorkedSet = new Set(entries.map((entry: any) => entry.date));
    const daysWorked = daysWorkedSet.size;
    const averageDailyWork = daysWorked > 0 ? totalNetWork / daysWorked : 0;

    // Calculate total payable
    let totalPayable = 0;
    entries.forEach((entry: any) => {
      if (entry.effective_rate) {
        totalPayable += (entry.netWork / 3600000) * entry.effective_rate;
      }
    });

    // Get user settings for default fallback
    const settingsResult = await getUserSettings(userId);
    let summaryHourlyRate = settingsResult.data?.hourly_rate || null;
    let summaryCurrency = settingsResult.data?.currency || "BRL";

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
          totalPayable,
          hourlyRate: summaryHourlyRate,
          currency: summaryCurrency,
        },
      },
    };
  } catch (error) {
    console.error("Error getting global report aggregation:", error);
    return {
      success: false,
      error: "Failed to aggregate reports. Database error.",
    };
  }
}

