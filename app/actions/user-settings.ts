"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type UserSettings = {
  user_id: number
  working_hours: number
  timezone: string
  auto_detect_breaks: boolean
  enable_notifications: boolean
  enable_email_notifications: boolean
  allow_sharing: boolean
  share_duration_days: number
  created_at: Date
  updated_at: Date
}

// Get user settings
export async function getUserSettings(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM user_settings
      WHERE user_id = ${userId}
    `

    if (result.length === 0) {
      return { success: false, error: "Settings not found" }
    }

    return { success: true, data: result[0] as UserSettings }
  } catch (error) {
    console.error("Error getting user settings:", error)
    return { success: false, error: "Failed to get user settings" }
  }
}

// Update user settings
export async function updateUserSettings(
  userId: number,
  settings: {
    working_hours?: number
    timezone?: string
    auto_detect_breaks?: boolean
    enable_notifications?: boolean
    enable_email_notifications?: boolean
    allow_sharing?: boolean
    share_duration_days?: number
  },
) {
  try {
    // Build the SET clause dynamically based on provided settings
    const setClauses = []
    const params = []

    if (settings.working_hours !== undefined) {
      setClauses.push("working_hours = $" + (params.length + 1))
      params.push(settings.working_hours)
    }

    if (settings.timezone !== undefined) {
      setClauses.push("timezone = $" + (params.length + 1))
      params.push(settings.timezone)
    }

    if (settings.auto_detect_breaks !== undefined) {
      setClauses.push("auto_detect_breaks = $" + (params.length + 1))
      params.push(settings.auto_detect_breaks)
    }

    if (settings.enable_notifications !== undefined) {
      setClauses.push("enable_notifications = $" + (params.length + 1))
      params.push(settings.enable_notifications)
    }

    if (settings.enable_email_notifications !== undefined) {
      setClauses.push("enable_email_notifications = $" + (params.length + 1))
      params.push(settings.enable_email_notifications)
    }

    if (settings.allow_sharing !== undefined) {
      setClauses.push("allow_sharing = $" + (params.length + 1))
      params.push(settings.allow_sharing)
    }

    if (settings.share_duration_days !== undefined) {
      setClauses.push("share_duration_days = $" + (params.length + 1))
      params.push(settings.share_duration_days)
    }

    // Add updated_at
    setClauses.push("updated_at = NOW()")

    if (setClauses.length === 0) {
      return { success: false, error: "No settings provided to update" }
    }

    // Add user_id to params
    params.push(userId)

    // Construct and execute the query
    const query = `
      UPDATE user_settings
      SET ${setClauses.join(", ")}
      WHERE user_id = $${params.length}
      RETURNING *
    `

    const result = await sql.unsafe(query, ...params)

    revalidatePath("/settings")
    return { success: true, data: result[0] as UserSettings }
  } catch (error) {
    console.error("Error updating user settings:", error)
    return { success: false, error: "Failed to update user settings" }
  }
}
