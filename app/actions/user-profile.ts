"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

type DbUserProfile = {
  id: number
  name: string
  email: string
  created_at: string
}

export async function updateUserName(userId: number, name: string) {
  try {
    // Update user name in the database
    await sql`
      UPDATE users
      SET name = ${name}
      WHERE id = ${userId}
    `

    // Revalidate the settings page to show updated data
    revalidatePath("/settings")

    return {
      success: true,
      data: { name }
    }
  } catch (error) {
    console.error("Error updating user name:", error)
    return {
      success: false,
      error: "Failed to update user name"
    }
  }
}

export async function getUserProfile(userId: number) {
  try {
    const result = (await sql`
      SELECT id, name, email, created_at
      FROM users
      WHERE id = ${userId}
    `) as unknown as DbUserProfile[]

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "User not found"
      }
    }

    return {
      success: true,
      data: result[0]
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return {
      success: false,
      error: "Failed to fetch user profile"
    }
  }
} 