"use server"

import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import crypto from "crypto"
import bcrypt from "bcryptjs"

// Ensure sessions table exists
async function ensureSessionsTable() {
  try {
    // Attempt to create pgcrypto extension just in case for gen_random_uuid()
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`.catch(() => {});
    
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
  } catch (error) {
    console.error("Error ensuring sessions table:", error)
  }
}

// Call ensureSessionsTable
ensureSessionsTable()

// Types
export type User = {
  id: number
  name: string
  email: string
  created_at: Date
  updated_at: Date
}

// Helper function to hash passwords (Bcrypt)
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Helper function to compare passwords (Bcrypt or Legacy SHA-256)
async function comparePassword(password: string, hash: string): Promise<{ valid: boolean; needsMigration: boolean }> {
  // Check if it's a Bcrypt hash (usually starts with $2a$ or $2b$)
  if (hash.startsWith("$2")) {
    const valid = await bcrypt.compare(password, hash)
    return { valid, needsMigration: false }
  }

  // Fallback to legacy SHA-256
  const legacyHash = crypto.createHash("sha256").update(password).digest("hex")
  const valid = legacyHash === hash
  return { valid, needsMigration: valid }
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
    const passwordHash = await hashPassword(password)

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

    // Create a real session in DB
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 1 week

    const sessionResult = await sql`
      INSERT INTO sessions (user_id, expires_at)
      VALUES (${user.id}, ${expiresAt})
      RETURNING id
    `
    const sessionId = sessionResult[0].id

    // Set a session cookie
    const cookieStore = await cookies()
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax",
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
    // Find the user
    const users = await sql`
      SELECT id, name, email, password_hash, created_at, updated_at
      FROM users
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return { success: false, error: "Invalid email or password" }
    }

    const user = users[0] as User & { password_hash: string }
    
    // Compare password (with migration support)
    const { valid, needsMigration } = await comparePassword(password, user.password_hash)
    if (!valid) {
      return { success: false, error: "Invalid email or password" }
    }

    // Migrate to Bcrypt if needed
    if (needsMigration) {
      const newHash = await hashPassword(password)
      await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${user.id}`
    }

    // Create a real session in DB
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 1 week

    const sessionResult = await sql`
      INSERT INTO sessions (user_id, expires_at)
      VALUES (${user.id}, ${expiresAt})
      RETURNING id
    `
    const sessionId = sessionResult[0].id

    // Set a session cookie
    const cookieStore = await cookies()
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax",
    })

    return { success: true, data: {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at
    } }
  } catch (error) {
    console.error("Error logging in user:", error)
    return { success: false, error: "Failed to log in. Database connection issue." }
  }
}

// Logout a user
export async function logoutUser() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (sessionId) {
    try {
      await sql`DELETE FROM sessions WHERE id = ${sessionId}`
    } catch (error) {
      console.error("Error deleting session:", error)
    }
  }

  cookieStore.delete("session_id")
  redirect("/login")
}

// Get the current user
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) {
    return null
  }

  try {
    const sessions = await sql`
      SELECT user_id, expires_at 
      FROM sessions 
      WHERE id = ${sessionId} AND expires_at > NOW()
    `

    if (sessions.length === 0) {
      return null
    }

    const userId = sessions[0].user_id

    const users = await sql`
      SELECT id, name, email, created_at, updated_at
      FROM users
      WHERE id = ${userId}
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
