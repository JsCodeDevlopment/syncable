"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import type { TimeEntry, Break } from "./time-entries"

// Create a manual time entry
export async function createManualTimeEntry(
  userId: number,
  startTime: Date,
  endTime: Date | null,
  breakDetails: { startTime: Date; endTime: Date | null }[],
) {
  try {
    // Start a transaction
    await sql`BEGIN`

    // Insert the time entry
    const timeEntryResult = await sql`
      INSERT INTO time_entries (user_id, start_time, end_time, status)
      VALUES (
        ${userId}, 
        ${startTime}, 
        ${endTime}, 
        ${endTime ? "completed" : "active"}
      )
      RETURNING id, user_id, start_time, end_time, status, created_at, updated_at
    `

    const timeEntry = timeEntryResult[0] as TimeEntry

    // Insert breaks if any
    if (breakDetails && breakDetails.length > 0) {
      for (const breakDetail of breakDetails) {
        await sql`
          INSERT INTO breaks (time_entry_id, start_time, end_time)
          VALUES (
            ${timeEntry.id}, 
            ${breakDetail.startTime}, 
            ${breakDetail.endTime}
          )
        `
      }
    }

    // Commit the transaction
    await sql`COMMIT`

    revalidatePath("/dashboard")
    return { success: true, data: timeEntry }
  } catch (error) {
    // Rollback in case of error
    await sql`ROLLBACK`
    console.error("Error creating manual time entry:", error)
    return { success: false, error: "Failed to create manual time entry" }
  }
}

// Update an existing time entry
export async function updateTimeEntry(timeEntryId: number, startTime: Date, endTime: Date | null, userId: number) {
  try {
    // Verify the time entry belongs to the user
    const verifyResult = await sql`
      SELECT id FROM time_entries 
      WHERE id = ${timeEntryId} AND user_id = ${userId}
    `

    if (verifyResult.length === 0) {
      return { success: false, error: "Time entry not found or access denied" }
    }

    const result = await sql`
      UPDATE time_entries
      SET 
        start_time = ${startTime}, 
        end_time = ${endTime},
        status = ${endTime ? "completed" : "active"},
        updated_at = NOW()
      WHERE id = ${timeEntryId}
      RETURNING id, user_id, start_time, end_time, status, created_at, updated_at
    `

    revalidatePath("/dashboard")
    return { success: true, data: result[0] as TimeEntry }
  } catch (error) {
    console.error("Error updating time entry:", error)
    return { success: false, error: "Failed to update time entry" }
  }
}

// Add a break to an existing time entry
export async function addBreakToTimeEntry(
  timeEntryId: number,
  breakStartTime: Date,
  breakEndTime: Date | null,
  userId: number,
) {
  try {
    // Verify the time entry belongs to the user
    const verifyResult = await sql`
      SELECT id FROM time_entries 
      WHERE id = ${timeEntryId} AND user_id = ${userId}
    `

    if (verifyResult.length === 0) {
      return { success: false, error: "Time entry not found or access denied" }
    }

    const result = await sql`
      INSERT INTO breaks (time_entry_id, start_time, end_time)
      VALUES (${timeEntryId}, ${breakStartTime}, ${breakEndTime})
      RETURNING id, time_entry_id, start_time, end_time, created_at, updated_at
    `

    revalidatePath("/dashboard")
    return { success: true, data: result[0] as Break }
  } catch (error) {
    console.error("Error adding break:", error)
    return { success: false, error: "Failed to add break" }
  }
}

// Update an existing break
export async function updateBreak(breakId: number, breakStartTime: Date, breakEndTime: Date | null, userId: number) {
  try {
    // Verify the break belongs to the user's time entry
    const verifyResult = await sql`
      SELECT b.id 
      FROM breaks b
      JOIN time_entries te ON b.time_entry_id = te.id
      WHERE b.id = ${breakId} AND te.user_id = ${userId}
    `

    if (verifyResult.length === 0) {
      return { success: false, error: "Break not found or access denied" }
    }

    const result = await sql`
      UPDATE breaks
      SET 
        start_time = ${breakStartTime}, 
        end_time = ${breakEndTime},
        updated_at = NOW()
      WHERE id = ${breakId}
      RETURNING id, time_entry_id, start_time, end_time, created_at, updated_at
    `

    revalidatePath("/dashboard")
    return { success: true, data: result[0] as Break }
  } catch (error) {
    console.error("Error updating break:", error)
    return { success: false, error: "Failed to update break" }
  }
}

// Delete a break
export async function deleteBreak(breakId: number, userId: number) {
  try {
    // Verify the break belongs to the user's time entry
    const verifyResult = await sql`
      SELECT b.id 
      FROM breaks b
      JOIN time_entries te ON b.time_entry_id = te.id
      WHERE b.id = ${breakId} AND te.user_id = ${userId}
    `

    if (verifyResult.length === 0) {
      return { success: false, error: "Break not found or access denied" }
    }

    await sql`
      DELETE FROM breaks
      WHERE id = ${breakId}
    `

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error deleting break:", error)
    return { success: false, error: "Failed to delete break" }
  }
}

// Delete a time entry and all associated breaks
export async function deleteTimeEntry(timeEntryId: number, userId: number) {
  try {
    // Verify the time entry belongs to the user
    const verifyResult = await sql`
      SELECT id FROM time_entries 
      WHERE id = ${timeEntryId} AND user_id = ${userId}
    `

    if (verifyResult.length === 0) {
      return { success: false, error: "Time entry not found or access denied" }
    }

    // Start a transaction
    await sql`BEGIN`

    // Delete all breaks associated with this time entry
    await sql`
      DELETE FROM breaks
      WHERE time_entry_id = ${timeEntryId}
    `

    // Delete the time entry
    await sql`
      DELETE FROM time_entries
      WHERE id = ${timeEntryId}
    `

    // Commit the transaction
    await sql`COMMIT`

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    // Rollback in case of error
    await sql`ROLLBACK`
    console.error("Error deleting time entry:", error)
    return { success: false, error: "Failed to delete time entry" }
  }
}
