"use server"

import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import crypto from "crypto"

// Types
export type User = {
  id: number
  name: string
  email: string
  created_at: Date
  updated_at: Date
}

// Helper function to hash passwords
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

// Register a new user
export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { success: false, error: "All fields are required" }
  }

  try {
    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return { success: false, error: "Email already in use" }
    }

    // Hash the password
    const passwordHash = hashPassword(password)

    // Insert the new user
    const result = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${passwordHash})
      RETURNING id, name, email, created_at, updated_at
    `

    const user = result[0] as User

    // Create default user settings
    await sql`
      INSERT INTO user_settings (user_id, working_hours, timezone)
      VALUES (${user.id}, 8, 'UTC')
    `

    // Set a session cookie
    const sessionId = crypto.randomUUID()
    const cookieStore = await cookies()
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    // Store user ID in another cookie for easy access
    cookieStore.set("user_id", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true, data: user }
  } catch (error) {
    console.error("Error registering user:", error)
    return { success: false, error: "Failed to register user. Database connection issue." }
  }
}

// Login a user
export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, error: "Email and password are required" }
  }

  try {
    // Hash the password
    const passwordHash = hashPassword(password)

    // Find the user
    const users = await sql`
      SELECT id, name, email, created_at, updated_at
      FROM users
      WHERE email = ${email} AND password_hash = ${passwordHash}
    `

    if (users.length === 0) {
      return { success: false, error: "Invalid email or password" }
    }

    const user = users[0] as User

    // Set a session cookie
    const sessionId = crypto.randomUUID()
    const cookieStore = await cookies()
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    // Store user ID in another cookie for easy access
    cookieStore.set("user_id", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true, data: user }
  } catch (error) {
    console.error("Error logging in user:", error)
    return { success: false, error: "Failed to log in. Database connection issue." }
  }
}

// Logout a user
export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete("session_id")
  cookieStore.delete("user_id")
  redirect("/login")
}

// Get the current user
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    return null
  }

  try {
    const users = await sql`
      SELECT id, name, email, created_at, updated_at
      FROM users
      WHERE id = ${Number.parseInt(userId)}
    `

    if (users.length === 0) {
      return null
    }

    return users[0] as User
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Middleware to check if user is authenticated
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}
