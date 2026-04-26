"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { requireAuth } from "./auth"

export type Project = {
  id: number
  user_id: number
  name: string
  client_name: string | null
  color: string
  hourly_rate?: number
  currency?: string
  created_at: Date
  updated_at: Date
}

// Ensure projects table and columns exist
async function ensureProjectsSchema() {
  try {
    // Create projects table
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        client_name TEXT,
        color TEXT DEFAULT '#3b82f6',
        hourly_rate DECIMAL(10, 2),
        currency TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Add project_id to time_entries
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'time_entries' AND COLUMN_NAME = 'project_id') THEN
          ALTER TABLE time_entries ADD COLUMN project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `
  } catch (error) {
    console.error("Error ensuring projects schema:", error)
  }
}

// Call schema check
ensureProjectsSchema()

export async function getProjects() {
  const user = await requireAuth()

  try {
    const projects = (await sql`
      SELECT * FROM projects 
      WHERE user_id = ${user.id} 
      ORDER BY name ASC
    `) as Project[]
    return { success: true, data: projects }
  } catch (error) {
    console.error("Error getting projects:", error)
    return { success: false, error: "Failed to get projects" }
  }
}

export async function createProject(data: {
    name: string
    client_name?: string
    color?: string
    hourly_rate?: number
    currency?: string
  },
) {
  const user = await requireAuth()

  try {
    const result = (await sql`
      INSERT INTO projects (user_id, name, client_name, color, hourly_rate, currency)
      VALUES (${user.id}, ${data.name}, ${data.client_name || null}, ${data.color || "#3b82f6"}, ${data.hourly_rate || null}, ${data.currency || null})
      RETURNING *
    `) as Project[]
    
    revalidatePath("/settings")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating project:", error)
    return { success: false, error: "Failed to create project" }
  }
}

export async function updateProject(projectId: number, data: {
    name?: string
    client_name?: string
    color?: string
    hourly_rate?: number
    currency?: string
  },
) {
  const user = await requireAuth()

  try {
    const result = (await sql`
      UPDATE projects
      SET 
        name = ${data.name !== undefined ? data.name : sql`name`},
        client_name = ${data.client_name !== undefined ? data.client_name : sql`client_name`},
        color = ${data.color !== undefined ? data.color : sql`color`},
        hourly_rate = ${data.hourly_rate !== undefined ? data.hourly_rate : sql`hourly_rate`},
        currency = ${data.currency !== undefined ? data.currency : sql`currency`},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${projectId} AND user_id = ${user.id}
      RETURNING *
    `) as Project[]
    
    if (result.length === 0) {
        return { success: false, error: "Unauthorized or project not found" }
    }

    revalidatePath("/settings")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating project:", error)
    return { success: false, error: "Failed to update project" }
  }
}

export async function deleteProject(projectId: number) {
  const user = await requireAuth()

  try {
    const result = await sql`DELETE FROM projects WHERE id = ${projectId} AND user_id = ${user.id} RETURNING id`
    if (result.length === 0) {
        return { success: false, error: "Unauthorized or project not found" }
    }
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error deleting project:", error)
    return { success: false, error: "Failed to delete project" }
  }
}
